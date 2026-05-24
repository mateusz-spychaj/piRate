import { useState, useEffect, useMemo } from 'react';
import type { RepoAnalysis, SortField, SortDirection } from '../../lib/types';
import ScoreOverview from './ScoreOverview';
import RadarChart from './RadarChart';
import PRList from './PRList';
import Filters from './Filters';

interface Props {
  hash: string;
  initialAnalysis?: RepoAnalysis | null;
}

function loadFromStorage(hash: string): RepoAnalysis | null {
  try {
    const raw = sessionStorage.getItem(`pirate-analysis-${hash}`);
    if (!raw) return null;
    return JSON.parse(raw) as RepoAnalysis;
  } catch {
    return null;
  }
}

export default function ResultsPage({ hash, initialAnalysis }: Props) {
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(() => {
    if (initialAnalysis) {
      sessionStorage.setItem(`pirate-analysis-${hash}`, JSON.stringify(initialAnalysis));
      return initialAnalysis;
    }
    return loadFromStorage(hash);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  useEffect(() => {
    if (analysis) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/results/${hash}`, { signal: controller.signal });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Nie znaleziono wyników');
        }

        const data = (await res.json()) as RepoAnalysis;
        sessionStorage.setItem(`pirate-analysis-${hash}`, JSON.stringify(data));
        setAnalysis(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const stored = loadFromStorage(hash);
        if (stored) {
          setAnalysis(stored);
        } else {
          setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania wyników');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
    return () => controller.abort();
  }, [hash]);

  const authors = useMemo(() => {
    if (!analysis) return [];
    const unique = new Set(analysis.prs.map((pr) => pr.author));
    return Array.from(unique).sort();
  }, [analysis]);

  const filteredPRs = useMemo(() => {
    if (!analysis) return [];

    let prs = [...analysis.prs];

    if (authorFilter) {
      prs = prs.filter((pr) => pr.author === authorFilter);
    }

    prs.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'author':
          cmp = a.author.localeCompare(b.author);
          break;
        case 'changedFiles':
          cmp = a.changedFiles - b.changedFiles;
          break;
        case 'impact':
          cmp = a.score.impact - b.score.impact;
          break;
        case 'aiLeverage':
          cmp = a.score.aiLeverage - b.score.aiLeverage;
          break;
        case 'quality':
          cmp = a.score.quality - b.score.quality;
          break;
        case 'total':
          cmp = a.score.total - b.score.total;
          break;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });

    return prs;
  }, [analysis, sortField, sortDirection, authorFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Ładowanie wyników...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Coś poszło nie tak</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <a href="/" className="btn-primary inline-block">Wróć do strony głównej</a>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-8">
      <ScoreOverview analysis={analysis} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RadarChart analysis={analysis} />
        </div>
        <div className="lg:col-span-2">
          <Filters
            sortField={sortField}
            sortDirection={sortDirection}
            authorFilter={authorFilter}
            authors={authors}
            onSortFieldChange={setSortField}
            onSortDirectionChange={setSortDirection}
            onAuthorFilterChange={setAuthorFilter}
          />
          <PRList prs={filteredPRs} />
        </div>
      </div>
    </div>
  );
}
