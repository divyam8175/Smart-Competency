import { ScoreBreakdown } from '../../types';

const TARGET = 85;

interface SkillGapAnalysisProps {
  scores?: ScoreBreakdown | null;
}

const SkillGapAnalysis = ({ scores }: SkillGapAnalysisProps): React.ReactElement => {
  if (!scores) {
    return (
      <div className="card">
        <h3>Skill Gap Analysis</h3>
        <p>No data yet.</p>
      </div>
    );
  }

  const rows = [
    { label: 'Technical', value: scores.technical },
    { label: 'Cognitive', value: scores.cognitive },
    { label: 'Behavioral', value: scores.behavioral },
    { label: 'Communication', value: scores.communication },
  ];

  return (
    <div className="card">
      <h3>Skill Gap Analysis</h3>
      <table className="gap-table">
        <thead>
          <tr>
            <th>Competency</th>
            <th>Current</th>
            <th>Target</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const gap = TARGET - row.value;
            const gapLabel = gap <= 0 ? 'On Track' : `${gap.toFixed(1)} pts`;
            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.value}</td>
                <td>{TARGET}</td>
                <td className={gap <= 0 ? 'gap-good' : 'gap-bad'}>{gapLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SkillGapAnalysis;
