import { ruleSystem, RuleCategory } from './context-rules'

// Rule Application Utilities
export const ruleUtils = {
  // Check for rule violations in code
  checkCode: (code: string, category: RuleCategory) => {
    const violations = ruleSystem.monitorRules(code)
    if (violations.length > 0) {
      console.warn('Rule violations detected:', violations)
      return false
    }
    return true
  },

  // Generate new rule based on pattern
  createRule: (pattern: string, context: any, category: RuleCategory) => {
    return ruleSystem.generateNewRule(category, pattern, context)
  },

  // Validate specific rule
  validateSpecificRule: (ruleName: string, context: any) => {
    const rule = Object.values(ruleSystem.currentRules)
      .flat()
      .find(r => r.name === ruleName)
    
    if (!rule) return false
    return ruleSystem.validateRule(rule, context)
  },

  // Get all rules for a category
  getCategoryRules: (category: RuleCategory) => {
    return ruleSystem.currentRules[category]
  },

  // Add custom rule
  addCustomRule: (category: RuleCategory, rule: any) => {
    ruleSystem.currentRules[category].push(rule)
  },

  // PDF Generation Specific Checks
  checkPdfGeneration: (code: string) => {
    const violations = ruleSystem.monitorRules(code)
    const quantityViolations = violations.filter(v => 
      v.includes('quantity') || 
      v.includes('OrderQuantityCalculation')
    )

    if (quantityViolations.length > 0) {
      console.warn('PDF Generation Quantity Violations:', quantityViolations)
      return false
    }
    return true
  },

  // Validate Order Quantity Calculations
  validateOrderQuantities: (code: string) => {
    const orderRule = ruleSystem.currentRules[RuleCategory.DATABASE]
      .find(rule => rule.name === 'OrderQuantityCalculation')

    if (!orderRule) return true

    // Check for direct quantity usage
    const hasDirectQuantity = code.includes('order.quantity')
    const hasForbiddenPatterns = orderRule.structure.forbidden.some(forbidden => 
      code.includes(forbidden)
    )

    if (!hasDirectQuantity || hasForbiddenPatterns) {
      console.warn('Order quantity calculation issues detected')
      return false
    }

    return true
  }
}

// Example usage:
/*
// Check code for violations
const code = `
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  const orders = ticket.orders // This would violate our rules
`
ruleUtils.checkCode(code, RuleCategory.DATABASE)

// Create new rule
const newRule = ruleUtils.createRule(
  'handling menu items',
  { context: 'menu item processing' },
  RuleCategory.BUSINESS
)

// Validate specific rule
const isValid = ruleUtils.validateSpecificRule('PurchaseBasedModel', code)

// Check PDF generation code
const pdfCode = `
  const orders = await prisma.order.findMany({
    where: { purchase: { campaignId } }
  })
  const quantity = orders.reduce((sum, order) => sum + order.quantity, 0)
`
ruleUtils.checkPdfGeneration(pdfCode)
ruleUtils.validateOrderQuantities(pdfCode)
*/ 