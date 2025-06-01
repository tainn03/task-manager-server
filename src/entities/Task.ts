import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({
    type: "enum",
    enum: ["low", "medium", "high"],
    default: "medium",
  })
  priority!: "low" | "medium" | "high";

  @Column({ type: "datetime", nullable: true })
  dueDate?: Date;

  @Column({
    type: "enum",
    enum: ["work", "personal", "shopping", "health", "education", "other"],
    default: "other",
  })
  category!:
    | "work"
    | "personal"
    | "shopping"
    | "health"
    | "education"
    | "other";

  @Column({ type: "json", nullable: true })
  tags?: string[];

  @Column({ default: false })
  isArchived!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user!: User;
}
