import { dayLabel, daysBetween } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

export type Row =
    | { kind: 'day', key: string, label: string }
    | { kind: 'unread', key: string }
    | { kind: 'message', key: string, message: MessageView };

// Перше чуже повідомлення, новіше за позначку прочитаного; свої повідомлення розділювач не відкривають
export const firstUnreadId = (messages: MessageView[], lastReadAt: number): MessageView[ 'id' ] | null => messages
    .find(message => !message.authorIsMe && message.createdAt > lastReadAt)?.id ?? null;

// Рядки стрічки в хронологічному порядку: роздільники днів, «Unread messages» і самі повідомлення
const buildRows = (messages: MessageView[], unreadId: MessageView[ 'id' ] | null, now: number): Row[] => {
    const rows: Row[] = [];
    let previous: MessageView | null = null;

    for (const message of messages) {
        // Розділювач стоїть над роздільником дня, щоб «Today» лишався поруч зі своїми повідомленнями
        if (message.id === unreadId) {
            rows.push({ kind: 'unread', key: 'unread' });
        }

        if (!previous || daysBetween(previous.createdAt, message.createdAt) !== 0) {
            rows.push({ kind: 'day', key: `day-${ message.id }`, label: dayLabel(message.createdAt, now) });
        }

        rows.push({ kind: 'message', key: message.id, message });
        previous = message;
    }

    return rows;
};

export default buildRows;
