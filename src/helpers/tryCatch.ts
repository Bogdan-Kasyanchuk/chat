async function tryCatch<T>(func: T) {
  try {
    return func;
  } catch (error) {
    console.error(`${error}`);
  }
}

export default tryCatch;
