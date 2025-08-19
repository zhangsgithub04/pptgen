"use client";

import React from 'react';

export type SystemTheme = 'light' | 'dark' | 'system';
export type PPTColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

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

export interface PPTTheme {
  id: PPTColorTheme;
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
}

export const pptColorThemes: PPTTheme[] = [
  {
    id: 'blue',
    name: 'Professional Blue',
    nameCN: '专业蓝',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'green',
    name: 'Nature Green',
    nameCN: '自然绿',
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#34d399',
      background: '#f0fdf4',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'purple',
    name: 'Creative Purple',
    nameCN: '创意紫',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#faf7ff',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'orange',
    name: 'Energetic Orange',
    nameCN: '活力橙',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fff7ed',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'red',
    name: 'Bold Red',
    nameCN: '大胆红',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
      background: '#fef2f2',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'teal',
    name: 'Modern Teal',
    nameCN: '现代青',
    colors: {
      primary: '#14b8a6',
      secondary: '#0f766e',
      accent: '#5eead4',
      background: '#f0fdfa',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  }
];

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
          <label
            key={theme.mode}
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
            <input
              type="radio"
              name="theme-mode"
              value={theme.mode}
              checked={selectedTheme === theme.mode}
              onChange={() => onThemeChange(theme.mode)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: currentTheme.colors.primary,
                marginBottom: '4px'
              }}
            />
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
          </label>
        ))}
      </div>
    </div>
  );
}

interface PPTColorSelectorProps {
  selectedPPTTheme: PPTColorTheme;
  onPPTThemeChange: (theme: PPTColorTheme) => void;
  language: 'en' | 'zh';
}

export function PPTColorSelector({ selectedPPTTheme, onPPTThemeChange, language }: PPTColorSelectorProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '16px', 
        color: '#1e293b'
      }}>
        {language === 'en' ? '🎨 PPT Color Theme' : '🎨 演示文稿配色主题'}
      </h3>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        maxWidth: '600px'
      }}>
        {pptColorThemes.map((theme) => (
          <label
            key={theme.id}
            style={{
              padding: '12px',
              border: selectedPPTTheme === theme.id ? `3px solid ${theme.colors.primary}` : `2px solid #e2e8f0`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: selectedPPTTheme === theme.id ? theme.colors.background : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (selectedPPTTheme !== theme.id) {
                e.currentTarget.style.backgroundColor = theme.colors.background;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPPTTheme !== theme.id) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            <input
              type="radio"
              name="ppt-color-theme"
              value={theme.id}
              checked={selectedPPTTheme === theme.id}
              onChange={() => onPPTThemeChange(theme.id)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                accentColor: theme.colors.primary
              }}
            />
            
            {/* Color preview */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '4px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: theme.colors.primary,
                borderRadius: '4px'
              }} />
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: theme.colors.secondary,
                borderRadius: '4px'
              }} />
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: theme.colors.accent,
                borderRadius: '4px'
              }} />
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: selectedPPTTheme === theme.id ? theme.colors.primary : '#1e293b',
              textAlign: 'center'
            }}>
              {language === 'en' ? theme.name : theme.nameCN}
            </div>
            
            {selectedPPTTheme === theme.id && (
              <div style={{
                fontSize: '12px',
                color: theme.colors.primary,
                fontWeight: '600'
              }}>
                ✓ {language === 'en' ? 'Selected' : '已选择'}
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
