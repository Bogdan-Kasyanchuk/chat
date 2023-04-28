import { useState } from 'react';

import { useStylesGlobal } from '@/hooks';

import { STATUS } from '@/helpers';

const useClassStatus = (value?: string) => {
  const { classes } = useStylesGlobal();
  const [status, setStatus] = useState(value ?? STATUS.ONLINE);

  const allStatus = {
    [STATUS.ONLINE]: classes.statusOnline,
    [STATUS.OFFLINE]: classes.statusOffline,
    [STATUS.DO_NOT_DISTURB]: classes.statusNotDisturb,
    [STATUS.OUT_OF_PLACE]: classes.statusOutPlace,
  };

  const setUserStatus = (value: string) => {
    setStatus(value);
  };

  const userStatus = allStatus[`${status}`];

  return { allStatus, userStatus, setUserStatus };
};

export default useClassStatus;
