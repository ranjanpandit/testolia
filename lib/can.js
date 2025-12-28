export const can = (user, permission) => {
  if (!permission) return true;
  return user?.permissions?.includes(permission);
};
