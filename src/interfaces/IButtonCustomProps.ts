import type { ButtonProps } from '@mantine/core';
import type { Variants } from '@mantine/styles';

export default interface IButtonCustomProps extends ButtonProps {
  variant?: Variants<ButtonProps['variant'] | 'filled-grey'>;
  onClick?: () => void;
}
