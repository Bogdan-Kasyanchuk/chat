import { useEffect, useState } from 'react';

// Поточний час, що оновлюється раз на interval: від нього залежать «5 minutes ago» і підписи часу
const useNow = (intervalMs = 30_000): number => {
    const [ now, setNow ] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            setNow(Date.now());
        }, intervalMs);

        return () => {
            clearInterval(id);
        };
    }, [ intervalMs ]);

    return now;
};

export default useNow;
