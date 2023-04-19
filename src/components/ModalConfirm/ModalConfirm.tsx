import type { FC } from 'react';

import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import type IModalConfirmProps from './IModalConfirmProps';

const ModalConfirm: FC = () => {
  const openModal = () =>
    modals.openConfirmModal({
      title: 'Please confirm your action',
      children: (
        <Text size='sm'>
          This action is so important that you are required to confirm it with a modal. Please click
          one of these buttons to proceed.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });

  return <Button onClick={openModal}>Open confirm modal</Button>;
};

export default ModalConfirm;
