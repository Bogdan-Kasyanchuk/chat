import { notifications } from '@mantine/notifications';

const showError = (error: unknown) => {
  notifications.show({
    message: `${error}`,
    color: 'red',
  });
};

export default showError;
