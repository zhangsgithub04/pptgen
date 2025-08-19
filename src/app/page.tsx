"use client";

import { useState, useEffect } from 'react';
import PptxGenJS from 'pptxgenjs';

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
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setSlides([]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
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
      
      // Add slide number
      pptSlide.addText(`${index + 1}`, {
        x: 9.2, y: 5.0, w: 0.5, h: 0.3,
        fontSize: 12, color: '666666', align: 'center'
      });
      
      // Add title with better formatting
      pptSlide.addText(slide.title, {
        x: 0.5, y: 0.3, w: 9, h: 0.8,
        fontSize: 28, bold: true, color: '1f2937',
        align: 'left', valign: 'middle'
      });
      
      // Split content into bullet points and format properly
      const bulletPoints = slide.content.split('\n').filter(point => point.trim().startsWith('-'));
      const cleanedPoints = bulletPoints.map(point => point.replace(/^-\s*/, '• '));
      
      // Add content with proper formatting
      pptSlide.addText(cleanedPoints.join('\n'), {
        x: 0.5, y: 1.5, w: 6, h: 3.5,
        fontSize: 16, color: '374151',
        align: 'left', valign: 'top',
        lineSpacing: 24
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
      
      // Add footer with topic
      pptSlide.addText(topic, {
        x: 0.5, y: 5.0, w: 8, h: 0.3,
        fontSize: 10, color: '9ca3af', italic: true
      });
    });
    
    // Download with better filename
    const filename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
    pptx.writeFile({ fileName: filename });
  };

  return (
    <main style={{ maxWidth: '1200px', margin: 'auto', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
          PPTGen: AI Presentation Generator
        </h1>
        <p style={{ fontSize: '18px', color: '#718096', marginBottom: '32px' }}>
          Generate professional presentations with AI-powered content and critiques
        </p>
        
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Input
            type="text"
            value={topic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
            placeholder="Enter your presentation topic (e.g., Quantum Computing, Machine Learning)..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !topic.trim()}>
            {isLoading ? '🔄 Generating...' : '✨ Generate Presentation'}
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

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <div style={{ fontSize: '18px', color: '#4a5568', marginBottom: '16px' }}>
            🤖 AI is crafting your presentation...
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

      <div style={{ marginTop: '48px' }}>
        {slides.map((slide, index) => (
          <Card key={index}>
            <SlideImage title={slide.title} imageUrl={slide.imageUrl} />
            <div style={{ flex: 1 }}>
              <CardHeader>
                <span style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginRight: '12px' 
                }}>
                  Slide {index + 1}
                </span>
                {slide.title}
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

      {slides.length > 0 && !isLoading && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button onClick={handleDownload} style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            fontSize: '18px', 
            padding: '16px 32px' 
          }}>
            📥 Download Presentation ({slides.length} slides)
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
  );
}