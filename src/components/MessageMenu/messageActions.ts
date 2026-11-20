import type { MessageView } from '@/types/chat';

export type MessageAction = 'reply' | 'edit' | 'copy' | 'forward' | 'select' | 'delete';

// Пункти меню повідомлення в порядку показу. Редагувати можна лише своє й не переслане
const messageActions = (message: MessageView): MessageAction[] => [
    'reply',
    ...message.authorIsMe && !message.forwardedFrom ? [ 'edit' as const ] : [],
    'copy',
    'forward',
    'select',
    'delete'
];

const SEND_ACTIONS: MessageAction[] = [ 'reply', 'edit' ];

// Те, що показують меню й нижня панель: у чат, куди не можна писати (видалений акаунт), — без «Reply» і «Edit»
export const availableActions = (message: MessageView, canSend: boolean): MessageAction[] => messageActions(message)
    .filter(action => canSend || !SEND_ACTIONS.includes(action));

export default messageActions;
