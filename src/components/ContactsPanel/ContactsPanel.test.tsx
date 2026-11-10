import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ContactView } from '@/types/chat';

import ContactsPanel from './ContactsPanel';

const openChat = vi.fn();

let contacts: ContactView[] | undefined;

const people: ContactView[] = [
    { userId: 'u2' as never, name: 'Bob', avatar: null, online: false, lastSeenAt: null, chatId: 'c1' as never },
    { userId: 'u3' as never, name: 'Carol', avatar: null, online: false, lastSeenAt: null, chatId: null }
];

vi.mock('convex/react', () => ({
    useQuery: () => contacts,
    useMutation: () => openChat
}));

const onAddContact = vi.fn();
const onOpened = vi.fn();

const renderPanel = (search = '') => {
    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={
                    <ContactsPanel
                        search={ search }
                        onAddContact={ onAddContact }
                        onOpened={ onOpened }
                    />
                }
            />
            <Route
                path="/chat/:chatId"
                element={ <p>chat page</p> }
            />
        </Routes>
    );
};

beforeEach(() => {
    contacts = people;
});

afterEach(() => {
    openChat.mockReset();
    onAddContact.mockReset();
    onOpened.mockReset();
});

// Чат може бути прихований для мене (співрозмовник лише відкрив його, або я його видалив): open повертає його в мій список
test('a click on a contact with a chat still opens it through chats.open', async () => {
    openChat.mockResolvedValue('c1');
    renderPanel();

    await userEvent.setup().click(screen.getByRole('button', { name: /Bob/ }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u2' });
    expect(await screen.findByText('chat page')).toBeTruthy();
});

test('a click on a contact without a chat opens a new one', async () => {
    openChat.mockResolvedValue('c7');
    renderPanel();

    await userEvent.setup().click(screen.getByRole('button', { name: /Carol/ }));

    expect(openChat).toHaveBeenCalledWith({ userId: 'u3' });
    expect(await screen.findByText('chat page')).toBeTruthy();
    expect(onOpened).toHaveBeenCalled();
});

// Артборд Contacts: рядок «Add contact» зверху, під ним кількість контактів
test('the contacts section starts with Add contact and the number of contacts', async () => {
    renderPanel();

    expect(screen.getByText('2 contacts')).toBeTruthy();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Add contact' }));

    expect(onAddContact).toHaveBeenCalled();
});

test('one contact is counted in the singular', () => {
    contacts = [ people[ 0 ] ];
    renderPanel();

    expect(screen.getByText('1 contact')).toBeTruthy();
});

test('without contacts the section says No contacts yet', () => {
    contacts = [];
    renderPanel();

    expect(screen.getByRole('heading', { name: 'No contacts yet' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add contact' })).toBeTruthy();
});

test('a search without matches says No results', () => {
    renderPanel('Olha');

    expect(screen.getByRole('heading', { name: 'No results' })).toBeTruthy();
    expect(screen.getByText('No contacts match “Olha”.')).toBeTruthy();
});

test('contacts show a skeleton while loading', () => {
    contacts = undefined;
    renderPanel();

    expect(screen.getByLabelText('Loading contacts')).toBeTruthy();
});
