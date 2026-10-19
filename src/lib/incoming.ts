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

        if (previous.get(chat.chatId)?.lastMessage?.id === lastMessage.id) {
            return false;
        }

        return !(pageVisible && chat.chatId === activeChatId);
    });
};

export default findIncoming;
