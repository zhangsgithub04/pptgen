"use client";

import React from 'react';

interface LanguageSelectorProps {
  language: 'en' | 'zh';
  onLanguageChange: (lang: 'en' | 'zh') => void;
}

export default function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 100,
      display: 'flex',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(229, 231, 235, 0.5)'
    }}>
      <button
        onClick={() => onLanguageChange('en')}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: language === 'en' ? '#3b82f6' : 'transparent',
          color: language === 'en' ? 'white' : '#6b7280',
          transition: 'all 0.2s'
        }}
      >
        🇺🇸 English
      </button>
      <button
        onClick={() => onLanguageChange('zh')}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: language === 'zh' ? '#3b82f6' : 'transparent',
          color: language === 'zh' ? 'white' : '#6b7280',
          transition: 'all 0.2s'
        }}
      >
        🇨🇳 中文
      </button>
    </div>
  );
}
