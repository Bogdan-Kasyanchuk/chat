import { Component, type ReactNode } from 'react';

type ChatErrorBoundaryProps = {
    fallback: ReactNode,
    children: ReactNode
};

type ChatErrorBoundaryState = {
    failed: boolean
};

// Запит чату кидає, якщо id в адресі зіпсований (валідатор v.id): замість білого екрана — fallback
class ChatErrorBoundary extends Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
    state: ChatErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): ChatErrorBoundaryState {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

export default ChatErrorBoundary;
