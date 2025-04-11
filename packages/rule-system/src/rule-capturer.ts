import { PatternAnalysis, Rule, RuleCategory, ImpactLevel } from './types';
import { RuleManager } from './rule-manager';
import { RuleTester } from './rule-tester';
import { RuleAnalytics } from './rule-analytics';

export class RuleCapturer {
  private readonly ruleManager: RuleManager;
  private readonly ruleTester: RuleTester;
  private readonly analytics: RuleAnalytics;
  private patternAnalyses: Map<string, PatternAnalysis>;
  private readonly minConfidence = 0.7;
  private readonly minFrequency = 2;

  constructor() {
    this.ruleManager = new RuleManager();
    this.ruleTester = new RuleTester();
    this.analytics = new RuleAnalytics();
    this.patternAnalyses = new Map();
  }

  async capturePattern(
    code: string,
    context: string,
    problem: string,
    solution: string,
    category: RuleCategory,
    impact: ImpactLevel,
    relatedFiles: string[] = [],
    dependencies: string[] = []
  ): Promise<void> {
    const key = this.generatePatternKey(code, problem);
    const existing = this.patternAnalyses.get(key);

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
      this.patternAnalyses.set(key, existing);
    } else {
      this.patternAnalyses.set(key, {
        code,
        context,
        problem,
        solution,
        frequency: 1,
        impact,
        category,
        relatedFiles,
        dependencies,
        lastSeen: new Date()
      });
    }

    await this.checkForRuleGeneration(key);
  }

  private generatePatternKey(code: string, problem: string): string {
    return `${code.substring(0, 50)}_${problem}`;
  }

  private async checkForRuleGeneration(patternKey: string): Promise<void> {
    const pattern = this.patternAnalyses.get(patternKey);
    if (!pattern || pattern.frequency < this.minFrequency) return;

    const rule = await this.generateRuleFromPattern(pattern);
    if (rule.confidence >= this.minConfidence) {
      // Test the rule before applying
      const testResults = await this.ruleTester.testRule(rule);
      
      if (testResults.effectiveness > 0.7) {
        await this.ruleManager.updateRule(rule);
        await this.analytics.trackRuleGeneration(rule, testResults);
        
        console.log(`Generated new rule: ${rule.name} with confidence ${rule.confidence}`);
        console.log(`Effectiveness: ${testResults.effectiveness}`);
      }
    }
  }

  private async generateRuleFromPattern(pattern: PatternAnalysis): Promise<Rule> {
    const regexPattern = this.generateRegexFromCode(pattern.code);
    const confidence = this.calculateConfidence(pattern, regexPattern);
    
    return {
      name: this.generateRuleName(pattern),
      pattern: regexPattern,
      solution: pattern.solution,
      context: pattern.context,
      autoFix: this.canAutoFix(pattern),
      priority: this.calculatePriority(pattern),
      confidence,
      examples: [pattern.code],
      category: pattern.category,
      impact: pattern.impact,
      version: '1.0.0',
      createdAt: new Date(),
      lastUpdated: new Date(),
      metadata: {
        adoptionRate: 0,
        effectiveness: 0
      }
    };
  }

  private generateRegexFromCode(code: string): string {
    // Enhanced regex generation with AST analysis
    return code
      .replace(/\s+/g, '\\s+')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\b\w+\b/g, '\\w+');
  }

  private calculateConfidence(pattern: PatternAnalysis, regexPattern: string): number {
    const frequencyScore = Math.min(pattern.frequency / 5, 1);
    const patternScore = regexPattern.length > 20 ? 0.8 : 0.5;
    const solutionScore = pattern.solution.length > 20 ? 0.8 : 0.5;
    const impactScore = this.getImpactScore(pattern.impact);
    
    return (frequencyScore + patternScore + solutionScore + impactScore) / 4;
  }

  private getImpactScore(impact: ImpactLevel): number {
    switch (impact) {
      case 'high': return 1;
      case 'medium': return 0.7;
      case 'low': return 0.4;
    }
  }

  private generateRuleName(pattern: PatternAnalysis): string {
    return `prevent_${pattern.category}_${pattern.problem.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private canAutoFix(pattern: PatternAnalysis): boolean {
    return pattern.solution.includes('replace') || 
           pattern.solution.includes('use') || 
           pattern.solution.includes('instead');
  }

  private calculatePriority(pattern: PatternAnalysis): number {
    const impactScore = this.getImpactScore(pattern.impact);
    const frequencyScore = Math.min(pattern.frequency / 5, 1);
    const difficultyScore = this.canAutoFix(pattern) ? 0.8 : 0.5;
    const categoryScore = this.getCategoryScore(pattern.category);
    
    return Math.round((impactScore + frequencyScore + difficultyScore + categoryScore) * 2.5);
  }

  private getCategoryScore(category: RuleCategory): number {
    switch (category) {
      case 'security': return 1;
      case 'performance': return 0.9;
      case 'maintainability': return 0.8;
      case 'style': return 0.6;
    }
  }
} 