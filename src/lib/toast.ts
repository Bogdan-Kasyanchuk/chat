import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { createElement } from 'react';

// Toast успіху (Components → Toasts): галочка 18 кольору toast accent. Без власної іконки toast у global.css
// вважається помилкою й отримує «!», тож успіх завжди йде через цю функцію
export const showSuccess = (message: string, id?: string) => {
    notifications.show({ id, icon: createElement(IconCheck, { size: 18 }), message });
};
