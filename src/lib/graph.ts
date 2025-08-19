import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateSlideImage } from "./imageGenerator";
import { getPlaceholderImage } from "./geminiImageGenerator";

// Define the State
interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  critique?: string;
  revision_needed?: boolean;
}

interface GraphState {
  topic: string;
  outline: string[];
  slides: Slide[];
  current_slide: number;
}

// Lazy initialization to avoid API key requirement during build
const getLLM = () => {
  return new ChatOpenAI({ temperature: 0.4, modelName: "gpt-4o" });
};

/**
 * Generates the presentation outline based on the topic.
 */
const generateOutline = async (state: GraphState): Promise<GraphState> => {
  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a professional presentation expert. Create a compelling outline for a presentation on "{topic}".
    
    Generate 5-7 slide titles that:
    - Are concise and engaging (max 6 words each)
    - Follow a logical flow from introduction to conclusion
    - Are suitable for a professional business audience
    - Cover key aspects comprehensively
    
    Include: Introduction, 2-3 core concept slides, applications/benefits, challenges/considerations, and conclusion.
    
    IMPORTANT: Respond ONLY with a valid JSON array. No additional text or explanations.
    
    Example: ["Introduction to Topic", "Core Principles", "Key Applications", "Current Challenges", "Future Outlook", "Conclusion"]`
  );
  const chain = prompt.pipe(getLLM()).pipe(new JsonOutputParser<string[]>());
  
  try {
    const outline = await chain.invoke({ topic: state.topic });
    
    // Validate we got an array
    if (!Array.isArray(outline) || outline.length === 0) {
      throw new Error("Invalid outline format received");
    }
    
    return { ...state, outline, current_slide: 0 };
  } catch (error) {
    console.error('Error generating outline:', error);
    // Fallback outline
    const fallbackOutline = [
      `Introduction to ${state.topic}`,
      "Key Concepts",
      "Main Applications",
      "Benefits and Advantages",
      "Challenges and Solutions",
      "Future Outlook",
      "Conclusion and Summary"
    ];
    return { ...state, outline: fallbackOutline, current_slide: 0 };
  }
};

/**
 * Generates the content for the current slide.
 */
const generateSlideContent = async (state: GraphState): Promise<GraphState> => {
  const { outline, current_slide, topic } = state;
  const slide_title = outline[current_slide];

  const prompt = ChatPromptTemplate.fromTemplate(
    `Generate professional presentation slide content.
    Topic: {topic}
    Slide Title: {slide_title}
    
    Create a well-structured slide with:
    - A clear, engaging title (max 8 words)
    - 3-5 concise bullet points (each 10-15 words max)
    - Professional, informative content suitable for business presentation
    
    IMPORTANT: Respond ONLY with valid JSON. No additional text, explanations, or formatting.
    
    Format as JSON with "title" and "content" keys. Content should be bullet points separated by newlines, each starting with "-".
    
    Example:
    {{
      "title": "Key Benefits of Technology",
      "content": "- Increases productivity and efficiency across teams\n- Reduces operational costs by 30-40%\n- Improves customer satisfaction and engagement\n- Enables data-driven decision making\n- Scales easily with business growth"
    }}`
  );
  const chain = prompt.pipe(getLLM()).pipe(new JsonOutputParser<Omit<Slide, 'critique'>>());
  
  try {
    const slideContent = await chain.invoke({ topic, slide_title });
    
    // Validate the response has required fields
    if (!slideContent.title || !slideContent.content) {
      throw new Error("Generated slide missing required title or content");
    }
    
    // Generate image for the slide (with timeout fallback)
    console.log(`Generating image for slide: ${slideContent.title}`);
    try {
      // Try to generate a real image with Hugging Face
      const imageUrl = await Promise.race([
        generateSlideImage(slideContent.title, slideContent.content),
        // 10 second timeout for image generation
        new Promise<string>((resolve) => 
          setTimeout(() => resolve(getPlaceholderImage(slideContent.title)), 10000)
        )
      ]);
      
      const slideWithImage = {
        ...slideContent,
        imageUrl: imageUrl || getPlaceholderImage(slideContent.title)
      };
      
      const newSlides = [...state.slides, slideWithImage];
      return { ...state, slides: newSlides };
    } catch (error) {
      console.error('Image generation failed, using placeholder:', error);
      const slideWithImage = {
        ...slideContent,
        imageUrl: getPlaceholderImage(slideContent.title)
      };
      const newSlides = [...state.slides, slideWithImage];
      return { ...state, slides: newSlides };
    }
  } catch (error) {
    console.error('Error generating slide content:', error);
    // Fallback to a simple slide if AI generation fails
    const fallbackSlide = {
      title: slide_title,
      content: `- Key aspects of ${topic}\n- Important considerations\n- Benefits and applications\n- Current developments\n- Future implications`,
      imageUrl: getPlaceholderImage(slide_title)
    };
    const newSlides = [...state.slides, fallbackSlide];
    return { ...state, slides: newSlides };
  }
};

/**
 * Critiques the generated slide content.
 */
const critiqueSlide = async (state: GraphState): Promise<GraphState> => {
  const { slides, current_slide } = state;
  const slide_to_critique = slides[current_slide];

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a presentation content critic. Review the following slide content. 
    Slide Title: {title}
    Slide Content:
{content}

    Is the content clear, concise, and relevant to the title? Does it follow the requested format? 
    
    IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
    
    If it's good, respond with: {{ "revision_needed": false, "critique": "No issues found." }}
    If it needs improvement, respond with: {{ "revision_needed": true, "critique": "[Your specific feedback here]" }}`
  );
  const chain = prompt.pipe(getLLM()).pipe(new JsonOutputParser<{ revision_needed: boolean; critique: string }>());
  
  try {
    const critiqueResult = await chain.invoke({
      title: slide_to_critique.title,
      content: slide_to_critique.content
    });

    // Update the specific slide with the critique
    const updatedSlides = [...state.slides];
    updatedSlides[current_slide] = { ...slide_to_critique, ...critiqueResult };

    return { ...state, slides: updatedSlides };
  } catch (error) {
    console.error('Error critiquing slide:', error);
    // Fallback to no revision needed if critique fails
    const updatedSlides = [...state.slides];
    updatedSlides[current_slide] = { 
      ...slide_to_critique, 
      revision_needed: false, 
      critique: "No issues found." 
    };
    return { ...state, slides: updatedSlides };
  }
};

/**
 * Refines the slide content based on critique.
 */
const refineSlide = async (state: GraphState): Promise<GraphState> => {
    const { slides, current_slide, topic } = state;
    const slide_to_refine = slides[current_slide];

    const prompt = ChatPromptTemplate.fromTemplate(
        `Refine the presentation slide content based on the provided critique.
        Topic: {topic}
        Original Title: {title}
        Original Content:
{content}

        Critique: {critique}

        IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
        
        Generate a new, improved version of the slide. Respond with a JSON object with "title" and "content" keys.`
    );
    const chain = prompt.pipe(getLLM()).pipe(new JsonOutputParser<Omit<Slide, 'critique'>>());
    
    try {
        const refinedContent = await chain.invoke({ 
            topic,
            title: slide_to_refine.title,
            content: slide_to_refine.content,
            critique: slide_to_refine.critique || 'No critique provided'
        });

        // Replace the old slide with the refined one
        const updatedSlides = [...state.slides];
        updatedSlides[current_slide] = { ...refinedContent }; // Reset critique after refinement

        return { ...state, slides: updatedSlides };
    } catch (error) {
        console.error('Error refining slide:', error);
        // If refinement fails, just clear the revision flag
        const updatedSlides = [...state.slides];
        updatedSlides[current_slide] = { 
            ...slide_to_refine, 
            revision_needed: false,
            critique: "Refinement completed" 
        };
        return { ...state, slides: updatedSlides };
    }
};

/**
 * Increments the slide counter.
 */
const moveToNextSlide = (state: GraphState): GraphState => {
    return { ...state, current_slide: state.current_slide + 1 };
};

// Simplified app implementation without LangGraph for now
export const app = {
  async *stream(inputs: Pick<GraphState, 'topic'>) {
    let state: GraphState = {
      topic: inputs.topic,
      outline: [],
      slides: [],
      current_slide: 0
    };

    // Generate outline
    state = await generateOutline(state);
    yield { generate_outline: state };

    // Process each slide
    while (state.current_slide < state.outline.length) {
      // Generate slide content
      state = await generateSlideContent(state);
      yield { generate_slide_content: state };

      // Critique the slide
      state = await critiqueSlide(state);
      yield { critique_slide: state };

      // Check if refinement is needed
      if (state.slides[state.current_slide]?.revision_needed) {
        state.slides[state.current_slide].revision_needed = false;
        state = await refineSlide(state);
        yield { refine_slide: state };
        
        // Re-critique after refinement
        state = await critiqueSlide(state);
        yield { critique_slide: state };
      }

      // Move to next slide
      state = moveToNextSlide(state);
      if (state.current_slide < state.outline.length) {
        yield { move_to_next_slide: state };
      }
    }

    return state;
  }
};
