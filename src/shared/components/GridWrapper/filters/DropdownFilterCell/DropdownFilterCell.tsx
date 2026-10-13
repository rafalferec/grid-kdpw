import {
  DropDownList,
  type DropDownListChangeEvent,
} from '@progress/kendo-react-dropdowns';

import type { GridFilterCellProps } from '@progress/kendo-react-grid';

interface DropdownFilterCellProps extends GridFilterCellProps {
  data: string[];
}

export function DropdownFilterCell({
  data,
  value,
  onChange,
  ariaLabel,
}: DropdownFilterCellProps) {
  const defaultItem = '(Wszystkie)';

  const handleChange = (event: DropDownListChangeEvent) => {
    const selected: unknown = event.value;

    if (typeof selected !== 'string') return;
    if (selected !== defaultItem && !data.includes(selected)) return;

    onChange({
      value: selected === defaultItem ? '' : selected,
      operator: selected === defaultItem ? '' : 'contains',
      syntheticEvent: event.syntheticEvent,
    });
  };

  return (
    <div className="k-filtercell">
      <DropDownList
        data={data}
        defaultItem={defaultItem}
        value={
          typeof value === 'string' && data.includes(value)
            ? value
            : defaultItem
        }
        ariaLabel={ariaLabel ?? 'Filtr'}
        onChange={handleChange}
      />
    </div>
  );
}