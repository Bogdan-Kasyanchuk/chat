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

const NONE: ReadonlySet<Id<'messages'>> = new Set();

const pick = (messages: MessageView[], ids: ReadonlySet<Id<'messages'>>) => messages.filter(message => ids.has(message.id));

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
    // У стані лише id; самі повідомлення беруться з завантаженої історії. Те, що зникло (видалене співрозмовником
    // чи в іншій вкладці, очищена історія), випадає саме: відповідь і редагування закриваються, діалоги
    // працюють із тим, що лишилось, а порожній діалог закривається
    const [ replyToId, setReplyToId ] = useState<Id<'messages'> | null>(null);
    const [ editingId, setEditingId ] = useState<Id<'messages'> | null>(null);
    const [ selected, setSelected ] = useState<ReadonlySet<Id<'messages'>>>(NONE);
    const [ forwarding, setForwarding ] = useState<ReadonlySet<Id<'messages'>>>(NONE);
    const [ deleting, setDeleting ] = useState<ReadonlySet<Id<'messages'>>>(NONE);

    // У хронологічному порядку стрічки
    const selectedMessages = useMemo(() => pick(history.messages, selected), [ history.messages, selected ]);
    const forwardMessages = useMemo(() => pick(history.messages, forwarding), [ history.messages, forwarding ]);
    const deleteMessages = useMemo(() => pick(history.messages, deleting), [ history.messages, deleting ]);
    const visibleSelection = useMemo(() => new Set(selectedMessages.map(message => message.id)), [ selectedMessages ]);
    const selecting = selectedMessages.length > 0;
    const replyTo = history.messages.find(message => message.id === replyToId) ?? null;
    const editingMessage = history.messages.find(message => message.id === editingId) ?? null;

    // Стабільні об'єкти з примітивів: Convex віддає нові об'єкти з кожним оновленням історії,
    // а композер фокусує поле, коли відповідь чи редагування змінились
    const replyAuthor = replyTo && (replyTo.authorIsMe ? me?.name ?? 'You' : partner.name);
    const replyBody = replyTo?.body;
    const replyDraft = useMemo(
        () => replyAuthor === null || replyBody === undefined ? null : { authorName: replyAuthor, body: replyBody },
        [ replyAuthor, replyBody ]
    );
    const editingBody = editingMessage?.body;
    const editing = useMemo(
        () => editingId === null || editingBody === undefined ? null : { id: editingId, body: editingBody },
        [ editingId, editingBody ]
    );

    const cancel = () => {
        setReplyToId(null);
        setEditingId(null);
    };

    const clearSelection = () => {
        setSelected(NONE);
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
                setEditingId(null);
                setReplyToId(message.id);
                break;
            case 'edit':
                setReplyToId(null);
                setEditingId(message.id);
                break;
            case 'copy':
                copyText(message.body);
                break;
            case 'forward':
                setForwarding(new Set([ message.id ]));
                break;
            case 'select':
                toggle(message.id);
                break;
            case 'delete':
                setDeleting(new Set([ message.id ]));
                break;
        }
    };

    const saveEdit = async (target: Pick<MessageView, 'id' | 'body'>, body: string) => {
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
        setEditingId(current => current === target.id ? null : current);
    };

    const submit = async (body: string) => {
        if (editing) {
            return saveEdit(editing, body);
        }

        const target = replyTo?.id ?? null;

        setReplyToId(null);

        try {
            await send({ chatId, body, ...target && { replyToId: target } });
        } catch (error) {
            // Повертаємо відповідь; якщо оригінал тим часом зник, вона сама не покажеться
            setReplyToId(current => current ?? target);
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
                            setForwarding(visibleSelection);
                        } }
                        onCopy={ () => {
                            copyText(selectedMessages.map(message => message.body).join('\n\n'));
                            clearSelection();
                        } }
                        onDelete={ () => {
                            setDeleting(visibleSelection);
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
            { forwardMessages.length > 0 && (
                <ForwardModal
                    messageIds={ forwardMessages.map(message => message.id) }
                    onDone={ forwarded => {
                        setForwarding(NONE);

                        if (forwarded) {
                            clearSelection();
                        }
                    } }
                />
            ) }
            { deleteMessages.length > 0 && (
                <DeleteMessagesModal
                    messages={ deleteMessages }
                    partnerName={ partner.userId === null ? null : partner.name }
                    onDone={ deleted => {
                        setDeleting(NONE);

                        if (deleted) {
                            clearSelection();
                        }
                    } }
                />
            ) }
        </div>
    );
};

export default Conversation;
