import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { expect, test } from 'vitest';
import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';
import { server } from '../../../tests/server';

test('renderuje układ, przekierowuje na produkty i obsługuje nawigację klawiaturą', async () => {
  const user = userEvent.setup();
  server.use(http.get('https://api.example.test/v1/store/:collection', () => HttpResponse.json({
    data: [], meta: { page: 1, limit: 10, total: 0, pages: 0 },
  })));
  window.history.replaceState(null, '', '/');

  render(<AppProviders><App /></AppProviders>);

  expect(screen.getByRole('banner')).toHaveTextContent('KDPW — Store');
  expect(within(screen.getByRole('main')).getByRole('heading', {
    name: 'Produkty',
  })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/products');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled(), { timeout: 3000 });

  const navigation = screen.getByRole('navigation', { name: 'Nawigacja główna' });
  const productsLink = within(navigation).getByRole('link', { name: 'Produkty' });
  const ordersLink = within(navigation).getByRole('link', { name: 'Zamówienia' });
  expect(productsLink).toHaveAttribute('aria-current', 'page');

  await user.tab();
  expect(screen.getByRole('link', { name: 'Przejdź do treści' })).toHaveFocus();
  await user.tab();
  expect(productsLink).toHaveFocus();
  await user.tab();
  expect(ordersLink).toHaveFocus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('heading', { name: 'Zamówienia' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/orders');
  expect(ordersLink).toHaveAttribute('aria-current', 'page');
  expect(productsLink).not.toHaveAttribute('aria-current');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled(), { timeout: 3000 });
});
