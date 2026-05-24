import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { DEFAULT_PR_COUNT, MIN_PR_COUNT, MAX_PR_COUNT } from '../../lib/constants';

export default function RepoInput() {
  const [url, setUrl] = useState('');
  const [prCount, setPrCount] = useState(DEFAULT_PR_COUNT);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pirate-prs');
    if (stored) {
      const count = parseInt(stored, 10);
      if (count >= MIN_PR_COUNT && count <= MAX_PR_COUNT) {
        setPrCount(count);
      }
    }
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    if (!githubPattern.test(url)) {
      setError('Nieprawidłowy URL repozytorium GitHub');
      return;
    }

    setIsLoading(true);
    localStorage.setItem('pirate-prs', prCount.toString());

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url, prCount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analiza nie powiodła się');
      }

      const data = await response.json();
      window.location.href = `/results/${data.hash}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coś poszło nie tak');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrCountChange = (value: number) => {
    const clamped = Math.max(MIN_PR_COUNT, Math.min(MAX_PR_COUNT, value));
    setPrCount(clamped);
    localStorage.setItem('pirate-prs', clamped.toString());
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/właściciel/repozytorium"
            className="input-field pr-12"
            aria-label="URL repozytorium GitHub"
            required
          />
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
            aria-label="Ustawienia analizy"
            aria-expanded={showSettings}
          >
            {showSettings ? <X size={18} /> : <Settings size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary whitespace-nowrap"
        >
          {isLoading ? 'Analizowanie...' : 'Analizuj repo'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}

      {showSettings && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl border border-border shadow-lg z-10 animate-fade-in">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Ile PRów analizować?
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_PR_COUNT}
              max={MAX_PR_COUNT}
              value={prCount}
              onChange={(e) => handlePrCountChange(parseInt(e.target.value, 10))}
              className="flex-1 accent-primary"
              aria-label="Liczba PRów do analizy"
            />
            <span className="text-sm font-semibold text-primary min-w-[2rem] text-center">
              {prCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
