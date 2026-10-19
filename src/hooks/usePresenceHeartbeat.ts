import { useDocumentVisibility } from '@mantine/hooks';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

import { api } from '@convex/_generated/api';
import { HEARTBEAT_MS } from '@convex/chatRules';

// Сервер вважає людину онлайн, поки приходять удари; прихована вкладка їх не шле
const usePresenceHeartbeat = (): void => {
    const heartbeat = useMutation(api.presence.heartbeat);
    const visibility = useDocumentVisibility();

    useEffect(() => {
        if (visibility !== 'visible') {
            return;
        }

        const beat = () => {
            heartbeat().catch(() => {});
        };

        beat();

        const id = setInterval(beat, HEARTBEAT_MS);

        return () => {
            clearInterval(id);
        };
    }, [ visibility, heartbeat ]);
};

export default usePresenceHeartbeat;
