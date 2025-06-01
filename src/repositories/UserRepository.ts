import { Repository } from "typeorm";
import { User } from "../entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";
import { AppDataSource } from "../data-source";

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }
}
