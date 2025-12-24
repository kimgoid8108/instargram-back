// UsersService: 사용자 관련 비즈니스 로직을 처리하는 서비스
// - UsersController에서 사용자 CRUD 작업 시 호출
// - AuthService에서 사용자 조회 시 호출 (findByEmail)
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const [existingUser, existingNickname] = await Promise.all([
      this.usersRepository.findOne({ where: { email: createUserDto.email } }),
      this.usersRepository.findOne({
        where: { nickname: createUserDto.nickname },
      }),
    ]);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    if (existingNickname) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.hashed_password,
      BCRYPT_ROUNDS,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      hashed_password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.hashed_password) {
      updateUserDto.hashed_password = await bcrypt.hash(
        updateUserDto.hashed_password,
        BCRYPT_ROUNDS,
      );
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
