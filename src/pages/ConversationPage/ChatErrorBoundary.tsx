import { ConvexError } from 'convex/values';
import { Component, type ReactNode } from 'react';

import { CHAT_NOT_FOUND } from '@convex/chatRules';

type ChatErrorBoundaryProps = {
    // Чату немає: зіпсований id в адресі чи CHAT_NOT_FOUND від сервера
    notFound: ReactNode,
    // Будь-яка інша помилка рендеру
    fallback: ReactNode,
    children: ReactNode
};

type ChatErrorBoundaryState = {
    error: { notFound: boolean } | null
};

// Валідатор v.id відхиляє зіпсований id ще до обробника: на клієнт приходить звичайна Error з ArgumentValidationError
const isChatNotFound = (error: unknown): boolean => (error instanceof ConvexError && error.data === CHAT_NOT_FOUND)
    || (error instanceof Error && error.message.includes('ArgumentValidationError'));

// Запити чату кидають, якщо id в адресі зіпсований або чат зник: замість білого екрана — «Chat not found».
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
