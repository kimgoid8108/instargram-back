import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refreshtokens', { schema: 'instagram' })
export class RefreshToken {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: false, unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashed_token: string;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp', nullable: false })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.refresh_tokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
