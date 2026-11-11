import type { FC } from 'react';

import ActionSheet from '@/components/ActionSheet';
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

// Артборд MobileActions: прев'ю повідомлення на затемненні над панеллю, під ним — пункти меню повідомлення.
// Панель замінює контекстне меню на телефоні
const MessageActionsSheet: FC<MessageActionsSheetProps> = ({ message, opened, canSend, onAction, onClose, onExited }) => (
    <ActionSheet
        opened={ opened }
        title="Message actions"
        items={ availableActions(message, canSend).map(action => ({
            key: action,
            label: ACTION_ITEMS[ action ].title,
            icon: ACTION_ITEMS[ action ].icon,
            danger: ACTION_ITEMS[ action ].danger,
            onClick: () => {
                onAction(action);
            }
        })) }
        above={ (
            // Дотик повз прев'ю — те саме, що дотик по затемненню
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
        ) }
        onClose={ onClose }
        onExited={ onExited }
    />
);

export default MessageActionsSheet;
