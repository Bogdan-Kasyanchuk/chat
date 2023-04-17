import { useEffect, useState } from 'react';

import { useStylesGlobal } from '@/hooks';

import type { IStatus } from '@/interfaces';

import type { TStatusUser } from '@/types';

const useClassStatus = (value: TStatusUser) => {
  const { classes } = useStylesGlobal();
  const [status, setStatus] = useState<TStatusUser>(value);

  const allStatus: IStatus = {
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
