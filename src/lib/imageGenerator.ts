import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client - using free tier
const getHfClient = () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    console.warn('Hugging Face API key not configured, falling back to placeholder images');
    return null;
  }
  return new HfInference(apiKey);
};

/**
 * Generate an image based on slide content using Hugging Face's free Stable Diffusion model
 */
export async function generateSlideImage(slideTitle: string, slideContent: string): Promise<string | null> {
  const hf = getHfClient();
  
  if (!hf) {
    // Return a placeholder image URL if no API key
    console.log('Hugging Face API key not configured, using placeholder');
    return getPlaceholderImage(slideTitle);
  }

  try {
    // Create a descriptive prompt for image generation
    const prompt = createImagePrompt(slideTitle, slideContent);
    
    console.log(`🎨 Attempting to generate image for: "${slideTitle}"`);
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}..."`);
    
    // Use a free tier model that's available
    const response = await Promise.race([
      hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell', // Free tier model
        inputs: prompt,
        parameters: {
          num_inference_steps: 4, // Fast generation
          width: 1024,
          height: 768,
        }
      }),
      // 20 second timeout for more complex models
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Image generation timeout')), 20000)
      )
    ]);

    // Convert response to base64 data URL
    if (response && typeof response === 'object' && 'arrayBuffer' in response) {
      const arrayBuffer = await (response as Blob).arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      console.log(`✅ Successfully generated image for: "${slideTitle}"`);
      return `data:image/png;base64,${base64}`;
    }
    
    console.log(`⚠️ No valid image response for: "${slideTitle}", using placeholder`);
    return getPlaceholderImage(slideTitle);
  } catch (error: any) {
    // Check if it's a quota/credits error
    if (error?.httpResponse?.status === 402 || error?.message?.includes('exceeded')) {
      console.warn(`💳 API quota exceeded for "${slideTitle}", using placeholder`);
    } else {
      console.error(`❌ Error generating image for "${slideTitle}":`, error);
    }
    
    // Always fallback to placeholder on any error
    return getPlaceholderImage(slideTitle);
  }
}

/**
 * Create a descriptive prompt for image generation based on slide content
 */
function createImagePrompt(title: string, content: string): string {
  // Handle undefined or null values
  const safeTitle = title || 'Slide';
  const safeContent = content || '';
  
  // Extract key concepts from the slide content
  const concepts = safeContent
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .slice(0, 3) // Take first 3 bullet points
    .join(', ');

  // Create a professional, presentation-style prompt
  const basePrompt = `Professional business presentation slide illustration for "${safeTitle}". `;
  const conceptPrompt = concepts ? `Key concepts: ${concepts}. ` : '';
  const stylePrompt = `Clean, modern, minimalist design. Corporate style. High quality. No text or words in image.`;

  return basePrompt + conceptPrompt + stylePrompt;
}

/**
 * Generate placeholder image URL as fallback (using SVG data URL for PowerPoint compatibility)
 */
export function getPlaceholderImage(title: string): string {
  // Handle undefined or null title
  const safeTitle = title || 'Slide';
  
  const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
  const colorIndex = safeTitle.length % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create a data URL SVG instead of using external placeholder service
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="central">
        🖼️ ${safeTitle.substring(0, 30)}${safeTitle.length > 30 ? '...' : ''}
      </text>
    </svg>
  `;
  
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}
