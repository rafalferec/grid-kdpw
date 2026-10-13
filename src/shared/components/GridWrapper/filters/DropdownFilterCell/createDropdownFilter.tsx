import type { GridCustomFilterCellProps } from '@progress/kendo-react-grid';
import { HeaderTdElement } from '@progress/kendo-react-data-tools';
import { DropdownFilterCell } from './DropdownFilterCell';

export function createDropdownFilter(data: string[]) {
  return function CustomDropdownFilter(props: GridCustomFilterCellProps) {
    return (
      <HeaderTdElement
        {...props.thProps}
        columnId={props.thProps?.columnId ?? ''}
      >
        <DropdownFilterCell {...props} data={data} />
      </HeaderTdElement>
    );
  };
}