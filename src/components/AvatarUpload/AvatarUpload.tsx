import { ActionIcon, FileButton, Text, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCamera, IconTrash } from '@tabler/icons-react';
import { useAction, useMutation } from 'convex/react';
import { type CSSProperties, type FC, useEffect, useRef, useState } from 'react';

import PresenceAvatar from '@/components/PresenceAvatar';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { AVATAR_TOO_BIG, AVATAR_TYPE, AVATAR_TYPES, MAX_AVATAR_BYTES } from '@convex/chatRules';

import classes from './AvatarUpload.module.css';

type AvatarUploadProps = {
    userId: string,
    name: string,
    avatar: string | null
};

// Mantine ставить --ai-* інлайн-стилем з varsResolver, тож рамку й кольори «danger soft» задає style
const RING = `${ 3 / 16 }rem solid var(--chat-sidebar-bg)`;
const CHANGE = { '--ai-bd': RING } as CSSProperties;
// Ініціали на фото 104 — 36, як на канвасі (тема дає пропорцію аватара 44, тобто 38)
const INITIALS = { '--avatar-initials-fz': rem(36) } as CSSProperties;
const REMOVE = {
    '--ai-bd': RING,
    '--ai-bg': 'var(--chat-danger-soft)',
    '--ai-hover': 'var(--chat-danger-soft-hover)',
    '--ai-color': 'var(--chat-danger)'
} as CSSProperties;

// Артборд Settings → Profile: фото 104, кругла кнопка «Change photo» (40) знизу праворуч,
// «Remove photo» — зверху праворуч, лише коли фото є
const AvatarUpload: FC<AvatarUploadProps> = ({ userId, name, avatar }) => {
    const generateUrl = useMutation(api.users.generateAvatarUploadUrl);
    const setAvatar = useAction(api.users.setAvatar);
    const resetRef = useRef<() => void>(null);
    // «Remove photo» зникає разом з фото: фокус переходить сюди, а не на початок сторінки
    const changeRef = useRef<HTMLButtonElement>(null);
    const focusChange = useRef(false);
    const [ preview, setPreview ] = useState<string | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(false);

    // Прев'ю — object URL; звільняємо при заміні й розмонтуванні
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [ preview ]);

    // Поки йде видалення, «Change photo» вимкнена: фокус — коли вона знову доступна
    useEffect(() => {
        if (!loading && focusChange.current) {
            focusChange.current = false;
            changeRef.current?.focus();
        }
    }, [ loading ]);

    const upload = async (file: File | null) => {
        if (!file) {
            return;
        }

        // FileButton не чистить прихований input: без скидання той самий файл вдруге не спрацює
        resetRef.current?.();
        setError(null);

        if (!AVATAR_TYPES.includes(file.type)) {
            setError(AVATAR_TYPE);

            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            setError(AVATAR_TOO_BIG);

            return;
        }

        setPreview(URL.createObjectURL(file));
        setLoading(true);

        try {
            const url = await generateUrl();
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const { storageId } = await response.json() as { storageId: Id<'_storage'> };

            await setAvatar({ storageId });
            notifications.show({ message: 'Photo updated' });
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setPreview(null);
            setLoading(false);
        }
    };

    const remove = async () => {
        setError(null);
        setLoading(true);

        try {
            await setAvatar({ storageId: null });
            focusChange.current = true;
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={ classes.root }>
            <span
                className={ classes.photo }
                style={ INITIALS }
            >
                <PresenceAvatar
                    userId={ userId }
                    name={ name }
                    avatar={ preview ?? avatar }
                    size={ 104 }
                />
                <FileButton
                    resetRef={ resetRef }
                    accept={ AVATAR_TYPES.join(',') }
                    onChange={ file => {
                        void upload(file);
                    } }
                >
                    { props => (
                        <ActionIcon
                            { ...props }
                            ref={ changeRef }
                            size={ 40 }
                            className={ classes.change }
                            style={ CHANGE }
                            aria-label="Change photo"
                            loading={ loading }
                        >
                            <IconCamera
                                size={ 18 }
                                aria-hidden
                            />
                        </ActionIcon>
                    ) }
                </FileButton>
                { avatar && (
                    <ActionIcon
                        size={ 40 }
                        variant="light"
                        className={ classes.remove }
                        style={ REMOVE }
                        aria-label="Remove photo"
                        title="Remove photo"
                        disabled={ loading }
                        onClick={ () => {
                            void remove();
                        } }
                    >
                        <IconTrash
                            size={ 18 }
                            aria-hidden
                        />
                    </ActionIcon>
                ) }
            </span>
            { error && (
                <Text
                    c="var(--chat-danger)"
                    size="xs"
                >
                    { error }
                </Text>
            ) }
        </div>
    );
};

export default AvatarUpload;
