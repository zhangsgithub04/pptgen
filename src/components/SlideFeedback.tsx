"use client";

import { useState } from 'react';

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  critique?: string;
  revision_needed?: boolean;
}

interface SlideFeedbackProps {
  slides: Slide[];
  onApplyFeedback: (feedback: string, slideIndex?: number) => void;
  isProcessing: boolean;
}

const Button = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <button 
    style={{ 
      background: '#667eea', 
      color: 'white', 
      padding: '8px 16px', 
      border: 'none', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontSize: '14px', 
      fontWeight: '500',
      ...(props.disabled && { background: '#a0aec0', cursor: 'not-allowed' })
    }} 
    {...props}
  >
    {children}
  </button>
);

const TextArea = (props: any) => (
  <textarea 
    style={{ 
      padding: '12px 16px', 
      width: '100%', 
      border: '2px solid #e1e5e9', 
      borderRadius: '8px', 
      fontSize: '14px', 
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }} 
    {...props} 
  />
);

export default function SlideFeedback({ slides, onApplyFeedback, isProcessing }: SlideFeedbackProps) {
  const [feedback, setFeedback] = useState('');
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<'global' | 'specific'>('global');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    onApplyFeedback(feedback, feedbackType === 'specific' ? selectedSlide || undefined : undefined);
    setFeedback('');
  };

  const suggestedFeedbacks = [
    "Make the content more technical and detailed",
    "Simplify the language for a general audience", 
    "Add more concrete examples and case studies",
    "Include more statistics and data points",
    "Make it more visual with bullet points",
    "Add a comparison with competitors",
    "Focus more on benefits and outcomes",
    "Include implementation timeline"
  ];

  const slideSpecificSuggestions = [
    "Add more background information to the introduction",
    "Include ROI calculations in the business case", 
    "Add technical specifications to the product demo",
    "Include market research data",
    "Add implementation steps",
    "Include risk assessment and mitigation",
    "Add success metrics and KPIs",
    "Include next steps and action items"
  ];

  return (
    <div style={{
      background: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      margin: '24px 0'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a202c',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🤝 Human-in-the-Loop Feedback
      </h3>
      
      <p style={{
        fontSize: '14px',
        color: '#4a5568',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Provide natural language feedback to improve your presentation. You can give general feedback for all slides or specific feedback for individual slides.
      </p>

      {/* Feedback Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="feedbackType"
              value="global"
              checked={feedbackType === 'global'}
              onChange={(e) => setFeedbackType(e.target.value as 'global' | 'specific')}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>📋 Global Feedback (All Slides)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="feedbackType"
              value="specific"
              checked={feedbackType === 'specific'}
              onChange={(e) => setFeedbackType(e.target.value as 'global' | 'specific')}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>🎯 Specific Slide Feedback</span>
          </label>
        </div>

        {/* Slide Selection for Specific Feedback */}
        {feedbackType === 'specific' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Select Slide to Modify:
            </label>
            <select
              value={selectedSlide || ''}
              onChange={(e) => setSelectedSlide(e.target.value ? parseInt(e.target.value) : null)}
              style={{
                padding: '8px 12px',
                border: '2px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              <option value="">Choose a slide...</option>
              {slides.map((slide, index) => (
                <option key={index} value={index}>
                  Slide {index + 1}: {slide.title.substring(0, 40)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Your Feedback:
          </label>
          <TextArea
            value={feedback}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
            placeholder={feedbackType === 'global' 
              ? "e.g., 'Make all slides more technical with specific examples' or 'Simplify the language for executives'"
              : selectedSlide !== null 
                ? `e.g., 'Add more data to slide ${(selectedSlide || 0) + 1}' or 'Make this slide more visual with charts'`
                : "Please select a slide first"
            }
            disabled={isProcessing || (feedbackType === 'specific' && selectedSlide === null)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            type="submit" 
            disabled={isProcessing || !feedback.trim() || (feedbackType === 'specific' && selectedSlide === null)}
          >
            {isProcessing ? '🔄 Applying Feedback...' : '✨ Apply Feedback'}
          </Button>
          
          {feedback && (
            <button
              type="button"
              onClick={() => setFeedback('')}
              style={{
                background: 'transparent',
                color: '#718096',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Suggested Feedback */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2d3748' }}>
          💡 Suggested Feedback:
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            General Improvements:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestedFeedbacks.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setFeedback(suggestion)}
                style={{
                  background: '#edf2f7',
                  color: '#4a5568',
                  border: '1px solid #cbd5e0',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.background = '#667eea';
                  target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.background = '#edf2f7';
                  target.style.color = '#4a5568';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Slide-Specific Ideas:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {slideSpecificSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setFeedback(suggestion)}
                style={{
                  background: '#e6fffa',
                  color: '#234e52',
                  border: '1px solid #81e6d9',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.background = '#319795';
                  target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.background = '#e6fffa';
                  target.style.color = '#234e52';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examples */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#fff5d6',
        borderRadius: '8px',
        border: '1px solid #ffd89b'
      }}>
        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#744210' }}>
          💬 Example Feedback:
        </h5>
        <ul style={{ fontSize: '13px', color: '#744210', margin: 0, paddingLeft: '20px' }}>
          <li>"Make slide 3 more data-driven with charts and statistics"</li>
          <li>"Add implementation timeline to the conclusion slide"</li>
          <li>"Simplify technical jargon in the introduction for executives"</li>
          <li>"Include competitive analysis in the market overview"</li>
        </ul>
      </div>
    </div>
  );
}
