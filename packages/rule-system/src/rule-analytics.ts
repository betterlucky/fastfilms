import { Rule, TestResults, AnalyticsReport, RuleCategory } from './types';
import fs from 'fs';
import path from 'path';

export class RuleAnalytics {
  private readonly analyticsPath: string;
  private analyticsData: {
    rules: Map<string, {
      rule: Rule;
      testResults: TestResults[];
      usageCount: number;
      lastUsed: Date;
    }>;
    categories: Map<string, {
      count: number;
      effectiveness: number;
      usage: number;
    }>;
  };

  constructor(analyticsPath: string = '.cursor/analytics') {
    this.analyticsPath = analyticsPath;
    this.analyticsData = {
      rules: new Map(),
      categories: new Map()
    };
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    const analyticsFile = path.join(this.analyticsPath, 'analytics.json');
    if (fs.existsSync(analyticsFile)) {
      const data = JSON.parse(fs.readFileSync(analyticsFile, 'utf-8'));
      this.analyticsData = {
        rules: new Map(Object.entries(data.rules)),
        categories: new Map(Object.entries(data.categories))
      };
    }
  }

  async trackRuleGeneration(rule: Rule, testResults: TestResults): Promise<void> {
    const ruleData = this.analyticsData.rules.get(rule.name) || {
      rule,
      testResults: [],
      usageCount: 0,
      lastUsed: new Date()
    };

    ruleData.testResults.push(testResults);
    this.analyticsData.rules.set(rule.name, ruleData);

    await this.updateCategoryStats(rule.category);
    await this.saveAnalyticsData();
  }

  async trackRuleUsage(ruleName: string): Promise<void> {
    const ruleData = this.analyticsData.rules.get(ruleName);
    if (ruleData) {
      ruleData.usageCount++;
      ruleData.lastUsed = new Date();
      this.analyticsData.rules.set(ruleName, ruleData);
      await this.saveAnalyticsData();
    }
  }

  private async updateCategoryStats(category: RuleCategory): Promise<void> {
    const categoryData = this.analyticsData.categories.get(category) || {
      count: 0,
      effectiveness: 0,
      usage: 0
    };

    categoryData.count++;
    this.analyticsData.categories.set(category, categoryData);
  }

  async generateReport(): Promise<AnalyticsReport> {
    const rules = Array.from(this.analyticsData.rules.values());
    
    return {
      ruleAdoption: this.calculateAdoptionRate(),
      issuePrevention: this.calculateIssuePrevention(),
      timeSaved: this.calculateTimeSaved(),
      mostEffectiveRules: this.getMostEffectiveRules(),
      areasForImprovement: this.getAreasForImprovement(),
      ruleCategories: this.getCategoryStats()
    };
  }

  private calculateAdoptionRate(): number {
    const totalRules = this.analyticsData.rules.size;
    const usedRules = Array.from(this.analyticsData.rules.values())
      .filter(rule => rule.usageCount > 0).length;
    
    return usedRules / totalRules;
  }

  private calculateIssuePrevention(): number {
    const rules = Array.from(this.analyticsData.rules.values());
    const totalEffectiveness = rules.reduce((sum, rule) => {
      const avgEffectiveness = rule.testResults.reduce((avg, result) => 
        avg + result.effectiveness, 0) / rule.testResults.length;
      return sum + avgEffectiveness;
    }, 0);
    
    return totalEffectiveness / rules.length;
  }

  private calculateTimeSaved(): number {
    // Estimate time saved based on rule usage and effectiveness
    const AVERAGE_FIX_TIME = 30; // minutes
    const rules = Array.from(this.analyticsData.rules.values());
    
    return rules.reduce((total, rule) => {
      const avgEffectiveness = rule.testResults.reduce((avg, result) => 
        avg + result.effectiveness, 0) / rule.testResults.length;
      return total + (rule.usageCount * AVERAGE_FIX_TIME * avgEffectiveness);
    }, 0);
  }

  private getMostEffectiveRules(): Rule[] {
    return Array.from(this.analyticsData.rules.values())
      .sort((a, b) => {
        const aEffectiveness = a.testResults.reduce((sum, result) => 
          sum + result.effectiveness, 0) / a.testResults.length;
        const bEffectiveness = b.testResults.reduce((sum, result) => 
          sum + result.effectiveness, 0) / b.testResults.length;
        return bEffectiveness - aEffectiveness;
      })
      .slice(0, 5)
      .map(data => data.rule);
  }

  private getAreasForImprovement(): string[] {
    const improvements: string[] = [];
    
    // Check for underutilized categories
    Array.from(this.analyticsData.categories.entries()).forEach(([category, stats]) => {
      if (stats.usage / stats.count < 0.5) {
        improvements.push(`Increase usage of ${category} rules`);
      }
    });
    
    // Check for ineffective rules
    Array.from(this.analyticsData.rules.values()).forEach(ruleData => {
      const avgEffectiveness = ruleData.testResults.reduce((sum, result) => 
        sum + result.effectiveness, 0) / ruleData.testResults.length;
      if (avgEffectiveness < 0.7) {
        improvements.push(`Improve effectiveness of ${ruleData.rule.name}`);
      }
    });
    
    return improvements;
  }

  private getCategoryStats(): Record<RuleCategory, {
    count: number;
    effectiveness: number;
  }> {
    const stats: Partial<Record<RuleCategory, {
      count: number;
      effectiveness: number;
    }>> = {};
    
    Array.from(this.analyticsData.categories.entries()).forEach(([category, data]) => {
      if (Object.values(RuleCategory).includes(category as RuleCategory)) {
        stats[category as RuleCategory] = {
          count: data.count,
          effectiveness: data.effectiveness
        };
      }
    });
    
    return stats as Record<RuleCategory, {
      count: number;
      effectiveness: number;
    }>;
  }

  private async saveAnalyticsData(): Promise<void> {
    const analyticsFile = path.join(this.analyticsPath, 'analytics.json');
    await fs.promises.writeFile(
      analyticsFile,
      JSON.stringify({
        rules: Object.fromEntries(this.analyticsData.rules),
        categories: Object.fromEntries(this.analyticsData.categories)
      }, null, 2)
    );
  }
} 