import type { FC } from 'react';

import { Button } from '@mantine/core';

import type { IButtonCustomProps } from '@/interfaces';

const ButtonCustom: FC<IButtonCustomProps> = (props) => {
  return <Button {...props}>{props.children}</Button>;
};

export default ButtonCustom;
