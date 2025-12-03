import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ScoreHistoryEntry } from '../../types';

interface ScoreTrendLineChartProps {
  history: ScoreHistoryEntry[];
}

const ScoreTrendLineChart = ({ history }: ScoreTrendLineChartProps): React.ReactElement => {
  if (!history.length) {
    return (
      <div className="card">
        <h3>Growth Over Time</h3>
        <p>No historical data yet.</p>
      </div>
    );
  }

  const data = history.map((entry) => ({
    date: new Date(entry.calculatedAt).toLocaleDateString(),
    overall: entry.overall,
  }));

  return (
    <div className="card">
      <h3>Growth Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
          <Tooltip />
          <Line type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendLineChart;
