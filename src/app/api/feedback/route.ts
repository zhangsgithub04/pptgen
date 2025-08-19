import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateSlideImage } from "../../../lib/imageGenerator";
import { getPlaceholderImage } from "../../../lib/geminiImageGenerator";
import { tokenTracker, generateSessionId, estimateTokenCount } from "../../../lib/tokenTracker";

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  critique?: string;
  revision_needed?: boolean;
}

interface FeedbackRequest {
  slides: Slide[];
  feedback: string;
  slideIndex?: number; // If specified, apply feedback to specific slide
  template?: {
    name: string;
    promptPrefix: string;
  };
}

// Lazy initialization to avoid API key requirement during build
const getLLM = () => {
  return new ChatOpenAI({ temperature: 0.4, modelName: "gpt-4o" });
};

// Wrapper function for LLM calls with token tracking
async function invokeWithTracking(
  chain: any,
  inputs: any,
  sessionId: string | undefined,
  operation: string
): Promise<any> {
  const startTime = Date.now();
  
  // Estimate input tokens
  const inputText = typeof inputs === 'string' ? inputs : JSON.stringify(inputs);
  const inputTokens = estimateTokenCount(inputText);
  
  try {
    const result = await chain.invoke(inputs);
    
    // Estimate output tokens
    const outputText = typeof result === 'string' ? result : JSON.stringify(result);
    const outputTokens = estimateTokenCount(outputText);
    const totalTokens = inputTokens + outputTokens;
    
    // Track usage if session ID is available
    if (sessionId) {
      tokenTracker.trackTokenUsage(sessionId, {
        inputTokens,
        outputTokens,
        totalTokens,
        model: 'gpt-4o',
        operation
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`⚡ ${operation} completed in ${duration}ms - ${totalTokens} tokens`);
    
    return result;
  } catch (error) {
    console.error(`❌ ${operation} failed:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slides, feedback, slideIndex, template }: FeedbackRequest = await req.json();

    if (!slides || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: slides and feedback' },
        { status: 400 }
      );
    }

    // Create or reuse session ID for tracking
    const sessionId = generateSessionId();
    tokenTracker.createSession(sessionId);
    console.log(`📊 Feedback tracking session: ${sessionId}`);

    // Determine if this is global feedback or specific slide feedback
    const isSpecificSlide = slideIndex !== undefined && slideIndex >= 0 && slideIndex < slides.length;

    let updatedSlides: Slide[];

    if (isSpecificSlide) {
      // Apply feedback to specific slide
      const slideToUpdate = slides[slideIndex!];
      const updatedSlide = await applyFeedbackToSlide(slideToUpdate, feedback, template, slideIndex, sessionId);
      
      updatedSlides = slides.map((slide, index) => 
        index === slideIndex ? updatedSlide : slide
      );
    } else {
      // Apply feedback to all slides
      updatedSlides = await Promise.all(
        slides.map((slide, index) => applyFeedbackToSlide(slide, feedback, template, index + 1, sessionId))
      );
    }

    return NextResponse.json({ slides: updatedSlides });

  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

async function applyFeedbackToSlide(
  slide: Slide, 
  feedback: string, 
  template?: { name: string; promptPrefix: string },
  slideNumber?: number,
  sessionId?: string
): Promise<Slide> {
  const prompt = ChatPromptTemplate.fromTemplate(`
You are a professional presentation expert. Apply the following human feedback to improve a slide.

Current Slide:
Title: {title}
Content: {content}

Human Feedback: "{feedback}"

Template Context: {templateContext}
Slide Number: {slideNumber}

Instructions:
1. Analyze the feedback and understand what improvements are requested
2. Apply the feedback while maintaining professional presentation standards
3. Keep the core message but enhance based on the feedback
4. Ensure the content remains concise and presentation-appropriate
5. If feedback asks for data/statistics, include realistic placeholder data points
6. If feedback asks for examples, include relevant industry examples
7. If feedback asks for simplification, reduce technical jargon
8. If feedback asks for more detail, add relevant bullet points

IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.

Format as JSON with "title" and "content" keys. Content should be bullet points separated by newlines, each starting with "-".

Example:
{{
  "title": "Enhanced Slide Title",
  "content": "- Enhanced bullet point based on feedback\\n- Additional detail as requested\\n- Improved clarity and focus\\n- Relevant examples included\\n- Data points added if requested"
}}
`);

  const chain = prompt.pipe(getLLM()).pipe(new JsonOutputParser<{ title: string; content: string }>());

  try {
    const templateContext = template 
      ? `This is part of a ${template.name} presentation template`
      : 'This is a general presentation';

    const improvedSlide = await chain.invoke({
      title: slide.title,
      content: slide.content,
      feedback,
      templateContext,
      slideNumber: slideNumber ? `${slideNumber}` : 'N/A'
    });

    // Regenerate image if title changed significantly or if feedback mentions visuals
    let imageUrl = slide.imageUrl;
    const improvedTitle = improvedSlide.title || slide.title || 'Slide';
    const improvedContent = improvedSlide.content || slide.content || '';
    
    const shouldRegenerateImage = 
      improvedTitle !== slide.title ||
      feedback.toLowerCase().includes('visual') ||
      feedback.toLowerCase().includes('image') ||
      feedback.toLowerCase().includes('chart') ||
      feedback.toLowerCase().includes('graphic');

    if (shouldRegenerateImage) {
      try {
        console.log(`Regenerating image for improved slide: ${improvedTitle}`);
        imageUrl = await Promise.race([
          generateSlideImage(improvedTitle, improvedContent),
          new Promise<string>((resolve) => 
            setTimeout(() => resolve(getPlaceholderImage(improvedTitle)), 8000)
          )
        ]) || getPlaceholderImage(improvedTitle);
      } catch (error) {
        console.error('Image regeneration failed, keeping original:', error);
        imageUrl = slide.imageUrl || getPlaceholderImage(improvedTitle);
      }
    }

    return {
      title: improvedTitle,
      content: improvedContent,
      imageUrl,
      critique: `Applied feedback: "${feedback}"`,
      revision_needed: false
    };

  } catch (error) {
    console.error('Error applying feedback to slide:', error);
    
    // Return original slide with error note if AI processing fails
    return {
      ...slide,
      critique: `Failed to apply feedback: "${feedback}". Please try rephrasing your request.`,
      revision_needed: true
    };
  }
}
