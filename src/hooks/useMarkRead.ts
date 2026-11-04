import { useDocumentVisibility } from '@mantine/hooks';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

type MarkReadState = {
    atBottom: boolean,
    hasUnread: boolean
};

// Прочитаним чат стає лише тоді, коли людина справді бачить низ стрічки у видимій вкладці
const useMarkRead = (chatId: Id<'chats'>, { atBottom, hasUnread }: MarkReadState): void => {
    const markRead = useMutation(api.chats.markRead);
    const visibility = useDocumentVisibility();

    useEffect(() => {
        if (atBottom && hasUnread && visibility === 'visible') {
            // Не критично: якщо не вдалося, наступна зміна стану спробує ще раз
            markRead({ chatId }).catch(() => {});
        }
    }, [ chatId, atBottom, hasUnread, visibility, markRead ]);
};

export default useMarkRead;
