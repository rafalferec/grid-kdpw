import { createContext } from 'react';
import type { CompositeFilterDescriptor } from '@progress/kendo-data-query';

interface GridFilterContextValue {
  filter: CompositeFilterDescriptor;
  onChange: ((filter: CompositeFilterDescriptor) => void) | undefined;
  titles: Record<string, string>;
}

export const GridFilterContext = createContext<GridFilterContextValue | null>(null);
