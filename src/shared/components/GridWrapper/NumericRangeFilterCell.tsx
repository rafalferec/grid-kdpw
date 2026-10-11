import { useContext } from 'react';
import type { GridCustomFilterCellProps } from '@progress/kendo-react-grid';

import { GridFilterContext } from './GridFilterContext';
import { findFilter, updateRangeFilter } from './filterDescriptors';
import styles from './GridWrapper.module.css';

export function NumericRangeFilterCell({ field, tdProps }: GridCustomFilterCellProps) {
  const context = useContext(GridFilterContext);
  if (!context || !field) return <td {...tdProps} />;

  const { filter, onChange, titles } = context;
  const title = titles[field] ?? field;

  return (
    <td {...tdProps}>
      <div className={styles.rangeFilter}>
        {(['gte', 'lte'] as const).map((operator) => {
          const value: unknown = findFilter(filter, field, operator)?.value;
          const label = operator === 'gte' ? 'Od' : 'Do';
          return (
            <input
              key={operator}
              type="number"
              step="any"
              className={styles.rangeInput}
              aria-label={`${title} ${label.toLowerCase()}`}
              placeholder={label}
              value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
              onChange={(event) => {
                const input = event.currentTarget;
                onChange?.(updateRangeFilter(filter, field, operator,
                  input.value === '' ? null : input.valueAsNumber));
              }}
            />
          );
        })}
      </div>
    </td>
  );
}
