import { InsightSummary } from '../../types';

interface InsightCardsProps {
  insights?: InsightSummary | null;
}

const InsightList = ({ title, items }: { title: string; items: string[] }): React.ReactElement => (
  <div className="insight-card">
    <h4>{title}</h4>
    <ul>
      {items.map((item, index) => (
        <li key={`${title}-${index}`}>{item}</li>
      ))}
    </ul>
  </div>
);

const InsightCards = ({ insights }: InsightCardsProps): React.ReactElement => {
  if (!insights) {
    return (
      <div className="card">
        <h3>Insights</h3>
        <p>No insights yet.</p>
      </div>
    );
  }

  return (
    <div className="card insights-card">
      <h3>Insights Generator</h3>
      <div className="insight-grid">
        <InsightList title="Strengths" items={insights.strengths} />
        <InsightList title="Weak Areas" items={insights.weaknesses} />
        <InsightList title="Focus Areas" items={insights.focusAreas} />
      </div>
    </div>
  );
};

export default InsightCards;
