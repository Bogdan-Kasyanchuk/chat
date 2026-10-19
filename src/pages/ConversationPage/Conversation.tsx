import { useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'convex/react';
import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import Composer from '@/components/Composer';
import ConversationHeader from '@/components/ConversationHeader';
import MessageList from '@/components/MessageList';
import StrangerBanner from '@/components/StrangerBanner';
import useNow from '@/hooks/useNow';
import errorMessage from '@/lib/errorMessage';
import type { ChatView, MessageView } from '@/types/chat';
import { api } from '@convex/_generated/api';

import classes from './ConversationPage.module.css';

type ConversationProps = {
    chat: ChatView
};

// Escape не чіпає розмову, поки відкрите модальне вікно чи меню: воно закривається само
const overlayOpen = () => document.querySelector('[role="dialog"], [role="menu"]') !== null;

const Conversation: FC<ConversationProps> = ({ chat }) => {
    const { chatId, partner } = chat;
    const now = useNow();
    const navigate = useNavigate();
    const me = useQuery(api.users.me);
    const send = useMutation(api.messages.send);
    // Знімок на момент відкриття: розділювач «Unread messages» не стрибає, коли спрацьовує markRead
    const [ lastReadAtOnOpen ] = useState(chat.lastReadAt);
    const [ replyTo, setReplyTo ] = useState<MessageView | null>(null);
    // Заповнює меню повідомлення (задача 12)
    const [ editing, setEditing ] = useState<MessageView | null>(null);

    // Стабільний об'єкт: композер фокусує поле лише коли відповідь справді змінилась
    const replyDraft = useMemo(() => replyTo && {
        authorName: replyTo.authorIsMe ? me?.name ?? 'You' : partner.name,
        body: replyTo.body
    }, [ replyTo, me?.name, partner.name ]);

    const cancel = () => {
        setReplyTo(null);
        setEditing(null);
    };

    // INPUT ігноруємо (пошук у боковій панелі), TEXTAREA — ні: Escape у композері скасовує відповідь
    useHotkeys([ [ 'Escape', () => {
        if (overlayOpen()) {
            return;
        }

        if (replyTo || editing) {
            cancel();
        } else {
            void navigate('/');
        }
    } ] ], [ 'INPUT', 'SELECT' ]);

    // Редагування (editing) під'єднає задача 12; поки що композер лише надсилає
    const submit = async (body: string) => {
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
            <ConversationHeader
                chat={ chat }
                now={ now }
            />
            <StrangerBanner chat={ chat } />
            <MessageList
                chatId={ chatId }
                partnerName={ partner.name }
                lastReadAt={ chat.lastReadAt }
                lastReadAtOnOpen={ lastReadAtOnOpen }
                onReply={ message => {
                    setEditing(null);
                    setReplyTo(message);
                } }
            />
            <Composer
                disabled={ !chat.canSend }
                replyTo={ replyDraft }
                editing={ editing }
                onCancel={ cancel }
                onSubmit={ submit }
            />
        </div>
    );
};

export default Conversation;
