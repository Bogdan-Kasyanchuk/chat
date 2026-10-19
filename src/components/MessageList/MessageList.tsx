import { Center, Loader, Text } from '@mantine/core';
import { usePaginatedQuery } from 'convex/react';
import { type FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import DaySeparator from '@/components/DaySeparator';
import MessageBubble from '@/components/MessageBubble';
import ScrollDownButton from '@/components/ScrollDownButton';
import UnreadDivider from '@/components/UnreadDivider';
import useMarkRead from '@/hooks/useMarkRead';
import useNow from '@/hooks/useNow';
import type { MessageView } from '@/types/chat';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

import buildRows, { firstUnreadId } from './buildRows';
import classes from './MessageList.module.css';

type MessageListProps = {
    chatId: Id<'chats'>,
    partnerName: string,
    // Поточна позначка прочитаного: від неї лічильник на кнопці «донизу» і потреба в markRead
    lastReadAt: number,
    // Знімок позначки на момент відкриття: від нього розділювач «Unread messages»
    lastReadAtOnOpen: number,
    onReply: (message: MessageView) => void
};

const PAGE_SIZE = 30;
// Старіші сторінки підвантажуються, коли до верху лишається менше LOAD_MORE_PX
const LOAD_MORE_PX = 200;
// Вважаємо, що людина внизу, якщо до кінця менше BOTTOM_PX
const BOTTOM_PX = 40;
// Щоб поставити розділювач, при відкритті догружаємо історію до першого непрочитаного, але не безмежно
const MAX_PRELOAD = 300;
// Відступ над розділювачем при відкритті
const DIVIDER_GAP = 8;

const rowOf = (container: HTMLElement, id: string) => container.querySelector<HTMLElement>(`[data-message-id="${ id }"]`);

const MessageList: FC<MessageListProps> = ({ chatId, partnerName, lastReadAt, lastReadAtOnOpen, onReply }) => {
    const { results, status, loadMore } = usePaginatedQuery(api.messages.list, { chatId }, { initialNumItems: PAGE_SIZE });
    const now = useNow();
    // Сервер віддає від нових до старих, стрічка — навпаки
    const messages = useMemo(() => [ ...results ].reverse(), [ results ]);
    const oldest = messages.at(0);
    const newest = messages.at(-1);

    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);
    const atBottomRef = useRef(false);
    const positionedRef = useRef(false);
    const anchorRef = useRef<{ id: string, top: number } | null>(null);
    const newestIdRef = useRef<string | null>(null);
    const [ atBottom, setAtBottom ] = useState(false);

    // Історія завантажена достатньо, щоб знайти перше непрочитане
    const ready = status === 'Exhausted' || (status !== 'LoadingFirstPage'
        && (oldest === undefined || oldest.createdAt <= lastReadAtOnOpen || messages.length >= MAX_PRELOAD));

    // undefined — ще не вирішено; далі розділювач лишається на місці, поки чат відкритий,
    // тож повідомлення, що приходять наживо, його не отримують
    const [ unreadId, setUnreadId ] = useState<MessageView[ 'id' ] | null | undefined>(undefined);

    if (ready && unreadId === undefined) {
        setUnreadId(firstUnreadId(messages, lastReadAtOnOpen));
    }

    const positioned = unreadId !== undefined;
    const rows = useMemo(() => buildRows(messages, unreadId ?? null, now), [ messages, unreadId, now ]);
    const unread = messages.filter(message => !message.authorIsMe && message.createdAt > lastReadAt).length;

    useMarkRead(chatId, { atBottom: positioned && atBottom, hasUnread: unread > 0 });

    const measure = useCallback(() => {
        const el = scrollRef.current;

        if (el) {
            atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_PX;
            setAtBottom(atBottomRef.current);
        }
    }, []);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const loadOlderIfNearTop = () => {
        const el = scrollRef.current;

        if (el && positionedRef.current && status === 'CanLoadMore' && el.scrollTop < LOAD_MORE_PX) {
            loadMore(PAGE_SIZE);
        }
    };

    // Догружаємо історію до першого непрочитаного, поки стрічка ще прихована
    useEffect(() => {
        if (!ready && status === 'CanLoadMore') {
            loadMore(PAGE_SIZE);
        }
    }, [ ready, status, loadMore ]);

    // Зміна розміру стрічки (нове повідомлення, ширина вікна, поле вводу виросло) не відриває від низу
    useEffect(() => {
        const el = scrollRef.current;
        const content = contentRef.current;

        if (!el || !content) {
            return;
        }

        const observer = new ResizeObserver(() => {
            if (positionedRef.current && atBottomRef.current) {
                el.scrollTop = el.scrollHeight;
            }

            measure();
        });

        observer.observe(el);
        observer.observe(content);

        return () => {
            observer.disconnect();
        };
    }, [ measure ]);

    // 1. Старіші сторінки додаються згори: тримаємо на місці найстаріше повідомлення попереднього рендеру
    useLayoutEffect(() => {
        const el = scrollRef.current;
        const anchor = anchorRef.current;

        if (!el) {
            return;
        }

        const anchorRow = anchor && rowOf(el, anchor.id);

        if (positionedRef.current && anchor && anchorRow) {
            el.scrollTop += anchorRow.offsetTop - anchor.top;
        }

        const oldestRow = oldest && rowOf(el, oldest.id);

        anchorRef.current = oldest && oldestRow ? { id: oldest.id, top: oldestRow.offsetTop } : null;
    });

    // 2. Нове повідомлення внизу: прокручуємо, якщо людина була внизу або це її повідомлення
    useLayoutEffect(() => {
        const previousId = newestIdRef.current;

        newestIdRef.current = newest?.id ?? null;

        if (positionedRef.current && newest && previousId !== newest.id && (atBottomRef.current || newest.authorIsMe)) {
            scrollToBottom();
        }
    }, [ newest ]);

    // 3. Відкриття чату: до розділювача, інакше донизу
    useLayoutEffect(() => {
        const el = scrollRef.current;

        if (!el || !positioned || positionedRef.current) {
            return;
        }

        positionedRef.current = true;
        el.scrollTop = dividerRef.current ? dividerRef.current.offsetTop - DIVIDER_GAP : el.scrollHeight;
    }, [ positioned ]);

    // Коротка стрічка не прокручується, тож підвантаження перевіряємо й після кожного рендеру
    useLayoutEffect(loadOlderIfNearTop);

    const scrollToMessage = (id: MessageView[ 'id' ]) => {
        const row = scrollRef.current && rowOf(scrollRef.current, id);

        // Оригінал ще не завантажено — нікуди прокручувати
        if (!row) {
            return;
        }

        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        row.setAttribute('data-flash', '');
        setTimeout(() => {
            row.removeAttribute('data-flash');
        }, 1200);
    };

    return (
        <div className={ classes.wrapper }>
            <div
                ref={ scrollRef }
                className={ classes.scroll }
                onScroll={ () => {
                    measure();
                    loadOlderIfNearTop();
                } }
            >
                <div
                    ref={ contentRef }
                    className={ classes.content }
                    data-hidden={ !positioned || undefined }
                >
                    { positioned && messages.length === 0 && (
                        <Text
                            className={ classes.empty }
                            c="dimmed"
                            size="sm"
                        >
                            No messages here yet
                        </Text>
                    ) }
                    { rows.map(row => {
                        if (row.kind === 'day') {
                            return (
                                <DaySeparator
                                    key={ row.key }
                                    label={ row.label }
                                />
                            );
                        }

                        if (row.kind === 'unread') {
                            return (
                                <UnreadDivider
                                    key={ row.key }
                                    ref={ dividerRef }
                                />
                            );
                        }

                        return (
                            <MessageBubble
                                key={ row.key }
                                message={ row.message }
                                partnerName={ partnerName }
                                onQuoteClick={ scrollToMessage }
                                onDoubleClick={ () => {
                                    onReply(row.message);
                                } }
                            />
                        );
                    }) }
                </div>
            </div>
            { (!positioned || status === 'LoadingMore') && (
                <Center className={ positioned ? classes.topLoader : classes.loader }>
                    <Loader size="sm" />
                </Center>
            ) }
            <ScrollDownButton
                visible={ positioned && !atBottom }
                unread={ unread }
                onClick={ () => {
                    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                } }
            />
        </div>
    );
};

export default MessageList;
