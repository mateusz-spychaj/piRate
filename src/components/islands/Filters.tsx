import { ArrowUpDown } from 'lucide-react';
import type { SortField, SortDirection } from '../../lib/types';

interface Props {
  sortField: SortField;
  sortDirection: SortDirection;
  authorFilter: string | null;
  authors: string[];
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (dir: SortDirection) => void;
  onAuthorFilterChange: (author: string | null) => void;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'title', label: 'Tytuł' },
  { value: 'author', label: 'Autor' },
  { value: 'changedFiles', label: 'Rozmiar' },
  { value: 'impact', label: 'Wpływ' },
  { value: 'aiLeverage', label: 'AI' },
  { value: 'quality', label: 'Jakość' },
  { value: 'total', label: 'Wynik' },
];

export default function Filters({
  sortField,
  sortDirection,
  authorFilter,
  authors,
  onSortFieldChange,
  onSortDirectionChange,
  onAuthorFilterChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-text-secondary">Sortuj:</label>
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
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
          aria-label={sortDirection === 'desc' ? 'Malejąco' : 'Rosnąco'}
        >
          <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
        </button>
      </div>

      {authors.length > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="author-select" className="text-sm text-text-secondary">Autor:</label>
          <select
            id="author-select"
            value={authorFilter ?? ''}
            onChange={(e) => onAuthorFilterChange(e.target.value || null)}
            className="input-field py-2 px-3 text-sm min-w-[120px]"
          >
            <option value="">Wszyscy</option>
            {authors.map((author) => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
