import { useMediaQuery } from '@mantine/hooks';

// Десктоп від брейкпоінта md; нижче — телефонний розклад. Застосунок без SSR, тож медіа-запит читається
// одразу на першому рендері: щойно змонтована панель чи діалог не малюються спершу телефонними
const useIsDesktop = (): boolean => useMediaQuery('(min-width: 48em)', undefined, { getInitialValueInEffect: false });

export default useIsDesktop;
