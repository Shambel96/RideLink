import { isAllowedOrigin } from './cors.config';

describe('CORS origin validation', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  beforeEach(() => {
    process.env.CORS_ORIGIN = 'http://localhost:5173';
  });

  afterAll(() => {
    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
      return;
    }

    process.env.CORS_ORIGIN = originalCorsOrigin;
  });

  it('accepts the Vite frontend origin even when a trailing slash is configured', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173/')).toBe(true);
  });

  it('rejects unexpected origins', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
  });
});
