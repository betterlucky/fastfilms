import fs from 'fs';
import path from 'path';
import { RuleManager } from './rule_manager';

interface IssuePattern {
  code: string;
  context: string;
  problem: string;
  solution: string;
  frequency: number;
}

interface DynamicRule {
  name: string;
  pattern: string;
  solution: string;
  context: string;
  autoFix?: boolean;
  priority: number;
  confidence: number;
  examples: string[];
}

export class DynamicRuleCapturer {
  private readonly ruleManager: RuleManager;
  private issuePatterns: Map<string, IssuePattern>;
  private readonly minConfidence = 0.7;
  private readonly minFrequency = 2;

  constructor() {
    this.ruleManager = new RuleManager();
    this.issuePatterns = new Map();
  }

  captureIssue(code: string, context: string, problem: string, solution: string): void {
    const key = this.generateIssueKey(code, problem);
    const existing = this.issuePatterns.get(key);

    if (existing) {
      existing.frequency++;
      this.issuePatterns.set(key, existing);
    } else {
      this.issuePatterns.set(key, {
        code,
        context,
        problem,
        solution,
        frequency: 1
      });
    }

    this.checkForRuleGeneration();
  }

  private generateIssueKey(code: string, problem: string): string {
    return `${code.substring(0, 50)}_${problem}`;
  }

  private checkForRuleGeneration(): void {
    for (const [key, pattern] of this.issuePatterns) {
      if (pattern.frequency >= this.minFrequency) {
        const rule = this.generateRuleFromPattern(pattern);
        if (rule.confidence >= this.minConfidence) {
          this.ruleManager.updateRule({
            name: rule.name,
            pattern: rule.pattern,
            solution: rule.solution,
            autoFix: rule.autoFix,
            priority: rule.priority,
            lastUpdated: new Date().toISOString()
          });
          console.log(`Generated new rule: ${rule.name} with confidence ${rule.confidence}`);
        }
      }
    }
  }

  private generateRuleFromPattern(pattern: IssuePattern): DynamicRule {
    // Extract common patterns and generate regex
    const regexPattern = this.generateRegexFromCode(pattern.code);
    
    // Calculate confidence based on pattern clarity and frequency
    const confidence = this.calculateConfidence(pattern, regexPattern);
    
    // Generate rule name based on problem and context
    const name = this.generateRuleName(pattern);
    
    return {
      name,
      pattern: regexPattern,
      solution: pattern.solution,
      context: pattern.context,
      autoFix: this.canAutoFix(pattern),
      priority: this.calculatePriority(pattern),
      confidence,
      examples: [pattern.code]
    };
  }

  private generateRegexFromCode(code: string): string {
    // Convert code pattern to regex pattern
    // This is a simplified version - you might want to enhance this
    return code
      .replace(/\s+/g, '\\s+')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private calculateConfidence(pattern: IssuePattern, regexPattern: string): number {
    // Calculate confidence based on:
    // 1. Pattern frequency
    // 2. Pattern clarity (how specific the regex is)
    // 3. Solution clarity
    const frequencyScore = Math.min(pattern.frequency / 5, 1);
    const patternScore = regexPattern.length > 20 ? 0.8 : 0.5;
    const solutionScore = pattern.solution.length > 20 ? 0.8 : 0.5;
    
    return (frequencyScore + patternScore + solutionScore) / 3;
  }

  private generateRuleName(pattern: IssuePattern): string {
    return `prevent_${pattern.problem.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private canAutoFix(pattern: IssuePattern): boolean {
    // Determine if the pattern can be automatically fixed
    // This is a simplified version - you might want to enhance this
    return pattern.solution.includes('replace') || 
           pattern.solution.includes('use') || 
           pattern.solution.includes('instead');
  }

  private calculatePriority(pattern: IssuePattern): number {
    // Calculate priority based on:
    // 1. Impact of the issue
    // 2. Frequency of occurrence
    // 3. Difficulty to fix
    const impactScore = pattern.problem.includes('error') ? 1 : 0.5;
    const frequencyScore = Math.min(pattern.frequency / 5, 1);
    const difficultyScore = this.canAutoFix(pattern) ? 0.8 : 0.5;
    
    return Math.round((impactScore + frequencyScore + difficultyScore) * 3);
  }
}

// Example usage:
const capturer = new DynamicRuleCapturer();

// When you notice an issue:
capturer.captureIssue(
  'console.log("Debug info")',
  'Using console.log in production code',
  'Debug logging in production',
  'Use proper logging service with appropriate log levels'
);

// The system will automatically generate a rule if it sees this pattern multiple times 