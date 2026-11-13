import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 5 * 60; // 5 minutes

@Injectable()
export class LoginLimiterService {
  constructor(private readonly redis: RedisService) {}

  private key(email: string): string {
    return `login:fail:${email.toLowerCase()}`;
  }

  async assertNotLocked(email: string): Promise<void> {
    const key = this.key(email);
    const count = await this.redis.get().get(key);
    if (count === null) return;

    if (parseInt(count, 10) >= MAX_ATTEMPTS) {
      const remaining = await this.redis.ttl(key);
      const minutes = Math.ceil(remaining / 60);
      throw new HttpException(
        `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordFailure(email: string): Promise<void> {
    const key = this.key(email);
    const count = await this.redis.increment(key);
    // Set TTL only on first failure so the window is fixed from the first bad attempt
    if (count === 1) {
      await this.redis.expire(key, WINDOW_SECONDS);
    }
  }

  async resetOnSuccess(email: string): Promise<void> {
    await this.redis.del(this.key(email));
  }
}
