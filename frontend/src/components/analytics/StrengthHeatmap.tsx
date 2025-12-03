import { ScoreBreakdown } from '../../types';

interface StrengthHeatmapProps {
  scores?: ScoreBreakdown | null;
}

const getHeatClass = (value: number): string => {
  if (value >= 85) return 'heat-high';
  if (value >= 70) return 'heat-mid';
  if (value >= 50) return 'heat-low';
  return 'heat-critical';
};

const StrengthHeatmap = ({ scores }: StrengthHeatmapProps): React.ReactElement => {
  if (!scores) {
    return (
      <div className="card">
        <h3>Strength Heatmap</h3>
        <p>No score data yet.</p>
      </div>
    );
  }

  const entries = [
    { key: 'technical', label: 'Technical', value: scores.technical },
    { key: 'cognitive', label: 'Cognitive', value: scores.cognitive },
    { key: 'behavioral', label: 'Behavioral', value: scores.behavioral },
    { key: 'communication', label: 'Communication', value: scores.communication },
  ];

  return (
    <div className="card heatmap-card">
      <h3>Strength Heatmap</h3>
      <div className="heatmap-grid">
        {entries.map((entry) => (
          <div key={entry.key} className={`heatmap-cell ${getHeatClass(entry.value)}`}>
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrengthHeatmap;
