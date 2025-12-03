import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation {
  degree: string;
  institution: string;
  graduationYear: string;
}

export interface IProject {
  name: string;
  description?: string;
  link?: string;
}

export interface IExperience {
  organization: string;
  role: string;
  duration?: string;
  summary?: string;
}

export interface IScoreBreakdown {
  technical: number;
  cognitive: number;
  behavioral: number;
  communication: number;
  overall: number;
}

export interface IScoreHistoryEntry extends IScoreBreakdown {
  calculatedAt: Date;
}

export interface IResumeSnapshot {
  rawText: string;
  skills: string[];
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  parsedAt: Date;
  sourceName?: string;
}

export interface ISkillGapEntry {
  roleFocus?: string;
  missingSkills: string[];
  matchingSkills: string[];
  recommendedLearning: string[];
  summary: string;
  analyzedAt: Date;
}

export interface IJobFitAssessment {
  role: string;
  suitability: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface ICandidateProfile extends Document {
  user: mongoose.Types.ObjectId;
  phone?: string;
  education: IEducation[];
  skills: string[];
  projects: IProject[];
  experience: IExperience[];
  scores?: IScoreBreakdown;
  scoreHistory: IScoreHistoryEntry[];
  resumeSnapshot?: IResumeSnapshot | null;
  skillGapHistory: ISkillGapEntry[];
  jobFitAssessments: IJobFitAssessment[];
}

const educationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: String, required: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    link: { type: String },
  },
  { _id: false }
);

const experienceSchema = new Schema<IExperience>(
  {
    organization: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String },
    summary: { type: String },
  },
  { _id: false }
);

const resumeSnapshotSchema = new Schema<IResumeSnapshot>(
  {
    rawText: { type: String, required: true },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    parsedAt: { type: Date, default: Date.now },
    sourceName: { type: String },
  },
  { _id: false }
);

const skillGapSchema = new Schema<ISkillGapEntry>(
  {
    roleFocus: { type: String },
    missingSkills: { type: [String], default: [] },
    matchingSkills: { type: [String], default: [] },
    recommendedLearning: { type: [String], default: [] },
    summary: { type: String, required: true },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobFitSchema = new Schema<IJobFitAssessment>(
  {
    role: { type: String, required: true },
    suitability: { type: Number, required: true, min: 0, max: 100 },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String },
    education: { type: [educationSchema], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [projectSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    scores: {
      type: new Schema<IScoreBreakdown>(
        {
          technical: { type: Number, min: 0, max: 100 },
          cognitive: { type: Number, min: 0, max: 100 },
          behavioral: { type: Number, min: 0, max: 100 },
          communication: { type: Number, min: 0, max: 100 },
          overall: { type: Number, min: 0, max: 100 },
        },
        { _id: false }
      ),
      default: null,
    },
    scoreHistory: {
      type: [
        new Schema<IScoreHistoryEntry>(
          {
            technical: { type: Number, min: 0, max: 100, required: true },
            cognitive: { type: Number, min: 0, max: 100, required: true },
            behavioral: { type: Number, min: 0, max: 100, required: true },
            communication: { type: Number, min: 0, max: 100, required: true },
            overall: { type: Number, min: 0, max: 100, required: true },
            calculatedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    resumeSnapshot: {
      type: resumeSnapshotSchema,
      default: null,
    },
    skillGapHistory: {
      type: [skillGapSchema],
      default: [],
    },
    jobFitAssessments: {
      type: [jobFitSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
