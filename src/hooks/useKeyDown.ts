import { KeyboardEvent, useEffect } from 'react';

const useKeyDown = (hundler: () => void) => {
  const onKeyDown = (e: KeyboardEvent<Element>) => {
    if (e.code === 'Escape') {
      hundler();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown as () => void);
    return () => {
      window.removeEventListener('keydown', onKeyDown as () => void);
    };
  });
};

export default useKeyDown;
