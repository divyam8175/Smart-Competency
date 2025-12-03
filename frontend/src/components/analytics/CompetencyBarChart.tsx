import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ScoreBreakdown } from '../../types';

const TARGET = 85;

interface CompetencyBarChartProps {
  scores?: ScoreBreakdown | null;
}

const CompetencyBarChart = ({ scores }: CompetencyBarChartProps): React.ReactElement => {
  if (!scores) {
    return (
      <div className="card">
        <h3>Skill Comparison</h3>
        <p>No score data yet.</p>
      </div>
    );
  }

  const data = [
    { name: 'Technical', score: scores.technical, target: TARGET },
    { name: 'Cognitive', score: scores.cognitive, target: TARGET },
    { name: 'Behavioral', score: scores.behavioral, target: TARGET },
    { name: 'Communication', score: scores.communication, target: TARGET },
  ];

  return (
    <div className="card">
      <h3>Skill Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: '#475569' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={TARGET} stroke="#f97316" label={{ value: 'Target', position: 'top', fill: '#f97316' }} />
          <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompetencyBarChart;
