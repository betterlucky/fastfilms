import { Rule, TestResults } from './types';

export class RuleTester {
  async testRule(rule: Rule): Promise<TestResults> {
    const testCases = await this.generateTestCases(rule);
    const results = await this.runTestCases(rule, testCases);
    
    return {
      effectiveness: this.calculateEffectiveness(results),
      falsePositives: results.filter(r => !r.passed && r.expected === r.actual).length,
      falseNegatives: results.filter(r => !r.passed && r.expected !== r.actual).length,
      performanceImpact: await this.measurePerformanceImpact(rule),
      testCases: results
    };
  }

  private async generateTestCases(rule: Rule): Promise<{
    input: string;
    expected: string;
  }[]> {
    // Generate test cases based on rule examples and patterns
    const testCases = [
      {
        input: rule.examples[0],
        expected: this.generateExpectedOutput(rule.examples[0], rule)
      },
      // Add more test cases based on rule pattern
      ...this.generateEdgeCases(rule)
    ];

    return testCases;
  }

  private generateExpectedOutput(input: string, rule: Rule): string {
    if (!rule.autoFix) return input;

    // Implement basic auto-fix logic
    // This is a simplified version - you might want to enhance this
    return input.replace(new RegExp(rule.pattern), (match) => {
      if (rule.solution.includes('replace')) {
        return rule.solution.split('replace')[1].trim();
      }
      return match;
    });
  }

  private generateEdgeCases(rule: Rule): {
    input: string;
    expected: string;
  }[] {
    // Generate edge cases based on rule pattern
    const edgeCases = [];
    
    // Add cases with similar but valid patterns
    edgeCases.push({
      input: `valid_${rule.pattern.replace(/\\/g, '')}`,
      expected: `valid_${rule.pattern.replace(/\\/g, '')}`
    });
    
    // Add cases with partial matches
    edgeCases.push({
      input: rule.pattern.substring(0, rule.pattern.length / 2),
      expected: rule.pattern.substring(0, rule.pattern.length / 2)
    });
    
    return edgeCases;
  }

  private async runTestCases(
    rule: Rule,
    testCases: { input: string; expected: string }[]
  ): Promise<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[]> {
    return testCases.map(testCase => {
      const actual = this.applyRule(rule, testCase.input);
      return {
        ...testCase,
        actual,
        passed: actual === testCase.expected
      };
    });
  }

  private applyRule(rule: Rule, input: string): string {
    if (!rule.autoFix) return input;

    try {
      return input.replace(new RegExp(rule.pattern), (match) => {
        if (rule.solution.includes('replace')) {
          return rule.solution.split('replace')[1].trim();
        }
        return match;
      });
    } catch (error) {
      console.error(`Error applying rule ${rule.name}:`, error);
      return input;
    }
  }

  private calculateEffectiveness(results: {
    passed: boolean;
  }[]): number {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    return passed / total;
  }

  private async measurePerformanceImpact(rule: Rule): Promise<number> {
    // Measure performance impact of applying the rule
    const testInput = 'a'.repeat(1000); // Large input for performance testing
    const iterations = 1000;
    
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.applyRule(rule, testInput);
    }
    const endTime = performance.now();
    
    const timePerOperation = (endTime - startTime) / iterations;
    return timePerOperation;
  }
} 