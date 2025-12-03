import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { ScoreBreakdown } from '../../types';

interface RadarCompetencyChartProps {
  scores?: ScoreBreakdown | null;
}

const RadarCompetencyChart = ({ scores }: RadarCompetencyChartProps): React.ReactElement => {
  if (!scores) {
    return (
      <div className="card">
        <h3>Competency Radar</h3>
        <p>No score data yet.</p>
      </div>
    );
  }

  const data = [
    { subject: 'Technical', value: scores.technical },
    { subject: 'Cognitive', value: scores.cognitive },
    { subject: 'Behavioral', value: scores.behavioral },
    { subject: 'Communication', value: scores.communication },
  ];

  return (
    <div className="card">
      <h3>Competency Radar</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart outerRadius={100} data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip />
          <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarCompetencyChart;
