import { useMantineColorScheme } from '@mantine/core';

export type ColorSchemeSetting = 'auto' | 'light' | 'dark';

// «Appearance» у налаштуваннях: System / Light / Dark. Вибір зберігає colorSchemeManager з теми
const useColorSchemeSetting = (): { value: ColorSchemeSetting, setValue: (value: ColorSchemeSetting) => void } => {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    return { value: colorScheme, setValue: setColorScheme };
};

export default useColorSchemeSetting;
