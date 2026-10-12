import { expect, test } from 'vitest';

import type { GridColumn } from '@/shared/components/GridWrapper/GridWrapper.types';
import { buildLikeFilters } from './buildLikeFilters';

interface Sensor {
  key: string;
  location: string;
  temperature: number;
  humidity: number;
}

const columns: GridColumn<Sensor>[] = [
  { field: 'key', title: 'Klucz', filter: false },
  { field: 'location', title: 'Lokalizacja', filter: true },
  { field: 'temperature', title: 'Temperatura', filter: true },
  { field: 'humidity', title: 'Wilgotność', filter: true },
];

test('mapuje tylko aktywne kolumny, pomija puste i niepoprawne wartości oraz nie zmienia zapisu liczb', () => {
  expect(buildLikeFilters<Sensor>({ logic: 'and', filters: [
    { field: 'location', operator: 'contains', value: '  ' },
    { field: 'temperature', operator: 'contains', value: Number.NaN },
    { field: 'humidity', operator: 'gte', value: '100' },
    { field: 'key', operator: 'contains', value: 'sensor-a' },
    { field: 'unknown', operator: 'contains', value: 'wartość' },
  ] }, columns)).toEqual({});
  expect(buildLikeFilters<Sensor>({ logic: 'and', filters: [
    { logic: 'and', filters: [
      { field: 'location', operator: 'contains', value: ' Magazyn ' },
      { field: 'temperature', operator: 'contains', value: '0' },
      { field: 'humidity', operator: 'contains', value: '20.00' },
    ] },
  ] }, columns)).toEqual({ location_like: 'Magazyn', temperature_like: '0', humidity_like: '20.00' });
});
