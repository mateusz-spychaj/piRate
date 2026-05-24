import type { AuthorStats } from '../../lib/types';
import { t, type Language } from '../../i18n';
import { useInView } from '../../hooks/useInView';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  stats: AuthorStats[];
  lang: string;
}

export default function AuthorBreakdown({ stats, lang }: Props) {
  const l = lang as Language;
  const { ref, inView } = useInView({ threshold: 0.2 });

  if (stats.length === 0) return null;

  return (
    <section ref={ref} className="card">
      <h3 className="font-semibold text-text-primary mb-4">
        {t('authorBreakdown.title', l)}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-medium">{t('authorBreakdown.author', l)}</th>
              <th className="text-center pb-3 font-medium">{t('authorBreakdown.prs', l)}</th>
              <th className="text-center pb-3 font-medium">{t('dimensions.impact', l)}</th>
              <th className="text-center pb-3 font-medium">{t('dimensions.aiLeverage', l)}</th>
              <th className="text-center pb-3 font-medium">{t('dimensions.quality', l)}</th>
              <th className="text-center pb-3 font-medium">{t('dashboard.totalScore', l)}</th>
              <th className="text-center pb-3 font-medium">{t('authorBreakdown.trend', l)}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => {
              const delay = i * 80;
              return (
                <tr
                  key={s.author}
                  className="border-b border-border last:border-0 transition-all duration-500 hover:bg-surface"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translateY(0)' : 'translateY(8px)',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  <td className="py-3 pr-4">
                    <span className="font-medium text-text-primary">{s.author}</span>
                  </td>
                  <td className="py-3 text-center text-text-secondary">{s.prCount}</td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${s.avgImpact >= 70 ? 'text-accent' : s.avgImpact >= 40 ? 'text-warning' : 'text-danger'}`}>
                      {s.avgImpact}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${s.avgAiLeverage >= 70 ? 'text-accent' : s.avgAiLeverage >= 40 ? 'text-warning' : 'text-danger'}`}>
                      {s.avgAiLeverage}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${s.avgQuality >= 70 ? 'text-accent' : s.avgQuality >= 40 ? 'text-warning' : 'text-danger'}`}>
                      {s.avgQuality}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="font-bold text-primary">{s.avgTotal}</span>
                  </td>
                  <td className="py-3 text-center">
                    {s.trend === 'up' ? (
                      <TrendingUp size={16} className="text-accent inline-block" />
                    ) : s.trend === 'down' ? (
                      <TrendingDown size={16} className="text-danger inline-block" />
                    ) : (
                      <Minus size={16} className="text-text-muted inline-block" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}