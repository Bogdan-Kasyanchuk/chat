import { Text } from '@mantine/core';
import type { FC } from 'react';

import lastSeenText from '@/lib/lastSeen';

type StatusTextProps = {
    online: boolean,
    lastSeenAt: number | null,
    now: number
};

// Статус 14: «online» — кольором акценту, «last seen …» — muted (Contacts, шапка розмови)
const StatusText: FC<StatusTextProps> = ({ online, lastSeenAt, now }) => (
    <Text
        size="sm"
        c={ online ? 'var(--chat-accent-text)' : 'dimmed' }
        truncate
    >
        { lastSeenText({ online, lastSeenAt }, now) }
    </Text>
);

export default StatusText;
