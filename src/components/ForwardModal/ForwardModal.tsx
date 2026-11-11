import { Center, Loader, ScrollArea, Text, TextInput, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { useMutation, useQuery } from 'convex/react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import ResponsiveDialog from '@/components/ResponsiveDialog';
import StatusText from '@/components/StatusText';
import useIsDesktop from '@/hooks/useIsDesktop';
import useNow from '@/hooks/useNow';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

import classes from './ForwardModal.module.css';

type ForwardModalProps = {
    messageIds: Id<'messages'>[],
    // true — переслано (і вже йде перехід у цільовий чат), false — закрито без пересилання
    onDone: (forwarded: boolean) => void
};

type Target = {
    key: string,
    // null — контакт без чату: чат спершу відкривається
    chatId: Id<'chats'> | null,
    userId: Id<'users'>,
    name: string,
    avatar: string | null,
    online: boolean,
    lastSeenAt: number | null
};

// Артборди ForwardDialog і MobileForward: пошук, розділи «Chats» і «Contacts», рядки з аватаром 44 і статусом
const ForwardModal: FC<ForwardModalProps> = ({ messageIds, onDone }) => {
    const chats = useQuery(api.chats.list);
    const contacts = useQuery(api.contacts.list);
    const openChat = useMutation(api.chats.open);
    const forward = useMutation(api.messages.forward);
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const now = useNow();
    const [ search, setSearch ] = useState('');
    const [ busy, setBusy ] = useState(false);

    const loading = chats === undefined || contacts === undefined;
    const chatTargets: Target[] = [];
    const contactTargets: Target[] = [];

    if (!loading) {
        // Видаленому акаунту не написати; контакт, з яким уже є чат, показуємо раз — як чат
        for (const { chatId, partner } of chats) {
            if (partner.userId !== null) {
                chatTargets.push({ key: chatId, chatId, ...partner, userId: partner.userId });
            }
        }

        const inChats = new Set(chatTargets.map(target => target.userId));

        for (const contact of contacts) {
            if (!inChats.has(contact.userId)) {
                contactTargets.push({ key: contact.userId, ...contact, chatId: null });
            }
        }
    }

    const query = search.trim().toLowerCase();
    const matches = (target: Target) => target.name.toLowerCase().includes(query);
    const sections = [
        { title: 'Chats', targets: chatTargets.filter(matches) },
        { title: 'Contacts', targets: contactTargets.filter(matches) }
    ].filter(section => section.targets.length > 0);

    const send = async (target: Target) => {
        if (busy) {
            return;
        }

        setBusy(true);

        try {
            const toChatId = target.chatId ?? await openChat({ userId: target.userId });

            await forward({ messageIds, toChatId });
            onDone(true);
            await navigate(`/chat/${ toChatId }`);
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
            setBusy(false);
        }
    };

    return (
        <ResponsiveDialog
            title="Forward to"
            busy={ busy }
            opened
            sheetCloseButton
            onClose={ () => {
                onDone(false);
            } }
        >
            { /* На телефоні без автофокуса: клавіатура закрила б панель */ }
            <TextInput
                className={ classes.search }
                variant="filled"
                radius="md"
                aria-label="Search"
                placeholder="Search"
                leftSection={ <IconSearch size={ 18 } /> }
                value={ search }
                data-autofocus={ isDesktop || undefined }
                onChange={ event => {
                    setSearch(event.currentTarget.value);
                } }
            />
            <ScrollArea.Autosize
                className={ classes.list }
                mah="min(400px, 50dvh)"
            >
                { loading && (
                    <Center p="md">
                        <Loader size="sm" />
                    </Center>
                ) }
                { !loading && sections.length === 0 && (
                    <Text
                        c="dimmed"
                        ta="center"
                        p="md"
                    >
                        { query ? 'Nothing found' : 'No chats or contacts yet' }
                    </Text>
                ) }
                { sections.map(section => (
                    <section
                        key={ section.title }
                        className={ classes.section }
                    >
                        <h3 className={ classes.heading }>{ section.title }</h3>
                        { section.targets.map(target => (
                            <UnstyledButton
                                key={ target.key }
                                className={ classes.item }
                                disabled={ busy }
                                onClick={ () => {
                                    void send(target);
                                } }
                            >
                                <PresenceAvatar
                                    userId={ target.userId }
                                    name={ target.name }
                                    avatar={ target.avatar }
                                    size={ 44 }
                                    online={ target.online }
                                />
                                <span className={ classes.text }>
                                    <Text
                                        fw={ 600 }
                                        truncate
                                    >
                                        { target.name }
                                    </Text>
                                    <StatusText
                                        lastSeenAt={ target.lastSeenAt }
                                        now={ now }
                                        online={ target.online }
                                    />
                                </span>
                            </UnstyledButton>
                        )) }
                    </section>
                )) }
            </ScrollArea.Autosize>
        </ResponsiveDialog>
    );
};

export default ForwardModal;
