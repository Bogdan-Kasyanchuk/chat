import { Checkbox } from '@mantine/core';
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

type Copy = { title: string, text: string, confirm: string, also: (name: string) => string };

// Delete chat — тексти MobileDelete; для Clear history канвас діалогу не має, тож він у тому ж тоні
const COPY: Record<ChatActionKind, (partner: string | null) => Copy> = {
    clear: () => ({
        title: 'Clear history?',
        text: 'All messages in this chat will be deleted. This can\'t be undone.',
        confirm: 'Clear',
        also: name => `Also clear for ${ name }`
    }),
    delete: partner => ({
        title: 'Delete chat?',
        text: partner === null
            ? 'The chat and its history will be removed from your list.'
            : `The chat with ${ partner } and its history will be removed from your list.`,
        confirm: 'Delete chat',
        also: name => `Also delete for ${ name }`
    })
};

const ChatActionModal: FC<ChatActionModalProps> = ({ kind, chat, onDone, onLeave }) => {
    const clearHistory = useMutation(api.chats.clearHistory);
    const removeChat = useMutation(api.chats.remove);
    const navigate = useNavigate();
    const [ forEveryone, setForEveryone ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const { chatId, partner } = chat;
    // У видаленого акаунта немає копії чату, яку можна прибрати
    const canForEveryone = partner.userId !== null;
    const copy = COPY[ kind ](canForEveryone ? partner.name : null);

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
            text={ copy.text }
            confirmLabel={ copy.confirm }
            loading={ loading }
            opened
            danger
            onConfirm={ () => {
                void confirm();
            } }
            onClose={ onDone }
        >
            { canForEveryone && (
                <Checkbox
                    label={ copy.also(partner.name) }
                    checked={ forEveryone }
                    onChange={ event => {
                        setForEveryone(event.currentTarget.checked);
                    } }
                />
            ) }
        </ConfirmModal>
    );
};

export default ChatActionModal;
