import { useState } from 'react';
import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { GridWrapper } from './GridWrapper';
import { findFilter, updateRangeFilter } from './filterDescriptors';

test('konfiguracja kolumn włącza tylko wskazane filtry i obsługuje zakres innego modelu bez filtrowania lokalnego', () => {
  function GridExample() {
    const [filter, setFilter] = useState<CompositeFilterDescriptor>({ logic: 'and', filters: [] });
    return <GridWrapper
      data={[{ key: 'sensor-a', temperature: 25, location: 'Magazyn' }]}
      dataItemKey="key"
      columns={[
        { field: 'temperature', title: 'Temperatura', filter: true, filterType: 'range' },
        { field: 'location', title: 'Lokalizacja', filter: false },
      ]}
      filter={filter}
      onFilterChange={setFilter}
      rowClassName={(item) => item.temperature > 20 ? 'warmRow' : ''}
      pagination={{ page: 1, pageSize: 10, total: 1, onPageChange: () => {} }}
    />;
  }
  render(<GridExample />);
  const minimum = screen.getByRole('spinbutton', { name: 'Temperatura od' });
  const maximum = screen.getByRole('spinbutton', { name: 'Temperatura do' });
  expect(screen.queryByRole('textbox', { name: 'location Filter' })).not.toBeInTheDocument();
  fireEvent.change(minimum, { target: { value: '30' } });
  fireEvent.change(maximum, { target: { value: '40' } });
  expect(minimum).toHaveValue(30);
  expect(maximum).toHaveValue(40);
  expect(screen.getByText('Magazyn')).toBeInTheDocument();
  expect(screen.getByText('Magazyn').closest('tr')).toHaveClass('warmRow');
  fireEvent.change(minimum, { target: { value: '' } });
  expect(minimum).toHaveValue(null);
  expect(maximum).toHaveValue(40);
});

test('zmiana granicy zachowuje pozostałe filtry i nie mutuje wejściowego deskryptora', () => {
  const original: CompositeFilterDescriptor = { logic: 'and', filters: [
    { field: 'location', operator: 'contains', value: 'Magazyn' },
    { logic: 'and', filters: [
      { field: 'temperature', operator: 'gte', value: 0 },
      { field: 'temperature', operator: 'lte', value: 40 },
    ] },
  ] };
  const next = updateRangeFilter(original, 'temperature', 'gte', 10);
  expect(findFilter(next, 'temperature', 'gte')?.value).toBe(10);
  expect(findFilter(next, 'temperature', 'lte')?.value).toBe(40);
  expect(findFilter(next, 'location', 'contains')?.value).toBe('Magazyn');
  expect(findFilter(original, 'temperature', 'gte')?.value).toBe(0);
  const cleared = updateRangeFilter(next, 'temperature', 'gte', null);
  expect(findFilter(cleared, 'temperature', 'gte')).toBeUndefined();
  expect(findFilter(cleared, 'temperature', 'lte')?.value).toBe(40);
});
