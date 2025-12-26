import { Controller, Post, Get, Delete, Body, Param, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: { id: number; email: string },
  ) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: number; email: string }) {
    return this.postsService.findAllByUserId(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; email: string },
  ) {
    await this.postsService.remove(user.id, id);
    return { success: true };
  }
}
