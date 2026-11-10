import { ActionIcon, Radio } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { useMutation } from 'convex/react';
import { type FC, useId } from 'react';

import SettingsSection from '@/components/SettingsSection';
import errorMessage from '@/lib/errorMessage';
import { SOUND_OPTIONS, playSound } from '@/lib/sounds';
import { api } from '@convex/_generated/api';
import type { Sound } from '@convex/validators';

import classes from './SoundSettings.module.css';

type SoundSettingsProps = {
    sound: Sound
};

const TITLE = 'Notifications and sounds';

// Артборд Settings → Notifications and sounds: рядки 44, вибраний — на тлі field, кругла кнопка Play праворуч.
// Заголовок розділу підписує групу; «None» грати нічого, тож без кнопки
const SoundSettings: FC<SoundSettingsProps> = ({ sound }) => {
    const setSound = useMutation(api.users.setSound);
    const titleId = useId();
    const name = useId();

    const choose = async (next: Sound) => {
        // Звук грає одразу: вибір — це і є дія користувача, потрібна для автоплею
        void playSound(next);

        try {
            await setSound({ sound: next });
        } catch (e) {
            notifications.show({ color: 'red', message: errorMessage(e) });
        }
    };

    return (
        <SettingsSection
            title={ TITLE }
            titleId={ titleId }
        >
            <div
                role="radiogroup"
                aria-labelledby={ titleId }
                className={ classes.list }
            >
                { SOUND_OPTIONS.map(option => (
                    <div
                        key={ option.value }
                        className={ classes.row }
                        data-checked={ option.value === sound || undefined }
                    >
                        <Radio
                            name={ name }
                            value={ option.value }
                            label={ option.label }
                            checked={ option.value === sound }
                            classNames={ { root: classes.radio, body: classes.body, labelWrapper: classes.labelWrapper, label: classes.label } }
                            onChange={ () => {
                                void choose(option.value);
                            } }
                        />
                        { option.value !== 'none' && (
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                aria-label={ `Play ${ option.label }` }
                                onClick={ () => {
                                    void playSound(option.value);
                                } }
                            >
                                <IconPlayerPlayFilled
                                    size={ 16 }
                                    aria-hidden
                                />
                            </ActionIcon>
                        ) }
                    </div>
                )) }
            </div>
        </SettingsSection>
    );
};

export default SoundSettings;
