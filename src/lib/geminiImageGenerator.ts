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
 * Generate an image using Gemini (Note: Gemini doesn't support image generation, falls back to placeholder)
 */
export async function generateSlideImageWithGemini(slideTitle: string, slideContent: string): Promise<string | null> {
  const genAI = getGeminiClient();
  
  if (!genAI) {
    return getPlaceholderImage(slideTitle);
  }

  try {
    console.log(`Note: Gemini doesn't support image generation, using enhanced placeholder for: "${slideTitle}"`);
    
    // Gemini doesn't actually support image generation
    // Using enhanced placeholder instead
    return getPlaceholderImage(slideTitle);
  } catch (error) {
    console.error(`Gemini placeholder generation failed for "${slideTitle}":`, error);
    return getPlaceholderImage(slideTitle);
  }
}

/**
 * Create a descriptive prompt for image generation based on slide content
 */
function createImagePrompt(title: string, content: string): string {
  // Extract key concepts from the slide content
  const concepts = content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .slice(0, 3) // Take first 3 bullet points
    .join(', ');

  // Create a professional, presentation-style prompt for Gemini
  const basePrompt = `Create a professional business presentation slide illustration for "${title}". `;
  const conceptPrompt = concepts ? `Key concepts to visualize: ${concepts}. ` : '';
  const stylePrompt = `Style: Clean, modern, minimalist design suitable for corporate presentations. High quality digital art. Professional color palette. No text or words in the image. Focus on visual metaphors and clean graphics.`;

  return basePrompt + conceptPrompt + stylePrompt;
}

/**
 * Generate placeholder image URL as fallback (using a solid color generator instead of external service)
 */
export function getPlaceholderImage(title: string): string {
  // Create a simple SVG-based placeholder to avoid external URL loading issues
  const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
  const colorIndex = title.length % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create a data URL SVG instead of using external placeholder service
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
