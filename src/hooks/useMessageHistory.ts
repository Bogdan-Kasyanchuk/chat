import { usePaginatedQuery } from 'convex/react';
import { useCallback, useMemo } from 'react';

import type { MessageView } from '@/types/chat';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

const PAGE_SIZE = 30;

export type MessageHistory = {
    // Від старих до нових, як у стрічці
    messages: MessageView[],
    status: ReturnType<typeof usePaginatedQuery>[ 'status' ],
    loadMore: () => void
};

// Завантажена історія чату. Живе в розмові, а не в стрічці: вибір, копіювання й видалення теж її читають
const useMessageHistory = (chatId: Id<'chats'>): MessageHistory => {
    const { results, status, loadMore } = usePaginatedQuery(api.messages.list, { chatId }, { initialNumItems: PAGE_SIZE });
    // Сервер віддає від нових до старих
    const messages = useMemo(() => [ ...results ].reverse(), [ results ]);

    const loadPage = useCallback(() => {
        loadMore(PAGE_SIZE);
    }, [ loadMore ]);

    return { messages, status, loadMore: loadPage };
};

export default useMessageHistory;
