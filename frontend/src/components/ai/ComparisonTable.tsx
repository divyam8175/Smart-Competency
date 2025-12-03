import { type ReactElement } from 'react';
import { RankedCandidate } from '../../types';

interface ComparisonTableProps {
  data: RankedCandidate[];
  loading?: boolean;
}

const ComparisonTable = ({ data, loading }: ComparisonTableProps): ReactElement => {
  return (
    <div className="card">
      <h3>Comparative Analysis</h3>
      {loading ? (
        <p className="muted-text">Loading comparison...</p>
      ) : data.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Overall Score</th>
                <th>Suitability %</th>
                <th>Matching Skills</th>
                <th>Missing Skills</th>
              </tr>
            </thead>
            <tbody>
              {data.map((candidate) => (
                <tr key={`compare-${candidate.candidateId}`}>
                  <td>
                    <strong>{candidate.name}</strong>
                    <div className="muted-text">{candidate.email}</div>
                  </td>
                  <td>{candidate.overallScore ?? '—'}</td>
                  <td>{candidate.jobFit.suitability}%</td>
                  <td>{candidate.jobFit.matchingSkills.join(', ') || '—'}</td>
                  <td>{candidate.jobFit.missingSkills.join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted-text">Select candidates in the ranking table to compare their readiness.</p>
      )}
    </div>
  );
};

export default ComparisonTable;
