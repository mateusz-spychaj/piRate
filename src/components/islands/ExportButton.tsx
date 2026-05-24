import { useCallback, useState } from 'react';
import { FileJson, Camera } from 'lucide-react';
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
      const el = scoreRef.current;
      if (!el) return;

      // Temporarily hide elements that should not appear in the export.
      // We use visibility:hidden instead of display:none to preserve layout
      // so html2canvas captures the correct dimensions.
      const hidden = Array.from(
        el.querySelectorAll<HTMLElement>('[data-export-hide]'),
      );
      hidden.forEach((node) => {
        node.dataset.exportHideOrig = node.style.visibility;
        node.style.visibility = 'hidden';
      });

      // Capture the live element — html2canvas can read all page stylesheets,
      // so Tailwind utilities and CSS custom properties resolve correctly.
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore hidden elements
      hidden.forEach((node) => {
        node.style.visibility = node.dataset.exportHideOrig ?? '';
        delete node.dataset.exportHideOrig;
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis.repoName.replace('/', '-')}-badge.png`;
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
    setTimeout(() => setExporting('idle'), 1000);
  }, [analysis, scoreRef]);

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
