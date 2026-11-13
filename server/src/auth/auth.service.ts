import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { LoginLimiterService } from './login-limiter.service.js';
import { LoginDto } from './dto/login.dto.js';
import { UserEntity } from '../users/entities/user.entity.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly limiter: LoginLimiterService,
  ) {}

  async login(dto: LoginDto): Promise<{ user: AuthUser; accessToken: string }> {
    // Throws TooManyRequestsException if the account is locked
    await this.limiter.assertNotLocked(dto.email);

    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Record a failure even for unknown emails to prevent user enumeration
      await this.limiter.recordFailure(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.usersService.validatePassword(user, dto.password);

    if (!valid) {
      await this.limiter.recordFailure(dto.email);
      await this.limiter.assertNotLocked(dto.email); // re-check so the threshold message fires immediately
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.limiter.resetOnSuccess(dto.email);
    await this.usersService.updateLastLogin(user.id);

    return {
      user: this.toAuthUser(user),
      accessToken: this.sign(user),
    };
  }

  sign(user: UserEntity): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private toAuthUser(user: UserEntity): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
