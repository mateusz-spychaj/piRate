import type { RepoAnalysis } from '../../lib/types';

interface Props {
  analysis: RepoAnalysis;
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="128" height="128" className="transform -rotate-90" role="img" aria-label={`${label}: ${value}/100`}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
        <circle
          cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute text-2xl font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

export default function ScoreOverview({ analysis }: Props) {
  const { totalScore, avgImpact, avgAiLeverage, avgQuality, pirateSummary, recommendations } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Świetnie';
    if (score >= 60) return 'Dobrze';
    if (score >= 40) return 'Średnio';
    return 'Do poprawy';
  };

  return (
    <section className="card">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center mb-4">
            <ScoreRing value={totalScore} label="Wynik całkowity" color={getScoreColor(totalScore)} />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">{totalScore}/100</h2>
          <p className="text-text-secondary text-sm mt-1">{getScoreLabel(totalScore)}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">Wymiary</h3>

          {[
            { label: 'Wpływ', value: avgImpact, color: '#1a73e8' },
            { label: 'AI Leverage', value: avgAiLeverage, color: '#8b5cf6' },
            { label: 'Jakość', value: avgQuality, color: '#10b981' },
          ].map((dim) => (
            <div key={dim.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-primary font-medium">{dim.label}</span>
                <span className="text-text-secondary">{dim.value}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${dim.value}%`, backgroundColor: dim.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm leading-relaxed italic">
            &ldquo;{pirateSummary}&rdquo;
          </p>
        </div>

        {recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Rekomendacje</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
