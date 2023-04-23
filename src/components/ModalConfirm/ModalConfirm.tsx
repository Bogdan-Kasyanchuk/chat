import type { FC } from 'react';

import { Group, Modal } from '@mantine/core';

import { Button } from '@/components';

import type IModalConfirmProps from './IModalConfirmProps';
import useStyles from './ModalConfirm.styles';

const ModalConfirm: FC<IModalConfirmProps> = ({
  title,
  children,
  isOpened,
  onClose,
  onConfirm,
}) => {
  const { classes: c } = useStyles();

  return (
    <Modal
      opened={isOpened}
      onClose={onClose}
      title={title}
      centered
      padding={20}
      transitionProps={{ duration: 150 }}
      classNames={{ title: c.title, close: c.closeButton }}
    >
      {children}
      <Group position='center' spacing={50} mt={30}>
        <Button type='button' variant='filled-grey' size='md' uppercase onClick={onConfirm}>
          Ok
        </Button>
        <Button type='button' variant='filled-grey' size='md' uppercase onClick={onClose}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default ModalConfirm;
