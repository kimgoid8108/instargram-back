import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/auth.entity';

@Entity('users', { schema: 'instagram' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashed_password: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_image_url: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens: RefreshToken[];
}
