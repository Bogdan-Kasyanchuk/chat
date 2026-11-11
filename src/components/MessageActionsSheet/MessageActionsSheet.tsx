import { Drawer, UnstyledButton } from '@mantine/core';
import type { FC } from 'react';

import ACTION_ITEMS from '@/components/MessageMenu/actionItems';
import { type MessageAction, availableActions } from '@/components/MessageMenu/messageActions';
import { formatClock } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

import classes from './MessageActionsSheet.module.css';

type MessageActionsSheetProps = {
    message: MessageView,
    opened: boolean,
    // Чат, куди не можна писати (видалений акаунт): без «Reply» і «Edit»
    canSend: boolean,
    onAction: (action: MessageAction) => void,
    onClose: () => void,
    onExited?: () => void
};

// Висота за вмістом: Mantine задає --drawer-height інлайн, тож перебиваємо теж інлайн (як у ResponsiveDialog).
// Тло й тінь має аркуш з пунктами, а не вся панель (тема дає content тло popover)
const STYLES = { content: { height: 'auto', maxHeight: '100dvh', backgroundColor: 'transparent', boxShadow: 'none' } };

// Артборд MobileActions: прев'ю повідомлення на затемненні над панеллю, під ним — пункти 44 з іконками 22.
// Панель замінює контекстне меню на телефоні
const MessageActionsSheet: FC<MessageActionsSheetProps> = ({ message, opened, canSend, onAction, onClose, onExited }) => (
    <Drawer
        opened={ opened }
        position="bottom"
        title="Message actions"
        withCloseButton={ false }
        classNames={ { header: classes.header, body: classes.body } }
        styles={ STYLES }
        onClose={ onClose }
        onExitTransitionEnd={ onExited }
    >
        { /* Дотик повз прев'ю — те саме, що дотик по затемненню */ }
        <div
            className={ classes.previewRow }
            data-mine={ message.authorIsMe || undefined }
            onClick={ onClose }
        >
            <div
                className={ classes.preview }
                data-mine={ message.authorIsMe || undefined }
            >
                <span className={ classes.text }>{ message.body }</span>
                <span className={ classes.meta }>
                    { message.editedAt !== null && <span>edited</span> }
                    <time dateTime={ new Date(message.createdAt).toISOString() }>{ formatClock(message.createdAt) }</time>
                </span>
            </div>
        </div>
        <div className={ classes.sheet }>
            <span
                className={ classes.handle }
                aria-hidden
            />
            { availableActions(message, canSend).map(action => (
                <UnstyledButton
                    key={ action }
                    className={ classes.item }
                    mod={ { danger: ACTION_ITEMS[ action ].danger } }
                    onClick={ () => {
                        onClose();
                        onAction(action);
                    } }
                >
                    { ACTION_ITEMS[ action ].icon }
                    { ACTION_ITEMS[ action ].title }
                </UnstyledButton>
            )) }
        </div>
    </Drawer>
);

export default MessageActionsSheet;
