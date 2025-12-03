import { ICandidateProfile, ISkillGapEntry } from '../models/CandidateProfile';

const ROLE_SKILL_LIBRARY: Record<string, string[]> = {
  'frontend developer': ['react', 'typescript', 'javascript', 'css', 'html', 'testing', 'accessibility', 'vite', 'ux collaboration'],
  'backend developer': ['node', 'express', 'mongodb', 'sql', 'api design', 'security', 'testing', 'docker'],
  'fullstack engineer': ['react', 'node', 'typescript', 'rest', 'graphql', 'ci/cd', 'cloud'],
  'data engineer': ['python', 'sql', 'spark', 'etl', 'data modeling', 'airflow', 'aws'],
};

const DEFAULT_TARGET = ['communication', 'teamwork', 'continuous learning'];

const actionLibrary: Record<string, string> = {
  react: 'Build a mini design system in React with accessibility baked in.',
  javascript: 'Complete advanced JS patterns course focusing on performance.',
  typescript: 'Adopt TypeScript strict mode across a side project.',
  css: 'Recreate a complex UI from Dribbble using modern CSS features.',
  html: 'Practice semantic HTML by auditing an existing page for a11y issues.',
  testing: 'Add component tests using Vitest + Testing Library.',
  accessibility: 'Run axe audits on a project and fix reported issues.',
  mongodb: 'Model multi-tenant schemas and practice aggregation pipelines.',
  sql: 'Write window-function heavy reports for realistic datasets.',
  'api design': 'Document an API with OpenAPI and add contract tests.',
  security: 'Run OWASP ZAP against an app and address the findings.',
  docker: 'Containerize the scoring API with multi-stage builds.',
  node: 'Implement streaming APIs with Node and measure throughput.',
  express: 'Refactor middleware with proper validation + error handling.',
  'ci/cd': 'Configure GitHub Actions with automated quality gates.',
  cloud: 'Deploy on AWS/GCP and instrument with logs + metrics.',
};

const normalize = (value: string): string => value.trim().toLowerCase();

export interface SkillGapAnalysisResult extends ISkillGapEntry {
  readinessScore: number;
  recommendedRoadmap: Array<{ skill: string; action: string }>;
}

export const analyzeSkillGaps = (
  profile: Pick<ICandidateProfile, 'skills' | 'resumeSnapshot' | 'experience'>,
  roleFocus?: string,
  customRequirements?: string[]
): SkillGapAnalysisResult => {
  const inventory = new Set<string>();

  profile.skills.forEach((skill) => inventory.add(normalize(skill)));
  profile.resumeSnapshot?.skills.forEach((skill) => inventory.add(normalize(skill)));
  profile.experience?.forEach((exp) => inventory.add(normalize(exp.role)));

  const targetFromRole = roleFocus ? ROLE_SKILL_LIBRARY[normalize(roleFocus)] : undefined;
  const targetSkills = new Set<string>([...(targetFromRole || []), ...(customRequirements || []), ...DEFAULT_TARGET]);

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  targetSkills.forEach((skill) => {
    if (!skill) return;
    if (inventory.has(normalize(skill))) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const readinessScore = targetSkills.size ? Math.round((matchingSkills.length / targetSkills.size) * 100) : 50;

  const recommendedLearning: string[] = missingSkills.map((skill) => actionLibrary[skill] || `Practice ${skill} with a focused mini-project.`);

  const recommendedRoadmap = missingSkills.slice(0, 5).map((skill) => ({
    skill,
    action: actionLibrary[skill] || `Schedule deliberate practice sessions for ${skill}.`,
  }));

  const summary = roleFocus
    ? `Compared with a ${roleFocus} expectations, ${matchingSkills.length} strengths detected and ${missingSkills.length} priority gaps remain.`
    : `Identified ${missingSkills.length} gaps against the core competency map.`;

  const result: SkillGapAnalysisResult = {
    missingSkills,
    matchingSkills,
    recommendedLearning,
    summary,
    analyzedAt: new Date(),
    readinessScore,
    recommendedRoadmap,
  };

  if (roleFocus) {
    result.roleFocus = roleFocus;
  }

  return result;
};
