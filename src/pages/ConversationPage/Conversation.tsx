import { useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import ChatSettingsMenu from '@/components/ChatSettingsMenu';
import Composer from '@/components/Composer';
import ConversationHeader from '@/components/ConversationHeader';
import DeleteMessagesModal from '@/components/DeleteMessagesModal';
import ForwardModal from '@/components/ForwardModal';
import MessageList from '@/components/MessageList';
import type { MessageAction } from '@/components/MessageMenu/messageActions';
import SelectionBar from '@/components/SelectionBar';
import StrangerBanner from '@/components/StrangerBanner';
import useCopyText from '@/hooks/useCopyText';
import useMessageHistory from '@/hooks/useMessageHistory';
import useNow from '@/hooks/useNow';
import errorMessage from '@/lib/errorMessage';
import type { ChatView, MessageView } from '@/types/chat';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { BATCH_SIZE_INVALID, MAX_BATCH } from '@convex/chatRules';

import classes from './ConversationPage.module.css';

type ConversationProps = {
    chat: ChatView,
    // Перед видаленням чату власноруч: зникнення чату — не «Chat not found»
    onLeave: () => void
};

// Escape не чіпає розмову, поки відкрите модальне вікно чи меню: воно закривається само
const overlayOpen = () => document.querySelector('[role="dialog"], [role="menu"], .mantine-contextmenu') !== null;

const Conversation: FC<ConversationProps> = ({ chat, onLeave }) => {
    const { chatId, partner } = chat;
    const now = useNow();
    const navigate = useNavigate();
    const me = useQuery(api.users.me);
    const send = useMutation(api.messages.send);
    const edit = useMutation(api.messages.edit);
    const history = useMessageHistory(chatId);
    const copyText = useCopyText();
    // Знімок на момент відкриття: розділювач «Unread messages» не стрибає, коли спрацьовує markRead
    const [ lastReadAtOnOpen ] = useState(chat.lastReadAt);
    const [ replyTo, setReplyTo ] = useState<MessageView | null>(null);
    const [ editing, setEditing ] = useState<MessageView | null>(null);
    const [ selected, setSelected ] = useState<ReadonlySet<Id<'messages'>>>(new Set());
    const [ forwarding, setForwarding ] = useState<Id<'messages'>[] | null>(null);
    const [ deleting, setDeleting ] = useState<MessageView[] | null>(null);

    // Вибрані, що досі в стрічці, у хронологічному порядку: видалене співрозмовником випадає саме
    const selectedMessages = useMemo(
        () => history.messages.filter(message => selected.has(message.id)),
        [ history.messages, selected ]
    );
    const visibleSelection = useMemo(() => new Set(selectedMessages.map(message => message.id)), [ selectedMessages ]);
    const selecting = selectedMessages.length > 0;

    // Стабільний об'єкт: композер фокусує поле лише коли відповідь справді змінилась
    const replyDraft = useMemo(() => replyTo && {
        authorName: replyTo.authorIsMe ? me?.name ?? 'You' : partner.name,
        body: replyTo.body
    }, [ replyTo, me?.name, partner.name ]);

    const cancel = () => {
        setReplyTo(null);
        setEditing(null);
    };

    const clearSelection = () => {
        setSelected(new Set());
    };

    const toggle = (id: Id<'messages'>) => {
        const next = new Set(visibleSelection);

        if (next.has(id)) {
            next.delete(id);
        } else if (next.size >= MAX_BATCH) {
            notifications.show({ id: 'batch-limit', color: 'red', message: BATCH_SIZE_INVALID });

            return;
        } else {
            next.add(id);
        }

        setSelected(next);
    };

    // INPUT ігноруємо (пошук у боковій панелі), TEXTAREA — ні: Escape у композері скасовує відповідь
    useHotkeys([ [ 'Escape', () => {
        if (overlayOpen()) {
            return;
        }

        if (selecting) {
            clearSelection();
        } else if (replyTo || editing) {
            cancel();
        } else {
            void navigate('/');
        }
    } ] ], [ 'INPUT', 'SELECT' ]);

    const onAction = (action: MessageAction, message: MessageView) => {
        switch (action) {
            case 'reply':
                setEditing(null);
                setReplyTo(message);
                break;
            case 'edit':
                setReplyTo(null);
                setEditing(message);
                break;
            case 'copy':
                copyText(message.body);
                break;
            case 'forward':
                setForwarding([ message.id ]);
                break;
            case 'select':
                toggle(message.id);
                break;
            case 'delete':
                setDeleting([ message ]);
                break;
        }
    };

    const saveEdit = async (target: MessageView, body: string) => {
        // Текст не змінився — нічого не зберігаємо, щоб не з'явилась позначка «edited»
        if (body.trim() !== target.body) {
            try {
                await edit({ messageId: target.id, body });
            } catch (error) {
                notifications.show({ color: 'red', message: errorMessage(error) });
                throw error;
            }
        }

        // Редагування закривається лише після збереження: при помилці текст лишається в полі
        setEditing(current => current?.id === target.id ? null : current);
    };

    const submit = async (body: string) => {
        if (editing) {
            return saveEdit(editing, body);
        }

        const target = replyTo;

        setReplyTo(null);

        try {
            await send({ chatId, body, ...target && { replyToId: target.id } });
        } catch (error) {
            setReplyTo(current => current ?? target);
            notifications.show({ color: 'red', message: errorMessage(error) });
            throw error;
        }
    };

    return (
        <div className={ classes.page }>
            { selecting
                ? (
                    <SelectionBar
                        count={ selectedMessages.length }
                        onForward={ () => {
                            setForwarding(selectedMessages.map(message => message.id));
                        } }
                        onCopy={ () => {
                            copyText(selectedMessages.map(message => message.body).join('\n\n'));
                            clearSelection();
                        } }
                        onDelete={ () => {
                            setDeleting(selectedMessages);
                        } }
                        onCancel={ clearSelection }
                    />
                )
                : (
                    <ConversationHeader
                        chat={ chat }
                        now={ now }
                        actions={ (
                            <ChatSettingsMenu
                                chat={ chat }
                                onLeave={ onLeave }
                            />
                        ) }
                    />
                ) }
            <StrangerBanner chat={ chat } />
            <MessageList
                chatId={ chatId }
                history={ history }
                partnerName={ partner.name }
                canSend={ chat.canSend }
                lastReadAt={ chat.lastReadAt }
                lastReadAtOnOpen={ lastReadAtOnOpen }
                selected={ visibleSelection }
                onAction={ onAction }
            />
            <Composer
                disabled={ !chat.canSend }
                replyTo={ replyDraft }
                editing={ editing }
                onCancel={ cancel }
                onSubmit={ submit }
            />
            { forwarding && (
                <ForwardModal
                    messageIds={ forwarding }
                    onDone={ forwarded => {
                        setForwarding(null);

                        if (forwarded) {
                            clearSelection();
                        }
                    } }
                />
            ) }
            { deleting && (
                <DeleteMessagesModal
                    messages={ deleting }
                    partnerName={ partner.userId === null ? null : partner.name }
                    onDone={ deleted => {
                        const gone = new Set(deleting.map(message => message.id));
                        const keep = (current: MessageView | null) => current && gone.has(current.id) ? null : current;

                        setDeleting(null);

                        if (deleted) {
                            clearSelection();
                            // Відповідати чи редагувати вже нічого
                            setReplyTo(keep);
                            setEditing(keep);
                        }
                    } }
                />
            ) }
        </div>
    );
};

export default Conversation;
