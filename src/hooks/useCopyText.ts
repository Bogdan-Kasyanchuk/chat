import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

import { showSuccess } from '@/lib/toast';

// Копіює текст у буфер і показує toast «Text copied» (артборд ToastCopied) або помилку, якщо браузер не дав доступу
const useCopyText = (): ((text: string) => void) => {
    const clipboard = useClipboard();

    useEffect(() => {
        if (clipboard.copied) {
            showSuccess('Text copied', 'copied');
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
