import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { expect, test } from 'vitest';

import { baseApi } from '@/shared/api/baseApi';
import { server } from '../../../tests/server';
import { OrdersPage } from './OrdersPage';
import { OrderDetails } from './OrderDetails';
import type { Order } from './types/order.types';

const order: Order = {
  id: 1889, number: 'SH-101889', status: 'pending', total: 876.56, currency: 'USD',
  created_at: '2026-09-01T11:06:02Z', updated_at: '2026-09-01T11:06:02Z',
  customer_id: 27, subtotal: 914.18, shipping: 5.99, tax: 56.95, discount: 100.56,
  payment_method: 'card', shipping_address: '1284 Lake St', shipping_method: 'standard',
  tracking_number: null, placed_at: '2026-09-01T11:06:02Z', paid_at: null,
  shipped_at: null, delivered_at: null, notes: 'Instrukcja dostawy',
};

test('rozwinięty wiersz pokazuje pozostałe dane zamówienia', () => {
  render(<OrderDetails dataItem={order} />);
  const details = screen.getByRole('region', { name: 'Szczegóły zamówienia SH-101889' });
  expect(within(details).getByText('1284 Lake St')).toBeInTheDocument();
  expect(within(details).getByText('Instrukcja dostawy')).toBeInTheDocument();
  expect(within(details).getByText('customer id')).toBeInTheDocument();
  expect(within(details).queryByText('status')).not.toBeInTheDocument();
  expect(within(details).queryByText('total')).not.toBeInTheDocument();
});

test('Refresh ponawia żądanie HTTP z aktualnymi filtrami i numerem strony', async () => {
  const user = userEvent.setup();
  const requests: URL[] = [];
  server.use(http.get('https://api.example.test/v1/store/orders', ({ request }) => {
    const url = new URL(request.url);
    requests.push(url);
    return HttpResponse.json({
      data: [],
      meta: { page: Number(url.searchParams.get('page')), limit: 10, total: 100, pages: 10 },
    });
  }));
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
  render(<Provider store={store}><OrdersPage /></Provider>);
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });

  await user.type(screen.getByRole('textbox', { name: 'number Filter' }), 'SH-10');
  await user.type(screen.getByRole('textbox', { name: 'currency Filter' }), 'USD');
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('number_like')).toBe('SH-10');
    expect(requests.at(-1)?.searchParams.get('currency')).toBe('USD');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.click(screen.getByRole('button', { name: 'Go to the next page' }));
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('page')).toBe('2');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  const previousRequest = requests.at(-1)?.href;
  const previousCount = requests.length;
  await user.click(refresh);
  await waitFor(() => {
    expect(requests.length).toBe(previousCount + 1);
    expect(requests.at(-1)?.href).toBe(previousRequest);
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
});
