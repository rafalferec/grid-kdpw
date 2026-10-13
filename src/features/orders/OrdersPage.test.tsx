import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { expect, onTestFinished, test } from 'vitest';

import { baseApi } from '@/shared/api/baseApi';
import { RecordDetails } from '@/shared/components/RecordDetails/RecordDetails';
import { server } from '../../../tests/server';
import { OrdersPage } from './OrdersPage';
import { columns } from './columns';
import type { Order } from './types/order.types';

const order: Order = {
  id: 1889, number: 'SH-101889', status: 'pending', total: 876.56, currency: 'USD',
  created_at: '2026-09-01T11:06:02Z', updated_at: '2026-09-01T11:06:02Z',
  customer_id: 27, subtotal: 914.18, shipping: 5.99, tax: 56.95, discount: 100.56,
  payment_method: 'card',
  shipping_address: {
    line1: '1284 Lake St', city: 'Chicago', region: 'IL', postal_code: '60601', country: 'US',
  },
  shipping_method: 'standard',
  tracking_number: null, placed_at: '2026-09-01T11:06:02Z', paid_at: null,
  shipped_at: null, delivered_at: null, notes: 'Instrukcja dostawy',
};

function renderOrders() {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
  const view = render(<Provider store={store}><OrdersPage /></Provider>);
  onTestFinished(() => {
    view.unmount();
    store.dispatch(baseApi.util.resetApiState());
  });
  return view;
}

test('rozwinięty wiersz pokazuje pozostałe dane zamówienia', () => {
  render(<RecordDetails
    dataItem={order}
    title={`Zamówienie ${order.number}`}
    excludedFields={columns.map((column) => column.field)}
  />);
  const details = screen.getByRole('region', { name: 'Szczegóły: Zamówienie SH-101889' });
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
  renderOrders();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });

  await user.type(screen.getByRole('textbox', { name: 'number Filter' }), 'SH-10');
  await user.type(screen.getByRole('textbox', { name: 'currency Filter' }), 'USD');
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('number_like')).toBe('SH-10');
    expect(requests.at(-1)?.searchParams.get('currency_like')).toBe('USD');
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

test('dropdown statusu wysyła status_like i usuwa go po wyborze Wszystkie', async () => {
  const user = userEvent.setup();
  const requests: URL[] = [];
  server.use(http.get('https://api.example.test/v1/store/orders', ({ request }) => {
    requests.push(new URL(request.url));
    return HttpResponse.json({ data: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } });
  }));
  renderOrders();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  await user.click(screen.getByRole('combobox', { name: 'status Filter' }));
  await user.click(await screen.findByRole('option', { name: 'paid' }));
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('status_like')).toBe('paid');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
  await user.click(screen.getByRole('combobox', { name: 'status Filter' }));
  await user.click(await screen.findByRole('option', { name: '(Wszystkie)' }));
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  await user.click(refresh);
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.has('status_like')).toBe(false);
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
}, 10000);

test('po błędzie sieci zamówień pozwala ponowić pobranie', async () => {
  const user = userEvent.setup();
  let requestCount = 0;
  server.use(http.get('https://api.example.test/v1/store/orders', () => {
    requestCount += 1;
    return requestCount === 1
      ? HttpResponse.error()
      : HttpResponse.json({ data: [order], meta: { page: 1, limit: 10, total: 1, pages: 1 } });
  }));
  renderOrders();
  expect(await screen.findByRole('alert', {}, { timeout: 3000 }))
    .toHaveTextContent('Nie udało się pobrać zamówień.');
  await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
  expect(await screen.findByText(order.number, {}, { timeout: 3000 })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(requestCount).toBe(2);
});

test('koloruje statusy zamówień i pokazuje adres dopiero po rozwinięciu wiersza', async () => {
  const orders: Order[] = [
    { ...order, id: 1, number: 'ORDER-PAID', status: 'paid' },
    { ...order, id: 2, number: 'ORDER-SHIPPED', status: 'shipped' },
    { ...order, id: 3, number: 'ORDER-CANCELLED', status: 'cancelled' },
    { ...order, id: 4, number: 'ORDER-PENDING', status: 'pending' },
  ];
  server.use(http.get('https://api.example.test/v1/store/orders', () => HttpResponse.json({
    data: orders, meta: { page: 1, limit: 10, total: 4, pages: 1 },
  })));
  renderOrders();
  await screen.findByText('ORDER-PAID', {}, { timeout: 3000 });
  expect(screen.getByText('ORDER-PAID').closest('tr')).toHaveClass('rowSuccess');
  expect(screen.getByText('ORDER-SHIPPED').closest('tr')).toHaveClass('rowSuccess');
  expect(screen.getByText('ORDER-CANCELLED').closest('tr')).toHaveClass('rowDanger');
  expect(screen.getByText('ORDER-PENDING').closest('tr')).not.toHaveClass('rowSuccess');
  expect(screen.getByText('ORDER-PENDING').closest('tr')).not.toHaveClass('rowDanger');
  expect(screen.queryByText(order.shipping_address.line1)).not.toBeInTheDocument();
  const row = screen.getByRole('row', { name: /ORDER-PAID/ });
  fireEvent.click(within(row).getByRole('link', { name: 'Expand detail row' }));
  expect(screen.getByText(order.shipping_address.line1)).toBeInTheDocument();
  expect(screen.getByText(order.shipping_address.city)).toBeInTheDocument();
});
