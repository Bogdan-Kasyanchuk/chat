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

export default messageActions;
