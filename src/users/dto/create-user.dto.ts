import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  hashed_password: string;

  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '닉네임은 최대 50자 이하여야 합니다.' })
  nickname: string;

  @IsOptional()
  @IsString({ message: '프로필 이미지 URL은 문자열이어야 합니다.' })
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  profile_image_url?: string;
}
