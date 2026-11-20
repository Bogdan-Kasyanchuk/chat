import { SegmentedControl } from '@mantine/core';
import type { FC } from 'react';

import SettingsSection from '@/components/SettingsSection';
import useColorSchemeSetting, { type ColorSchemeSetting } from '@/hooks/useColorSchemeSetting';

const OPTIONS: Array<{ value: ColorSchemeSetting, label: string }> = [
    { value: 'auto', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
];

// Settings → Appearance: тема системи, світла чи темна; вибір зберігається на пристрої (рішення «Теми»)
const AppearanceSettings: FC = () => {
    const { value, setValue } = useColorSchemeSetting();

    return (
        <SettingsSection title="Appearance">
            <SegmentedControl
                aria-label="Theme"
                data={ OPTIONS }
                value={ value }
                fullWidth
                onChange={ next => {
                    setValue(next as ColorSchemeSetting);
                } }
            />
        </SettingsSection>
    );
};

export default AppearanceSettings;
