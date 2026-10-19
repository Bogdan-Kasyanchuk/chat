import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

// Копіює текст у буфер і показує toast «Copied» (або помилку, якщо браузер не дав доступу)
const useCopyText = (): ((text: string) => void) => {
    const clipboard = useClipboard();

    useEffect(() => {
        if (clipboard.copied) {
            notifications.show({ id: 'copied', message: 'Copied' });
        }
    }, [ clipboard.copied ]);

    useEffect(() => {
        if (clipboard.error) {
            notifications.show({ id: 'copy-failed', color: 'red', message: 'Couldn\'t copy the text' });
        }
    }, [ clipboard.error ]);

    return text => {
        // Повторне копіювання до спливання таймера теж показує toast
        clipboard.reset();
        clipboard.copy(text);
    };
};

export default useCopyText;
