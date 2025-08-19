"use client";

import { translations } from '../lib/translations';

export interface PresentationTemplate {
  id: string;
  name: string;
  nameCN: string;
  description: string;
  descriptionCN: string;
  icon: string;
  promptPrefix: string;
  promptPrefixCN: string;
  slideCount: string;
  slideCountCN: string;
  tags: string[];
  tagsCN: string[];
}

export const presentationTemplates: PresentationTemplate[] = [
  {
    id: 'business-pitch',
    name: 'Business Pitch',
    nameCN: '商业演示',
    description: 'Perfect for investor presentations, startup pitches, and business proposals',
    descriptionCN: '适用于投资者演示、创业路演和商业提案',
    icon: '💼',
    promptPrefix: 'Create a compelling business pitch presentation about',
    promptPrefixCN: '创建一个关于以下主题的引人注目的商业路演演示',
    slideCount: '8-10 slides',
    slideCountCN: '8-10 张幻灯片',
    tags: ['Investment', 'Startup', 'Business', 'Revenue'],
    tagsCN: ['投资', '创业', '商业', '收入']
  },
  {
    id: 'educational',
    name: 'Educational & Training',
    nameCN: '教育培训',
    description: 'Ideal for courses, workshops, training sessions, and academic presentations',
    descriptionCN: '适用于课程、研习会、培训课程和学术演示',
    icon: '🎓',
    promptPrefix: 'Create an educational presentation that teaches about',
    promptPrefixCN: '创建一个教授以下主题的教育演示',
    slideCount: '6-8 slides',
    slideCountCN: '6-8 张幻灯片',
    tags: ['Learning', 'Training', 'Academic', 'Knowledge'],
    tagsCN: ['学习', '培训', '学术', '知识']
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    nameCN: '产品演示',
    description: 'Showcase product features, benefits, and competitive advantages',
    descriptionCN: '展示产品功能、优势和竞争优势',
    icon: '🚀',
    promptPrefix: 'Create a product demonstration presentation for',
    promptPrefixCN: '创建一个关于以下产品的演示展示',
    slideCount: '7-9 slides',
    slideCountCN: '7-9 张幻灯片',
    tags: ['Product', 'Features', 'Demo', 'Benefits'],
    tagsCN: ['产品', '功能', '演示', '优势']
  },
  {
    id: 'research-findings',
    name: 'Research & Analysis',
    nameCN: '研究分析',
    description: 'Present research findings, data analysis, and scientific discoveries',
    descriptionCN: '展示研究成果、数据分析和科学发现',
    icon: '🔬',
    promptPrefix: 'Create a research presentation analyzing',
    promptPrefixCN: '创建一个分析以下主题的研究演示',
    slideCount: '6-8 slides',
    slideCountCN: '6-8 张幻灯片',
    tags: ['Research', 'Data', 'Analysis', 'Science'],
    tagsCN: ['研究', '数据', '分析', '科学']
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Strategy',
    nameCN: '营销策略',
    description: 'Marketing campaigns, brand strategies, and promotional presentations',
    descriptionCN: '营销活动、品牌策略和推广演示',
    icon: '📈',
    promptPrefix: 'Create a marketing strategy presentation for',
    promptPrefixCN: '创建一个关于以下主题的营销策略演示',
    slideCount: '8-10 slides',
    slideCountCN: '8-10 张幻灯片',
    tags: ['Marketing', 'Strategy', 'Campaign', 'Branding'],
    tagsCN: ['营销', '策略', '活动', '品牌']
  }
];

interface TemplateSelectionProps {
  onSelectTemplate: (template: PresentationTemplate) => void;
  language?: 'en' | 'zh';
}

const TemplateCard = ({ template, onSelect, language = 'en' }: { template: PresentationTemplate; onSelect: () => void; language?: 'en' | 'zh' }) => (
  <div
    onClick={onSelect}
    style={{
      border: '2px solid #e1e5e9',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      const target = e.currentTarget as HTMLElement;
      target.style.borderColor = '#667eea';
      target.style.transform = 'translateY(-2px)';
      target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)';
    }}
    onMouseLeave={(e) => {
      const target = e.currentTarget as HTMLElement;
      target.style.borderColor = '#e1e5e9';
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
  >
    <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
      {template.icon}
    </div>
    
    <h3 style={{ 
      fontSize: '20px', 
      fontWeight: '600', 
      color: '#1a202c', 
      marginBottom: '12px',
      textAlign: 'center'
    }}>
      {language === 'en' ? template.name : template.nameCN}
    </h3>
    
    <p style={{ 
      fontSize: '14px', 
      color: '#4a5568', 
      lineHeight: '1.5',
      marginBottom: '16px',
      textAlign: 'center',
      flex: 1
    }}>
      {language === 'en' ? template.description : template.descriptionCN}
    </p>
    
    <div style={{ 
      fontSize: '12px', 
      color: '#718096', 
      marginBottom: '12px',
      textAlign: 'center',
      fontWeight: '500'
    }}>
      📊 {language === 'en' ? template.slideCount : template.slideCountCN}
    </div>
    
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '6px',
      justifyContent: 'center'
    }}>
      {(language === 'en' ? template.tags : template.tagsCN).map((tag, index) => (
        <span
          key={index}
          style={{
            background: '#edf2f7',
            color: '#4a5568',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500'
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default function TemplateSelection({ onSelectTemplate, language = 'en' }: TemplateSelectionProps) {
  const t = translations[language];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '1200px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '12px'
          }}>
            🎯 {t.chooseTemplate}
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#718096',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {language === 'en' 
              ? 'Select a template that best fits your presentation goals. Each template is optimized for specific use cases and audiences.'
              : '选择最符合您演示目标的模板。每个模板都针对特定用例和受众进行了优化。'
            }
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {presentationTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              language={language}
              onSelect={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
