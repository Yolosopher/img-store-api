const delayer = async (
  ms: number,
  cb: () => any | Promise<any>
): Promise<any> => {
  return new Promise((resolve, reject) =>
    setTimeout(async () => {
      try {
        const result = await cb();
        resolve(result ?? true);
      } catch (error) {
        reject(error);
      }
    }, ms)
  );
};

export default delayer;
