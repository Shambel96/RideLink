export const normalizeOrigin = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/\/+$/, '');
};

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const allowedOrigins = (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.includes('*')) {
    return true;
  }

  const normalizedIncomingOrigin = normalizeOrigin(origin);

  return allowedOrigins.some(
    (allowedOrigin) =>
      normalizeOrigin(allowedOrigin) === normalizedIncomingOrigin,
  );
};
