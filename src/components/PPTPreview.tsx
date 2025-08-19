"use client";

import React, { useState } from 'react';

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  critique?: string;
  revision_needed?: boolean;
}

interface PPTPreviewProps {
  slides: Slide[];
  onDownload: () => void;
  onClose: () => void;
}

export default function PPTPreview({ slides, onDownload, onClose }: PPTPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentSlide(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
          break;
        case 'Home':
          event.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          event.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const exportSlideAsImage = () => {
    // Create a canvas element to capture the slide
    const slideElement = document.getElementById(`slide-preview-${currentSlide}`);
    if (!slideElement) return;

    // Use html2canvas or similar library in a real implementation
    // For now, we'll show an alert
    alert(`Feature coming soon: Export slide ${currentSlide + 1} as image`);
  };

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];
  const bulletPoints = slide.content.split('\n').filter(point => point.trim().startsWith('-'));
  const cleanedPoints = bulletPoints.map(point => point.replace(/^-\s*/, ''));

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      {/* Header */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          color: 'white'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          PowerPoint Preview
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={exportSlideAsImage}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Export Slide
          </button>
          <button
            onClick={onDownload}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Download PPT
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Main slide area */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          gap: '20px',
          height: 'calc(100vh - 200px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slide thumbnails */}
        <div 
          style={{
            width: '200px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            padding: '16px',
            overflowY: 'auto',
            maxHeight: '100%'
          }}
        >
          <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>
            Slides ({slides.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slides.map((slideItem, index) => (
              <div
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  backgroundColor: currentSlide === index ? '#3b82f6' : '#374151',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: currentSlide === index ? '2px solid #60a5fa' : '2px solid transparent'
                }}
              >
                <div style={{ color: 'white', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Slide {index + 1}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '11px', lineHeight: '1.3' }}>
                  {slideItem.title.substring(0, 40)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main slide display */}
        <div 
          id={`slide-preview-${currentSlide}`}
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Slide number indicator */}
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#f3f4f6',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}
          >
            {currentSlide + 1} / {slides.length}
          </div>

          {/* Slide content */}
          <div style={{ flex: 1, display: 'flex', gap: '40px' }}>
            {/* Text content */}
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h1 
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '32px',
                  lineHeight: '1.2'
                }}
              >
                {slide.title}
              </h1>

              {/* Content */}
              <div style={{ fontSize: '18px', lineHeight: '1.6', color: '#374151' }}>
                {cleanedPoints.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {cleanedPoints.map((point, index) => (
                      <li key={index} style={{ marginBottom: '12px' }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{slide.content}</p>
                )}
              </div>
            </div>

            {/* Image */}
            {slide.imageUrl && (
              <div 
                style={{
                  width: '300px',
                  height: '225px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <img 
                  src={slide.imageUrl}
                  alt={`Image for ${slide.title}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f7fafc',
                    border: '2px dashed #cbd5e0',
                    borderRadius: '12px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#718096',
                    textAlign: 'center',
                    padding: '16px'
                  }}
                >
                  📊 Image unavailable
                </div>
              </div>
            )}
          </div>

          {/* Navigation controls */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              style={{
                backgroundColor: currentSlide === 0 ? '#e5e7eb' : '#3b82f6',
                color: currentSlide === 0 ? '#9ca3af' : 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Previous
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: currentSlide === index ? '#3b82f6' : '#d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              style={{
                backgroundColor: currentSlide === slides.length - 1 ? '#e5e7eb' : '#3b82f6',
                color: currentSlide === slides.length - 1 ? '#9ca3af' : 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts info */}
      <div 
        style={{
          marginTop: '20px',
          color: '#9ca3af',
          fontSize: '14px',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        Use ← → arrow keys to navigate | Home/End for first/last slide | ESC to close | Click outside to close
      </div>
    </div>
  );
}
