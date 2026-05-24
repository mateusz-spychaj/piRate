import { useState } from 'react';
import { ExternalLink, GitPullRequest, GitCompare, X, Loader2, FileCode } from 'lucide-react';
import type { PRData } from '../../lib/types';
import { t, type Language } from '../../i18n';

function truncateDiff(text: string): string {
  const lines = text.split('\n');
  if (lines.length <= 80) return text;
  return lines.slice(0, 80).join('\n') + '\n\n··· diff truncated ···';
}

interface Props {
  prs: PRData[];
  lang: string;
}

function ScoreBadge({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const color = value >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                value >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';

  return (
    <div className={`px-2 py-1 rounded text-xs font-semibold ${color}`} title={label}>
      {label}: {value}
    </div>
  );
}

export default function PRList({ prs, lang }: Props) {
  const l = lang as Language;
  const [expandedDiff, setExpandedDiff] = useState<number | null>(null);
  const [diffContent, setDiffContent] = useState<Record<number, string>>({});
  const [diffLoading, setDiffLoading] = useState<Record<number, boolean>>({});
  const [diffError, setDiffError] = useState<Record<number, boolean>>({});

  async function toggleDiff(pr: PRData) {
    if (expandedDiff === pr.id) {
      setExpandedDiff(null);
      return;
    }

    setExpandedDiff(pr.id);

    if (diffContent[pr.id]) return;

    setDiffLoading((prev) => ({ ...prev, [pr.id]: true }));
    setDiffError((prev) => ({ ...prev, [pr.id]: false }));

    try {
      const res = await fetch(`/api/diff?url=${encodeURIComponent(pr.diffUrl)}`);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setDiffContent((prev) => ({ ...prev, [pr.id]: truncateDiff(text) }));
    } catch {
      setDiffError((prev) => ({ ...prev, [pr.id]: true }));
    } finally {
      setDiffLoading((prev) => ({ ...prev, [pr.id]: false }));
    }
  }

  if (prs.length === 0) {
    return (
      <div className="card text-center py-12">
        <GitPullRequest size={32} className="text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">{t('prList.empty', l)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prs.map((pr) => (
        <article key={pr.id} className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-text-muted font-mono">#{pr.number}</span>
                <span className="text-xs text-text-secondary font-mono">{pr.author}</span>
              </div>
              <h3 className="font-medium text-text-primary truncate">{pr.title}</h3>
              <p className="text-xs text-text-muted mt-1">
                +{pr.additions}/-{pr.deletions} · {pr.changedFiles} {t('prList.files', l)}
              </p>
            </div>

            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
              aria-label={t('prList.openOnGitHub', l)}
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => toggleDiff(pr)}
              className="shrink-0 p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
              aria-label={expandedDiff === pr.id ? t('prList.hideDiff', l) : t('prList.viewDiff', l)}
              title={expandedDiff === pr.id ? t('prList.hideDiff', l) : t('prList.viewDiff', l)}
            >
              {expandedDiff === pr.id ? <X size={16} /> : <GitCompare size={16} />}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <ScoreBadge value={pr.score.impact} label={t('dimensions.impact', l)} />
            <ScoreBadge value={pr.score.aiLeverage} label={t('dimensions.aiLeverage', l)} />
            <ScoreBadge value={pr.score.quality} label={t('dimensions.quality', l)} />
            <ScoreBadge value={pr.score.total} label={t('dashboard.totalScore', l)} />
          </div>

          {expandedDiff === pr.id && (
            <div className="mt-3 border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-surface dark:bg-gray-800 border-b border-border text-xs text-text-muted">
                <FileCode size={14} />
                <span>{t('prList.viewDiff', l)}</span>
              </div>
              {diffLoading[pr.id] && (
                <div className="flex items-center justify-center gap-2 py-8 text-text-muted text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('prList.diffLoading', l)}</span>
                </div>
              )}
              {diffError[pr.id] && (
                <div className="py-8 text-center text-sm text-danger">
                  {t('prList.diffError', l)}
                </div>
              )}
              {diffContent[pr.id] && (
                <pre className="text-xs leading-relaxed overflow-x-auto max-h-96 p-3 bg-gray-50 dark:bg-gray-950 text-text-primary font-mono whitespace-pre">{diffContent[pr.id]}</pre>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}