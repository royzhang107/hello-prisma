import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaRepository } from './common/repository';

@Injectable()
export class AppService {
  constructor(
    @Inject(forwardRef(() => PrismaRepository))
    private readonly prisma: PrismaRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getPosts() {
    const usersWithPosts = await this.prisma.user.findMany({
      include: {
        posts: true,
      },
    });
    console.dir(usersWithPosts, { depth: null });
    return usersWithPosts;
  }
}
