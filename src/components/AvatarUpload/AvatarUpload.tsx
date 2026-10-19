import { Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAction, useMutation } from 'convex/react';
import { type FC, useEffect, useState } from 'react';

import PresenceAvatar from '@/components/PresenceAvatar';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { AVATAR_TOO_BIG, AVATAR_TYPE, AVATAR_TYPES, MAX_AVATAR_BYTES } from '@convex/chatRules';

type AvatarUploadProps = {
    name: string,
    avatar: string | null
};

const AvatarUpload: FC<AvatarUploadProps> = ({ name, avatar }) => {
    const generateUrl = useMutation(api.users.generateAvatarUploadUrl);
    const setAvatar = useAction(api.users.setAvatar);
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

    const upload = async (file: File | null) => {
        if (!file) {
            return;
        }

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
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xs">
            <Group wrap="nowrap">
                <PresenceAvatar
                    name={ name }
                    avatar={ preview ?? avatar }
                    size={ 72 }
                />
                <Group gap="xs">
                    <FileButton
                        accept={ AVATAR_TYPES.join(',') }
                        onChange={ file => {
                            void upload(file);
                        } }
                    >
                        { props => (
                            <Button
                                { ...props }
                                variant="default"
                                loading={ loading }
                            >
                                Upload photo
                            </Button>
                        ) }
                    </FileButton>
                    <Button
                        variant="subtle"
                        color="red"
                        disabled={ !avatar || loading }
                        onClick={ () => {
                            void remove();
                        } }
                    >
                        Remove photo
                    </Button>
                </Group>
            </Group>
            { error && (
                <Text
                    c="red"
                    size="sm"
                >
                    { error }
                </Text>
            ) }
        </Stack>
    );
};

export default AvatarUpload;
