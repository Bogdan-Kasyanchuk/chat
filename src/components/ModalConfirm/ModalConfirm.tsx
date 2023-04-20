import type { FC } from 'react';

import { Group, Modal } from '@mantine/core';

import { Button } from '@/components';

import type IModalConfirmProps from './IModalConfirmProps';

const ModalConfirm: FC<IModalConfirmProps> = ({
  title,
  children,
  isOpened,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal opened={isOpened} onClose={onClose} title={title} centered>
      {children}
      <Group position='center' spacing={30}>
        <Button type='button' variant='filled-grey' compact size='lg' uppercase onClick={onConfirm}>
          Ok
        </Button>
        <Button type='button' variant='filled-grey' compact size='lg' uppercase onClick={onClose}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default ModalConfirm;
