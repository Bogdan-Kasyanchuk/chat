import { FC } from 'react';

import { Button } from '@mantine/core';

import type { IButtonCustom } from '@/interfaces';

const ButtonCustom: FC<IButtonCustom> = (props) => {
  return <Button {...props}>{props.children}</Button>;
};

export default ButtonCustom;
