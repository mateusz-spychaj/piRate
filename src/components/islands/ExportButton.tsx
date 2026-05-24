import { useCallback, useState } from 'react';
import { Download, FileJson, Camera } from 'lucide-react';
import { t, type Language } from '../../i18n';
import type { RepoAnalysis } from '../../lib/types';

interface Props {
  analysis: RepoAnalysis;
  lang: string;
  scoreRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportButton({ analysis, lang, scoreRef }: Props) {
  const l = lang as Language;
  const [exporting, setExporting] = useState<'idle' | 'json' | 'png'>('idle');

  const exportJSON = useCallback(() => {
    setExporting('json');
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.repoName.replace('/', '-')}-analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting('idle'), 1000);
  }, [analysis]);

  const exportPNG = useCallback(async () => {
    setExporting('png');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = scoreRef.current;
      if (!el) return;

      const oklchRegex = /oklch\([^)]+\)/g;
      const styleEls = Array.from(document.querySelectorAll('style'))
        .filter((s): s is HTMLStyleElement => s instanceof HTMLStyleElement && !!s.textContent?.includes('oklch'));
      const backups = styleEls.map((s) => ({ el: s, text: s.textContent! }));
      styleEls.forEach((s) => { s.textContent = s.textContent!.replace(oklchRegex, 'rgb(128,128,128)'); });

      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        onclone: (_clonedDoc, clonedEl: HTMLElement) => {
          const walk = (orig: Element, clone: Element) => {
            if (clone instanceof HTMLElement && orig instanceof HTMLElement) {
              const cs = window.getComputedStyle(orig);
              for (let i = 0; i < cs.length; i++) {
                const prop = cs[i];
                clone.style.setProperty(prop, cs.getPropertyValue(prop));
              }
            }
            const oKids = Array.from(orig.children);
            const cKids = Array.from(clone.children);
            for (let i = 0; i < Math.min(oKids.length, cKids.length); i++) {
              walk(oKids[i], cKids[i]);
            }
          };
          walk(el, clonedEl);
        },
      });

      backups.forEach(({ el, text }) => { el.textContent = text; });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis.repoName.replace('/', '-')}-badge.png`;
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
    setTimeout(() => setExporting('idle'), 1000);
  }, [analysis]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={exportJSON}
        disabled={exporting !== 'idle'}
        className="btn-ghost text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <FileJson size={14} />
        {exporting === 'json' ? t('export.exporting', l) : t('export.json', l)}
      </button>

      <button
        onClick={exportPNG}
        disabled={exporting !== 'idle'}
        className="btn-ghost text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Camera size={14} />
        {exporting === 'png' ? t('export.exporting', l) : t('export.png', l)}
      </button>
    </div>
  );
}
