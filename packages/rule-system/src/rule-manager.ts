import { Rule, RuleContext, EmergencyOverride } from './types';
import fs from 'fs';
import path from 'path';

export class RuleManager {
  private readonly rulesPath: string;
  private activeRules: Rule[] = [];
  private emergencyOverrides: Map<string, EmergencyOverride> = new Map();

  constructor(rulesPath: string = '.cursor/rules') {
    this.rulesPath = rulesPath;
    this.loadActiveRules();
  }

  private loadActiveRules(): void {
    const rulesFiles = fs.readdirSync(this.rulesPath)
      .filter(file => file.endsWith('.json') && file !== 'meta_rules.json');
    
    this.activeRules = rulesFiles.flatMap(file => {
      const content = fs.readFileSync(path.join(this.rulesPath, file), 'utf-8');
      return JSON.parse(content).rules || [];
    });
  }

  async applyRuleWithContext(rule: Rule, context: RuleContext): Promise<void> {
    // Check for emergency override
    const override = this.emergencyOverrides.get(rule.name);
    if (override && new Date() < override.expiresAt) {
      console.log(`Rule ${rule.name} is temporarily disabled until ${override.expiresAt}`);
      return;
    }

    // Apply context-specific adjustments
    const adjustedRule = this.adjustRuleForContext(rule, context);
    
    // Apply the rule
    await this.applyRule(adjustedRule);
  }

  private async applyRule(rule: Rule): Promise<void> {
    // Implement rule application logic
    if (rule.autoFix) {
      console.log(`Applying auto-fix for rule: ${rule.name}`);
      // TODO: Implement auto-fix logic
    } else {
      console.log(`Manual fix required for rule: ${rule.name}`);
      console.log(`Solution: ${rule.solution}`);
    }
  }

  private adjustRuleForContext(rule: Rule, context: RuleContext): Rule {
    // Adjust rule based on context
    let adjustedPriority = rule.priority;
    
    // Adjust priority based on environment
    if (context.environment === 'development') {
      adjustedPriority *= 0.8; // Lower priority in development
    }
    
    // Adjust based on project phase
    if (context.projectPhase === 'testing') {
      adjustedPriority *= 1.2; // Higher priority in testing
    }
    
    return {
      ...rule,
      priority: adjustedPriority
    };
  }

  async updateRule(rule: Rule): Promise<void> {
    const existingRuleIndex = this.activeRules.findIndex(r => r.name === rule.name);
    
    if (existingRuleIndex >= 0) {
      this.activeRules[existingRuleIndex] = {
        ...rule,
        lastUpdated: new Date()
      };
    } else {
      this.activeRules.push({
        ...rule,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }

    await this.saveActiveRules();
  }

  private async saveActiveRules(): Promise<void> {
    const activeRulesFile = path.join(this.rulesPath, 'active_rules.json');
    await fs.promises.writeFile(
      activeRulesFile,
      JSON.stringify({ rules: this.activeRules }, null, 2)
    );
  }

  getActiveRules(): Rule[] {
    return this.activeRules;
  }

  async temporaryDisableRule(
    rule: Rule,
    reason: string,
    duration: number,
    appliedBy: string
  ): Promise<void> {
    const override: EmergencyOverride = {
      rule,
      reason,
      duration,
      appliedBy,
      appliedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000) // duration in minutes
    };

    this.emergencyOverrides.set(rule.name, override);
    await this.saveEmergencyOverrides();
  }

  private async saveEmergencyOverrides(): Promise<void> {
    const overridesFile = path.join(this.rulesPath, 'emergency_overrides.json');
    await fs.promises.writeFile(
      overridesFile,
      JSON.stringify(Array.from(this.emergencyOverrides.values()), null, 2)
    );
  }
} 