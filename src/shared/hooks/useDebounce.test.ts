import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import { useDebounce } from './useDebounce';

afterEach(() => vi.useRealTimers());

test('publikuje tylko ostatnią wartość po pełnym czasie bez zmian', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
    initialProps: { value: '' },
  });
  rerender({ value: 'S' });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: 'So' });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: 'Sonora' });
  act(() => vi.advanceTimersByTime(399));
  expect(result.current).toBe('');
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe('Sonora');
});

test('anuluje oczekujące opóźnienie po odmontowaniu', () => {
  vi.useFakeTimers();
  const { rerender, unmount } = renderHook(({ value }) => useDebounce(value), {
    initialProps: { value: '' },
  });
  rerender({ value: 'nowy filtr' });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
