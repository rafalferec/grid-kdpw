import { useState } from 'react';
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

function SelectableGrid(props: GridWrapperProps<TestRecord>) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  return <GridWrapper
    {...props}
    selectedId={selectedId}
    onSelectionChange={(id) => {
      setSelectedId(id);
      props.onSelectionChange?.(id);
    }}
  />;
}

test('kliknięcie wiersza zaznacza go, a przycisk osobno wyświetla wybrany rekord', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn<(id: string | number | null) => void>();
  const props = { ...createProps(), onSelectionChange };
  render(<SelectableGrid {...props} />);
  const showSelected = screen.getByRole('button', { name: 'Wyświetl zaznaczony' });
  const firstRow = screen.getByRole('row', { name: 'Pierwszy rekord' });
  const secondRow = screen.getByRole('row', { name: 'Drugi rekord' });
  expect(showSelected).toBeDisabled();

  await user.click(within(firstRow).getByText('Pierwszy rekord'));
  expect(firstRow).toHaveAttribute('aria-selected', 'true');
  expect(showSelected).toBeEnabled();
  expect(props.onSelectionChange).toHaveBeenLastCalledWith('alpha');
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();

  const callsBeforeDisplay = onSelectionChange.mock.calls.length;
  await user.click(showSelected);
  let details = screen.getByRole('region', { name: 'Wyświetlony rekord' });
  expect(within(details).getByText('Pierwszy rekord')).toBeInTheDocument();
  expect(details.compareDocumentPosition(screen.getByRole('grid')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(props.onSelectionChange).toHaveBeenCalledTimes(callsBeforeDisplay);
  expect(showSelected).toHaveFocus();

  await user.click(within(secondRow).getByText('Drugi rekord'));
  expect(secondRow).toHaveAttribute('aria-selected', 'true');
  expect(firstRow).toHaveAttribute('aria-selected', 'false');
  expect(props.onSelectionChange).toHaveBeenLastCalledWith('beta');
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();

  await user.click(within(firstRow).getByText('Pierwszy rekord'));
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();
  await user.click(within(secondRow).getByText('Drugi rekord'));
  await user.click(showSelected);
  details = screen.getByRole('region', { name: 'Wyświetlony rekord' });
  expect(within(details).getByText('Drugi rekord')).toBeInTheDocument();
  expect(within(details).queryByText('Pierwszy rekord')).not.toBeInTheDocument();

  await user.click(within(details).getByRole('button', { name: 'Zamknij' }));
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();
  expect(secondRow).toHaveAttribute('aria-selected', 'true');
  expect(showSelected).toBeEnabled();
  expect(showSelected).toHaveFocus();
  await user.click(showSelected);
  expect(within(screen.getByRole('region', { name: 'Wyświetlony rekord' })).getByText('Drugi rekord')).toBeInTheDocument();
});

test('korzysta z aktualnych danych i ukrywa szczegóły rekordu usuniętego z bieżącej strony', async () => {
  const user = userEvent.setup();
  const props = { ...createProps(), selectedId: 'alpha' };
  const { rerender } = render(<GridWrapper {...props} />);

  await user.click(screen.getByRole('button', { name: 'Wyświetl zaznaczony' }));
  rerender(<GridWrapper {...props} data={[{ code: 'alpha', description: 'Aktualne dane' }]} />);
  const details = screen.getByRole('region', { name: 'Wyświetlony rekord' });
  expect(within(details).getByText('Aktualne dane')).toBeInTheDocument();
  expect(within(details).queryByText('Pierwszy rekord')).not.toBeInTheDocument();

  rerender(<GridWrapper {...props} data={[]} />);
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Wyświetl zaznaczony' })).toBeDisabled();
});

test('rozwija jeden wiersz, przełącza rozwinięcie i pozwala je zamknąć', () => {
  const props = createProps();
  render(<GridWrapper {...props} detail={TestDetails} />);

  const firstRow = screen.getByRole('row', { name: 'Expand detail row Pierwszy rekord' });
  fireEvent.click(within(firstRow).getByRole('link', { name: 'Expand detail row' }));
  expect(screen.getByText('Szczegóły alpha')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Expand detail row' }));
  expect(screen.getByText('Szczegóły beta')).toBeInTheDocument();
  expect(screen.queryByText('Szczegóły alpha')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Collapse detail row' }));
  expect(screen.queryByText('Szczegóły beta')).not.toBeInTheDocument();
});
