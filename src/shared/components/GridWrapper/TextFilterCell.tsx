import { HeaderTdElement } from '@progress/kendo-react-data-tools';
import { GridFilterCell } from '@progress/kendo-react-grid';
import type { GridCustomFilterCellProps } from '@progress/kendo-react-grid';

const operators = [{ text: 'Zawiera', operator: 'contains' }];

export function TextFilterCell(props: GridCustomFilterCellProps) {
  return (
    <HeaderTdElement
      {...props.thProps}
      columnId={props.thProps?.columnId ?? ''}
    >
      <GridFilterCell
        {...props}
        filterType="text"
        operator="contains"
        operators={operators}
      />
    </HeaderTdElement>
  );
}
