import { Checkbox, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import ConfirmModal from '@/components/ConfirmModal';
import errorMessage from '@/lib/errorMessage';
import type { ChatView } from '@/types/chat';
import { api } from '@convex/_generated/api';

export type ChatActionKind = 'clear' | 'delete';

type ChatActionModalProps = {
    kind: ChatActionKind,
    chat: ChatView,
    onDone: () => void,
    // Перед видаленням чату: сторінка розмови не сприймає його зникнення як «Chat not found»
    onLeave?: () => void
};

const COPY = {
    clear: { title: 'Clear history?', text: 'All messages in this chat will be deleted.', confirm: 'Clear' },
    delete: { title: 'Delete chat?', text: 'The chat and all its messages will be deleted.', confirm: 'Delete' }
} satisfies Record<ChatActionKind, { title: string, text: string, confirm: string }>;

const ChatActionModal: FC<ChatActionModalProps> = ({ kind, chat, onDone, onLeave }) => {
    const clearHistory = useMutation(api.chats.clearHistory);
    const removeChat = useMutation(api.chats.remove);
    const navigate = useNavigate();
    const [ forEveryone, setForEveryone ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const { chatId, partner } = chat;
    // У видаленого акаунта немає копії чату, яку можна прибрати
    const canForEveryone = partner.userId !== null;
    const copy = COPY[ kind ];

    const confirm = async () => {
        const args = { chatId, forEveryone: canForEveryone && forEveryone };

        setLoading(true);

        try {
            if (kind === 'clear') {
                await clearHistory(args);
                onDone();

                return;
            }

            // Спершу йдемо з чату, потім видаляємо: інакше запит чату встигне стати null і покаже «Chat not found»
            onLeave?.();
            void navigate('/', { replace: true });
            await removeChat(args);
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
            setLoading(false);
        }
    };

    return (
        <ConfirmModal
            title={ copy.title }
            confirmLabel={ copy.confirm }
            loading={ loading }
            opened
            danger
            onConfirm={ () => {
                void confirm();
            } }
            onClose={ onDone }
        >
            <Stack>
                <Text size="sm">
                    { copy.text } You can&apos;t undo this.
                </Text>
                { canForEveryone && (
                    <Checkbox
                        label={ `Also for ${ partner.name }` }
                        checked={ forEveryone }
                        onChange={ event => {
                            setForEveryone(event.currentTarget.checked);
                        } }
                    />
                ) }
            </Stack>
        </ConfirmModal>
    );
};

export default ChatActionModal;
