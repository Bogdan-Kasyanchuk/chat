import { useComputedColorScheme } from '@mantine/core';
import { useEffect } from 'react';

import { THEME_COLOR } from '@/theme';

// Смуга браузера на телефоні йде за темою застосунку: ручний Light / Dark перебиває media-варіанти з index.html,
// а в режимі System колір міняється разом з темою ОС. Схема читається вже на першому рендері (застосунок без SSR):
// інакше хук спершу записав би світлий колір поверх темного зі скрипту index.html, і смуга мигнула б
const useThemeColorMeta = (): void => {
    const scheme = useComputedColorScheme('light', { getInitialValueInEffect: false });

    useEffect(() => {
        document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
            meta.content = THEME_COLOR[ scheme ];
        });
    }, [ scheme ]);
};

export default useThemeColorMeta;
