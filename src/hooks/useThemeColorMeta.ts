import { useComputedColorScheme } from '@mantine/core';
import { useEffect } from 'react';

import { THEME_COLOR } from '@/theme';

// Смуга браузера на телефоні йде за темою застосунку: ручний Light / Dark перебиває media-варіанти з index.html,
// а в режимі System колір міняється разом з темою ОС
const useThemeColorMeta = (): void => {
    const scheme = useComputedColorScheme('light');

    useEffect(() => {
        document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
            meta.content = THEME_COLOR[ scheme ];
        });
    }, [ scheme ]);
};

export default useThemeColorMeta;
