import { FormEvent, useState, type ReactElement } from 'react';
import { SkillGapAnalysis } from '../../types';

interface SkillGapPanelProps {
  analysis?: SkillGapAnalysis | null;
  loading?: boolean;
  onAnalyze: (roleFocus?: string) => Promise<void>;
}

const SkillGapPanel = ({ analysis, loading, onAnalyze }: SkillGapPanelProps): ReactElement => {
  const [roleFocus, setRoleFocus] = useState('');

  const handleAnalyze = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await onAnalyze(roleFocus || undefined);
  };

  return (
    <div className="card">
      <form className="skill-gap-form" onSubmit={handleAnalyze}>
        <div>
          <h3>AI Skill Gap Detection</h3>
          <p className="subtle">Benchmark your profile against a role and get a personalized roadmap.</p>
        </div>
        <div className="skill-gap-inputs">
          <input placeholder="Role focus (optional)" value={roleFocus} onChange={(e) => setRoleFocus(e.target.value)} />
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {analysis ? (
        <div className="skill-gap-result">
          <p className="summary">{analysis.summary}</p>
          <div className="gap-columns">
            <div>
              <h4>Missing Skills</h4>
              <ul>
                {analysis.missingSkills?.length ? analysis.missingSkills.map((skill) => <li key={skill}>{skill}</li>) : <li>None detected</li>}
              </ul>
            </div>
            <div>
              <h4>Roadmap</h4>
              <ul>
                {analysis.recommendedRoadmap?.length ? analysis.recommendedRoadmap.map((item) => (
                  <li key={item.skill}>
                    <strong>{item.skill}:</strong> {item.action}
                  </li>
                )) : <li>No roadmap available</li>}
              </ul>
            </div>
          </div>
          <p className="muted-text">Readiness score: {analysis.readinessScore}%</p>
        </div>
      ) : (
        <p className="muted-text">Run the detector to uncover hidden gaps.</p>
      )}
    </div>
  );
};

export default SkillGapPanel;
