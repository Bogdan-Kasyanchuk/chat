import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

const useButtonScroll = (
  viewport: RefObject<HTMLDivElement>,
  scrollPositionY: number,
  scrollDirection: 'top' | 'bottom',
) => {
  const [isButtonShow, setIsButtonShow] = useState(false);

  useEffect(() => {
    const { scrollHeight, clientHeight } = viewport.current as HTMLDivElement;

    if (scrollDirection === 'top' && scrollPositionY >= 100) {
      setIsButtonShow(true);
    } else if (
      scrollDirection === 'bottom' &&
      scrollHeight - clientHeight - 100 >= scrollPositionY
    ) {
      setIsButtonShow(true);
    } else {
      setIsButtonShow(false);
    }
  });

  return { isButtonShow };
};

export default useButtonScroll;
