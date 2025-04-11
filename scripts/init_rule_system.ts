import fs from 'fs';
import path from 'path';
import { DynamicRuleCapturer } from './dynamic_rule_capturer';
import { RuleManager } from './rule_manager';

class RuleSystemInitializer {
  private readonly rulesPath: string;
  private readonly capturer: DynamicRuleCapturer;
  private readonly manager: RuleManager;

  constructor() {
    this.rulesPath = path.join(process.cwd(), '.cursor', 'rules');
    this.capturer = new DynamicRuleCapturer();
    this.manager = new RuleManager();
  }

  async initialize(): Promise<void> {
    // Ensure rules directory exists
    if (!fs.existsSync(this.rulesPath)) {
      fs.mkdirSync(this.rulesPath, { recursive: true });
    }

    // Load meta rules
    const metaRulesPath = path.join(this.rulesPath, 'meta_rules.json');
    if (!fs.existsSync(metaRulesPath)) {
      throw new Error('Meta rules file not found. Please ensure it exists at .cursor/rules/meta_rules.json');
    }

    // Verify rule system is operational
    await this.testRuleSystem();
    
    console.log('Rule system initialized successfully! 🎉');
    console.log('The AI assistant is now aware of and can use the rule generation system.');
  }

  private async testRuleSystem(): Promise<void> {
    // Test rule capture
    this.capturer.captureIssue(
      'test code',
      'test context',
      'test problem',
      'test solution'
    );

    // Test rule management
    const testRule = {
      name: 'test_rule',
      pattern: 'test',
      solution: 'test solution',
      autoFix: true,
      priority: 1,
      lastUpdated: new Date().toISOString()
    };

    await this.manager.updateRule(testRule);
    
    // Verify rule was added
    const rules = this.manager.getActiveRules();
    if (!rules.some(rule => rule.name === 'test_rule')) {
      throw new Error('Rule system test failed: Rule was not properly added');
    }
  }
}

// Initialize the rule system
const initializer = new RuleSystemInitializer();
initializer.initialize()
  .then(() => console.log('Rule system is ready to use! 🚀'))
  .catch(error => console.error('Failed to initialize rule system:', error)); 