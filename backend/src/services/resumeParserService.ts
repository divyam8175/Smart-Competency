import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { IEducation, IExperience, IProject, IResumeSnapshot } from '../models/CandidateProfile';

const extractTextFromPdfBuffer = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    await parser.destroy().catch(() => undefined);
  }
};

type UploadedResumeFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

const COMMON_SKILLS = [
  'javascript',
  'typescript',
  'react',
  'node.js',
  'node',
  'express',
  'mongodb',
  'sql',
  'python',
  'aws',
  'docker',
  'kubernetes',
  'css',
  'html',
  'graphql',
  'azure',
  'java',
  'c#',
  'ci/cd',
];

export interface ResumeParseResult {
  snapshot: IResumeSnapshot;
  autofill: {
    phone?: string;
    education: IEducation[];
    skills: string[];
    projects: IProject[];
    experience: IExperience[];
  };
}

const extractTextFromFile = async (file: UploadedResumeFile): Promise<string> => {
  const mime = file.mimetype;

  if (mime === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPdfBuffer(file.buffer);
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.originalname.toLowerCase().endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  return file.buffer.toString('utf8');
};

const findSection = (text: string, label: string): string => {
  const regex = new RegExp(`${label}\s*:?(.*?)(?=\n[A-Z][A-Za-z /&]+:?|$)`, 'is');
  const match = text.match(regex);
  if (!match || !match[1]) return '';
  return match[1].trim();
};

const splitList = (section: string): string[] => {
  return section
    .split(/\n|•|-\s+/)
    .map((line) => line.replace(/^[•\-\s]+/, '').trim())
    .filter((line) => line.length > 2);
};

const parseEducation = (text: string): IEducation[] => {
  const section = findSection(text, 'Education');
  if (!section) return [];
  const entries = splitList(section).slice(0, 4);

  return entries.map((entry) => {
    const yearMatch = entry.match(/(20\d{2}|19\d{2})/);
    const [degreePart, institutionPart] = entry.split(/ at | - |, /i);
    return {
      degree: degreePart?.trim() || entry,
      institution: institutionPart?.trim() || 'N/A',
      graduationYear: yearMatch?.[0] || 'N/A',
    };
  });
};

const parseProjects = (text: string): IProject[] => {
  const section = findSection(text, 'Projects');
  if (!section) return [];
  const entries = splitList(section).slice(0, 5);

  return entries.map((entry) => {
    const [name, description] = entry.split(/\s*-\s*/);
    const linkMatch = entry.match(/https?:\/\/[^\s)]+/i);
    const project: IProject = {
      name: name?.trim() || entry,
    };

    const cleanedDescription = description?.trim();
    if (cleanedDescription) {
      project.description = cleanedDescription;
    }

    if (linkMatch?.[0]) {
      project.link = linkMatch[0];
    }

    return project;
  });
};

const parseExperience = (text: string): IExperience[] => {
  const section = findSection(text, 'Experience') || findSection(text, 'Professional Experience');
  if (!section) return [];
  const entries = splitList(section).slice(0, 5);

  return entries.map((entry) => {
    const durationMatch = entry.match(/(20\d{2}|19\d{2}).{0,3}(Present|20\d{2}|19\d{2})/i);
    const [organizationPart, rolePart] = entry.split(/ - | at /i);
    const experience: IExperience = {
      organization: organizationPart?.trim() || 'Experience',
      role: rolePart?.trim() || 'Contributor',
      summary: entry,
    };

    if (durationMatch?.[0]) {
      experience.duration = durationMatch[0];
    }

    return experience;
  });
};

const parseSkills = (text: string): string[] => {
  const normalized = text.toLowerCase();
  const detected = COMMON_SKILLS.filter((skill) => normalized.includes(skill));
  if (detected.length >= 5) {
    return Array.from(new Set(detected)).slice(0, 20);
  }

  const section = findSection(text, 'Skills');
  if (!section) return detected;
  const tokens = section
    .split(/,|\n|•/)
    .map((token) => token.trim())
    .filter(Boolean);
  return Array.from(new Set([...(detected || []), ...tokens])).slice(0, 20);
};

const parsePhone = (text: string): string | undefined => {
  const match = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return match?.[0]?.trim();
};

export const parseResume = async (file: UploadedResumeFile): Promise<ResumeParseResult> => {
  const rawText = await extractTextFromFile(file);
  const education = parseEducation(rawText);
  const projects = parseProjects(rawText);
  const experience = parseExperience(rawText);
  const skills = parseSkills(rawText);
  const phone = parsePhone(rawText);

  const snapshot: IResumeSnapshot = {
    rawText,
    education,
    projects,
    experience,
    skills,
    parsedAt: new Date(),
    sourceName: file.originalname,
  };

  const autofill: ResumeParseResult['autofill'] = {
    education,
    projects,
    experience,
    skills,
  };

  if (phone) {
    autofill.phone = phone;
  }

  return {
    snapshot,
    autofill,
  };
};
