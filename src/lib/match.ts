import { getDb } from './db';
import { Resource } from './types';

export interface MatchQuery {
  naturalLanguagePrompt: string;
  userId: string;
  maxBudget?: number;
  categoryFilter?: 'equipment' | 'space' | 'digital';
}

export interface MatchScoreBreakdown {
  intentScore: number;       // 0 - 30
  budgetScore: number;       // 0 - 25
  eligibilityScore: number;  // 0 or 25 (HARD GATE)
  availabilityScore: number; // 0 - 20
  totalScore: number;        // 0 - 100
}

export interface MatchResultItem {
  resource: Resource;
  score: number;
  breakdown: MatchScoreBreakdown;
  isEligible: boolean;
  missingSkills: string[];
  explanation: string;
  isRecommended: boolean;
  isAlternative: boolean;
  suitabilityHighlights: string[];
}

export function executeSlotlyMatch(query: MatchQuery): MatchResultItem[] {
  const db = getDb();
  const promptLower = query.naturalLanguagePrompt.toLowerCase();

  // 1. Extract intent keywords & budget from prompt if not explicitly given
  let budgetLimit = query.maxBudget;
  if (!budgetLimit) {
    const budgetMatch = promptLower.match(/(?:budget|cost|under|below|max|rs\.?|₹)\s*(\d+)/i);
    if (budgetMatch) {
      budgetLimit = parseInt(budgetMatch[1], 10);
    }
  }

  // 2. Query all resources with their owner details and requirements
  const allResources = db.prepare(`
    SELECT r.*, u.name as owner_name, u.email as owner_email
    FROM resources r
    JOIN users u ON r.owner_id = u.id
    WHERE r.status != 'maintenance'
  `).all() as any[];

  // 3. Query user verified skills
  const userVerifiedSkills = db.prepare(`
    SELECT skill_id FROM user_skills WHERE user_id = ? AND status = 'verified'
  `).all(query.userId) as any[];
  const verifiedSkillSet = new Set(userVerifiedSkills.map(s => s.skill_id));

  // Category intent keywords
  const categoryKeywords: Record<string, string[]> = {
    equipment: ['printer', '3d', 'sem', 'microscope', 'camera', 'scope', 'red', 'oscilloscope', 'tool', 'device', 'rig', 'hardware', 'instrument'],
    space: ['room', 'cleanroom', 'arena', 'chamber', 'lab', 'facility', 'bay', 'mocap', 'flight', 'testing', 'acoustic', 'studio'],
    digital: ['gpu', 'h100', 'cluster', 'slurm', 'nvidia', 'ansys', 'fluent', 'license', 'token', 'compute', 'simulation', 'cad']
  };

  const results: MatchResultItem[] = allResources.map(res => {
    let intentScore = 5;
    const highlights: string[] = [];

    // Parse specifications
    let specs: Record<string, any> = {};
    try {
      specs = JSON.parse(res.specifications);
    } catch {
      specs = {};
    }

    const titleLower = res.title.toLowerCase();
    const descLower = res.description.toLowerCase();
    const subcatLower = res.subcategory.toLowerCase();
    const locationLower = res.location.toLowerCase();

    // Check query tokens against resource attributes
    const tokens = promptLower.split(/[\s,.-]+/).filter(t => t.length > 2);
    let matchedTokenCount = 0;

    for (const token of tokens) {
      if (titleLower.includes(token)) {
        matchedTokenCount += 2;
      } else if (descLower.includes(token) || subcatLower.includes(token)) {
        matchedTokenCount += 1;
      }
    }

    intentScore = Math.min(30, intentScore + matchedTokenCount * 5);

    if (matchedTokenCount > 0) {
      highlights.push(`Direct subject match for ${res.subcategory}`);
    }

    // Budget Score calculation
    let budgetScore = 20;
    if (budgetLimit !== undefined && budgetLimit > 0) {
      if (res.hourly_rate <= budgetLimit) {
        budgetScore = 25;
        highlights.push(`Within specified budget (₹${res.hourly_rate}/hr vs max ₹${budgetLimit})`);
      } else {
        const overPercent = (res.hourly_rate - budgetLimit) / budgetLimit;
        budgetScore = Math.max(0, Math.round(25 * (1 - overPercent)));
        highlights.push(`Exceeds budget cap by ₹${res.hourly_rate - budgetLimit}/hr`);
      }
    }

    // SkillGate Eligibility check (HARD CONSTRAINT)
    const requiredSkills = db.prepare(`
      SELECT s.id, s.name, rs.is_mandatory
      FROM resource_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.resource_id = ? AND rs.is_mandatory = 1
    `).all(res.id) as any[];

    const missingSkills: string[] = [];
    for (const req of requiredSkills) {
      if (!verifiedSkillSet.has(req.id)) {
        missingSkills.push(req.name);
      }
    }

    const isEligible = missingSkills.length === 0;
    let eligibilityScore = 25;
    if (!isEligible) {
      eligibilityScore = 0; // ZERO on failed gate
      highlights.push(`SkillGate Block: Requires verified qualification [${missingSkills.join(', ')}]`);
    } else if (requiredSkills.length > 0) {
      highlights.push(`SkillGate Verified: Your credentials satisfy ${requiredSkills.map(r => r.name).join(', ')}`);
    } else {
      highlights.push('Open access: No special safety prerequisites required');
    }

    // Availability score
    let availabilityScore = 15;
    if (res.status === 'available') {
      availabilityScore = 20;
      highlights.push('Immediately ready for reservation');
    } else if (res.status === 'in_use') {
      availabilityScore = 10;
      highlights.push('Currently active; slot opening follows turnaround buffer');
    }

    // Calculate total score
    // Notice: If not eligible, total score is capped heavily so it never outranks eligible assets!
    let totalScore = intentScore + budgetScore + eligibilityScore + availabilityScore;
    if (!isEligible) {
      totalScore = Math.min(35, totalScore * 0.4);
    }

    // Construct human-readable explanation
    let explanation = '';
    if (isEligible && totalScore >= 70) {
      explanation = `Highly recommended. Matched your ${res.subcategory} specification, fits comfortably within your budget (₹${res.hourly_rate}/hr), and your credentials satisfy all access prerequisites.`;
    } else if (!isEligible) {
      explanation = `Matches technical requirements but locked by SkillGate. You lack the mandatory safety clearance: ${missingSkills.join(', ')}.`;
    } else if (budgetLimit && res.hourly_rate > budgetLimit) {
      explanation = `Viable alternative meeting functional criteria, but hourly fee (₹${res.hourly_rate}/hr) exceeds your target budget by ₹${res.hourly_rate - budgetLimit}/hr.`;
    } else {
      explanation = `Compatible resource in ${res.location} with good operational readiness.`;
    }

    return {
      resource: {
        ...res,
        specifications: specs
      },
      score: Math.round(totalScore),
      breakdown: {
        intentScore,
        budgetScore,
        eligibilityScore,
        availabilityScore,
        totalScore: Math.round(totalScore)
      },
      isEligible,
      missingSkills,
      explanation,
      isRecommended: isEligible && totalScore >= 65,
      isAlternative: totalScore < 65 && totalScore >= 35,
      suitabilityHighlights: highlights
    };
  });

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Backward-compatible alias for existing tests and routes
export const executeIdleXMatch = executeSlotlyMatch;

