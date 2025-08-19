import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured, falling back to placeholder images');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate an image using Gemini's enhanced text capabilities and Vertex AI Imagen
 */
export async function generateSlideImageWithGemini(slideTitle: string, slideContent: string): Promise<string | null> {
  const genAI = getGeminiClient();
  
  if (!genAI) {
    console.log('🔄 Gemini not configured, using enhanced placeholder');
    return getPlaceholderImage(slideTitle);
  }

  try {
    console.log(`🎨 Gemini: Creating enhanced image prompt for: "${slideTitle}"`);
    
    // Use Gemini to create an enhanced image prompt
    const enhancedPrompt = await createEnhancedImagePrompt(slideTitle, slideContent);
    
    // Try to use Vertex AI Imagen if configured
    const vertexImage = await generateWithVertexAI(enhancedPrompt);
    if (vertexImage) {
      console.log(`✅ Vertex AI Imagen: Successfully generated image for: "${slideTitle}"`);
      return vertexImage;
    }
    
    // Fallback: Try alternative image generation services
    const alternativeImage = await generateWithAlternativeAPI(enhancedPrompt);
    if (alternativeImage) {
      console.log(`✅ Alternative API: Successfully generated image for: "${slideTitle}"`);
      return alternativeImage;
    }
    
    // Final fallback: Enhanced SVG placeholder
    console.log(`📊 Using enhanced SVG placeholder for: "${slideTitle}"`);
    return getEnhancedPlaceholderImage(slideTitle, slideContent);
    
  } catch (error) {
    console.error(`❌ Gemini image generation failed for "${slideTitle}":`, error);
    return getPlaceholderImage(slideTitle);
  }
}

/**
 * Use Gemini to create an enhanced, detailed image prompt
 */
async function createEnhancedImagePrompt(title: string, content: string): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    return createBasicImagePrompt(title, content);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const promptInstruction = `
Create a detailed image generation prompt for a professional business presentation slide.

Slide Title: "${title}"
Slide Content: "${content}"

Create a detailed, professional image prompt that would work well for AI image generation. The prompt should:
1. Be specific and visual
2. Focus on professional, business-appropriate imagery
3. Include relevant metaphors or symbols
4. Specify clean, modern design style
5. Avoid text or words in the image
6. Be suitable for corporate presentations

Respond with only the image prompt, no additional text.
`;

    const result = await model.generateContent(promptInstruction);
    const response = await result.response;
    const enhancedPrompt = response.text();
    
    console.log(`📝 Gemini enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);
    return enhancedPrompt;
    
  } catch (error) {
    console.error('Error creating enhanced prompt with Gemini:', error);
    return createBasicImagePrompt(title, content);
  }
}

/**
 * Generate image using Google Cloud Vertex AI Imagen
 */
async function generateWithVertexAI(prompt: string): Promise<string | null> {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!projectId || !credentialsPath || projectId === 'your_project_id_here') {
      console.log('🔄 Vertex AI not configured, skipping...');
      return null;
    }

    // Import Vertex AI (dynamic import to avoid build-time requirements)
    const { VertexAI } = await import('@google-cloud/vertexai');
    
    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1', // or your preferred location
    });
    
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'imagegeneration@006', // Latest Imagen model
    });

    const request = {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,
        topP: 0.8,
        topK: 40
      }
    };

    console.log('🎨 Vertex AI Imagen: Generating image...');
    const response = await generativeModel.generateContent(request);
    
    // Note: Vertex AI Imagen returns image data differently
    // This is a placeholder implementation - actual implementation depends on Imagen API response format
    if (response && response.response) {
      // Extract image data from response (format depends on actual API)
      // For now, return null to fall back to alternative methods
      console.log('🔄 Vertex AI Imagen response received, processing...');
      return null; // Placeholder - implement actual image extraction
    }
    
    return null;
    
  } catch (error) {
    console.error('Vertex AI Imagen error:', error);
    return null;
  }
}

/**
 * Generate image using alternative free APIs (Pollinations, etc.)
 */
async function generateWithAlternativeAPI(prompt: string): Promise<string | null> {
  try {
    // Use Pollinations AI (free alternative)
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    
    console.log('🎨 Pollinations AI: Generating image...');
    
    // Test if the URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (response.ok) {
      // Convert to base64 for consistency with other generators
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    }
    
    return null;
    
  } catch (error) {
    console.error('Alternative API error:', error);
    return null;
  }
}

/**
 * Create a basic image prompt as fallback
 */
function createBasicImagePrompt(title: string, content: string): string {
  const concepts = content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .slice(0, 3)
    .join(', ');

  const basePrompt = `Professional business presentation slide illustration for "${title}". `;
  const conceptPrompt = concepts ? `Key concepts: ${concepts}. ` : '';
  const stylePrompt = `Clean, modern, minimalist design. Corporate style. High quality. No text or words in image.`;

  return basePrompt + conceptPrompt + stylePrompt;
}

/**
 * Generate enhanced SVG placeholder with Gemini-generated description
 */
async function getEnhancedPlaceholderImage(title: string, content: string): Promise<string> {
  const genAI = getGeminiClient();
  
  if (!genAI) {
    return getPlaceholderImage(title);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Create a short, visual description (max 20 words) for what should be illustrated for this slide:
Title: "${title}"
Content: "${content}"

Respond with only emoji icons and very brief description that represents the key visual concept.
Example: "🚀 Growth chart with upward trend"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();
    
    return createVisualPlaceholder(title, description);
    
  } catch (error) {
    console.error('Error creating enhanced placeholder:', error);
    return getPlaceholderImage(title);
  }
}

/**
 * Create a visually appealing SVG placeholder
 */
function createVisualPlaceholder(title: string, description: string): string {
  const colors = [
    { bg: '667eea', text: 'ffffff' },
    { bg: '764ba2', text: 'ffffff' },
    { bg: 'f093fb', text: '000000' },
    { bg: 'f5576c', text: 'ffffff' },
    { bg: '4facfe', text: '000000' },
    { bg: '43e97b', text: '000000' }
  ];
  
  const colorIndex = title.length % colors.length;
  const { bg, text } = colors[colorIndex];
  
  // Create a more sophisticated SVG placeholder
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${bg}88;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="400" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="350" r="60" fill="rgba(255,255,255,0.1)"/>
      <circle cx="500" cy="380" r="70" fill="rgba(255,255,255,0.1)"/>
      <text x="400" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#${text}" text-anchor="middle" dominant-baseline="central">
        ${title.substring(0, 25)}${title.length > 25 ? '...' : ''}
      </text>
      <text x="400" y="320" font-family="Arial, sans-serif" font-size="16" fill="#${text}" text-anchor="middle" dominant-baseline="central" opacity="0.8">
        ${description}
      </text>
      <text x="400" y="500" font-family="Arial, sans-serif" font-size="14" fill="#${text}" text-anchor="middle" dominant-baseline="central" opacity="0.6">
        Gemini Enhanced Placeholder
      </text>
    </svg>
  `;
  
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

/**
 * Generate basic placeholder image URL as fallback
 */
export function getPlaceholderImage(title: string): string {
  const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
  const colorIndex = title.length % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="central">
        📊 ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}
      </text>
    </svg>
  `;
  
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}
