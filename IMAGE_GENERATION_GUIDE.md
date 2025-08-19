# PPTGen Image Generation Guide

## Overview
PPTGen now supports two image generation providers to create visuals for your presentation slides:

## Image Generation Providers

### 🤗 Hugging Face (FLUX Model)
- **Provider**: Hugging Face Inference API
- **Model**: FLUX.1-dev (state-of-the-art text-to-image model)
- **Strengths**: 
  - High-quality, photorealistic images
  - Fast generation (5-10 seconds)
  - Excellent understanding of complex prompts
- **Limitations**: 
  - Free tier has limited credits
  - May require API key for extended use
- **Best for**: Realistic photos, detailed illustrations, complex scenes

### 🔮 Gemini + Vertex AI Imagen
- **Provider**: Google Gemini + Vertex AI Imagen
- **Model**: Gemini 1.5 Flash for prompt enhancement + Imagen for generation
- **Strengths**: 
  - Enhanced prompts using Gemini AI
  - Professional business-focused imagery
  - Better context understanding
  - Multiple fallback options
- **Limitations**: 
  - Requires Google Cloud Project setup
  - May have usage costs
- **Best for**: Business presentations, corporate imagery, conceptual illustrations

## How It Works

### Hugging Face Flow
1. User selects topic and Hugging Face provider
2. AI generates slide content
3. Content is sent to Hugging Face FLUX model
4. Image generated and embedded in slide
5. Fallback to enhanced SVG if generation fails

### Gemini Flow
1. User selects topic and Gemini provider
2. AI generates slide content
3. Gemini enhances the image prompt with business context
4. Enhanced prompt sent to Vertex AI Imagen
5. Multiple fallback options:
   - Alternative free APIs (Pollinations)
   - Enhanced SVG placeholders with Gemini descriptions
   - Basic SVG placeholders

## Setup Requirements

### Hugging Face Setup
```bash
# Add to .env.local
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

### Gemini + Vertex AI Setup
```bash
# Add to .env.local
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Features

### Intelligent Fallbacks
- If primary image generation fails, system automatically falls back to:
  1. Alternative free services
  2. Enhanced SVG placeholders
  3. Basic colored placeholders

### Enhanced Prompts
- Gemini provider uses AI to create detailed, business-appropriate image prompts
- Automatically optimizes prompts for corporate presentation style
- Avoids text/words in generated images

### Timeout Protection
- 10-second timeout for Hugging Face
- 15-second timeout for Gemini/Vertex AI
- Prevents hanging on slow API responses

## Usage Tips

### For Best Results with Hugging Face:
- Works well with descriptive, detailed topics
- Excellent for technical concepts and realistic imagery
- Monitor API credits usage

### For Best Results with Gemini:
- Ideal for business and corporate presentations
- Better conceptual understanding
- More professional, clean imagery style
- Requires proper Google Cloud setup

### General Tips:
- Start with Hugging Face for quick testing
- Use Gemini for important business presentations
- Both providers work with all 5 presentation templates
- Images are automatically sized and optimized for PowerPoint export

## Troubleshooting

### Common Issues:
1. **No images generated**: Check API keys in .env.local
2. **Timeout errors**: Increase timeout or use faster provider
3. **Placeholder images only**: Verify API configuration
4. **Vertex AI errors**: Check Google Cloud project setup and credentials

### Debug Information:
- Check browser console for detailed error messages
- Server logs show image generation attempts and fallbacks
- Each provider logs its generation process

## Future Enhancements

Planned improvements:
- DALL-E integration
- Midjourney API support
- Custom style presets
- Batch image generation
- Image editing capabilities
