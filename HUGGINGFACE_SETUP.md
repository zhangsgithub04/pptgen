# Image Generation Setup for PPTGen

## Option 1: Gemini AI Image Generation (Recommended) 🌟

### Free Gemini API Key Setup
1. **Sign up for Google AI Studio (Free)**
   - Go to https://aistudio.google.com/
   - Sign in with your Google account

2. **Generate API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the generated key

3. **Add to Environment**
   - Open `.env.local` file
   - Replace `your_gemini_api_key_here` with your actual key:
   ```bash
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Free Tier Benefits**
   - ✅ **Free**: Gemini 2.0 Flash Preview with image generation
   - ✅ **High Quality**: Advanced image generation capabilities
   - ✅ **Fast**: Quick generation times
   - ✅ **Reliable**: Google's infrastructure

## Option 2: Hugging Face API (Alternative)

### Free Hugging Face API Key Setup
1. **Sign up for Hugging Face (Free)**
   - Go to https://huggingface.co/join
   - Create a free account

2. **Generate API Token**
   - Go to https://huggingface.co/settings/tokens
   - Click "New token"
   - Name it "PPTGen Image Generation" 
   - Select "Read" role (free tier)
   - Copy the token

3. **Add to Environment**
   - Open `.env.local` file
   - Replace `your_huggingface_api_key_here` with your actual token:
   ```bash
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Free Tier Limits**
   - ✅ **Free**: Stable Diffusion 2.1 model
   - ✅ **Free**: 1000+ inference calls per month
   - ✅ **Free**: No credit card required
   - ⚠️ **Rate Limited**: ~1-2 images per minute

## Alternative: Use Without API Keys
If you don't want to set up either service, the app will automatically:
- Use colorful SVG-based placeholder images
- Still generate full presentations
- Work perfectly for content generation
- No external dependencies

## Image Generation Features
- 📊 **Smart Prompts**: AI creates descriptive prompts from slide content
- 🎨 **Professional Style**: Business presentation optimized images
- 📐 **Perfect Sizing**: 4:3 aspect ratio for presentations
- 💾 **Base64 Embedding**: Images embedded directly in PowerPoint files
- 🔄 **Fallback**: Graceful degradation to SVG placeholders on errors
- ⚡ **Fast**: 10-second timeout with instant fallbacks
