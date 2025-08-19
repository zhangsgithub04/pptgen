/**
 * Token consumption tracking for LLM operations
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  operation: string;
  timestamp: number;
  cost?: number; // Estimated cost in USD
}

export interface ImageGenerationUsage {
  provider: 'huggingface' | 'gemini';
  model: string;
  operation: string;
  imageCount: number;
  timestamp: number;
  cost?: number; // Estimated cost in USD
  success: boolean;
}

export interface SessionUsage {
  id: string;
  startTime: number;
  tokenUsages: TokenUsage[];
  imageUsages: ImageGenerationUsage[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalImages: number;
  estimatedCost: number;
}

// Token cost estimates (USD per 1K tokens) - approximate values
const TOKEN_COSTS = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
  'llama-2-70b': { input: 0.0007, output: 0.0009 },
  'mistral-7b': { input: 0.0002, output: 0.0002 },
  'default': { input: 0.001, output: 0.002 }
};

// Image generation cost estimates (USD per image)
const IMAGE_COSTS = {
  huggingface: {
    'black-forest-labs/FLUX.1-schnell': 0.003,
    'runwayml/stable-diffusion-v1-5': 0.002,
    'default': 0.002
  },
  gemini: {
    'imagegeneration': 0.004,
    'default': 0.004
  }
};

class TokenTracker {
  private sessions: Map<string, SessionUsage> = new Map();

  /**
   * Create a new tracking session
   */
  createSession(sessionId: string): void {
    this.sessions.set(sessionId, {
      id: sessionId,
      startTime: Date.now(),
      tokenUsages: [],
      imageUsages: [],
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalImages: 0,
      estimatedCost: 0
    });
  }

  /**
   * Track LLM token usage
   */
  trackTokenUsage(sessionId: string, usage: Omit<TokenUsage, 'timestamp' | 'cost'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found, creating new session`);
      this.createSession(sessionId);
    }

    const cost = this.calculateTokenCost(usage.model, usage.inputTokens, usage.outputTokens);
    const tokenUsage: TokenUsage = {
      ...usage,
      timestamp: Date.now(),
      cost
    };

    const currentSession = this.sessions.get(sessionId)!;
    currentSession.tokenUsages.push(tokenUsage);
    currentSession.totalInputTokens += usage.inputTokens;
    currentSession.totalOutputTokens += usage.outputTokens;
    currentSession.totalTokens += usage.totalTokens;
    currentSession.estimatedCost += cost;

    console.log(`🧮 Token Usage - ${usage.operation}:`, {
      model: usage.model,
      input: usage.inputTokens,
      output: usage.outputTokens,
      total: usage.totalTokens,
      cost: `$${cost.toFixed(4)}`
    });
  }

  /**
   * Track image generation usage
   */
  trackImageGeneration(sessionId: string, usage: Omit<ImageGenerationUsage, 'timestamp' | 'cost'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found, creating new session`);
      this.createSession(sessionId);
    }

    const cost = this.calculateImageCost(usage.provider, usage.model, usage.imageCount);
    const imageUsage: ImageGenerationUsage = {
      ...usage,
      timestamp: Date.now(),
      cost
    };

    const currentSession = this.sessions.get(sessionId)!;
    currentSession.imageUsages.push(imageUsage);
    currentSession.totalImages += usage.imageCount;
    currentSession.estimatedCost += cost;

    console.log(`🎨 Image Generation - ${usage.operation}:`, {
      provider: usage.provider,
      model: usage.model,
      count: usage.imageCount,
      success: usage.success,
      cost: `$${cost.toFixed(4)}`
    });
  }

  /**
   * Get session usage summary
   */
  getSessionUsage(sessionId: string): SessionUsage | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get formatted usage report
   */
  getUsageReport(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return 'Session not found';

    const duration = Math.round((Date.now() - session.startTime) / 1000);
    
    let report = `📊 Usage Report for Session: ${sessionId}\n`;
    report += `⏱️ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s\n\n`;
    
    // Token usage summary
    report += `🤖 LLM Token Usage:\n`;
    report += `   Input Tokens: ${session.totalInputTokens.toLocaleString()}\n`;
    report += `   Output Tokens: ${session.totalOutputTokens.toLocaleString()}\n`;
    report += `   Total Tokens: ${session.totalTokens.toLocaleString()}\n\n`;

    // Detailed token operations
    if (session.tokenUsages.length > 0) {
      report += `📝 Token Operations:\n`;
      const operationSummary = session.tokenUsages.reduce((acc, usage) => {
        if (!acc[usage.operation]) {
          acc[usage.operation] = { count: 0, totalTokens: 0, totalCost: 0 };
        }
        acc[usage.operation].count++;
        acc[usage.operation].totalTokens += usage.totalTokens;
        acc[usage.operation].totalCost += usage.cost || 0;
        return acc;
      }, {} as Record<string, { count: number; totalTokens: number; totalCost: number }>);

      Object.entries(operationSummary).forEach(([operation, summary]) => {
        report += `   ${operation}: ${summary.count} calls, ${summary.totalTokens.toLocaleString()} tokens, $${summary.totalCost.toFixed(4)}\n`;
      });
      report += '\n';
    }

    // Image generation summary
    report += `🎨 Image Generation:\n`;
    report += `   Total Images: ${session.totalImages}\n`;
    
    if (session.imageUsages.length > 0) {
      const imageSummary = session.imageUsages.reduce((acc, usage) => {
        const key = `${usage.provider}-${usage.operation}`;
        if (!acc[key]) {
          acc[key] = { count: 0, images: 0, cost: 0, success: 0 };
        }
        acc[key].count++;
        acc[key].images += usage.imageCount;
        acc[key].cost += usage.cost || 0;
        if (usage.success) acc[key].success++;
        return acc;
      }, {} as Record<string, { count: number; images: number; cost: number; success: number }>);

      Object.entries(imageSummary).forEach(([key, summary]) => {
        report += `   ${key}: ${summary.success}/${summary.count} successful, ${summary.images} images, $${summary.cost.toFixed(4)}\n`;
      });
      report += '\n';
    }

    report += `💰 Total Estimated Cost: $${session.estimatedCost.toFixed(4)}`;
    
    return report;
  }

  /**
   * Calculate token cost
   */
  private calculateTokenCost(model: string, inputTokens: number, outputTokens: number): number {
    const modelKey = model.toLowerCase();
    const costs = TOKEN_COSTS[modelKey as keyof typeof TOKEN_COSTS] || TOKEN_COSTS.default;
    
    const inputCost = (inputTokens / 1000) * costs.input;
    const outputCost = (outputTokens / 1000) * costs.output;
    
    return inputCost + outputCost;
  }

  /**
   * Calculate image generation cost
   */
  private calculateImageCost(provider: 'huggingface' | 'gemini', model: string, imageCount: number): number {
    const providerCosts = IMAGE_COSTS[provider];
    const costPerImage = providerCosts[model as keyof typeof providerCosts] || providerCosts.default;
    
    return imageCount * costPerImage;
  }

  /**
   * Clear old sessions (keep only last 24 hours)
   */
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Global tracker instance
export const tokenTracker = new TokenTracker();

// Utility function to count tokens (approximate)
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Utility function to generate session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
