import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { GridCustomCellProps } from '@progress/kendo-react-grid';

import styles from './GridWrapper.module.css';

interface GridRowActionsSettings {
  dataItemKey: string;
  displayedId: string | number | null;
  detailsId: string;
  loading: boolean;
  onToggle: (id: string | number) => void;
}

const RowActionsContext = createContext<GridRowActionsSettings | null>(null);

export function GridRowActions({
  children,
  ...settings
}: GridRowActionsSettings & { children: ReactNode }) {
  return <RowActionsContext value={settings}>{children}</RowActionsContext>;
}

function getRecordId(item: unknown, field: string): string | number | null {
  if (typeof item !== 'object' || item === null) return null;

  const value: unknown = Object.entries(item).find(([key]) => key === field)?.[1];
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

export function GridRowActionCell({ dataItem, tdProps }: GridCustomCellProps) {
  const settings = useContext(RowActionsContext);
  if (!settings) return <td {...tdProps} />;

  const id = getRecordId(dataItem, settings.dataItemKey);
  const isDisplayed = id !== null && id === settings.displayedId;
  const label = isDisplayed ? 'Ukryj dane' : 'Wyświetl dane';

  return (
    <td {...tdProps}>
      <button
        type="button"
        className={styles.actionButton}
        disabled={id === null || settings.loading}
        aria-label={`${label} record ${id ?? ''}`}
        aria-expanded={isDisplayed}
        aria-controls={isDisplayed ? settings.detailsId : undefined}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onMouseDownCapture={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          if (id !== null) settings.onToggle(id);
        }}
      >
        {label}
      </button>
    </td>
  );
}
