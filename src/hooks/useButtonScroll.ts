import type { RefObject } from 'react';
import { useState } from 'react';

import { useDidUpdate } from '@mantine/hooks';

const useButtonScroll = (
  viewport: RefObject<HTMLDivElement>,
  scrollPositionY: number,
  defaultValue: boolean,
) => {
  const [isButton, setIsButton] = useState(defaultValue);

  useDidUpdate(() => {
    const { scrollHeight, clientHeight } = viewport.current as HTMLDivElement;

    if (
      scrollHeight - clientHeight >= 100 &&
      scrollHeight - 100 - clientHeight <= scrollPositionY
    ) {
      setIsButton(true);
    } else {
      setIsButton(false);
    }
  }, [scrollPositionY]);

  return { isButton };
};

export default useButtonScroll;
