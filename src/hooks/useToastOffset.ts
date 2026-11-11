import { type RefObject, useEffect } from 'react';

// На канвасі toast на 90 від низу при композері 70, тобто на 20 над нижньою смугою розмови
const GAP = 20;
const PROPERTY = '--chat-toast-offset';

// Публікує висоту нижньої смуги розмови (композер з відповіддю, кількома рядками чи панеллю емодзі або панель
// вибору) як --chat-toast-offset: toast-и стоять над нею, а не на полі чи емодзі. Без розмови — 90 з global.css
const useToastOffset = (ref: RefObject<HTMLElement | null>): void => {
    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const root = document.documentElement;
        const update = () => {
            root.style.setProperty(PROPERTY, `${ element.offsetHeight + GAP }px`);
        };
        const observer = new ResizeObserver(update);

        update();
        observer.observe(element);

        return () => {
            observer.disconnect();
            root.style.removeProperty(PROPERTY);
        };
    }, [ ref ]);
};

export default useToastOffset;
