import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Refresh Token은 문자열이어야 합니다.' })
  @MinLength(1, { message: 'Refresh Token을 입력해주세요.' })
  refreshToken: string;
}
