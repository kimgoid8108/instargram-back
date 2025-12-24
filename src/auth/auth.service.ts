import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const isDevelopment = process.env.NODE_ENV !== 'production';

@Injectable()
export class AuthService {
  private readonly INVALID_CREDENTIALS_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.hashed_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }

    try {
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' },
      );

      const refreshToken = await this.createRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: refreshToken.hashed_token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profile_image_url: user.profile_image_url,
        },
      };
    } catch (error) {
      if (isDevelopment) {
        console.error('로그인 처리 중 오류:', error);
      }
      throw new InternalServerErrorException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  async refreshToken(token: string) {
    const hashedToken = this.hashToken(token);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { hashed_token: hashedToken },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.is_revoked || refreshToken.expires_at < new Date()) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    const accessToken = this.jwtService.sign(
      { sub: refreshToken.user.id, email: refreshToken.user.email },
      { expiresIn: '15m' },
    );

    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    const hashedToken = this.hashToken(token);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { hashed_token: hashedToken },
    });

    if (refreshToken) {
      refreshToken.is_revoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  private async createRefreshToken(userId: number): Promise<RefreshToken> {
    // 트랜잭션으로 기존 토큰 삭제 후 새 토큰 생성
    return await this.refreshTokenRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 기존 Refresh Token 삭제 (유저당 1개만 유지)
        await transactionalEntityManager.delete(RefreshToken, {
          user_id: userId,
        });

        // 새 Refresh Token 생성
        const token = crypto.randomBytes(64).toString('hex');
        const hashedToken = this.hashToken(token);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const refreshToken = transactionalEntityManager.create(RefreshToken, {
          user_id: userId,
          hashed_token: hashedToken,
          expires_at: expiresAt,
          is_revoked: false,
        });

        return await transactionalEntityManager.save(RefreshToken, refreshToken);
      },
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
