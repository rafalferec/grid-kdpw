import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { expect, test } from 'vitest';

import { baseApi } from '@/shared/api/baseApi';
import { server } from '../../../tests/server';
import { ProductsPage } from './ProductsPage';

test('łączy filtry po stronie serwera, zachowuje je przy paginacji i Refresh oraz usuwa po wyczyszczeniu', async () => {
  const user = userEvent.setup();
  const requests: URL[] = [];
  server.use(http.get('https://api.example.test/v1/store/products', ({ request }) => {
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
  render(<Provider store={store}><ProductsPage /></Provider>);
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });

  const name = screen.getByRole('textbox', { name: 'name Filter' });
  const sku = screen.getByRole('textbox', { name: 'sku Filter' });
  const price = screen.getByRole('textbox', { name: 'price Filter' });
  expect(screen.getAllByRole('textbox')).toHaveLength(6);
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

  await user.type(name, 'Sonora');
  fireEvent.change(sku, { target: { value: 'AUD' } });
  fireEvent.change(price, { target: { value: '200.50' } });
  expect(refresh).toBeDisabled();
  await waitFor(() => {
    const params = requests.at(-1)?.searchParams;
    expect(params?.get('name_like')).toBe('Sonora');
    expect(params?.get('sku_like')).toBe('AUD');
    expect(params?.get('price_like')).toBe('200.50');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.click(screen.getByRole('button', { name: 'Go to the next page' }));
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('page')).toBe('2');
    expect(requests.at(-1)?.searchParams.get('price_like')).toBe('200.50');
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

  fireEvent.change(price, { target: { value: '150' } });
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('page')).toBe('1');
    expect(requests.at(-1)?.searchParams.get('price_like')).toBe('150');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.clear(name);
  fireEvent.change(sku, { target: { value: '' } });
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.has('name_like')).toBe(false);
    expect(requests.at(-1)?.searchParams.has('sku_like')).toBe(false);
    expect(requests.at(-1)?.searchParams.get('price_like')).toBe('150');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
  fireEvent.change(price, { target: { value: '' } });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  await user.click(refresh);
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.has('price_like')).toBe(false);
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
}, 15000);
