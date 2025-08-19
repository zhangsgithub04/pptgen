"use client";

import React from 'react';

export interface Theme {
  id: string;
  name: string;
  nameCN: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    title: string;
    content: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    nameCN: '现代蓝',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  },
  {
    id: 'corporate-dark',
    name: 'Corporate Dark',
    nameCN: '企业深色',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  },
  {
    id: 'vibrant-purple',
    name: 'Vibrant Purple',
    nameCN: '活力紫',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  },
  {
    id: 'elegant-green',
    name: 'Elegant Green',
    nameCN: '优雅绿',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    nameCN: '温暖橙',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#fb923c',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    nameCN: '极简灰',
    colors: {
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    fonts: {
      title: 'Arial, sans-serif',
      content: 'Arial, sans-serif'
    }
  }
];

interface ThemeSelectorProps {
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: 'en' | 'zh';
}

export default function ThemeSelector({ selectedTheme, onThemeChange, language }: ThemeSelectorProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '16px', 
        color: '#1f2937' 
      }}>
        {language === 'en' ? 'Choose Theme' : '选择主题'}
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '12px' 
      }}>
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            style={{
              padding: '16px',
              border: selectedTheme.id === theme.id ? `3px solid ${theme.colors.primary}` : '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: selectedTheme.id === theme.id ? '#f8fafc' : '#ffffff',
              boxShadow: selectedTheme.id === theme.id ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
              transform: selectedTheme.id === theme.id ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedTheme.id !== theme.id) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTheme.id !== theme.id) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }
            }}
          >
            {/* Theme preview */}
            <div style={{ 
              display: 'flex', 
              gap: '4px', 
              marginBottom: '12px',
              height: '20px'
            }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: theme.colors.primary, 
                borderRadius: '4px' 
              }} />
              <div style={{ 
                flex: 1, 
                backgroundColor: theme.colors.secondary, 
                borderRadius: '4px' 
              }} />
              <div style={{ 
                flex: 1, 
                backgroundColor: theme.colors.accent, 
                borderRadius: '4px' 
              }} />
            </div>
            
            {/* Theme name */}
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: theme.colors.text,
              textAlign: 'center'
            }}>
              {language === 'en' ? theme.name : theme.nameCN}
            </div>
            
            {/* Selected indicator */}
            {selectedTheme.id === theme.id && (
              <div style={{
                marginTop: '8px',
                textAlign: 'center',
                fontSize: '12px',
                color: theme.colors.primary,
                fontWeight: '600'
              }}>
                ✓ {language === 'en' ? 'Selected' : '已选择'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
