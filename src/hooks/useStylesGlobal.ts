import { createStyles, rem } from '@mantine/core';

const useStylesGlobal = createStyles((theme) => ({
  borderT: {
    borderTop: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  borderR: {
    borderRight: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  borderB: {
    borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  borderL: {
    borderLeft: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  border: {
    border: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  borderX: {
    borderInline: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  borderY: {
    borderBlock: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  statusOnline: {
    backgroundColor: theme.colors.green[7],
  },

  statusOffline: {
    backgroundColor: theme.colors.red[7],
  },

  statusNotDisturb: {
    backgroundColor: theme.colors.yellow[7],
  },

  statusOutPlace: {
    backgroundColor: theme.colors.gray[7],
  },
}));

export default useStylesGlobal;
