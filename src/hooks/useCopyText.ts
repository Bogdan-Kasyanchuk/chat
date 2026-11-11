import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { createElement, useEffect } from 'react';

// Копіює текст у буфер і показує toast «Text copied» (артборд ToastCopied) або помилку, якщо браузер не дав доступу
const useCopyText = (): ((text: string) => void) => {
    const clipboard = useClipboard();

    useEffect(() => {
        if (clipboard.copied) {
            notifications.show({ id: 'copied', icon: createElement(IconCheck, { size: 18 }), message: 'Text copied' });
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
