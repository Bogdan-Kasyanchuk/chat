import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FunctionReference, getFunctionName } from 'convex/server';
import { afterEach, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { ChatView } from '@/types/chat';

import ChatSettingsMenu from './ChatSettingsMenu';

const mutations: Record<string, ReturnType<typeof vi.fn>> = {
    'chats:setMuted': vi.fn(),
    'contacts:add': vi.fn(),
    'contacts:remove': vi.fn()
};

vi.mock('convex/react', () => ({
    useMutation: (ref: FunctionReference<'mutation'>) => mutations[ getFunctionName(ref) ] ?? vi.fn()
}));

const makeChat = (patch: Partial<ChatView> = {}): ChatView => ({
    chatId: 'c1' as ChatView[ 'chatId' ],
    partner: { userId: 'u2' as never, name: 'Bob', avatar: null, online: true, lastSeenAt: null, isContact: true },
    muted: false,
    lastReadAt: 0,
    canSend: true,
    ...patch
});

const openMenu = async (chat: ChatView) => {
    const user = userEvent.setup();

    renderWithProviders(<ChatSettingsMenu chat={ chat } />);
    await user.click(screen.getByRole('button', { name: 'Chat settings' }));

    return user;
};

afterEach(() => {
    Object.values(mutations).forEach(mock => {
        mock.mockReset();
    });
});

test('Mute toggles the label', async () => {
    mutations[ 'chats:setMuted' ].mockResolvedValue(null);

    const user = await openMenu(makeChat());

    await user.click(await screen.findByRole('menuitem', { name: 'Mute notifications' }));

    expect(mutations[ 'chats:setMuted' ]).toHaveBeenCalledWith({ chatId: 'c1', muted: true });

    cleanup();
    await openMenu(makeChat({ muted: true }));

    expect(await screen.findByRole('menuitem', { name: 'Unmute notifications' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Mute notifications' })).toBeNull();
});

test('ChatSettingsMenu adds a stranger to contacts and removes a contact', async () => {
    mutations[ 'contacts:add' ].mockResolvedValue(null);

    const user = await openMenu(makeChat({ partner: { ...makeChat().partner, isContact: false } }));

    const add = await screen.findByRole('menuitem', { name: 'Add to contacts' });

    expect(screen.queryByRole('menuitem', { name: 'Remove from contacts' })).toBeNull();

    await user.click(add);

    expect(mutations[ 'contacts:add' ]).toHaveBeenCalledWith({ userId: 'u2' });
});

test('ChatSettingsMenu has no contact item for a deleted account and opens the delete dialog', async () => {
    const user = await openMenu(makeChat({
        partner: { userId: null, name: 'Deleted account', avatar: null, online: false, lastSeenAt: null, isContact: false },
        canSend: false
    }));

    expect(await screen.findByRole('menuitem', { name: 'Clear history' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: /contacts/ })).toBeNull();

    await user.click(screen.getByRole('menuitem', { name: 'Delete chat' }));

    expect(await screen.findByRole('dialog', { name: 'Delete chat?' })).toBeTruthy();
    // Співрозмовника немає — видаляти «і для нього» нікому
    expect(screen.queryByRole('checkbox')).toBeNull();
});
