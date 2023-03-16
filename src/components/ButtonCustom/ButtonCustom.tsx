import { FC } from 'react';

import { Button, ButtonProps } from '@mantine/core';
import { Variants } from '@mantine/styles';

export interface BtnProps extends ButtonProps {
  variant?: Variants<ButtonProps['variant'] | 'filled-grey'>;
  onClick?: any;
}

const ButtonCustom: FC<BtnProps> = (props) => {
  return <Button {...props}>{props.children}</Button>;
};

export default ButtonCustom;
