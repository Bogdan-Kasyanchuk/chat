import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MessageView } from '@/types/chat';

import Composer from './Composer';

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
