import { showError } from '@/helpers';

async function tryCatch<T>(func: T) {
  try {
    return func;
  } catch (error) {
    showError(error);
  }
}

export default tryCatch;
