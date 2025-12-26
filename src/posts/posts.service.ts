import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      user_id: userId,
    });

    return this.postsRepository.save(post);
  }

  async findAllByUserId(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(userId: number, postId: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, user_id: userId },
    });

    if (!post) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    await this.postsRepository.remove(post);
  }
}
