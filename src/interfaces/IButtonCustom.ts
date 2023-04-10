import { ButtonProps } from '@mantine/core';
import { Variants } from '@mantine/styles';

export interface IButtonCustom extends ButtonProps {
  variant?: Variants<ButtonProps['variant'] | 'filled-grey'>;
  onClick?: () => void;
}
