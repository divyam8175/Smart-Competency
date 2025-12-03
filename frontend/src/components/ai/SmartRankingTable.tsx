import { ChangeEvent, FormEvent, useEffect, useState, type ReactElement } from 'react';
import { RankedCandidate } from '../../types';

interface SmartRankingTableProps {
  results: RankedCandidate[];
  loading?: boolean;
  onQuery: (role: string, limit: number) => Promise<void>;
  selectedIds: string[];
  onToggleSelect: (candidateId: string) => void;
  initialRole?: string;
}

const SmartRankingTable = ({ results, loading, onQuery, selectedIds, onToggleSelect, initialRole = 'Frontend Developer' }: SmartRankingTableProps): ReactElement => {
  const [role, setRole] = useState(initialRole);
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await onQuery(role, limit);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(Number(event.target.value) || 5);
  };

  const isSelected = (id: string): boolean => selectedIds.includes(id);

  return (
    <div className="card ranking-card">
      <form className="ranking-form" onSubmit={handleSubmit}>
        <div>
          <h3>Smart Ranking</h3>
          <p className="subtle">Auto-ranked list by suitability %, competency signals, and AI insights.</p>
        </div>
        <div className="ranking-inputs">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Target role" />
          <input type="number" min="1" max="30" value={limit} onChange={handleLimitChange} />
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Scanning...' : 'Refresh'}
          </button>
        </div>
      </form>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Overall Score</th>
              <th>Role Fit</th>
              <th>Recent Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((candidate) => (
              <tr key={candidate.candidateId}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected(candidate.candidateId)}
                    onChange={() => onToggleSelect(candidate.candidateId)}
                  />
                </td>
                <td>
                  <strong>{candidate.name}</strong>
                  <div className="muted-text">{candidate.email}</div>
                </td>
                <td>{candidate.overallScore ?? '—'}</td>
                <td>
                  <span className="badge">{candidate.jobFit.suitability}%</span>
                </td>
                <td>{candidate.recentScoreDate ? new Date(candidate.recentScoreDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartRankingTable;
