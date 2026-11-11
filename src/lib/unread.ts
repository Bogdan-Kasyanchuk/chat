// Непрочитані в чатах без вимкненого звуку; except — відкритий чат (лічильник на «назад» у розмові)
export const unreadTotal = (chats: ReadonlyArray<{ chatId: string, unread: number, muted: boolean }> | undefined, except?: string): number => (chats ?? [])
    .reduce((sum, chat) => chat.muted || chat.chatId === except ? sum : sum + chat.unread, 0);

// Бейджі показують щонайбільше «99+»
export const MAX_BADGE = 99;

export const badgeText = (count: number): string => count > MAX_BADGE ? `${ MAX_BADGE }+` : String(count);
