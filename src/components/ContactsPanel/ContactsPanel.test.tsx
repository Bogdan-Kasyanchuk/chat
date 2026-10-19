import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ContactView } from '@/types/chat';

import ContactsPanel from './ContactsPanel';

const openChat = vi.fn();

const contacts: ContactView[] = [
    { userId: 'u2' as never, name: 'Bob', avatar: null, online: false, lastSeenAt: null, chatId: 'c1' as never },
    { userId: 'u3' as never, name: 'Carol', avatar: null, online: false, lastSeenAt: null, chatId: null }
];

vi.mock('convex/react', () => ({
    useQuery: () => contacts,
    useMutation: () => openChat,
    // Для закритої AddContactModal
    useConvex: () => ({})
}));

const renderPanel = () => {
    renderWithProviders(
        <Routes>
            <Route
                path="/"
                element={ <ContactsPanel search="" /> }
            />
            <Route
                path="/chat/:chatId"
                element={ <p>chat page</p> }
            />
        </Routes>
    );
};

afterEach(() => {
    openChat.mockReset();
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
});
