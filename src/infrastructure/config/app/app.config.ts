import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  name: 'FinSight',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'finsight-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  fastapi: {
    url: process.env.FASTAPI_URL ?? 'http://localhost:8000',
    internalKey: process.env.FASTAPI_INTERNAL_KEY ?? 'dev-internal-key',
  },
}));
