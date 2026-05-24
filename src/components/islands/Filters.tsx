import { ArrowUpDown } from 'lucide-react';
import type { SortField, SortDirection } from '../../lib/types';
import { t, type Language } from '../../i18n';

interface Props {
  sortField: SortField;
  sortDirection: SortDirection;
  authorFilter: string | null;
  authors: string[];
  lang: string;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (dir: SortDirection) => void;
  onAuthorFilterChange: (author: string | null) => void;
}

export default function Filters({
  sortField,
  sortDirection,
  authorFilter,
  authors,
  lang,
  onSortFieldChange,
  onSortDirectionChange,
  onAuthorFilterChange,
}: Props) {
  const l = lang as Language;

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'title', label: t('filters.sort.title', l) },
    { value: 'author', label: t('filters.sort.author', l) },
    { value: 'changedFiles', label: t('filters.sort.size', l) },
    { value: 'impact', label: t('dimensions.impact', l) },
    { value: 'aiLeverage', label: t('dimensions.aiLeverage', l) },
    { value: 'quality', label: t('dimensions.quality', l) },
    { value: 'total', label: t('dashboard.totalScore', l) },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-text-secondary">
          {t('filters.sort', l)}:
        </label>
        <select
          id="sort-select"
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="input-field py-2 px-3 text-sm min-w-[120px]"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface cursor-pointer"
          aria-label={sortDirection === 'desc' ? t('filters.direction.desc', l) : t('filters.direction.asc', l)}
        >
          <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
        </button>
      </div>

      {authors.length > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="author-select" className="text-sm text-text-secondary">
            {t('filters.author', l)}:
          </label>
          <select
            id="author-select"
            value={authorFilter ?? ''}
            onChange={(e) => onAuthorFilterChange(e.target.value || null)}
            className="input-field py-2 px-3 text-sm min-w-[120px]"
          >
            <option value="">{t('filters.all', l)}</option>
            {authors.map((author) => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}