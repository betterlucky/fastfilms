import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Rule {
  name: string;
  pattern: string;
  solution: string;
  autoFix?: boolean;
  priority: number;
  lastUpdated: string;
}

export class RuleManager {
  private readonly rulesPath: string;
  private activeRules: Rule[] = [];

  constructor() {
    this.rulesPath = path.join(process.cwd(), '.cursor', 'rules');
    this.loadActiveRules();
  }

  private loadActiveRules(): void {
    const rulesFiles = fs.readdirSync(this.rulesPath)
      .filter(file => file.endsWith('.json') && file !== 'project_rules.json');
    
    this.activeRules = rulesFiles.flatMap(file => {
      const content = fs.readFileSync(path.join(this.rulesPath, file), 'utf-8');
      return JSON.parse(content).rules || [];
    });
  }

  async applyRulesToFile(filePath: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    for (const rule of this.activeRules) {
      if (this.matchesRule(fileContent, rule)) {
        await this.applyRuleFix(filePath, rule);
      }
    }
  }

  private matchesRule(content: string, rule: Rule): boolean {
    // Implement pattern matching logic
    return new RegExp(rule.pattern).test(content);
  }

  private async applyRuleFix(filePath: string, rule: Rule): Promise<void> {
    if (rule.autoFix) {
      // Implement automatic fix application
      console.log(`Applying auto-fix for rule: ${rule.name} to ${filePath}`);
    } else {
      console.log(`Manual fix required for rule: ${rule.name} in ${filePath}`);
      console.log(`Solution: ${rule.solution}`);
    }
  }

  async updateRule(rule: Rule): Promise<void> {
    const existingRuleIndex = this.activeRules.findIndex(r => r.name === rule.name);
    
    if (existingRuleIndex >= 0) {
      this.activeRules[existingRuleIndex] = {
        ...rule,
        lastUpdated: new Date().toISOString()
      };
    } else {
      this.activeRules.push({
        ...rule,
        lastUpdated: new Date().toISOString()
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
}

// Example usage
const manager = new RuleManager();

// Example rule update
const newRule: Rule = {
  name: 'prevent_console_log',
  pattern: 'console\\.log\\(',
  solution: 'Use proper logging service instead of console.log',
  autoFix: true,
  priority: 1,
  lastUpdated: new Date().toISOString()
};

manager.updateRule(newRule)
  .then(() => console.log('Rule updated successfully'))
  .catch(console.error); 