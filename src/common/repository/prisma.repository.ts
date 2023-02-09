import {
  INestApplication,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaRepository
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaRepository.name);
  constructor() {
    const logLevels: Prisma.LogLevel[] =
      process.env.NODE_ENV !== 'production'
        ? ['query', 'info', 'warn', 'error']
        : ['info', 'warn', 'error'];
    super({ log: logLevels });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      this.$on('query', (event) => {
        this.logger.debug(
          `Duration: ${event.duration} ms, Params: ${event.params}`,
        );
      });
    }

    this.$on('info', (event) => {
      this.logger.log(`message: ${event.message}`);
    });
    this.$on('error', (event) => {
      this.logger.error(`error: ${event.message}`);
    });
    this.$on('warn', (event) => {
      this.logger.log(`warn: ${event.message}`);
    });
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
