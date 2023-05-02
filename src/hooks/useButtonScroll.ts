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

    const differenceHeights = scrollHeight - clientHeight;

    if (scrollDirection === 'top') {
      if (differenceHeights >= 100 && differenceHeights - 100 <= scrollPositionY) {
        setIsButtonShow(true);
      } else {
        setIsButtonShow(false);
      }
    }

    if (scrollDirection === 'bottom') {
      if (differenceHeights >= 100 && differenceHeights - 100 >= scrollPositionY) {
        setIsButtonShow(true);
      } else {
        setIsButtonShow(false);
      }
    }
  });

  return { isButtonShow };
};

export default useButtonScroll;
