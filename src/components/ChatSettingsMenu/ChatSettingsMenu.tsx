import { ActionIcon, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBell, IconBellOff, IconDotsVertical, IconEraser, IconTrash, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';

import ChatActionModal from '@/components/ChatActionModal';
import type { ChatActionKind } from '@/components/ChatActionModal/ChatActionModal';
import errorMessage from '@/lib/errorMessage';
import type { ChatView } from '@/types/chat';
import { api } from '@convex/_generated/api';

type ChatSettingsMenuProps = {
    chat: ChatView,
    onLeave?: () => void
};

const ChatSettingsMenu: FC<ChatSettingsMenuProps> = ({ chat, onLeave }) => {
    const setMuted = useMutation(api.chats.setMuted);
    const addContact = useMutation(api.contacts.add);
    const removeContact = useMutation(api.contacts.remove);
    const [ action, setAction ] = useState<ChatActionKind | null>(null);
    const { chatId, partner, muted } = chat;
    const { userId } = partner;

    const run = async (mutation: () => Promise<null>) => {
        try {
            await mutation();
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
        }
    };

    return (
        <>
            <Menu
                position="bottom-end"
                withinPortal
            >
                <Menu.Target>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        aria-label="Chat settings"
                    >
                        <IconDotsVertical size={ 20 } />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={ muted ? <IconBell size={ 16 } /> : <IconBellOff size={ 16 } /> }
                        onClick={ () => {
                            void run(() => setMuted({ chatId, muted: !muted }));
                        } }
                    >
                        { muted ? 'Unmute notifications' : 'Mute notifications' }
                    </Menu.Item>
                    { /* Видалений акаунт ні додати, ні прибрати з контактів */ }
                    { userId !== null && (
                        <Menu.Item
                            leftSection={ partner.isContact ? <IconUserMinus size={ 16 } /> : <IconUserPlus size={ 16 } /> }
                            onClick={ () => {
                                void run(() => (partner.isContact ? removeContact : addContact)({ userId }));
                            } }
                        >
                            { partner.isContact ? 'Remove from contacts' : 'Add to contacts' }
                        </Menu.Item>
                    ) }
                    <Menu.Item
                        leftSection={ <IconEraser size={ 16 } /> }
                        onClick={ () => {
                            setAction('clear');
                        } }
                    >
                        Clear history
                    </Menu.Item>
                    <Menu.Item
                        color="red"
                        leftSection={ <IconTrash size={ 16 } /> }
                        onClick={ () => {
                            setAction('delete');
                        } }
                    >
                        Delete chat
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            { action && (
                <ChatActionModal
                    kind={ action }
                    chat={ chat }
                    onDone={ () => {
                        setAction(null);
                    } }
                    onLeave={ onLeave }
                />
            ) }
        </>
    );
};

export default ChatSettingsMenu;
