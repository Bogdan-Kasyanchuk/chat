import { IconArrowBackUp, IconArrowForwardUp, IconCircleCheck, IconCopy, IconPencil, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import type { MessageAction } from './messageActions';

type ActionItem = {
    title: string,
    icon: ReactNode,
    danger?: boolean
};

// Пункти меню й нижньої панелі: іконки 22 (Components → Menus), «Delete» — кольором danger
const icon = (Icon: typeof IconCopy) => (
    <Icon
        size={ 22 }
        stroke={ 1.9 }
        aria-hidden
    />
);

const ACTION_ITEMS: Record<MessageAction, ActionItem> = {
    reply: { title: 'Reply', icon: icon(IconArrowBackUp) },
    edit: { title: 'Edit', icon: icon(IconPencil) },
    copy: { title: 'Copy text', icon: icon(IconCopy) },
    forward: { title: 'Forward', icon: icon(IconArrowForwardUp) },
    select: { title: 'Select', icon: icon(IconCircleCheck) },
    delete: { title: 'Delete', icon: icon(IconTrash), danger: true }
};

export default ACTION_ITEMS;
