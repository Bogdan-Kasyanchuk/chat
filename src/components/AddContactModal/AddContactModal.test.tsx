import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { mockViewport } from '@/test/viewport';

import AddContactModal from './AddContactModal';

const findByEmail = vi.fn();
const addContact = vi.fn();
const openChat = vi.fn();

vi.mock('convex/react', () => ({
    useConvex: () => ({ query: findByEmail }),
    useMutation: (ref: FunctionReference<'mutation'>) => getFunctionName(ref) === 'contacts:add' ? addContact : openChat
}));

const onClose = vi.fn();

const renderModal = () => renderWithProviders(
    <Routes>
        <Route
            path="/"
            element={
                <AddContactModal
                    opened
                    onClose={ onClose }
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
    onClose.mockReset();
});

// Артборд AddContact: підказка під полем, знайдена людина з поштою, «Message» і «Add to contacts»
test('AddContactModal finds a user and adds them', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue({ userId: 'u2', name: 'Bob', avatar: null, isContact: false });
    addContact.mockResolvedValue(null);

    renderModal();

    expect(screen.getByText('Enter the exact email the person signed up with.')).toBeTruthy();

    const user = await find('bob@example.com');

    expect(findByEmail).toHaveBeenCalledWith(expect.anything(), { email: 'bob@example.com' });
    expect(await screen.findByText('bob@example.com')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Message' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Add to contacts' }));

    expect(addContact).toHaveBeenCalledWith({ userId: 'u2' });
    // Після додавання — той самий стан, що й для наявного контакту
    expect(await screen.findByText('Already in your contacts')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add to contacts' })).toBeNull();
});

test('AddContactModal opens a chat with a new person through Message', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue({ userId: 'u2', name: 'Bob', avatar: null, isContact: false });
    openChat.mockResolvedValue('c9');

    renderModal();

    const user = await find('bob@example.com');

    await user.click(await screen.findByRole('button', { name: 'Message' }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u2' });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

// Артборд AddContactExists
test('adding an existing contact shows Already in your contacts', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue({ userId: 'u2', name: 'Bob', avatar: null, isContact: true });
    openChat.mockResolvedValue('c9');

    renderModal();

    const user = await find('bob@example.com');

    expect(await screen.findByText('Already in your contacts')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add to contacts' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Message' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u2' });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

// Артборд AddContactNotFound: помилка під полем, «Cancel» і вимкнене «Add to contacts»
test('AddContactModal says when nobody has the email', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue(null);

    renderModal();

    const user = await find('nobody@example.com');
    const error = await screen.findByText('No one has signed up with this email. Check the spelling.');

    expect(error).toBeTruthy();
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('button', { name: 'Add to contacts' }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText('Enter the exact email the person signed up with.')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
});

test('editing the email clears the not-found error', async () => {
    mockViewport(true);
    findByEmail.mockResolvedValue(null);

    renderModal();

    const user = await find('nobody@example.com');

    await screen.findByText('No one has signed up with this email. Check the spelling.');
    await user.type(screen.getByLabelText('Email'), 'x');

    expect(screen.queryByText('No one has signed up with this email. Check the spelling.')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
});

test('AddContactModal shows the server message for an invalid email', async () => {
    mockViewport(true);
    findByEmail.mockRejectedValue(new ConvexError('Enter a valid email'));

    renderModal();
    await find('bob@example.com');

    await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeTruthy();
    });
});

// Артборд MobileAddContact: на телефоні це екран зі стрілкою «Back to contacts», заголовком 32 і підзаголовком
test('on the phone Add contact is a full screen with Back to contacts', async () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Add contact' });

    expect(dialog.closest('[data-full-screen]') ?? dialog.querySelector('[data-full-screen]')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Add contact' })).toBeTruthy();
    expect(screen.getByText('Find people by the email they signed up with.')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back to contacts' }));

    expect(onClose).toHaveBeenCalled();
});

// Канвас AddContact: кнопка закриття з підписом «Close»
test('the close button of the desktop dialog is named Close', () => {
    mockViewport(true);
    renderModal();

    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
});

test('the phone back arrow takes the accent text colour', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Back to contacts' }).style.getPropertyValue('--ai-color')).toBe('var(--chat-accent-text)');
});
