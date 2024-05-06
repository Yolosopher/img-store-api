type ResBodyType = any;

const hasThisError = (resBody: ResBodyType, msg: string) => {
  const found = resBody?.errors?.find((a: any) => a?.message === msg);
  return Boolean(found);
};

export default hasThisError;
