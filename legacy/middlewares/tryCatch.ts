import { showError } from '@/lib';

async function tryCatch<T>(func: T) {
  try {
    return await func;
  } catch (error) {
    showError(error);
  }
}

export default tryCatch;
