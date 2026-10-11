import { DropDownList } from '@progress/kendo-react-dropdowns';
import type { GridFilterCellProps } from '@progress/kendo-react-grid';

interface DropdownFilterCellProps extends GridFilterCellProps {
  data: string[];
}

export function DropdownFilterCell({
  data,
  value,
  onChange,
}: DropdownFilterCellProps) {
  const defaultItem = '(Wszystkie)';

  return (
    <div className="k-filtercell">
      <DropDownList
        data={data}
        defaultItem={defaultItem}
        value={value || defaultItem}
        onChange={(event) => {
          const selected = event.value;

          onChange({
            value: selected === defaultItem ? '' : selected,
            operator: selected === defaultItem ? '' : 'eq',
            syntheticEvent: event.syntheticEvent,
          });
        }}
      />
    </div>
  );
}
