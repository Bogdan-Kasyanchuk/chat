import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';
import type { MessageView } from '@/types/chat';

import Composer from './Composer';

vi.mock('frimousse', async () => (await import('@/test/frimousseMock')).frimousseMock);

afterEach(() => {
    localStorage.clear();
});

const renderComposer = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    renderWithProviders(
        <Composer
            disabled={ false }
            replyTo={ null }
            editing={ null }
            onCancel={ vi.fn() }
            onSubmit={ onSubmit }
        />
    );

    return onSubmit;
};

test('Composer sends on Enter and adds a newline on Shift+Enter', async () => {
    const onSubmit = renderComposer();
    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.type(field, 'Hello{Shift>}{Enter}{/Shift}there');

    expect(field.value).toBe('Hello\nthere');
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('Hello\nthere');
    expect(field.value).toBe('');

    await user.type(field, 'Again');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenLastCalledWith('Again');
});

test('Composer does not send whitespace', async () => {
    const onSubmit = renderComposer();
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox', { name: 'Message' }), '   {Shift>}{Enter}{/Shift}  {Enter}');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).not.toHaveBeenCalled();
});

test('Composer gives the text back when sending fails', async () => {
    renderComposer(vi.fn().mockRejectedValue(new Error('offline')));
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await userEvent.setup().type(field, 'Lost?{Enter}');

    expect(field.value).toBe('Lost?');
});

test('Composer shows the reply bar and closes it', async () => {
    const onCancel = vi.fn();

    renderWithProviders(
        <Composer
            disabled={ false }
            replyTo={ { authorName: 'Bob', body: 'See you' } }
            editing={ null }
            onCancel={ onCancel }
            onSubmit={ vi.fn() }
        />
    );

    expect(screen.getByText('Reply to Bob')).toBeTruthy();
    expect(screen.getByText('See you')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel reply' }));

    expect(onCancel).toHaveBeenCalled();
});

test('Composer fills the field with the message being edited', () => {
    renderWithProviders(
        <Composer
            disabled={ false }
            replyTo={ null }
            editing={ { id: 'm1' as MessageView[ 'id' ], body: 'Old text' } }
            onCancel={ vi.fn() }
            onSubmit={ vi.fn() }
        />
    );

    expect(screen.getByText('Edit message')).toBeTruthy();
    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' }).value).toBe('Old text');
});

test('Composer replaces the field with a notice when disabled', () => {
    renderWithProviders(
        <Composer
            replyTo={ null }
            editing={ null }
            disabled
            onCancel={ vi.fn() }
            onSubmit={ vi.fn() }
        />
    );

    expect(screen.getByText('You can\'t message a deleted account')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
});

test('Composer keeps the draft while a message is being edited', async () => {
    const props = { disabled: false, replyTo: null, onCancel: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(
        <Composer
            { ...props }
            editing={ null }
        />
    );
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await userEvent.setup().type(field, 'Half a thought');

    rerender(
        <Composer
            { ...props }
            editing={ { id: 'm1' as MessageView[ 'id' ], body: 'Old text' } }
        />
    );

    expect(field.value).toBe('Old text');

    rerender(
        <Composer
            { ...props }
            editing={ { id: 'm2' as MessageView[ 'id' ], body: 'Other text' } }
        />
    );

    expect(field.value).toBe('Other text');

    rerender(
        <Composer
            { ...props }
            editing={ null }
        />
    );

    expect(field.value).toBe('Half a thought');
});

test('picking an emoji inserts it at the caret and keeps the picker open', async () => {
    mockViewport(true);
    renderComposer();
    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.type(field, 'Hi there');
    field.setSelectionRange(2, 2);
    await user.click(screen.getByRole('button', { name: 'Emoji' }));
    await user.click(screen.getByRole('button', { name: '😀' }));

    expect(field.value).toBe('Hi😀 there');
    expect(field.selectionStart).toBe(4);
    expect(document.activeElement).toBe(field);
    expect(screen.getByRole('button', { name: 'Emoji' }).getAttribute('aria-expanded')).toBe('true');
});

test('a picked emoji goes to Recently used', async () => {
    mockViewport(true);
    renderComposer();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Emoji' }));

    expect(screen.queryByText('Recently used')).toBeNull();

    await user.click(screen.getByRole('button', { name: '😀' }));

    expect(screen.getByText('Recently used')).toBeTruthy();
});

test('on a phone the emoji button swaps for Show keyboard and back', async () => {
    mockViewport(false);
    renderComposer();
    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.click(field);
    await user.click(screen.getByRole('button', { name: 'Emoji' }));

    expect(document.activeElement).not.toBe(field);
    expect(screen.queryByRole('button', { name: 'Emoji' })).toBeNull();

    await user.click(screen.getByRole('button', { name: '😀' }));

    expect(field.value).toBe('😀');
    expect(document.activeElement).not.toBe(field);

    await user.click(screen.getByRole('button', { name: 'Show keyboard' }));

    expect(document.activeElement).toBe(field);
    expect(screen.queryByRole('button', { name: '😀' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Emoji' })).toBeTruthy();
});

test('Escape closes the picker without clearing the draft', async () => {
    mockViewport(true);
    renderComposer();
    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    await user.type(field, 'Draft');
    await user.click(screen.getByRole('button', { name: 'Emoji' }));

    expect(screen.getByRole('button', { name: 'Emoji' }).getAttribute('aria-expanded')).toBe('true');

    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Emoji' }).getAttribute('aria-expanded')).toBe('false');
    expect(field.value).toBe('Draft');
});

test('a refused emoji at the limit leaves no stale caret for the next typing', async () => {
    mockViewport(true);
    renderComposer();
    const user = userEvent.setup();
    const field = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });

    fireEvent.change(field, { target: { value: 'a'.repeat(4096) } });
    field.setSelectionRange(0, 0);
    await user.click(screen.getByRole('button', { name: 'Emoji' }));
    await user.click(screen.getByRole('button', { name: '😀' }));

    expect(field.value).toHaveLength(4096);

    await user.click(field);
    field.setSelectionRange(4096, 4096);
    await user.keyboard('{Backspace}b');

    expect(field.value).toBe(`${ 'a'.repeat(4095) }b`);
});

test('on a phone focusing the field closes the panel', async () => {
    mockViewport(false);
    renderComposer();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Emoji' }));

    expect(screen.getByRole('button', { name: 'Show keyboard' })).toBeTruthy();

    await user.click(screen.getByRole('textbox', { name: 'Message' }));

    expect(screen.getByRole('button', { name: 'Emoji' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '😀' })).toBeNull();
});
