import { useState } from 'react';

import useStylesGlobal from '@/hooks/useStylesGlobal';

import { TStatusUser } from '@/types';

const useClassStatus = (defaultValue: TStatusUser) => {
  const { classes } = useStylesGlobal();
  const [status, setStatus] = useState<TStatusUser>(defaultValue);

  const allStatus: { [x: string]: string } = {
    online: classes.statusOnline,
    offline: classes.statusOffline,
    'do not disturb': classes.statusNotDisturb,
    'out of place': classes.statusOutPlace,
  };

  const setUserStatus = (value: TStatusUser) => {
    setStatus(value);
  };

  const userStatus = allStatus[`${status}`];

  return { allStatus, userStatus, setUserStatus };
};

export default useClassStatus;
