import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';
import { ICandidateProfile, IJobFitAssessment, ISkillGapEntry, IScoreHistoryEntry } from '../models/CandidateProfile';
import { InsightSummary } from './insightService';

export interface ReportContext {
  candidate: ICandidateProfile;
  userMeta?: { name: string; email: string };
  insights?: InsightSummary | null;
  latestSkillGap?: ISkillGapEntry;
  latestJobFit?: IJobFitAssessment;
  scoreHistory?: IScoreHistoryEntry[];
}

const addSectionHeading = (doc: PDFKit.PDFDocument, title: string): void => {
  doc.moveDown().fontSize(16).fillColor('#111827').text(title, { underline: true });
  doc.moveDown(0.3).fontSize(11).fillColor('#1f2937');
};

export const generateCandidateReport = async ({ candidate, userMeta, insights, latestJobFit, latestSkillGap, scoreHistory }: ReportContext): Promise<Buffer> => {
  return await new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(22).text('Smart Competency Candidate Report');
    doc.moveDown();

    const displayName = userMeta?.name || 'Candidate';
    const displayEmail = userMeta?.email || 'n/a';

    doc.fontSize(14).text(displayName, { continued: true }).fontSize(12).text(`  |  ${displayEmail}`);

    if (candidate.phone) {
      doc.fontSize(12).text(`Phone: ${candidate.phone}`);
    }

    addSectionHeading(doc, 'Score Breakdown');
    if (candidate.scores) {
      Object.entries(candidate.scores).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
    } else {
      doc.text('No scores captured yet.');
    }

    if (scoreHistory?.length) {
      doc.moveDown(0.5).fontSize(12).text('Recent Score History:');
      scoreHistory.slice(-5).forEach((entry) => {
        doc.text(`${new Date(entry.calculatedAt).toLocaleDateString()}: ${entry.overall}`);
      });
    }

    if (insights) {
      addSectionHeading(doc, 'AI Insights');
      doc.text('Strengths:');
      insights.strengths.forEach((item) => doc.text(`• ${item}`));
      doc.moveDown(0.3).text('Focus Areas:');
      insights.focusAreas.forEach((item) => doc.text(`• ${item}`));
    }

    if (latestSkillGap) {
      addSectionHeading(doc, 'Skill Gap Assessment');
      doc.text(latestSkillGap.summary);
      if (latestSkillGap.missingSkills.length) {
        doc.moveDown(0.3).text('Missing Skills:');
        latestSkillGap.missingSkills.forEach((skill) => doc.text(`• ${skill}`));
      }
      if (latestSkillGap.recommendedLearning.length) {
        doc.moveDown(0.3).text('Learning Roadmap:');
        latestSkillGap.recommendedLearning.slice(0, 5).forEach((tip) => doc.text(`• ${tip}`));
      }
    }

    if (latestJobFit) {
      addSectionHeading(doc, `Role Fit · ${latestJobFit.role}`);
      doc.text(`Suitability: ${latestJobFit.suitability}%`);
      if (latestJobFit.matchingSkills.length) {
        doc.text(`Matching Skills: ${latestJobFit.matchingSkills.join(', ')}`);
      }
      if (latestJobFit.missingSkills.length) {
        doc.text(`Missing Skills: ${latestJobFit.missingSkills.join(', ')}`);
      }
      if (latestJobFit.recommendations.length) {
        doc.moveDown(0.3).text('Recommended Actions:');
        latestJobFit.recommendations.slice(0, 5).forEach((tip) => doc.text(`• ${tip}`));
      }
    }

    doc.end();
  });
};
