import { FormEvent, useState, type ReactElement } from 'react';
import { JobFitPrediction } from '../../types';

interface JobFitPredictorProps {
  prediction?: JobFitPrediction | null;
  loading?: boolean;
  onPredict: (role: string) => Promise<void>;
}

const JobFitPredictor = ({ prediction, loading, onPredict }: JobFitPredictorProps): ReactElement => {
  const [role, setRole] = useState('Frontend Developer');

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!role.trim()) return;
    await onPredict(role.trim());
  };

  return (
    <div className="card">
      <form className="job-fit-form" onSubmit={handleSubmit}>
        <div>
          <h3>Job Role Suitability</h3>
          <p className="subtle">AI blends competency scores & skills to predict fit for a role.</p>
        </div>
        <div className="job-fit-inputs">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Enter a role (e.g. Frontend Developer)" />
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      </form>

      {prediction ? (
        <div className="job-fit-result">
          <p className="overall">{prediction.role}: {prediction.suitability}% fit</p>
          <p className="muted-text">{prediction.rationale}</p>
          <div className="gap-columns">
            <div>
              <h4>Matching Skills</h4>
              <div className="chips">
                {prediction.matchingSkills?.length ? prediction.matchingSkills.map((skill) => (
                  <span className="chip" key={`match-${skill}`}>
                    {skill}
                  </span>
                )) : <span className="chip">None</span>}
              </div>
            </div>
            <div>
              <h4>Missing Skills</h4>
              <div className="chips">
                {prediction.missingSkills?.length ? (
                  prediction.missingSkills.map((skill) => (
                    <span className="chip critical" key={`miss-${skill}`}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="chip">None</span>
                )}
              </div>
            </div>
          </div>
          {!!prediction.recommendations?.length && (
            <ul>
              {prediction.recommendations.slice(0, 4).map((tip, index) => (
                <li key={`tip-${index}`}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="muted-text">Run the predictor to see fit % and tailored actions.</p>
      )}
    </div>
  );
};

export default JobFitPredictor;
