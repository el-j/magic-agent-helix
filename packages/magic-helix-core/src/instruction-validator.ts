/**
 * Instruction Quality Validator
 * Scores AI instructions based on structure, clarity, and completeness
 * Based on insights from awesome-ai-system-prompts
 */

export interface InstructionQuality {
  overallScore: number; // 0-100
  structureScore: number; // 0-100
  clarityScore: number; // 0-100
  completenessScore: number; // 0-100
  recommendations: string[];
  missingElements: string[];
}

export interface InstructionElement {
  name: string;
  weight: number; // Importance weight (0-1)
  required: boolean;
  check: (instruction: string) => boolean;
}

/**
 * Core elements that high-quality instructions should contain
 * Based on analysis of v0, Claude, ChatGPT, Cline, etc.
 */
export const INSTRUCTION_ELEMENTS: InstructionElement[] = [
  // Role Definition (Critical)
  {
    name: 'Expert Identity',
    weight: 1.0,
    required: true,
    check: (s) => /you are (an?|the) .+? (expert|specialist|assistant)/i.test(s)
  },
  {
    name: 'Capability Declarations',
    weight: 0.8,
    required: true,
    check: (s) => /you (can|excel at|have expertise in)/i.test(s)
  },
  {
    name: 'Scope Boundaries',
    weight: 0.7,
    required: false,
    check: (s) => /you (will not|won't|cannot|must not)/i.test(s)
  },
  
  // Organization Structure (Important)
  {
    name: 'Clear Headings',
    weight: 0.9,
    required: true,
    check: (s) => (s.match(/^##? /gm) || []).length >= 3
  },
  {
    name: 'Structured Sections',
    weight: 0.8,
    required: false,
    check: (s) => /<rules>|<thinking>|```xml/i.test(s) || (s.match(/^###? /gm) || []).length >= 5
  },
  
  // Tool Guidelines (Critical for agentic AI)
  {
    name: 'Tool Documentation',
    weight: 1.0,
    required: true,
    check: (s) => /tool|function|command|api/i.test(s) && /parameter|argument|input/i.test(s)
  },
  {
    name: 'Tool Usage Policies',
    weight: 0.9,
    required: true,
    check: (s) => /when to use|when not to use|prefer|avoid/i.test(s)
  },
  {
    name: 'Concrete Examples',
    weight: 0.8,
    required: true,
    check: (s) => (s.match(/```[\s\S]+?```/g) || []).length >= 2
  },
  
  // Reasoning Patterns (Important)
  {
    name: 'Step-by-Step Process',
    weight: 0.7,
    required: false,
    check: (s) => /^\d+\. /gm.test(s) || /first|then|next|finally/i.test(s)
  },
  {
    name: 'Thinking/Planning Phase',
    weight: 0.6,
    required: false,
    check: (s) => /<thinking>|before .+?, (think|plan|analyze)/i.test(s)
  },
  {
    name: 'Confirmation Gates',
    weight: 0.8,
    required: false,
    check: (s) => /confirmation|preview|show .+? before|ask .+? before/i.test(s)
  },
  
  // Safety Protocols (Critical)
  {
    name: 'Refusal Guidelines',
    weight: 1.0,
    required: true,
    check: (s) => /refuse|decline|cannot (assist|help) with|inappropriate/i.test(s)
  },
  {
    name: 'Destructive Action Warnings',
    weight: 0.9,
    required: false,
    check: (s) => /warning|caution|delete|remove|overwrite/i.test(s)
  },
  
  // Tone & Style (Moderate)
  {
    name: 'Communication Style',
    weight: 0.5,
    required: false,
    check: (s) => /concise|brief|direct|friendly|professional|tone/i.test(s)
  },
  {
    name: 'Forbidden Phrases',
    weight: 0.4,
    required: false,
    check: (s) => /do not (say|use|start with)|avoid (saying|phrases like)/i.test(s)
  }
];

/**
 * Validates instruction quality and returns detailed scoring
 */
export function validateInstructions(instruction: string): InstructionQuality {
  const results = INSTRUCTION_ELEMENTS.map(element => ({
    element,
    passed: element.check(instruction)
  }));
  
  // Calculate structure score (organization and formatting)
  const structureElements = results.filter(r => 
    ['Clear Headings', 'Structured Sections'].includes(r.element.name)
  );
  const structureScore = calculateScore(structureElements);
  
  // Calculate clarity score (examples and communication style)
  const clarityElements = results.filter(r => 
    ['Concrete Examples', 'Communication Style', 'Forbidden Phrases'].includes(r.element.name)
  );
  const clarityScore = calculateScore(clarityElements);
  
  // Calculate completeness score (all critical elements)
  const completenessElements = results.filter(r => r.element.required);
  const completenessScore = calculateScore(completenessElements);
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (structureScore * 0.3 + clarityScore * 0.2 + completenessScore * 0.5)
  );
  
  // Identify missing elements
  const missingElements = results
    .filter(r => r.element.required && !r.passed)
    .map(r => r.element.name);
  
  // Generate recommendations
  const recommendations = generateRecommendations(results, instruction);
  
  return {
    overallScore,
    structureScore,
    clarityScore,
    completenessScore,
    recommendations,
    missingElements
  };
}

/**
 * Calculates score from element results (0-100)
 */
function calculateScore(results: { element: InstructionElement; passed: boolean }[]): number {
  if (results.length === 0) return 100;
  
  const totalWeight = results.reduce((sum, r) => sum + r.element.weight, 0);
  const achievedWeight = results
    .filter(r => r.passed)
    .reduce((sum, r) => sum + r.element.weight, 0);
  
  return Math.round((achievedWeight / totalWeight) * 100);
}

/**
 * Generates actionable recommendations for improvement
 */
function generateRecommendations(
  results: { element: InstructionElement; passed: boolean }[],
  instruction: string
): string[] {
  const recommendations: string[] = [];
  
  // Check for missing critical elements
  const missingCritical = results.filter(r => r.element.required && !r.passed);
  if (missingCritical.length > 0) {
    recommendations.push(
      `Add ${missingCritical.length} critical element(s): ${missingCritical.map(r => r.element.name).join(', ')}`
    );
  }
  
  // Check for expert identity
  if (!results.find(r => r.element.name === 'Expert Identity')?.passed) {
    recommendations.push(
      'Add expert identity: Start with "You are an expert [domain] specialist..."'
    );
  }
  
  // Check for tool guidelines
  if (!results.find(r => r.element.name === 'Tool Documentation')?.passed) {
    recommendations.push(
      'Add tool documentation: Include function schemas with parameters and examples'
    );
  }
  
  // Check for safety protocols
  if (!results.find(r => r.element.name === 'Refusal Guidelines')?.passed) {
    recommendations.push(
      'Add refusal guidelines: Specify what requests should be declined and how'
    );
  }
  
  // Check for code examples
  const codeBlockCount = (instruction.match(/```[\s\S]+?```/g) || []).length;
  if (codeBlockCount < 3) {
    recommendations.push(
      `Add more code examples: Currently ${codeBlockCount}, aim for at least 5 concrete examples`
    );
  }
  
  // Check for good vs bad examples
  const hasGoodBad = /✅|❌|good:|bad:/i.test(instruction);
  if (!hasGoodBad) {
    recommendations.push(
      'Add ✅/❌ comparisons: Show good vs bad examples for clarity'
    );
  }
  
  // Check instruction length
  const wordCount = instruction.split(/\s+/).length;
  if (wordCount < 500) {
    recommendations.push(
      `Instructions may be too brief (${wordCount} words). Aim for 1000-3000 words for comprehensive guidance.`
    );
  } else if (wordCount > 5000) {
    recommendations.push(
      `Instructions may be too long (${wordCount} words). Consider breaking into sections or modules.`
    );
  }
  
  // Check for confirmation gates
  if (!results.find(r => r.element.name === 'Confirmation Gates')?.passed) {
    recommendations.push(
      'Consider adding confirmation gates for destructive operations (delete, overwrite)'
    );
  }
  
  // If no recommendations, indicate quality is high
  if (recommendations.length === 0) {
    recommendations.push('Instructions meet quality standards. Consider A/B testing variants for optimization.');
  }
  
  return recommendations;
}

/**
 * Quick quality check - returns pass/fail based on threshold
 */
export function passesQualityThreshold(instruction: string, threshold = 70): boolean {
  const quality = validateInstructions(instruction);
  return quality.overallScore >= threshold;
}

/**
 * Returns a quality grade (A-F) based on score
 */
export function getQualityGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Formats validation results for CLI output
 */
export function formatValidationReport(quality: InstructionQuality): string {
  const lines: string[] = [];
  
  lines.push('=== Instruction Quality Report ===\n');
  lines.push(`Overall Score: ${quality.overallScore}/100 (${getQualityGrade(quality.overallScore)})\n`);
  lines.push(`  Structure:    ${quality.structureScore}/100`);
  lines.push(`  Clarity:      ${quality.clarityScore}/100`);
  lines.push(`  Completeness: ${quality.completenessScore}/100\n`);
  
  if (quality.missingElements.length > 0) {
    lines.push('❌ Missing Critical Elements:');
    for (const element of quality.missingElements) {
      lines.push(`   - ${element}`);
    }
    lines.push('');
  }
  
  if (quality.recommendations.length > 0) {
    lines.push('💡 Recommendations:');
    for (const rec of quality.recommendations) {
      lines.push(`   - ${rec}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}
