#!/usr/bin/env node

// Nutrition Compliance Check for Philly Wings Express
// Audits existing nutrition data for FDA compliance and generates report

import { nutritionData } from '../data/nutrition-data.js';
import { FDARounding, DailyValues, validateNutrition } from '../../src/models/nutrition-schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Audit results storage
const auditResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalItems: 0,
    compliant: 0,
    warnings: 0,
    errors: 0
  },
  categories: {},
  issues: [],
  recommendations: []
};

console.log(`${colors.blue}🔍 Philly Wings Nutrition Compliance Audit${colors.reset}`);
console.log(`${colors.blue}===========================================${colors.reset}\n`);

// Check each category
Object.entries(nutritionData).forEach(([category, items]) => {
  console.log(`${colors.magenta}📋 Checking ${category.toUpperCase()}...${colors.reset}`);
  
  auditResults.categories[category] = {
    total: 0,
    compliant: 0,
    warnings: 0,
    errors: 0,
    items: {}
  };
  
  Object.entries(items).forEach(([itemId, item]) => {
    auditResults.summary.totalItems++;
    auditResults.categories[category].total++;
    
    const itemAudit = auditItem(item, category);
    auditResults.categories[category].items[itemId] = itemAudit;
    
    if (itemAudit.errors.length > 0) {
      auditResults.summary.errors++;
      auditResults.categories[category].errors++;
      console.log(`  ${colors.red}❌ ${item.name}${colors.reset}`);
      itemAudit.errors.forEach(error => {
        console.log(`     ${colors.red}└─ ${error}${colors.reset}`);
      });
    } else if (itemAudit.warnings.length > 0) {
      auditResults.summary.warnings++;
      auditResults.categories[category].warnings++;
      console.log(`  ${colors.yellow}⚠️  ${item.name}${colors.reset}`);
      itemAudit.warnings.forEach(warning => {
        console.log(`     ${colors.yellow}└─ ${warning}${colors.reset}`);
      });
    } else {
      auditResults.summary.compliant++;
      auditResults.categories[category].compliant++;
      console.log(`  ${colors.green}✅ ${item.name}${colors.reset}`);
    }
  });
  
  console.log('');
});

// Perform detailed audit on each item
function auditItem(item, category) {
  const audit = {
    name: item.name,
    errors: [],
    warnings: [],
    recommendations: []
  };
  
  // Check required fields
  if (!item.servingSize) {
    audit.errors.push('Missing serving size');
  }
  
  // Check for metric weight (FDA requirement)
  if (item.servingSize && !item.servingSize.includes('g') && !item.servingSize.includes('oz')) {
    audit.warnings.push(`Serving size should include metric weight: "${item.servingSize}"`);
  }
  
  // Check new FDA requirements (2020)
  if (item.addedSugars === undefined) {
    audit.errors.push('Missing added sugars (required as of 2020)');
  }
  
  if (item.vitaminD === undefined) {
    audit.errors.push('Missing vitamin D (required as of 2020)');
  }
  
  if (item.potassium === undefined) {
    audit.errors.push('Missing potassium (required as of 2020)');
  }
  
  // Check rounding compliance
  if (item.calories !== undefined) {
    const roundedCalories = FDARounding.calories(item.calories);
    if (item.calories !== roundedCalories) {
      audit.warnings.push(`Calories should be rounded to ${roundedCalories} (currently ${item.calories})`);
    }
  }
  
  if (item.totalFat !== undefined) {
    const roundedFat = FDARounding.fat(item.totalFat);
    if (item.totalFat !== roundedFat) {
      audit.warnings.push(`Total fat should be rounded to ${roundedFat}g (currently ${item.totalFat}g)`);
    }
  }
  
  if (item.sodium !== undefined) {
    const roundedSodium = FDARounding.mgValues(item.sodium);
    if (item.sodium !== roundedSodium) {
      audit.warnings.push(`Sodium should be rounded to ${roundedSodium}mg (currently ${item.sodium}mg)`);
    }
  }
  
  // Check allergen declarations
  if (!item.allergens || item.allergens.length === 0) {
    if (category === 'wings' || category === 'sides') {
      audit.warnings.push('No allergen information provided');
    }
  }
  
  // Check for cross-contact warnings on fried items
  if ((category === 'wings' || category === 'sides') && !item.warning) {
    audit.warnings.push('Missing cross-contact warning for fried items');
  }
  
  // Validate daily values
  if (item.calories !== undefined && item.calories > 0) {
    // Check if item qualifies for any claims
    if (item.protein && (item.protein / DailyValues.protein) >= 0.2) {
      audit.recommendations.push('Qualifies for "High Protein" claim (≥20% DV)');
    }
    
    if (item.sodium && item.sodium < 140) {
      audit.recommendations.push('Qualifies for "Low Sodium" claim (<140mg)');
    }
    
    if (item.totalCarbs && item.dietaryFiber) {
      const netCarbs = item.totalCarbs - item.dietaryFiber;
      if (netCarbs <= 5) {
        audit.recommendations.push('Qualifies for "Keto-Friendly" designation (≤5g net carbs)');
      }
    }
  }
  
  // Special checks for specific categories
  if (category === 'sauces') {
    if (!item.servingSize || !item.servingSize.includes('oz')) {
      audit.warnings.push('Sauce serving size should be in ounces');
    }
  }
  
  if (category === 'combos') {
    if (!item.name.toLowerCase().includes('serves')) {
      audit.recommendations.push('Consider adding serving size (e.g., "Serves 2-3")');
    }
  }
  
  return audit;
}

// Generate compliance summary
console.log(`${colors.blue}📊 COMPLIANCE SUMMARY${colors.reset}`);
console.log(`${colors.blue}===================${colors.reset}`);
console.log(`Total Items Audited: ${auditResults.summary.totalItems}`);
console.log(`${colors.green}✅ Fully Compliant: ${auditResults.summary.compliant} (${Math.round(auditResults.summary.compliant / auditResults.summary.totalItems * 100)}%)${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings: ${auditResults.summary.warnings} (${Math.round(auditResults.summary.warnings / auditResults.summary.totalItems * 100)}%)${colors.reset}`);
console.log(`${colors.red}❌ Errors: ${auditResults.summary.errors} (${Math.round(auditResults.summary.errors / auditResults.summary.totalItems * 100)}%)${colors.reset}\n`);

// Top issues
const allIssues = [];
Object.values(auditResults.categories).forEach(category => {
  Object.values(category.items).forEach(item => {
    allIssues.push(...item.errors.map(e => ({ type: 'error', issue: e })));
    allIssues.push(...item.warnings.map(w => ({ type: 'warning', issue: w })));
  });
});

// Count issue frequency
const issueFrequency = {};
allIssues.forEach(({ issue }) => {
  issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
});

// Sort by frequency
const topIssues = Object.entries(issueFrequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

if (topIssues.length > 0) {
  console.log(`${colors.magenta}🔝 TOP COMPLIANCE ISSUES${colors.reset}`);
  console.log(`${colors.magenta}========================${colors.reset}`);
  topIssues.forEach(([issue, count]) => {
    const percentage = Math.round(count / auditResults.summary.totalItems * 100);
    console.log(`• ${issue}: ${count} items (${percentage}%)`);
  });
  console.log('');
}

// Recommendations
console.log(`${colors.green}💡 RECOMMENDATIONS${colors.reset}`);
console.log(`${colors.green}==================${colors.reset}`);
console.log('1. Add missing 2020 FDA requirements: Added Sugars, Vitamin D, Potassium');
console.log('2. Include metric weights (grams) for all serving sizes');
console.log('3. Apply FDA rounding rules to all nutrient values');
console.log('4. Add cross-contact warnings for all fried items');
console.log('5. Consider highlighting items that qualify for health claims');
console.log('6. Implement regular lab testing to verify nutrition accuracy\n');

// Generate detailed report file
const reportPath = path.join(__dirname, `nutrition-audit-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
console.log(`${colors.blue}📄 Detailed report saved to: ${reportPath}${colors.reset}\n`);

// Generate action items
console.log(`${colors.magenta}📝 ACTION ITEMS${colors.reset}`);
console.log(`${colors.magenta}===============${colors.reset}`);
console.log('1. Update nutrition-data.js with missing nutrients');
console.log('2. Migrate data to new enhanced schema format');
console.log('3. Create supplier documentation tracking system');
console.log('4. Schedule third-party lab testing for verification');
console.log('5. Train staff on allergen protocols');
console.log('6. Update nutrition modal to display new required nutrients\n');

// Exit with appropriate code
const hasErrors = auditResults.summary.errors > 0;
if (hasErrors) {
  console.log(`${colors.red}❌ Audit completed with errors. Please address critical issues.${colors.reset}`);
  process.exit(1);
} else if (auditResults.summary.warnings > 0) {
  console.log(`${colors.yellow}⚠️  Audit completed with warnings. Consider addressing for full compliance.${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.green}✅ Audit completed successfully! All items are FDA compliant.${colors.reset}`);
  process.exit(0);
}