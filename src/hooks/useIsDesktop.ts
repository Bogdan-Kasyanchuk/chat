import { useMediaQuery } from '@mantine/hooks';

// Десктоп від брейкпоінта md; нижче — телефонний розклад
const useIsDesktop = (): boolean => useMediaQuery('(min-width: 48em)') ?? false;

export default useIsDesktop;
