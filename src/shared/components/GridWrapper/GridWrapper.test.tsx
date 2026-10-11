import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { GridWrapper } from './GridWrapper';
import type { GridWrapperProps } from './GridWrapper.types';

interface TestRecord {
  code: string;
  description: string;
}

function createProps(): GridWrapperProps<TestRecord> {
  return {
    data: [
      { code: 'alpha', description: 'Pierwszy rekord' },
      { code: 'beta', description: 'Drugi rekord' },
    ],
    columns: [{ field: 'description', title: 'Opis' }],
    dataItemKey: 'code',
    pagination: { page: 1, pageSize: 10, total: 2, onPageChange: vi.fn() },
    onSelectionChange: vi.fn(),
  };
}

function TestDetails({ dataItem }: { dataItem: TestRecord }) {
  return <p>Szczegóły {dataItem.code}</p>;
}

test('przycisk w wierszu zaznacza rekord i pokazuje jego dane nad tabelą', async () => {
  const user = userEvent.setup();
  const props = createProps();
  render(<GridWrapper {...props} />);
  const firstRow = screen.getByRole('row', { name: 'Pierwszy rekord Wyświetl dane' });
  const showFirst = within(firstRow).getByRole('button', { name: 'Wyświetl dane record alpha' });
  expect(screen.queryByRole('region', { name: 'Selected record' })).not.toBeInTheDocument();
  await user.click(showFirst);
  let details = screen.getByRole('region', { name: 'Selected record' });
  expect(within(details).getByText('Pierwszy rekord')).toBeInTheDocument();
  expect(details.compareDocumentPosition(screen.getByRole('grid')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(props.onSelectionChange).toHaveBeenCalledTimes(1);
  expect(props.onSelectionChange).toHaveBeenLastCalledWith('alpha');
  expect(screen.getByRole('button', { name: 'Ukryj dane record alpha' })).toHaveFocus();

  await user.click(screen.getByRole('button', { name: 'Wyświetl dane record beta' }));
  details = screen.getByRole('region', { name: 'Selected record' });
  expect(within(details).getByText('Drugi rekord')).toBeInTheDocument();
  expect(within(details).queryByText('Pierwszy rekord')).not.toBeInTheDocument();
  expect(props.onSelectionChange).toHaveBeenLastCalledWith('beta');

  await user.keyboard('{Enter}');
  expect(screen.queryByRole('region', { name: 'Selected record' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Wyświetl dane record beta' })).toHaveFocus();
});

test('korzysta z aktualnych danych i ukrywa szczegóły rekordu usuniętego z bieżącej strony', async () => {
  const user = userEvent.setup();
  const props = { ...createProps(), selectedId: 'alpha' };
  const { rerender } = render(<GridWrapper {...props} />);

  await user.click(screen.getByRole('button', { name: 'Wyświetl dane record alpha' }));
  rerender(<GridWrapper {...props} data={[{ code: 'alpha', description: 'Aktualne dane' }]} />);
  const details = screen.getByRole('region', { name: 'Selected record' });
  expect(within(details).getByText('Aktualne dane')).toBeInTheDocument();
  expect(within(details).queryByText('Pierwszy rekord')).not.toBeInTheDocument();

  rerender(<GridWrapper {...props} data={[]} />);
  expect(screen.queryByRole('region', { name: 'Selected record' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Wyświetl dane record alpha' })).not.toBeInTheDocument();
});

test('rozwija jeden wiersz, przełącza rozwinięcie i pozwala je zamknąć', () => {
  const props = createProps();
  render(<GridWrapper {...props} detail={TestDetails} />);

  const firstRow = screen.getByRole('row', { name: 'Expand detail row Pierwszy rekord Wyświetl dane' });
  fireEvent.click(within(firstRow).getByRole('link', { name: 'Expand detail row' }));
  expect(screen.getByText('Szczegóły alpha')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Selected record' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Expand detail row' }));
  expect(screen.getByText('Szczegóły beta')).toBeInTheDocument();
  expect(screen.queryByText('Szczegóły alpha')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Collapse detail row' }));
  expect(screen.queryByText('Szczegóły beta')).not.toBeInTheDocument();
});
