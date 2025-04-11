// Context-Aware Rule System
// This file contains the meta-rule system for generating and managing context-aware rules

// Base Rule Interface
interface BaseRule {
  name: string
  context: {
    when: string
    why: string
    impact: string
  }
  structure: {
    interface: string
    examples: string[]
    forbidden: string[]
  }
  validation: {
    check: string
    test: string[]
    monitor: string
  }
}

// Rule Categories
export enum RuleCategory {
  DATABASE = 'database',
  BUSINESS = 'business',
  UI = 'ui',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

// Pattern Detection Interface
interface PatternDetection {
  detect: (context: any) => string[]
  analyze: (patterns: string[]) => {
    name: string
    when: string
    why: string
    impact: string
  }
  document: (analysis: any) => BaseRule
}

// Rule Generation Context
export interface RuleGenerationContext {
  patterns: {
    repeatedIssues: PatternDetection
    dataRelationships: PatternDetection
    businessLogic: PatternDetection
  }
  categories: Record<RuleCategory, BaseRule[]>
}

// Current Rules Implementation
export const currentRules: Record<RuleCategory, BaseRule[]> = {
  [RuleCategory.DATABASE]: [
    {
      name: 'PurchaseBasedModel',
      context: {
        when: 'When handling orders or tickets',
        why: 'To maintain consistent data relationships',
        impact: 'Prevents incorrect data flow and quantity issues'
      },
      structure: {
        interface: `
          interface PurchaseRelations {
            orders: Order[]
            tickets: Ticket[]
            campaign: Campaign
            user: User
          }
        `,
        examples: [
          'Get orders through purchase.orders',
          'Get tickets through purchase.tickets'
        ],
        forbidden: [
          'ticket.orders',
          'order.ticketId'
        ]
      },
      validation: {
        check: 'Verify orders and tickets are linked through purchase',
        test: [
          'Test order creation through purchase',
          'Test ticket creation through purchase'
        ],
        monitor: 'Check for direct ticket-order relationships'
      }
    },
    {
      name: 'OrderQuantityCalculation',
      context: {
        when: 'When calculating order quantities in PDFs or reports',
        why: 'To prevent multiplication of quantities through ticket relationships',
        impact: 'Ensures correct order quantities in all outputs'
      },
      structure: {
        interface: `
          interface OrderQuantityRules {
            directOrder: 'Use order.quantity directly'
            purchaseBased: 'Get orders through purchase.orders'
            pdfGeneration: 'Use purchase.orders for quantity calculations'
          }
        `,
        examples: [
          'const orders = await prisma.order.findMany({ where: { purchase: { campaignId } } })',
          'const quantity = order.quantity // Use directly'
        ],
        forbidden: [
          'ticket.orders.reduce((sum, order) => sum + order.quantity, 0)',
          'purchase.tickets.length * order.quantity',
          'ticket.quantity * order.quantity'
        ]
      },
      validation: {
        check: 'Verify order quantities are calculated directly from orders',
        test: [
          'Test PDF generation with multiple orders',
          'Test order quantity calculations in reports'
        ],
        monitor: 'Check for quantity multiplication in order processing'
      }
    }
  ],
  [RuleCategory.BUSINESS]: [
    {
      name: 'QuantityHandling',
      context: {
        when: 'When calculating quantities',
        why: 'To prevent multiplication issues',
        impact: 'Ensures correct quantity calculations'
      },
      structure: {
        interface: `
          interface QuantityRules {
            orderQuantities: {
              baseItem: string
              comboItem: string
            }
            ticketQuantities: {
              standard: string
              payItForward: string
            }
          }
        `,
        examples: [
          'Use order.quantity directly',
          'Count tickets separately from orders'
        ],
        forbidden: [
          'ticket.quantity * order.quantity',
          'purchase.tickets.length * order.quantity'
        ]
      },
      validation: {
        check: 'Verify quantities are calculated correctly',
        test: [
          'Test order quantity calculations',
          'Test ticket quantity calculations'
        ],
        monitor: 'Check for quantity multiplication issues'
      }
    }
  ],
  [RuleCategory.UI]: [],
  [RuleCategory.SECURITY]: [],
  [RuleCategory.PERFORMANCE]: []
}

// Rule Generation Function
export function generateNewRule(
  category: RuleCategory,
  pattern: string,
  context: any
): BaseRule {
  // Detect pattern
  const detectedPatterns = currentRules[category].find(rule => 
    rule.context.when.includes(pattern)
  )

  if (detectedPatterns) {
    return detectedPatterns
  }

  // Generate new rule
  const newRule: BaseRule = {
    name: `AutoGeneratedRule_${Date.now()}`,
    context: {
      when: `When ${pattern}`,
      why: 'To prevent common mistakes',
      impact: 'Ensures consistent implementation'
    },
    structure: {
      interface: 'GeneratedInterface',
      examples: ['Example usage'],
      forbidden: ['Common mistakes']
    },
    validation: {
      check: 'How to verify correct usage',
      test: ['Test cases'],
      monitor: 'How to detect violations'
    }
  }

  // Add to current rules
  currentRules[category].push(newRule)

  return newRule
}

// Rule Validation Function
export function validateRule(rule: BaseRule, context: any): boolean {
  // Check if rule is being followed
  const violations = rule.structure.forbidden.filter(forbidden => 
    context.includes(forbidden)
  )

  return violations.length === 0
}

// Rule Monitoring Function
export function monitorRules(context: any): string[] {
  const violations: string[] = []

  Object.values(currentRules).forEach(rules => {
    rules.forEach(rule => {
      if (!validateRule(rule, context)) {
        violations.push(`Violation of rule: ${rule.name}`)
      }
    })
  })

  return violations
}

// Export the rule system
export const ruleSystem = {
  generateNewRule,
  validateRule,
  monitorRules,
  currentRules
} 