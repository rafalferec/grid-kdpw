import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { expect, onTestFinished, test } from 'vitest';

import { baseApi } from '@/shared/api/baseApi';
import { server } from '../../../tests/server';
import { ProductsPage } from './ProductsPage';
import type { Product } from './types/product.types';

const product: Product = {
  id: 1, sku: 'AUD-1', name: 'Głośnik testowy', slug: 'glosnik-testowy',
  description: 'Opis poza kolumnami', category_id: 2, brand: 'Sonora', price: 200,
  compare_at_price: null, currency: 'PLN', color: 'black', weight_g: 500,
  tags: ['audio', 'dom'], in_stock: true, rating: 4, review_count: 10, status: 'active',
  created_at: '2026-09-01T11:06:02Z', updated_at: '2026-09-01T11:06:02Z',
};

function renderProducts() {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
  const view = render(<Provider store={store}><ProductsPage /></Provider>);
  onTestFinished(() => {
    view.unmount();
    store.dispatch(baseApi.util.resetApiState());
  });
  return view;
}

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
  renderProducts();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });

  const name = screen.getByRole('textbox', { name: 'name Filter' });
  const sku = screen.getByRole('textbox', { name: 'sku Filter' });
  const price = screen.getByRole('textbox', { name: 'price Filter' });
  expect(screen.getAllByRole('textbox')).toHaveLength(5);
  expect(screen.getByRole('textbox', { name: 'brand Filter' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'rating Filter' })).toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'id Filter' })).not.toBeInTheDocument();
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

test('łączy dropdowny z inputem, resetuje stronę i usuwa wybrany filtr przez Wszystkie', async () => {
  const user = userEvent.setup();
  const requests: URL[] = [];
  server.use(http.get('https://api.example.test/v1/store/products', ({ request }) => {
    requests.push(new URL(request.url));
    return HttpResponse.json({ data: [], meta: { page: 1, limit: 10, total: 30, pages: 3 } });
  }));
  renderProducts();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  fireEvent.change(screen.getByRole('textbox', { name: 'name Filter' }), { target: { value: 'Sonora' } });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  await user.click(screen.getByRole('button', { name: 'Go to the next page' }));
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('page')).toBe('2');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.click(screen.getByRole('combobox', { name: 'in_stock Filter' }));
  await user.click(await screen.findByRole('option', { name: 'false' }));
  await waitFor(() => {
    const params = requests.at(-1)?.searchParams;
    expect(params?.get('in_stock_like')).toBe('false');
    expect(params?.get('name_like')).toBe('Sonora');
    expect(params?.get('page')).toBe('1');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.click(screen.getByRole('combobox', { name: 'status Filter' }));
  await user.click(await screen.findByRole('option', { name: 'active' }));
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('status_like')).toBe('active');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });

  await user.click(screen.getByRole('combobox', { name: 'in_stock Filter' }));
  await user.click(await screen.findByRole('option', { name: '(Wszystkie)' }));
  await waitFor(() => {
    const params = requests.at(-1)?.searchParams;
    expect(params?.has('in_stock_like')).toBe(false);
    expect(params?.get('status_like')).toBe('active');
    expect(params?.get('name_like')).toBe('Sonora');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
}, 15000);

test('pokazuje błąd produktów i pobiera dane po ponowieniu', async () => {
  const user = userEvent.setup();
  let requestCount = 0;
  server.use(http.get('https://api.example.test/v1/store/products', () => {
    requestCount += 1;
    return requestCount === 1
      ? HttpResponse.json({ message: 'Błąd serwera' }, { status: 500 })
      : HttpResponse.json({ data: [product], meta: { page: 1, limit: 10, total: 1, pages: 1 } });
  }));
  renderProducts();
  expect(await screen.findByRole('alert', {}, { timeout: 3000 }))
    .toHaveTextContent('Nie udało się pobrać produktów.');
  await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
  expect(await screen.findByText(product.name, {}, { timeout: 3000 })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(requestCount).toBe(2);
});

test('szybkie zmiany inputu powodują jedno żądanie z ostatnią wartością', async () => {
  const requests: URL[] = [];
  server.use(http.get('https://api.example.test/v1/store/products', ({ request }) => {
    requests.push(new URL(request.url));
    return HttpResponse.json({ data: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } });
  }));
  renderProducts();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await waitFor(() => expect(refresh).toBeEnabled(), { timeout: 3000 });
  const previousCount = requests.length;
  const input = screen.getByRole('textbox', { name: 'name Filter' });
  fireEvent.change(input, { target: { value: 'S' } });
  fireEvent.change(input, { target: { value: 'So' } });
  fireEvent.change(input, { target: { value: 'Sonora' } });
  expect(requests).toHaveLength(previousCount);
  expect(refresh).toBeDisabled();
  await waitFor(() => {
    expect(requests.at(-1)?.searchParams.get('name_like')).toBe('Sonora');
    expect(refresh).toBeEnabled();
  }, { timeout: 3000 });
  expect(requests).toHaveLength(previousCount + 1);
});

test('pokazuje loader przy pobieraniu i Refresh, a następnie aktualizuje dane', async () => {
  const user = userEvent.setup();
  let requestCount = 0;
  server.use(http.get('https://api.example.test/v1/store/products', () => {
    requestCount += 1;
    return HttpResponse.json({
      data: [{ ...product, name: requestCount === 1 ? 'Przed odświeżeniem' : 'Po odświeżeniu' }],
      meta: { page: 1, limit: 10, total: 1, pages: 1 },
    });
  }));
  renderProducts();
  expect(screen.getByText('Ładowanie danych')).toBeInTheDocument();
  await screen.findByText('Przed odświeżeniem', {}, { timeout: 3000 });
  expect(screen.queryByText('Ładowanie danych')).not.toBeInTheDocument();
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  await user.click(refresh);
  expect(screen.getByText('Ładowanie danych')).toBeInTheDocument();
  expect(refresh).toBeDisabled();
  await screen.findByText('Po odświeżeniu', {}, { timeout: 3000 });
  expect(screen.queryByText('Przed odświeżeniem')).not.toBeInTheDocument();
  expect(screen.queryByText('Ładowanie danych')).not.toBeInTheDocument();
  expect(refresh).toBeEnabled();
  expect(requestCount).toBe(2);
});

test('koloruje dostępność produktów i rozwija pola pominięte w kolumnach', async () => {
  const unavailable: Product = { ...product, id: 2, name: 'Niedostępny produkt', in_stock: false };
  server.use(http.get('https://api.example.test/v1/store/products', () => HttpResponse.json({
    data: [product, unavailable], meta: { page: 1, limit: 10, total: 2, pages: 1 },
  })));
  renderProducts();
  const row = (await screen.findByText(product.name, {}, { timeout: 3000 })).closest('tr');
  expect(row).toHaveClass('rowSuccess');
  expect(row).not.toHaveClass('rowDanger');
  expect(screen.getByText(unavailable.name).closest('tr')).toHaveClass('rowDanger');
  expect(screen.queryByText('Opis poza kolumnami')).not.toBeInTheDocument();
  const productRow = screen.getByRole('row', { name: new RegExp(product.name) });
  fireEvent.click(within(productRow).getByRole('link', { name: 'Expand detail row' }));
  const details = screen.getByRole('region', { name: `Szczegóły: Produkt ${product.id}` });
  expect(within(details).getByText('Opis poza kolumnami')).toBeInTheDocument();
  expect(within(details).getByText('audio')).toBeInTheDocument();
  expect(within(details).getByText('dom')).toBeInTheDocument();
  expect(within(details).queryByText('price')).not.toBeInTheDocument();
});
