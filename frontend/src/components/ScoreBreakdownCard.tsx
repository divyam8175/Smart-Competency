import { type ReactElement } from 'react';
import { ScoreBreakdown } from '../types';

interface ScoreBreakdownCardProps {
  scores?: ScoreBreakdown | null;
}

const ScoreBreakdownCard = ({ scores }: ScoreBreakdownCardProps): ReactElement => {
  if (!scores) {
    return (
      <div className="card">
        <h2>Smart Score</h2>
        <p>No score calculated yet.</p>
      </div>
    );
  }

  return (
    <div className="card score-card">
      <div className="score-header">
        <div>
          <p>Overall Score</p>
          <h2>{(scores.overall || 0).toFixed(2)} / 100</h2>
        </div>
        <div className="badge">Weighted</div>
      </div>

      <div className="score-grid">
        <div>
          <p>Technical</p>
          <strong>{scores.technical || 0}</strong>
        </div>
        <div>
          <p>Cognitive</p>
          <strong>{scores.cognitive || 0}</strong>
        </div>
        <div>
          <p>Behavioral</p>
          <strong>{scores.behavioral || 0}</strong>
        </div>
        <div>
          <p>Communication</p>
          <strong>{scores.communication || 0}</strong>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;
