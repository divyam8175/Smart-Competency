import { FormEvent, useState, type ReactElement } from 'react';
import { calculateCandidateScore } from '../api/client';
import { InsightSummary, ScoreBreakdown, ScoreInputPayload, User } from '../types';

const emptyScores: ScoreInputPayload = {
  technical: 0,
  cognitive: 0,
  behavioral: 0,
  communication: 0,
};

interface ScoreInputFormProps {
  reviewer: User;
}

const ScoreInputForm = ({ reviewer }: ScoreInputFormProps): ReactElement => {
  const [candidateId, setCandidateId] = useState('');
  const [scores, setScores] = useState<ScoreInputPayload>(emptyScores);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ScoreBreakdown | null>(null);
  const [insights, setInsights] = useState<InsightSummary | null>(null);

  const updateScore = (key: keyof ScoreInputPayload, value: string): void => {
    const numeric = Number(value);
    setScores((prev) => ({ ...prev, [key]: Number.isNaN(numeric) ? 0 : numeric }));
  };

  const resetForm = (): void => {
    setScores(emptyScores);
    setCandidateId('');
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!candidateId) {
      setMessage('Candidate ID is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { scores: calculated, insights: returnedInsights } = await calculateCandidateScore(candidateId, scores);
      setResult(calculated);
      setInsights(returnedInsights);
      setMessage('Score saved successfully.');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to calculate score';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Smart Scoring Engine</h2>
      <p className="subtle">Logged in as {reviewer.role}</p>
      <form className="score-form" onSubmit={handleSubmit}>
        <label>
          Candidate User ID
          <input value={candidateId} onChange={(e) => setCandidateId(e.target.value)} placeholder="Mongo user _id" />
        </label>

        {(['technical', 'cognitive', 'behavioral', 'communication'] as Array<keyof ScoreInputPayload>).map((key) => (
          <label key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)} Score (0-100)
            <input type="number" min="0" max="100" value={scores[key]} onChange={(e) => updateScore(key, e.target.value)} />
          </label>
        ))}

        {message && <p className={`message ${result ? 'success' : 'error'}`}>{message}</p>}

        <div className="score-actions">
          <button type="button" className="text-button" onClick={resetForm}>
            Reset
          </button>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate & Save'}
          </button>
        </div>
      </form>

      {result && (
        <div className="score-result">
          <h3>Latest Result</h3>
          <p className="overall">Overall: {result.overall.toFixed(2)} / 100</p>
          <div className="score-grid">
            {Object.entries(result).map(([key, value]) =>
              key === 'overall' ? null : (
                <div key={key}>
                  <p>{key}</p>
                  <strong>{value as number}</strong>
                </div>
              )
            )}
          </div>

          {insights && (
            <div className="insight-mini">
              <h4>Insights</h4>
              <ul>
                {[...insights.strengths.slice(0, 1), ...insights.focusAreas.slice(0, 1)].map((item, index) => (
                  <li key={`insight-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreInputForm;
