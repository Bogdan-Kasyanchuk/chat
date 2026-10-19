import { useLongPress } from '@mantine/hooks';
import { IconArrowBackUp, IconArrowForwardUp, IconCircleCheck, IconCopy, IconPencil, IconTrash } from '@tabler/icons-react';
import { type ContextMenuItemOptions, useContextMenu } from 'mantine-contextmenu';
import type { FC, MouseEvent, ReactNode } from 'react';

import type { MessageView } from '@/types/chat';

import messageActions, { type MessageAction } from './messageActions';
import classes from './MessageMenu.module.css';

type MessageMenuProps = {
    message: MessageView,
    // Чат, куди не можна писати (видалений акаунт): без «Reply» і «Edit»
    canSend: boolean,
    // Режим вибору: меню не відкривається
    disabled?: boolean,
    onAction: (action: MessageAction) => void,
    children: ReactNode
};

const ITEMS: Record<MessageAction, Pick<ContextMenuItemOptions, 'title' | 'icon' | 'color'>> = {
    reply: { title: 'Reply', icon: <IconArrowBackUp size={ 16 } /> },
    edit: { title: 'Edit', icon: <IconPencil size={ 16 } /> },
    copy: { title: 'Copy text', icon: <IconCopy size={ 16 } /> },
    forward: { title: 'Forward', icon: <IconArrowForwardUp size={ 16 } /> },
    select: { title: 'Select', icon: <IconCircleCheck size={ 16 } /> },
    delete: { title: 'Delete', icon: <IconTrash size={ 16 } />, color: 'red' }
};

const SEND_ACTIONS: MessageAction[] = [ 'reply', 'edit' ];

// Android після довгого натискання ще й шле contextmenu — на оверлей меню, яке від нього закрилося б
const swallowNextContextMenu = () => {
    const swallow = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    window.addEventListener('contextmenu', swallow, { capture: true, once: true });
    window.setTimeout(() => {
        window.removeEventListener('contextmenu', swallow, { capture: true });
    }, 1000);
};

// У режимі вибору правий клік не відкриває ні наше меню, ні браузерне
const preventNativeMenu = (event: MouseEvent) => {
    event.preventDefault();
};

// Меню повідомлення: правий клік на десктопі, довге натискання на телефоні
const MessageMenu: FC<MessageMenuProps> = ({ message, canSend, disabled = false, onAction, children }) => {
    const { showContextMenu } = useContextMenu();
    const items = messageActions(message)
        .filter(action => canSend || !SEND_ACTIONS.includes(action))
        .map(action => ({
            key: action,
            ...ITEMS[ action ],
            onClick: () => {
                onAction(action);
            }
        }));
    const open = showContextMenu(items);
    const longPress = useLongPress(event => {
        // Слухаємо лише дотики (events: [ 'touch' ]), мишу обслуговує правий клік
        if ('touches' in event) {
            swallowNextContextMenu();
            open(event);
        }
    }, {
        threshold: 400,
        cancelOnMove: true,
        events: [ 'touch' ],
        // Палець піднято після спрацювання: без цього click після touchend влучив би в оверлей і закрив меню
        onFinish: event => {
            event.preventDefault();
        }
    });

    return (
        <div
            className={ classes.trigger }
            onContextMenu={ disabled ? preventNativeMenu : open }
            { ...!disabled && longPress }
        >
            { children }
        </div>
    );
};

export default MessageMenu;
