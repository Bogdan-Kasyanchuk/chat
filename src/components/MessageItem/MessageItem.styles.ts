import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  item: {
    padding: rem(15),
  },

  message: {
    padding: rem(12),
    marginBottom: rem(8),
    fontSize: rem(18),
    borderRadius: rem(16),
    lineHeight: 1.3,
  },
}));

export default useStyles;
