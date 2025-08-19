"use client";

import React from 'react';

export type SystemTheme = 'light' | 'dark' | 'system';

export interface Theme {
  mode: SystemTheme;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
  };
}

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getThemeColors = (themeMode: SystemTheme): Theme => {
  const actualMode = themeMode === 'system' ? getSystemTheme() : themeMode;
  
  if (actualMode === 'dark') {
    return {
      mode: themeMode,
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        border: '#334155',
        hover: '#475569'
      }
    };
  } else {
    return {
      mode: themeMode,
      colors: {
        background: '#ffffff',
        surface: '#f8fafc',
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        hover: '#f1f5f9'
      }
    };
  }
};

interface ThemeSelectorProps {
  selectedTheme: SystemTheme;
  onThemeChange: (theme: SystemTheme) => void;
  language: 'en' | 'zh';
}

export default function ThemeSelector({ selectedTheme, onThemeChange, language }: ThemeSelectorProps) {
  const currentTheme = getThemeColors(selectedTheme);
  
  const themes: { mode: SystemTheme; name: string; nameCN: string; icon: string; description: string; descriptionCN: string }[] = [
    {
      mode: 'light',
      name: 'Light',
      nameCN: '浅色',
      icon: '☀️',
      description: 'Clean and bright interface',
      descriptionCN: '清洁明亮的界面'
    },
    {
      mode: 'dark',
      name: 'Dark',
      nameCN: '深色',
      icon: '🌙',
      description: 'Easy on the eyes in low light',
      descriptionCN: '在弱光环境下保护眼睛'
    },
    {
      mode: 'system',
      name: 'System',
      nameCN: '跟随系统',
      icon: '💻',
      description: 'Follow your system preference',
      descriptionCN: '跟随系统偏好设置'
    }
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '16px', 
        color: currentTheme.colors.text 
      }}>
        {language === 'en' ? '🎨 Theme Mode' : '🎨 主题模式'}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {themes.map((theme) => (
          <button
            key={theme.mode}
            onClick={() => onThemeChange(theme.mode)}
            style={{
              padding: '16px 20px',
              border: selectedTheme === theme.mode ? `2px solid ${currentTheme.colors.primary}` : `2px solid ${currentTheme.colors.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: selectedTheme === theme.mode ? currentTheme.colors.primary + '10' : currentTheme.colors.surface,
              color: currentTheme.colors.text,
              minWidth: '120px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (selectedTheme !== theme.mode) {
                e.currentTarget.style.backgroundColor = currentTheme.colors.hover;
                e.currentTarget.style.borderColor = currentTheme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTheme !== theme.mode) {
                e.currentTarget.style.backgroundColor = currentTheme.colors.surface;
                e.currentTarget.style.borderColor = currentTheme.colors.border;
              }
            }}
          >
            <div style={{ fontSize: '24px' }}>{theme.icon}</div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: selectedTheme === theme.mode ? currentTheme.colors.primary : currentTheme.colors.text
            }}>
              {language === 'en' ? theme.name : theme.nameCN}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: currentTheme.colors.textSecondary,
              lineHeight: '1.3'
            }}>
              {language === 'en' ? theme.description : theme.descriptionCN}
            </div>
            {selectedTheme === theme.mode && (
              <div style={{
                fontSize: '12px',
                color: currentTheme.colors.primary,
                fontWeight: '600'
              }}>
                ✓ {language === 'en' ? 'Active' : '当前'}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
