import { useRef, useState, useEffect } from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import type { RepoAnalysis } from '../../lib/types';

interface Props {
  analysis: RepoAnalysis;
}

export default function RadarChart({ analysis }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { avgImpact, avgAiLeverage, avgQuality, prs } = analysis;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setWidth(el.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = [
    { dimension: 'Wpływ', score: avgImpact },
    { dimension: 'AI Leverage', score: avgAiLeverage },
    { dimension: 'Jakość', score: avgQuality },
  ];

  const prData = prs.length <= 6
    ? prs.map((pr) => ({
        dimension: `#${pr.number}`,
        score: pr.score.total,
      }))
    : [];

  return (
    <div className="card">
      <h3 className="font-semibold text-text-primary mb-4">Wizualizacja</h3>

      <div ref={containerRef} className="w-full" style={{ minHeight: 300 }}>
        {width > 0 && (
          <RechartsRadar width={width} height={300} data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#64748b' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Radar
              name="Średnia"
              dataKey="score"
              stroke="#1a73e8"
              fill="#1a73e8"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </RechartsRadar>
        )}
      </div>

      {prData.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-text-muted mb-2">Score per PR</p>
          <div className="space-y-1">
            {prData.map((pr) => (
              <div key={pr.dimension} className="flex items-center gap-2 text-xs">
                <span className="text-text-muted w-10">{pr.dimension}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${pr.score}%` }}
                  />
                </div>
                <span className="text-text-secondary w-6 text-right">{pr.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
