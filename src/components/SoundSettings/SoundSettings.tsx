import { Button, Group, Radio, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import type { FC } from 'react';

import errorMessage from '@/lib/errorMessage';
import { SOUND_OPTIONS, playSound } from '@/lib/sounds';
import { api } from '@convex/_generated/api';
import type { Sound } from '@convex/validators';

type SoundSettingsProps = {
    sound: Sound
};

const SoundSettings: FC<SoundSettingsProps> = ({ sound }) => {
    const setSound = useMutation(api.users.setSound);

    const choose = async (value: string) => {
        const next = value as Sound;

        // Звук грає одразу: вибір — це і є дія користувача, потрібна для автоплею
        void playSound(next);

        try {
            await setSound({ sound: next });
        } catch (e) {
            notifications.show({ color: 'red', message: errorMessage(e) });
        }
    };

    return (
        <Radio.Group
            value={ sound }
            label="Notification sound"
            onChange={ value => {
                void choose(value);
            } }
        >
            <Stack mt="xs">
                { SOUND_OPTIONS.map(option => (
                    <Group
                        key={ option.value }
                        justify="space-between"
                    >
                        <Radio
                            value={ option.value }
                            label={ option.label }
                        />
                        <Button
                            variant="subtle"
                            size="compact-sm"
                            aria-label={ `Play ${ option.label }` }
                            disabled={ option.value === 'none' }
                            onClick={ () => {
                                void playSound(option.value);
                            } }
                        >
                            Play
                        </Button>
                    </Group>
                )) }
            </Stack>
        </Radio.Group>
    );
};

export default SoundSettings;
