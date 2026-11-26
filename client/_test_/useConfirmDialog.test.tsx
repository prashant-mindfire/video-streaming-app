import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useConfirmDialog from '../src/hooks/useConfirmDialog';

const UseConfirmDialog = () => {
  const { open, dialog, selectedItem } = useConfirmDialog({
    title: 'Confirm delete',
    message: (item: string) => `Delete ${item}?`,
    onConfirm: () => undefined,
  });

  return (
    <>
      <button onClick={() => open('video')}>Open dialog</button>
      <output>{selectedItem ?? 'closed'}</output>
      {dialog}
    </>
  );
};

describe('useConfirmDialog', () => {
  it.each(['Cancel', 'Close dialog'])('closes from the %s button', (buttonName) => {
    render(<UseConfirmDialog />);

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    expect(screen.queryByText('video')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: buttonName }));

    expect(screen.queryByText('closed')).not.toBeNull();
  });
});
