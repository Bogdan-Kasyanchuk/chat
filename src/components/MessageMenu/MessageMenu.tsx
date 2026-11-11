import { useLongPress } from '@mantine/hooks';
import { useContextMenu } from 'mantine-contextmenu';
import { type FC, type MouseEvent, type ReactNode, useState } from 'react';

import MessageActionsSheet from '@/components/MessageActionsSheet';
import type { MessageView } from '@/types/chat';

import ACTION_ITEMS from './actionItems';
import { type MessageAction, availableActions } from './messageActions';
import classes from './MessageMenu.module.css';

type MessageMenuProps = {
    message: MessageView,
    // Десктоп (від md): контекстне меню, інакше — нижня панель. Рахує MessageList раз на стрічку,
    // а не кожен рядок своїм слухачем matchMedia
    desktop: boolean,
    // Чат, куди не можна писати (видалений акаунт): без «Reply» і «Edit»
    canSend: boolean,
    // Режим вибору: меню не відкривається
    disabled?: boolean,
    onAction: (action: MessageAction) => void,
    children: ReactNode
};

// closing — панель ще від'їжджає: лишається змонтованою до кінця анімації
type SheetState = 'closed' | 'open' | 'closing';

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

// Меню повідомлення. На десктопі — контекстне меню (правий клік, довге натискання на сенсорному екрані),
// на телефоні — нижня панель MessageActionsSheet. Панель монтується лише відкритою: вікно з keydown-слухачем
// на кожне повідомлення стрічці ні до чого
const MessageMenu: FC<MessageMenuProps> = ({ message, desktop: isDesktop, canSend, disabled = false, onAction, children }) => {
    const { showContextMenu } = useContextMenu();
    const [ sheet, setSheet ] = useState<SheetState>('closed');
    const items = availableActions(message, canSend).map(action => ({
        key: action,
        title: ACTION_ITEMS[ action ].title,
        icon: ACTION_ITEMS[ action ].icon,
        className: ACTION_ITEMS[ action ].danger ? classes.danger : undefined,
        onClick: () => {
            onAction(action);
        }
    }));
    const showMenu = showContextMenu(items, { className: classes.menu, classNames: { item: classes.item } });

    const openSheet = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setSheet('open');
    };

    const open = isDesktop ? showMenu : openSheet;
    const longPress = useLongPress(event => {
        // Слухаємо лише дотики (events: [ 'touch' ]), мишу обслуговує правий клік
        if ('touches' in event) {
            swallowNextContextMenu();

            if (isDesktop) {
                showMenu(event);
            } else {
                setSheet('open');
            }
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

    // Панель — поза обгорткою: дотики й правий клік у ній (React піднімає їх і крізь портал) не мають
    // запускати довге натискання повідомлення
    return (
        <>
            <div
                className={ classes.trigger }
                onContextMenu={ disabled ? preventNativeMenu : open }
                { ...!disabled && longPress }
            >
                { children }
            </div>
            { sheet !== 'closed' && (
                <MessageActionsSheet
                    message={ message }
                    opened={ sheet === 'open' }
                    canSend={ canSend }
                    onAction={ onAction }
                    onClose={ () => {
                        setSheet('closing');
                    } }
                    onExited={ () => {
                        setSheet('closed');
                    } }
                />
            ) }
        </>
    );
};

export default MessageMenu;
