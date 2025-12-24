import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly INVALID_CREDENTIALS_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 이메일 중복 확인
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 닉네임 중복 확인
    const existingNickname = await this.usersService.findByNickname(createUserDto.nickname);
    if (existingNickname) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }

    // 회원가입 처리 (비밀번호는 UsersService에서 해싱됨)
    const user = await this.usersService.create(createUserDto);

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

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

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        email: user.email,
        nickname: user.nickname,
      },
    };
  }
}
