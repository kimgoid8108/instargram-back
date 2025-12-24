// UsersController: 사용자 관련 HTTP 요청을 처리하는 컨트롤러
// - GET /users/me: 현재 로그인한 사용자 정보 조회 (인증 필수)
// - GET /users: 모든 사용자 조회
// - GET /users/:id: 특정 사용자 조회
// - PATCH /users/:id: 사용자 정보 수정 (인증 필수)
// - DELETE /users/:id: 사용자 삭제 (인증 필수)
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: { id: number; email: string }) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 본인 정보 수정 (ID 입력 불필요) - :id 라우트보다 먼저 정의해야 함
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { id: number; email: string },
  ) {
    return this.usersService.update(currentUser.id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { id: number; email: string },
  ) {
    if (id !== currentUser.id) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다.');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { id: number; email: string },
  ) {
    if (id !== currentUser.id) {
      throw new ForbiddenException('본인만 삭제할 수 있습니다.');
    }
    return this.usersService.remove(id);
  }
}
