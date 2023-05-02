import type { FC } from 'react';

import { ActionIcon, Transition } from '@mantine/core';

import { IconArrowBigUpFilled } from '@tabler/icons-react';

import type IButtonScrollProps from './IButtonScrollProps';

const ButtonScroll: FC<IButtonScrollProps> = ({ isShow, scrollTo }) => {
  return (
    <Transition mounted={isShow} transition='slide-left' duration={200} timingFunction='ease'>
      {(styles) => (
        <ActionIcon
          onClick={scrollTo}
          size={40}
          style={{ position: 'fixed', left: '50px', bottom: '50px', ...styles }}
        >
          <IconArrowBigUpFilled size={40} style={{ transform: 'rotate(0deg)' }} />
        </ActionIcon>
      )}
    </Transition>
  );
};

export default ButtonScroll;
