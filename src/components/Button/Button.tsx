import type { FC } from 'react';

import { Button as Btn } from '@mantine/core';

import type { IButtonProps } from '@/interfaces';

const Button: FC<IButtonProps> = (props) => {
  return <Btn {...props}>{props.children}</Btn>;
};

export default Button;
