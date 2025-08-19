"use client";

import { useState, useEffect } from 'react';
import PptxGenJS from 'pptxgenjs';
import LoginForm from '../components/LoginForm';
import TemplateSelection, { PresentationTemplate } from '../components/TemplateSelection';
import SlideFeedback from '../components/SlideFeedback';
import PPTPreview from '../components/PPTPreview';
import ThemeSelector, { SystemTheme, getThemeColors, getSystemTheme } from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import { translations } from '../lib/translations';

// --- Shadcn UI Components (placeholders, you would install these) ---
// To keep this file self-contained, we'll use basic HTML elements.
// In your actual project, you would import these from your components folder.
const Button = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <button style={{ background: '#333', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '8px 0', fontSize: '16px', fontWeight: '500' }} {...props}>{children}</button>;
const Input = (props: any) => <input style={{ padding: '12px 16px', width: '100%', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '16px', marginBottom: '16px' }} {...props} />;
const Card = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div style={{ border: '1px solid #e1e5e9', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#ffffff', display: 'flex', gap: '24px', alignItems: 'flex-start' }} {...props}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600', color: '#1a202c', lineHeight: '1.3' }}>{children}</h2>;
const CardContent = ({ children }: { children: React.ReactNode }) => <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '16px', color: '#4a5568' }}>{children}</div>;
const SlideImage = ({ title, imageUrl }: { title: string; imageUrl?: string }) => (
  <div style={{ 
    width: '200px', 
    height: '150px', 
    borderRadius: '8px', 
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative'
  }}>
    {imageUrl ? (
      <img 
        src={imageUrl} 
        alt={`Image for ${title}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          borderRadius: '8px'
        }}
        onError={(e) => {
          // Fallback to placeholder on image load error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    ) : null}
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#f7fafc', 
      border: '2px dashed #cbd5e0', 
      borderRadius: '8px', 
      display: imageUrl ? 'none' : 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '14px',
      color: '#718096',
      textAlign: 'center',
      padding: '16px',
      position: imageUrl ? 'absolute' : 'static',
      top: 0,
      left: 0
    }}>
      📊 {imageUrl ? 'Loading...' : `Image for "${title.substring(0, 30)}..."`}
    </div>
  </div>
);
// --- End of Placeholder Components ---

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  critique?: string;
  revision_needed?: boolean;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PresentationTemplate | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<SystemTheme>('system');
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [topic, setTopic] = useState('');
  const [imageProvider, setImageProvider] = useState<'huggingface' | 'gemini'>('huggingface');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const t = translations[language];
  const theme = getThemeColors(selectedTheme);

  // Check if user is already authenticated (persist login in session)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('pptgen_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('pptgen_language') as 'en' | 'zh';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load saved theme preference
    const savedThemeMode = localStorage.getItem('pptgen_theme') as SystemTheme;
    if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
      setSelectedTheme(savedThemeMode);
    }
  }, []);

  // Keyboard event handling for preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview]);

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLanguage(lang);
    localStorage.setItem('pptgen_language', lang);
  };

  const handleThemeChange = (theme: SystemTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem('pptgen_theme', theme);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('pptgen_authenticated', 'true');
    }
  };

  const handleTemplateSelect = (template: PresentationTemplate) => {
    setSelectedTemplate(template);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setTopic('');
    setImageProvider('huggingface');
    setSlides([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedTemplate(null);
    setTopic('');
    setImageProvider('huggingface');
    setSlides([]);
    setError(null);
    setSuccessMessage(null);
    sessionStorage.removeItem('pptgen_authenticated');
  };

  const handleApplyFeedback = async (feedback: string, slideIndex?: number) => {
    if (!feedback.trim() || slides.length === 0) return;

    setIsProcessingFeedback(true);
    setError(null);

    try {
      console.log('🤖 Applying feedback:', feedback, 'to slide index:', slideIndex);
      console.log('📊 Current slides before feedback:', slides.length);
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          feedback,
          slideIndex,
          template: selectedTemplate ? {
            name: selectedTemplate.name,
            promptPrefix: selectedTemplate.promptPrefix
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Feedback API result:', result);
      console.log('📊 Updated slides count:', result.slides?.length);
      
      if (result.slides && Array.isArray(result.slides)) {
        setSlides([...result.slides]); // Force new array to trigger re-render
        setLastUpdated(Date.now()); // Trigger visual update indicator
        setSuccessMessage('✅ Feedback applied successfully! Slides have been updated.');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
        
        console.log('🔄 UI updated with new slides');
      } else {
        console.error('❌ Invalid response format:', result);
        throw new Error('Invalid response format: missing slides array');
      }

    } catch (err: any) {
      console.error('Feedback processing failed:', err);
      setError(`Failed to apply feedback: ${err.message}`);
    } finally {
      setIsProcessingFeedback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !selectedTemplate) return;

    setSlides([]);
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Combine template prompt with user topic
      const enhancedTopic = `${selectedTemplate.promptPrefix} ${topic}`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          template: selectedTemplate,
          theme: selectedTheme,
          language: language,
          imageProvider 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Check the event name from the graph stream
              const eventName = Object.keys(data)[0];
              const eventData = data[eventName];

              // Handle error events
              if (eventName === 'error') {
                throw new Error(eventData.message || 'Stream error occurred');
              }

              if (eventName === 'generate_slide_content' || eventName === 'refine_slide') {
                setSlides(prevSlides => {
                  // Get the complete slides array from the state
                  const newSlides = eventData.slides || [];
                  
                  // Ensure all slides have string content
                  const validatedSlides = newSlides.map((slide: any) => ({
                    title: String(slide.title || ''),
                    content: String(slide.content || ''),
                    imageUrl: slide.imageUrl || undefined,
                    critique: slide.critique || undefined,
                    revision_needed: slide.revision_needed || false
                  }));
                  
                  // Only update if we have new slides
                  if (validatedSlides.length > prevSlides.length) {
                    return validatedSlides;
                  }
                  return prevSlides;
                });
              } else if (eventName === 'critique_slide') {
                // Update the slides with critique information
                setSlides(prevSlides => {
                  const newSlides = eventData.slides || [];
                  const validatedSlides = newSlides.map((slide: any) => ({
                    title: String(slide.title || ''),
                    content: String(slide.content || ''),
                    imageUrl: slide.imageUrl || undefined,
                    critique: slide.critique || undefined,
                    revision_needed: slide.revision_needed || false
                  }));
                  return validatedSlides;
                });
              } else if (eventName === 'generate_outline') {
                console.log('Outline generated:', eventData.outline);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          const eventName = Object.keys(data)[0];
          const eventData = data[eventName];
          
          // Handle error events
          if (eventName === 'error') {
            throw new Error(eventData.message || 'Stream error occurred');
          }
          
          if (eventName === 'generate_slide_content' || eventName === 'refine_slide') {
            setSlides(prevSlides => {
              const newSlides = eventData.slides || [];
              if (newSlides.length > prevSlides.length) {
                return newSlides;
              }
              return prevSlides;
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse final SSE data:', parseError);
        }
      }

    } catch (err: any) {
      console.error('Fetch failed:', err);
      setError(`Failed to generate presentation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const pptx = new PptxGenJS();
    
    // Set slide size to standard 16:9
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    pptx.layout = 'LAYOUT_16x9';
    
    slides.forEach((slide, index) => {
      const pptSlide = pptx.addSlide();
      
      // Add theme-colored background accent
      pptSlide.addShape('rect', {
        x: 0, y: 0, w: 10, h: 0.1,
        fill: { color: theme.colors.primary.replace('#', '') }
      });
      
      // Add slide number with theme color
      pptSlide.addText(`${index + 1}`, {
        x: 9.2, y: 5.0, w: 0.5, h: 0.3,
        fontSize: 12, color: theme.colors.textSecondary.replace('#', ''), align: 'center'
      });
      
      // Add title with theme colors
      pptSlide.addText(slide.title, {
        x: 0.5, y: 0.3, w: 9, h: 0.8,
        fontSize: 28, bold: true, color: theme.colors.primary.replace('#', ''),
        align: 'left', valign: 'middle',
        fontFace: 'Arial'
      });
      
      // Split content into bullet points and format properly
      const bulletPoints = slide.content.split('\n').filter(point => point.trim().startsWith('-'));
      const cleanedPoints = bulletPoints.map(point => point.replace(/^-\s*/, '• '));
      
      // Add content with theme colors
      pptSlide.addText(cleanedPoints.join('\n'), {
        x: 0.5, y: 1.5, w: 6, h: 3.5,
        fontSize: 16, color: theme.colors.text.replace('#', ''),
        align: 'left', valign: 'top',
        lineSpacing: 24,
        fontFace: 'Arial'
      });
      
      // Add image to slide
      if (slide.imageUrl) {
        try {
          // For data URLs (base64 images)
          if (slide.imageUrl.startsWith('data:')) {
            pptSlide.addImage({
              data: slide.imageUrl,
              x: 7, y: 1.5, w: 2.5, h: 1.875, // Maintain aspect ratio
              sizing: { type: 'contain', w: 2.5, h: 1.875 }
            });
          } else {
            // For regular URLs, add as image
            pptSlide.addImage({
              path: slide.imageUrl,
              x: 7, y: 1.5, w: 2.5, h: 1.875,
              sizing: { type: 'contain', w: 2.5, h: 1.875 }
            });
          }
        } catch (imageError) {
          console.warn('Failed to add image to slide:', imageError);
          // Fallback to placeholder text
          pptSlide.addText('📊 Image Unavailable', {
            x: 7, y: 1.5, w: 2.5, h: 2,
            fontSize: 14, color: '718096',
            align: 'center', valign: 'middle',
            fill: { color: 'f8fafc' }
          });
        }
      } else {
        // Add image placeholder text
        pptSlide.addText('📊 Image Placeholder', {
          x: 7, y: 1.5, w: 2.5, h: 2,
          fontSize: 14, color: '718096',
          align: 'center', valign: 'middle',
          fill: { color: 'f8fafc' }
        });
      }
      
      // Add footer with topic and template
      pptSlide.addText(`${topic} • ${selectedTemplate?.name || 'Custom Template'}`, {
        x: 0.5, y: 5.0, w: 8, h: 0.3,
        fontSize: 10, color: '9ca3af', italic: true
      });
    });
    
    // Download with better filename
    const filename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
    pptx.writeFile({ fileName: filename });
  };

  return (
    <>
      {/* Language Selector - Always visible */}
      <LanguageSelector 
        language={language} 
        onLanguageChange={handleLanguageChange} 
      />

      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} language={language} />
      ) : !selectedTemplate ? (
        <TemplateSelection onSelectTemplate={handleTemplateSelect} language={language} />
      ) : (
        <main style={{ 
          maxWidth: '1200px', 
          margin: 'auto', 
          padding: '32px 24px', 
          fontFamily: 'Arial',
          color: theme.colors.text
        }}>
          {/* Header with template info and logout */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            padding: '16px 24px',
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            borderRadius: '12px',
            color: 'white'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {selectedTemplate.icon} {selectedTemplate.name} Template
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                {selectedTemplate.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBackToTemplates}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← {language === 'en' ? 'Templates' : '模板'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔒 {language === 'en' ? 'Logout' : '退出'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: theme.colors.text, 
              marginBottom: '12px',
              fontFamily: 'Arial'
            }}>
              🎯 {t.title}
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: theme.colors.textSecondary, 
              marginBottom: '32px' 
            }}>
              {t.subtitle}
            </p>
            
            {/* Theme Selector */}
            <ThemeSelector 
              selectedTheme={selectedTheme}
              onThemeChange={handleThemeChange}
              language={language}
            />
            
            {/* Instruction Text */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '32px',
              padding: '20px',
              backgroundColor: theme.colors.background,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                color: theme.colors.primary, 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '8px' 
              }}>
                {language === 'en' ? '🚀 Ready to Create Your Presentation?' : '🚀 准备创建您的演示文稿了吗？'}
              </h3>
              <p style={{ 
                color: theme.colors.textSecondary, 
                fontSize: '14px', 
                margin: 0 
              }}>
                {language === 'en' 
                  ? 'Enter your topic below and let AI generate a professional presentation for you!'
                  : '在下方输入您的主题，让AI为您生成专业的演示文稿！'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* Topic Input Section */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: theme.colors.text, 
                  marginBottom: '12px',
                  textAlign: 'left'
                }}>
                  📝 {language === 'en' ? 'Presentation Topic' : '演示主题'}
                </label>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                  placeholder={t.topicPlaceholder}
                  disabled={isLoading}
                  style={{
                    borderColor: theme.colors.primary,
                    color: theme.colors.text,
                    fontSize: '16px',
                    padding: '16px 20px',
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                    transition: 'all 0.2s'
                  }}
                />
              </div>
              
              {/* Image Provider Selection */}
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: theme.colors.text, 
                  marginBottom: '8px' 
                }}>
                  🎨 {t.imageProvider}:
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="imageProvider"
                      value="huggingface"
                      checked={imageProvider === 'huggingface'}
                      onChange={(e) => setImageProvider(e.target.value as 'huggingface' | 'gemini')}
                      disabled={isLoading}
                    />
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>🤗 {t.huggingface}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="imageProvider"
                      value="gemini"
                      checked={imageProvider === 'gemini'}
                      onChange={(e) => setImageProvider(e.target.value as 'huggingface' | 'gemini')}
                      disabled={isLoading}
                    />
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>🔮 {t.gemini}</span>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                  {imageProvider === 'huggingface' 
                    ? 'Uses Hugging Face FLUX model for realistic image generation'
                    : 'Uses Gemini for enhanced prompts with Vertex AI Imagen for image generation'
                  }
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !topic.trim()}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !topic.trim() ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s',
                  width: '100%',
                  marginTop: '8px'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!isLoading && topic.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
              >
                {isLoading ? `🔄 ${t.generating}` : `✨ ${t.generatePresentation}`}
              </Button>
            </form>
          </div>

          {error && (
            <div style={{ 
              background: '#fed7d7', 
              border: '1px solid #fc8181', 
              color: '#c53030', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ 
              background: '#f0fff4', 
              border: '1px solid #38a169', 
              color: '#22543d', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center',
              animation: 'slideUpdate 0.5s ease-in-out'
            }}>
              {successMessage}
            </div>
          )}

          {isLoading && (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <div style={{ fontSize: '18px', color: '#4a5568', marginBottom: '16px' }}>
                🤖 AI is crafting your {selectedTemplate.name.toLowerCase()} presentation...
              </div>
              <div style={{ 
                width: '200px', 
                height: '4px', 
                background: '#e2e8f0', 
                borderRadius: '2px', 
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '30%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #4299e1, #63b3ed)', 
                  borderRadius: '2px',
                  animation: 'loading 2s infinite ease-in-out'
                }}></div>
              </div>
            </div>
          )}

          {isProcessingFeedback && (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <div style={{ fontSize: '18px', color: '#4a5568', marginBottom: '16px' }}>
                🤝 AI is processing your feedback and improving the slides...
              </div>
              <div style={{ 
                width: '200px', 
                height: '4px', 
                background: '#e2e8f0', 
                borderRadius: '2px', 
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '30%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #38b2ac, #4fd1c7)', 
                  borderRadius: '2px',
                  animation: 'loading 2s infinite ease-in-out'
                }}></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '48px' }}>
            {slides.map((slide, index) => (
              <Card 
                key={index}
                style={{
                  border: '1px solid #e1e5e9',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                  transition: 'all 0.3s ease',
                  ...(Date.now() - lastUpdated < 2000 && {
                    backgroundColor: '#f0fff4',
                    borderColor: '#38a169',
                    boxShadow: '0 4px 20px rgba(56, 161, 105, 0.15)'
                  })
                }}
              >
                <SlideImage title={slide.title} imageUrl={slide.imageUrl} />
                <div style={{ flex: 1 }}>
                  <CardHeader>
                    <span style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginRight: '12px' 
                    }}>
                      {t.slide} {index + 1}
                    </span>
                    {slide.title}
                    {Date.now() - lastUpdated < 2000 && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        background: theme.colors.accent,
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '12px',
                        animation: 'pulse 1s infinite'
                      }}>
                        ✨ Updated
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>{slide.content}</CardContent>
                  {slide.critique && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: '#f7fafc', 
                      borderLeft: '4px solid #4299e1', 
                      borderRadius: '0 8px 8px 0',
                      fontSize: '14px',
                      color: '#2d3748'
                    }}>
                      <strong>💡 AI Critique:</strong> {slide.critique}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Human-in-the-Loop Feedback Component */}
          {slides.length > 0 && !isLoading && (
            <SlideFeedback 
              slides={slides} 
              onApplyFeedback={handleApplyFeedback}
              isProcessing={isProcessingFeedback}
            />
          )}

          {slides.length > 0 && !isLoading && (
            <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => setShowPreview(true)} style={{ 
                background: `linear-gradient(135deg, ${theme.colors.accent}, #059669)`, 
                fontSize: '18px', 
                padding: '16px 32px' 
              }}>
                👁️ {t.previewPresentation} ({slides.length} slides)
              </Button>
              <Button onClick={handleDownload} style={{ 
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, 
                fontSize: '18px', 
                padding: '16px 32px' 
              }}>
                📥 {t.downloadPresentation}
              </Button>
            </div>
          )}

          <style jsx>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(200%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </main>
      )}

      {/* PowerPoint Preview Modal */}
      {showPreview && slides.length > 0 && (
        <PPTPreview 
          slides={slides}
          onDownload={handleDownload}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}