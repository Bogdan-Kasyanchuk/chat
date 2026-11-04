import { ConvexError } from 'convex/values';
import { Component, type ReactNode } from 'react';

import { CHAT_NOT_FOUND } from '@convex/chatRules';

type ChatErrorBoundaryProps = {
    // Чату немає: CHAT_NOT_FOUND від сервера
    notFound: ReactNode,
    // Будь-яка інша помилка рендеру
    fallback: ReactNode,
    children: ReactNode
};

type ChatErrorBoundaryState = {
    error: { notFound: boolean } | null
};

// Зіпсований id сервер сам перетворює на null чи CHAT_NOT_FOUND; тут лишається гонка, коли messages.list
// дізнається про зниклий чат раніше за chats.get
const isChatNotFound = (error: unknown): boolean => error instanceof ConvexError && error.data === CHAT_NOT_FOUND;

// Замість білого екрана: CHAT_NOT_FOUND — «Chat not found», будь-яка інша помилка — загальний fallback.
// Інші помилки не видаємо за відсутній чат
class ChatErrorBoundary extends Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
    state: ChatErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: unknown): ChatErrorBoundaryState {
        return { error: { notFound: isChatNotFound(error) } };
    }

    render() {
        const { error } = this.state;

        if (!error) {
            return this.props.children;
        }

        return error.notFound ? this.props.notFound : this.props.fallback;
    }
}

export default ChatErrorBoundary;
