import { ActionIcon, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconEraser, IconTrash, IconUserMinus, IconUserPlus, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { useMutation } from 'convex/react';
import { type FC, useState } from 'react';

import ActionSheet, { type ActionSheetItem } from '@/components/ActionSheet';
import ChatActionModal from '@/components/ChatActionModal';
import type { ChatActionKind } from '@/components/ChatActionModal/ChatActionModal';
import useIsDesktop from '@/hooks/useIsDesktop';
import errorMessage from '@/lib/errorMessage';
import type { ChatView } from '@/types/chat';
import { api } from '@convex/_generated/api';

type ChatSettingsMenuProps = {
    chat: ChatView,
    onLeave?: () => void
};

const icon = (Icon: typeof IconTrash) => (
    <Icon
        size={ 22 }
        stroke={ 1.9 }
        aria-hidden
    />
);

// Артборди ChatMenu (меню 250 під кнопкою) і MobileChatMenu (нижня панель з ручкою): ті самі пункти,
// «Clear history» і «Delete chat» відокремлені лінією
const ChatSettingsMenu: FC<ChatSettingsMenuProps> = ({ chat, onLeave }) => {
    const setMuted = useMutation(api.chats.setMuted);
    const addContact = useMutation(api.contacts.add);
    const removeContact = useMutation(api.contacts.remove);
    const isDesktop = useIsDesktop();
    const [ action, setAction ] = useState<ChatActionKind | null>(null);
    const [ sheetOpened, setSheetOpened ] = useState(false);
    const { chatId, partner, muted } = chat;
    const { userId } = partner;

    const run = async (mutation: () => Promise<null>) => {
        try {
            await mutation();
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
        }
    };

    const items: ActionSheetItem[] = [
        {
            key: 'mute',
            label: muted ? 'Unmute notifications' : 'Mute notifications',
            icon: icon(muted ? IconVolume : IconVolumeOff),
            onClick: () => {
                void run(() => setMuted({ chatId, muted: !muted }));
            }
        },
        // Видалений акаунт ні додати, ні прибрати з контактів
        ...userId === null
            ? []
            : [ {
                key: 'contact',
                label: partner.isContact ? 'Remove from contacts' : 'Add to contacts',
                icon: icon(partner.isContact ? IconUserMinus : IconUserPlus),
                onClick: () => {
                    void run(() => (partner.isContact ? removeContact : addContact)({ userId }));
                }
            } ],
        {
            key: 'clear',
            label: 'Clear history',
            icon: icon(IconEraser),
            dividerBefore: true,
            onClick: () => {
                setAction('clear');
            }
        },
        {
            key: 'delete',
            label: 'Delete chat',
            icon: icon(IconTrash),
            danger: true,
            onClick: () => {
                setAction('delete');
            }
        }
    ];

    const trigger = (
        <ActionIcon
            variant="subtle"
            color="gray"
            size={ 44 }
            aria-label="Chat settings"
            // На десктопі ці атрибути ставить Menu.Target
            { ...!isDesktop && { 'aria-haspopup': 'menu', 'aria-expanded': sheetOpened } }
            onClick={ isDesktop
                ? undefined
                : () => {
                    setSheetOpened(true);
                } }
        >
            <IconDotsVertical size={ 22 } />
        </ActionIcon>
    );

    return (
        <>
            { isDesktop
                ? (
                    <Menu
                        position="bottom-end"
                        width={ 250 }
                        withinPortal
                    >
                        <Menu.Target>{ trigger }</Menu.Target>
                        <Menu.Dropdown>
                            { items.map(item => [
                                item.dividerBefore && <Menu.Divider key={ `${ item.key }-divider` } />,
                                <Menu.Item
                                    key={ item.key }
                                    color={ item.danger ? 'red' : undefined }
                                    leftSection={ item.icon }
                                    onClick={ item.onClick }
                                >
                                    { item.label }
                                </Menu.Item>
                            ]) }
                        </Menu.Dropdown>
                    </Menu>
                )
                : (
                    <>
                        { trigger }
                        <ActionSheet
                            opened={ sheetOpened }
                            title="Chat settings"
                            items={ items }
                            asMenu
                            onClose={ () => {
                                setSheetOpened(false);
                            } }
                        />
                    </>
                ) }
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
