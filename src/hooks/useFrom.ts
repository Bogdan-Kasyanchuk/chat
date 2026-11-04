import { useLocation } from 'react-router';

// Куди повернути людину після входу: PrivateRoute кладе сюди шлях разом із query
const useFrom = (): string => (useLocation().state as { from?: string } | null)?.from ?? '/';

export default useFrom;
