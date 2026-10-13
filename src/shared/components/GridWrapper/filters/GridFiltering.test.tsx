import { useState } from 'react';
import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { GridWrapper } from '../GridWrapper';
import { findFilter } from './filterDescriptors';

test('konfiguracja kolumn włącza filtry tekstowe także dla liczb bez filtrowania lokalnego', () => {
  function GridExample() {
    const [filter, setFilter] = useState<CompositeFilterDescriptor>({ logic: 'and', filters: [] });
    return <GridWrapper
      data={[{ key: 'sensor-a', temperature: 25, location: 'Magazyn' }]}
      dataItemKey="key"
      columns={[
        { field: 'temperature', title: 'Temperatura', filter: true },
        { field: 'location', title: 'Lokalizacja', filter: false },
      ]}
      filter={filter}
      onFilterChange={setFilter}
      rowClassName={(item) => item.temperature > 20 ? 'warmRow' : ''}
      pagination={{ page: 1, pageSize: 10, total: 1, onPageChange: () => {} }}
    />;
  }
  render(<GridExample />);
  const temperature = screen.getByRole('textbox', { name: 'temperature Filter' });
  expect(screen.queryByRole('textbox', { name: 'location Filter' })).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  fireEvent.change(temperature, { target: { value: '30.00' } });
  expect(temperature).toHaveValue('30.00');
  expect(screen.getByText('Magazyn')).toBeInTheDocument();
  expect(screen.getByText('Magazyn').closest('tr')).toHaveClass('warmRow');
  fireEvent.change(temperature, { target: { value: '' } });
  expect(temperature).toHaveValue('');
});

test('odczytuje zagnieżdżony filtr według pola i operatora', () => {
  const original: CompositeFilterDescriptor = { logic: 'and', filters: [
    { field: 'location', operator: 'contains', value: 'Magazyn' },
    { logic: 'and', filters: [
      { field: 'temperature', operator: 'contains', value: '0' },
    ] },
  ] };
  expect(findFilter(original, 'temperature', 'contains')?.value).toBe('0');
  expect(findFilter(original, 'location', 'contains')?.value).toBe('Magazyn');
  expect(findFilter(original, 'temperature', 'eq')).toBeUndefined();
  expect(findFilter(original, 'humidity', 'contains')).toBeUndefined();
});
