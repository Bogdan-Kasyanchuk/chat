import type { ChatSummary } from '@/types/chat';

type IncomingOptions = {
    activeChatId: string | null,
    pageVisible: boolean
};

// Чати, де зʼявилось нове чуже повідомлення, про яке треба сповістити
const findIncoming = (prev: ChatSummary[] | undefined, next: ChatSummary[], { activeChatId, pageVisible }: IncomingOptions): ChatSummary[] => {
    if (prev === undefined) {
        return [];
    }

    const previous = new Map(prev.map(chat => [ chat.chatId, chat ]));

    return next.filter(chat => {
        const { lastMessage } = chat;

        if (!lastMessage || lastMessage.authorIsMe || chat.muted) {
            return false;
        }

        const before = previous.get(chat.chatId)?.lastMessage;

        // Старіше повідомлення стає останнім після видалення новішого — це не нове
        if (before?.id === lastMessage.id || (before && lastMessage.createdAt <= before.createdAt)) {
            return false;
        }

        return !(pageVisible && chat.chatId === activeChatId);
    });
};

export default findIncoming;
