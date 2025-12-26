import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  image_url: string;

  @IsString()
  @IsOptional()
  content?: string;
}
