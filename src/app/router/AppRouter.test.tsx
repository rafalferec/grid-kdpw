import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

test('renderuje układ, przekierowuje na Products i obsługuje nawigację klawiaturą', async () => {
  const user = userEvent.setup();
  window.history.replaceState(null, '', '/');

  render(<AppProviders><App /></AppProviders>);

  expect(screen.getByRole('banner')).toHaveTextContent('KDPW — Store');
  expect(within(screen.getByRole('main')).getByRole('heading', {
    name: 'Products — w przygotowaniu',
  })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/products');

  const navigation = screen.getByRole('navigation', { name: 'Nawigacja główna' });
  const productsLink = within(navigation).getByRole('link', { name: 'Products' });
  const ordersLink = within(navigation).getByRole('link', { name: 'Orders' });
  expect(productsLink).toHaveAttribute('aria-current', 'page');

  await user.tab();
  expect(screen.getByRole('link', { name: 'Przejdź do treści' })).toHaveFocus();
  await user.tab();
  expect(productsLink).toHaveFocus();
  await user.tab();
  expect(ordersLink).toHaveFocus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/orders');
  expect(ordersLink).toHaveAttribute('aria-current', 'page');
  expect(productsLink).not.toHaveAttribute('aria-current');
});
