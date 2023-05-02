import type { RefObject } from 'react';
import { useState } from 'react';

import { useDidUpdate } from '@mantine/hooks';

const useButtonScroll = (
  viewport: RefObject<HTMLDivElement>,
  scrollPositionY: number,
  scrollDirection: 'top' | 'bottom',
) => {
  const [isButtonShow, setIsButtonShow] = useState(false);

  useDidUpdate(() => {
    const { scrollHeight, clientHeight } = viewport.current as HTMLDivElement;

    if (scrollDirection === 'top' && scrollHeight - clientHeight >= 100) {
      if (scrollHeight - 100 - clientHeight <= scrollPositionY) {
        setIsButtonShow(true);
      } else {
        setIsButtonShow(false);
      }
    }

    if (scrollDirection === 'bottom' && scrollHeight - clientHeight >= 100) {
      if (scrollHeight - 100 - clientHeight >= scrollPositionY) {
        setIsButtonShow(true);
      } else {
        setIsButtonShow(false);
      }
    }
  }, [scrollPositionY]);

  return { isButtonShow };
};

export default useButtonScroll;
