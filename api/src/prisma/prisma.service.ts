import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function readPositiveInt(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const logger = new Logger(PrismaService.name);
    const connectionTimeoutMillis = readPositiveInt(
      'DB_CONNECTION_TIMEOUT_MS',
      20_000,
    );
    const queryTimeoutMillis = readPositiveInt('DB_QUERY_TIMEOUT_MS', 20_000);
    const pool = new Pool({
      connectionString: process.env['DATABASE_URL'],
      connectionTimeoutMillis,
      query_timeout: queryTimeoutMillis,
      statement_timeout: queryTimeoutMillis,
      idleTimeoutMillis: 20_000,
      max: readPositiveInt('DB_POOL_MAX', 5),
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      maxUses: 7_500,
      allowExitOnIdle: false,
      ssl:
        process.env['DATABASE_SSL'] === 'false'
          ? undefined
          : { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool, {
      disposeExternalPool: true,
      onPoolError: (error) => {
        logger.error('Database pool error', error.stack ?? error.message);
      },
      onConnectionError: (error) => {
        logger.error('Database connection error', error.stack ?? error.message);
      },
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_'),
    );

    return Promise.all(
      models.map((modelKey) => {
        if (typeof modelKey === 'string') {
          return this[modelKey].deleteMany();
        }
      }),
    );
  }
}
