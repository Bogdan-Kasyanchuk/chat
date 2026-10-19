import { expect, test } from 'vitest';

import type { MessageView } from '@/types/chat';

import messageActions from './messageActions';

const makeMessage = (patch: Partial<MessageView> = {}): MessageView => ({
    id: 'm1' as MessageView[ 'id' ],
    body: 'Hello',
    createdAt: 1,
    authorIsMe: true,
    editedAt: null,
    forwardedFrom: null,
    replyTo: null,
    read: false,
    ...patch
});

test('messageActions offers edit only for my own non-forwarded messages', () => {
    expect(messageActions(makeMessage())).toEqual([ 'reply', 'edit', 'copy', 'forward', 'select', 'delete' ]);
    expect(messageActions(makeMessage({ authorIsMe: false }))).toEqual([ 'reply', 'copy', 'forward', 'select', 'delete' ]);
    expect(messageActions(makeMessage({ forwardedFrom: 'Carol' }))).toEqual([ 'reply', 'copy', 'forward', 'select', 'delete' ]);
});
