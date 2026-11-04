import { Text } from '@mantine/core';
import type { FC } from 'react';

import lastSeenText from '@/lib/lastSeen';

type StatusTextProps = {
    online: boolean,
    lastSeenAt: number | null,
    now: number
};

const StatusText: FC<StatusTextProps> = ({ online, lastSeenAt, now }) => (
    <Text
        size="xs"
        c={ online ? 'green.8' : 'dimmed' }
        truncate
    >
        { lastSeenText({ online, lastSeenAt }, now) }
    </Text>
);

export default StatusText;
