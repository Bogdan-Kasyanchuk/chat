import type { FC } from 'react';

import { ActionIcon, Transition } from '@mantine/core';

import { IconArrowBigUpFilled } from '@tabler/icons-react';

import type IButtonScrollProps from './IButtonScrollProps';

const ButtonScroll: FC<IButtonScrollProps> = ({ isShow, scrollTo, buttonDirection }) => {
  return (
    <Transition mounted={isShow} transition='slide-left' duration={150}>
      {(styles) => (
        <ActionIcon
          onClick={scrollTo}
          size={40}
          pos='absolute'
          right={20}
          bottom={20}
          style={{ ...styles }}
          color='dark.5'
        >
          <IconArrowBigUpFilled
            size={40}
            style={{ transform: buttonDirection === 'top' ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
        </ActionIcon>
      )}
    </Transition>
  );
};

export default ButtonScroll;
