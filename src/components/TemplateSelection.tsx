"use client";

export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptPrefix: string;
  slideCount: string;
  tags: string[];
}

export const presentationTemplates: PresentationTemplate[] = [
  {
    id: 'business-pitch',
    name: 'Business Pitch',
    description: 'Perfect for investor presentations, startup pitches, and business proposals',
    icon: '💼',
    promptPrefix: 'Create a compelling business pitch presentation about',
    slideCount: '8-10 slides',
    tags: ['Investment', 'Startup', 'Business', 'Revenue']
  },
  {
    id: 'educational',
    name: 'Educational & Training',
    description: 'Ideal for courses, workshops, training sessions, and academic presentations',
    icon: '🎓',
    promptPrefix: 'Create an educational presentation that teaches about',
    slideCount: '6-8 slides',
    tags: ['Learning', 'Training', 'Academic', 'Knowledge']
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase product features, benefits, and competitive advantages',
    icon: '🚀',
    promptPrefix: 'Create a product demonstration presentation for',
    slideCount: '7-9 slides',
    tags: ['Product', 'Features', 'Demo', 'Benefits']
  },
  {
    id: 'research-findings',
    name: 'Research & Analysis',
    description: 'Present research findings, data analysis, and scientific discoveries',
    icon: '🔬',
    promptPrefix: 'Create a research presentation analyzing',
    slideCount: '6-8 slides',
    tags: ['Research', 'Data', 'Analysis', 'Science']
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Strategy',
    description: 'Marketing campaigns, brand strategies, and promotional presentations',
    icon: '📈',
    promptPrefix: 'Create a marketing strategy presentation for',
    slideCount: '8-10 slides',
    tags: ['Marketing', 'Strategy', 'Campaign', 'Branding']
  }
];

interface TemplateSelectionProps {
  onSelectTemplate: (template: PresentationTemplate) => void;
}

const TemplateCard = ({ template, onSelect }: { template: PresentationTemplate; onSelect: () => void }) => (
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
      {template.name}
    </h3>
    
    <p style={{ 
      fontSize: '14px', 
      color: '#4a5568', 
      lineHeight: '1.5',
      marginBottom: '16px',
      textAlign: 'center',
      flex: 1
    }}>
      {template.description}
    </p>
    
    <div style={{ 
      fontSize: '12px', 
      color: '#718096', 
      marginBottom: '12px',
      textAlign: 'center',
      fontWeight: '500'
    }}>
      📊 {template.slideCount}
    </div>
    
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '6px',
      justifyContent: 'center'
    }}>
      {template.tags.map((tag, index) => (
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

export default function TemplateSelection({ onSelectTemplate }: TemplateSelectionProps) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: 'auto',
      padding: '32px 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '12px'
        }}>
          🎯 Choose Your Presentation Template
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#718096',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Select a template that best fits your presentation goals. Each template is optimized for specific use cases and audiences.
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
            onSelect={() => onSelectTemplate(template)}
          />
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          ✨ AI-Powered Content Generation
        </h3>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          Each template uses advanced AI to generate relevant content, professional images, and intelligent critiques for your presentations.
        </p>
      </div>
    </div>
  );
}
