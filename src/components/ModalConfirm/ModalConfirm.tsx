import type { FC } from 'react';

import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type IModalConfirmProps from './IModalConfirmProps';

const ModalConfirm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title='Authentication' centered>
        Modal content Modal content Modal content Modal content Modal content Modal content
        <Group position='center' spacing={30}>
          <Button uppercase onClick={open}>
            Ok
          </Button>
          <Button uppercase onClick={close}>
            Cancel
          </Button>
        </Group>
      </Modal>

      <Group position='center'>
        <Button onClick={open}>Open centered Modal</Button>
      </Group>
    </>
  );
};

export default ModalConfirm;
