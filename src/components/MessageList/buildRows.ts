import { dayLabel, daysBetween, startOfDay } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

// Група — послідовні повідомлення одного автора з проміжком не більше 5 хвилин у межах дня
export const GROUP_GAP_MS = 5 * 60_000;

export type Row =
    | { kind: 'day', key: string, label: string }
    | { kind: 'unread', key: string }
    // first — більший відступ над бульбашкою, last — «хвостик» і кінець групи
    | { kind: 'message', key: string, message: MessageView, first: boolean, last: boolean };

type MessageRow = Extract<Row, { kind: 'message' }>;

// Перше чуже повідомлення, новіше за позначку прочитаного; свої повідомлення розділювач не відкривають
export const firstUnreadId = (messages: MessageView[], lastReadAt: number): MessageView[ 'id' ] | null => messages
    .find(message => !message.authorIsMe && message.createdAt > lastReadAt)?.id ?? null;

// Рядки стрічки в хронологічному порядку: роздільники днів, «Unread messages» і самі повідомлення з межами груп
const buildRows = (messages: MessageView[], unreadId: MessageView[ 'id' ] | null, now: number): Row[] => {
    const rows: Row[] = [];
    let previous: MessageRow | null = null;

    for (const message of messages) {
        const unread = message.id === unreadId;
        const newDay = !previous || daysBetween(previous.message.createdAt, message.createdAt) !== 0;
        const newGroup = !previous
            || newDay
            || unread
            || previous.message.authorIsMe !== message.authorIsMe
            || message.createdAt - previous.message.createdAt > GROUP_GAP_MS;

        // Розділювач стоїть над роздільником дня, щоб «Today» лишався поруч зі своїми повідомленнями
        if (unread) {
            rows.push({ kind: 'unread', key: 'unread' });
        }

        if (newDay) {
            // Ключ — календарний день, а не перше повідомлення: догружені старіші того ж дня не перемонтовують секцію
            rows.push({ kind: 'day', key: `day-${ startOfDay(message.createdAt) }`, label: dayLabel(message.createdAt, now) });
        }

        if (previous && newGroup) {
            previous.last = true;
        }

        const row: MessageRow = { kind: 'message', key: message.id, message, first: newGroup, last: false };

        rows.push(row);
        previous = row;
    }

    if (previous) {
        previous.last = true;
    }

    return rows;
};

export type Section = {
    key: string,
    // null — рядки до першої мітки дня (розділювач «Unread» над першим повідомленням дня)
    label: string | null,
    rows: Exclude<Row, { kind: 'day' }>[]
};

// Кожен день — окрема секція: липка плашка дати тримається лише над своїм днем і не накладається на інші
export const toSections = (rows: Row[]): Section[] => {
    const sections: Section[] = [];

    for (const row of rows) {
        if (row.kind === 'day') {
            sections.push({ key: row.key, label: row.label, rows: [] });
            continue;
        }

        let current = sections.at(-1);

        if (!current) {
            current = { key: 'lead', label: null, rows: [] };
            sections.push(current);
        }

        current.rows.push(row);
    }

    return sections;
};

export default buildRows;
