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

function SelectableGrid<T>(props: GridWrapperProps<T>) {
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
  const elementFromPoint = vi.spyOn(document, 'elementFromPoint');
  const clickRow = async (row: HTMLElement) => {
    const cell = within(row).getByRole('gridcell');
    elementFromPoint.mockReturnValue(cell);
    await user.click(cell);
  };
  expect(showSelected).toBeDisabled();

  await clickRow(firstRow);
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

  await clickRow(secondRow);
  expect(secondRow).toHaveAttribute('aria-selected', 'true');
  expect(firstRow).toHaveAttribute('aria-selected', 'false');
  expect(props.onSelectionChange).toHaveBeenLastCalledWith('beta');
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();

  await clickRow(firstRow);
  expect(screen.queryByRole('region', { name: 'Wyświetlony rekord' })).not.toBeInTheDocument();
  await clickRow(secondRow);
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

test('zaznacza klawiaturą rekord z liczbowym ID równym zero', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn<(id: string | number | null) => void>();
  render(<SelectableGrid
    data={[{ id: 0, name: 'Rekord zero' }]}
    columns={[{ field: 'name', title: 'Nazwa' }]}
    dataItemKey="id"
    pagination={{ page: 1, pageSize: 10, total: 1, onPageChange: vi.fn() }}
    onSelectionChange={onSelectionChange}
  />);
  const row = screen.getByRole('row', { name: 'Rekord zero' });
  const cell = within(row).getByRole('gridcell');
  cell.focus();
  fireEvent.keyDown(cell, { key: ' ', code: 'Space', keyCode: 32 });

  expect(onSelectionChange).toHaveBeenLastCalledWith(0);
  expect(row).toHaveAttribute('aria-selected', 'true');
  await user.click(screen.getByRole('button', { name: 'Wyświetl zaznaczony' }));
  expect(within(screen.getByRole('region', { name: 'Wyświetlony rekord' }))
    .getByText('Rekord zero')).toBeInTheDocument();
});

test('loader znajduje się nad wierszami i blokuje akcje podczas odświeżania', async () => {
  const user = userEvent.setup();
  const props = { ...createProps(), selectedId: 'alpha', onRefresh: vi.fn() };
  const { container, rerender } = render(<GridWrapper {...props} loading message="Pobieranie rekordów" />);
  const overlay = screen.getByText('Pobieranie rekordów').closest<HTMLElement>('[role="status"]');
  expect(overlay).toBeInTheDocument();
  expect(container.querySelector('.k-grid-container')).toContainElement(overlay);
  expect(container.querySelector('.k-grid-header')).not.toContainElement(overlay);
  expect(container.querySelector('[aria-busy]')).toHaveAttribute('aria-busy', 'true');
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  expect(refresh).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Wyświetl zaznaczony' })).toBeDisabled();
  const cell = screen.getByRole('gridcell', { name: 'Drugi rekord' });
  vi.spyOn(document, 'elementFromPoint').mockReturnValue(cell);
  await user.click(cell);
  await user.click(refresh);
  expect(props.onSelectionChange).not.toHaveBeenCalled();
  expect(props.onRefresh).not.toHaveBeenCalled();

  rerender(<GridWrapper {...props} loading={false} message="Pobieranie rekordów" />);
  expect(screen.queryByText('Pobieranie rekordów')).not.toBeInTheDocument();
  expect(container.querySelector('[aria-busy]')).toHaveAttribute('aria-busy', 'false');
  expect(refresh).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Wyświetl zaznaczony' })).toBeEnabled();
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
