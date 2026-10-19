import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import AddContactModal from './AddContactModal';

const findByEmail = vi.fn();
const addContact = vi.fn();
const openChat = vi.fn();

vi.mock('convex/react', () => ({
    useConvex: () => ({ query: findByEmail }),
    useMutation: (ref: FunctionReference<'mutation'>) => getFunctionName(ref) === 'contacts:add' ? addContact : openChat
}));

const renderModal = () => renderWithProviders(
    <Routes>
        <Route
            path="/"
            element={
                <AddContactModal
                    opened
                    onClose={ vi.fn() }
                />
            }
        />
        <Route
            path="/chat/:chatId"
            element={ <p>chat page</p> }
        />
    </Routes>
);

const find = async (email: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), email);
    await user.click(screen.getByRole('button', { name: 'Find' }));

    return user;
};

afterEach(() => {
    findByEmail.mockReset();
    addContact.mockReset();
    openChat.mockReset();
});

test('AddContactModal finds a user and adds them', async () => {
    findByEmail.mockResolvedValue({ userId: 'u2', name: 'Bob', avatar: null, isContact: false });
    addContact.mockResolvedValue(null);

    renderModal();

    const user = await find('bob@example.com');

    expect(findByEmail).toHaveBeenCalledWith(expect.anything(), { email: 'bob@example.com' });

    await user.click(await screen.findByRole('button', { name: 'Add to contacts' }));

    expect(addContact).toHaveBeenCalledWith({ userId: 'u2' });
    expect((await screen.findByRole('button', { name: 'In contacts' })).hasAttribute('disabled')).toBe(true);
});

test('AddContactModal opens a chat with the found user', async () => {
    findByEmail.mockResolvedValue({ userId: 'u2', name: 'Bob', avatar: null, isContact: true });
    openChat.mockResolvedValue('c9');

    renderModal();

    const user = await find('bob@example.com');

    await user.click(await screen.findByRole('button', { name: 'Message' }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u2' });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

test('AddContactModal says when nobody has the email', async () => {
    findByEmail.mockResolvedValue(null);

    renderModal();
    await find('nobody@example.com');

    expect(await screen.findByText('No user with this email')).toBeTruthy();
});

test('AddContactModal shows the server message for an invalid email', async () => {
    findByEmail.mockRejectedValue(new ConvexError('Enter a valid email'));

    renderModal();
    await find('bob@example.com');

    await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeTruthy();
    });
});
