export type ImpactLevel = 'high' | 'medium' | 'low';
export enum RuleCategory {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  MAINTAINABILITY = 'maintainability',
  STYLE = 'style'
}
export type ProjectPhase = 'development' | 'testing' | 'production';

export interface PatternAnalysis {
  code: string;
  context: string;
  problem: string;
  solution: string;
  frequency: number;
  impact: ImpactLevel;
  category: RuleCategory;
  relatedFiles: string[];
  dependencies: string[];
  lastSeen: Date;
}

export interface RuleContext {
  fileType: string;
  projectPhase: ProjectPhase;
  teamPreferences: Record<string, any>;
  techStack: string[];
  environment: 'development' | 'production';
}

export interface Rule {
  name: string;
  pattern: string;
  solution: string;
  context: string;
  autoFix?: boolean;
  priority: number;
  confidence: number;
  examples: string[];
  category: RuleCategory;
  impact: ImpactLevel;
  version: string;
  createdAt: Date;
  lastUpdated: Date;
  deprecated?: boolean;
  metadata: {
    adoptionRate?: number;
    effectiveness?: number;
    falsePositives?: number;
    falseNegatives?: number;
  };
}

export interface TestResults {
  effectiveness: number;
  falsePositives: number;
  falseNegatives: number;
  performanceImpact: number;
  testCases: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
}

export interface AnalyticsReport {
  ruleAdoption: number;
  issuePrevention: number;
  timeSaved: number;
  mostEffectiveRules: Rule[];
  areasForImprovement: string[];
  ruleCategories: Record<RuleCategory, {
    count: number;
    effectiveness: number;
  }>;
}

export interface EmergencyOverride {
  rule: Rule;
  reason: string;
  duration: number;
  appliedBy: string;
  appliedAt: Date;
  expiresAt: Date;
}

export interface RuleVersion {
  major: number;
  minor: number;
  patch: number;
  changes: {
    type: 'breaking' | 'feature' | 'fix';
    description: string;
  }[];
} 