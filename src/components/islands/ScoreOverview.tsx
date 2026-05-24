import { useState, useEffect } from 'react';
import type { RepoAnalysis } from '../../lib/types';
import { t, type Language } from '../../i18n';
import { useInView } from '../../hooks/useInView';

interface Props {
  analysis: RepoAnalysis;
  lang: string;
}

function AnimatedScoreRing({
  value,
  label,
  color,
  inView,
}: {
  value: number;
  label: string;
  color: string;
  inView: boolean;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const duration = 1000;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedValue(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      role="img"
      aria-label={`${label}: ${value}/100`}
    >
      <circle
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-gray-200"
      />
      <circle
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={inView ? offset : circumference}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="64"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="28"
        fontWeight="bold"
        fill={color}
      >
        {animatedValue}
      </text>
    </svg>
  );
}

function AnimatedBar({
  value,
  label,
  color,
  inView,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  inView: boolean;
  delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [inView, value, delay]);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-primary font-medium">{label}</span>
        <span className="text-text-secondary">{value}/100</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const SCORE_LABELS: Record<string, [string, string, string, string]> = {
  pl: ['Do poprawy', 'Średnio', 'Dobrze', 'Świetnie'],
  en: ['Needs improvement', 'Average', 'Good', 'Excellent'],
};

const THRESHOLDS = [40, 60, 80];

export default function ScoreOverview({ analysis, lang }: Props) {
  const l = lang as Language;
  const labels = SCORE_LABELS[l] ?? SCORE_LABELS.en;
  const { ref, inView } = useInView({ threshold: 0.3 });
  const {
    totalScore,
    avgImpact,
    avgAiLeverage,
    avgQuality,
    pirateSummary,
    recommendations,
  } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#00B894';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= THRESHOLDS[2]) return labels[3];
    if (score >= THRESHOLDS[1]) return labels[2];
    if (score >= THRESHOLDS[0]) return labels[1];
    return labels[0];
  };

  return (
    <section ref={ref} className="card">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center mb-4">
            <AnimatedScoreRing
              value={totalScore}
              label={t('dashboard.totalScore', l)}
              color={getScoreColor(totalScore)}
              inView={inView}
            />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">
            {totalScore}/100
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {getScoreLabel(totalScore)}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">{t('dashboard.dimensions', l)}</h3>

          {[
            { label: t('dimensions.impact', l), value: avgImpact, color: '#6C5CE7' },
            { label: t('dimensions.aiLeverage', l), value: avgAiLeverage, color: '#8B5CF6' },
            { label: t('dimensions.quality', l), value: avgQuality, color: '#00B894' },
          ].map((dim, i) => (
            <AnimatedBar
              key={dim.label}
              value={dim.value}
              label={dim.label}
              color={dim.color}
              inView={inView}
              delay={i * 150}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed italic">
            &ldquo;{pirateSummary}&rdquo;
          </p>
        </div>

        {recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              {t('dashboard.recommendations', l)}
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
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