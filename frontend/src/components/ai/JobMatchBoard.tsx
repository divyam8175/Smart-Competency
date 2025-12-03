import { type ReactElement } from 'react';
import { RankedCandidate } from '../../types';

interface JobMatchBoardProps {
  role: string;
  matches: RankedCandidate[];
}

const JobMatchBoard = ({ role, matches }: JobMatchBoardProps): ReactElement => {
  return (
    <div className="card">
      <h3>Top Matches · {role || 'Role'}</h3>
      {matches.length ? (
        <ul className="match-list">
          {matches.map((candidate) => (
            <li key={`match-${candidate.candidateId}`}>
              <div>
                <strong>{candidate.name}</strong>
                <p className="muted-text">{candidate.email}</p>
              </div>
              <div className="badge">{candidate.jobFit.suitability}%</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted-text">Run a role query to surface top matches.</p>
      )}
    </div>
  );
};

export default JobMatchBoard;
