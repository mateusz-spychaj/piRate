import { ExternalLink, GitPullRequest } from 'lucide-react';
import type { PRData } from '../../lib/types';

interface Props {
  prs: PRData[];
}

function ScoreBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? 'bg-emerald-100 text-emerald-700' :
                value >= 40 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';

  return (
    <div className={`px-2 py-1 rounded text-xs font-semibold ${color}`} title={label}>
      {label}: {value}
    </div>
  );
}

export default function PRList({ prs }: Props) {
  if (prs.length === 0) {
    return (
      <div className="card text-center py-12">
        <GitPullRequest size={32} className="text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">Brak pull requestów do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prs.map((pr) => (
        <article key={pr.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-text-muted font-mono">#{pr.number}</span>
                <span className="text-xs text-text-secondary font-mono">{pr.author}</span>
              </div>
              <h3 className="font-medium text-text-primary truncate">{pr.title}</h3>
              <p className="text-xs text-text-muted mt-1">
                +{pr.additions}/-{pr.deletions} · {pr.changedFiles} files
              </p>
            </div>

            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
              aria-label={`Open PR #${pr.number} on GitHub`}
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <ScoreBadge value={pr.score.impact} label="Wpływ" />
            <ScoreBadge value={pr.score.aiLeverage} label="AI" />
            <ScoreBadge value={pr.score.quality} label="Jakość" />
            <ScoreBadge value={pr.score.total} label="Wynik" />
          </div>
        </article>
      ))}
    </div>
  );
}
