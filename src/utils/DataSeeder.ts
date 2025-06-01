import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import bcrypt from "bcryptjs";

export class DataSeeder {
  private static readonly SAMPLE_USERS = [
    { email: "john.doe@example.com", password: "password123" },
    { email: "jane.smith@example.com", password: "password123" },
    { email: "demo@example.com", password: "demo123" },
  ];

  private static readonly SAMPLE_TASKS = [
    {
      title: "Complete project proposal",
      description: "Write and submit the Q2 project proposal to management",
      category: "work" as const,
      priority: "high" as const,
      tags: ["urgent", "management", "proposal"],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: "Buy groceries",
      description: "Milk, bread, eggs, and fruits for the week",
      category: "personal" as const,
      priority: "medium" as const,
      tags: ["shopping", "weekly"],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
    {
      title: "Book doctor appointment",
      description: "Annual health checkup with Dr. Johnson",
      category: "health" as const,
      priority: "medium" as const,
      tags: ["health", "checkup"],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
    {
      title: "Learn TypeScript fundamentals",
      description: "Complete the TypeScript course on advanced types",
      category: "education" as const,
      priority: "low" as const,
      tags: ["learning", "programming", "typescript"],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    },
    {
      title: "Plan weekend trip",
      description: "Research and book accommodation for mountain hiking trip",
      category: "personal" as const,
      priority: "low" as const,
      tags: ["vacation", "hiking", "planning"],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
    {
      title: "Fix kitchen faucet",
      description: "Replace the dripping kitchen faucet",
      category: "other" as const,
      priority: "medium" as const,
      tags: ["home", "repair"],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  ];

  static async seedDatabase(): Promise<void> {
    console.log("🌱 Starting database seeding...");

    try {
      // Initialize database connection if not already connected
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const userRepository = AppDataSource.getRepository(User);
      const taskRepository = AppDataSource.getRepository(Task);

      // Clear existing data
      await taskRepository.delete({});
      await userRepository.delete({});

      console.log("📝 Creating sample users...");

      // Create users
      const users = [];
      for (const userData of this.SAMPLE_USERS) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          email: userData.email,
          password: hashedPassword,
        });
        users.push(await userRepository.save(user));
      }

      console.log("📋 Creating sample tasks...");

      // Create tasks for each user
      for (const user of users) {
        for (const taskData of this.SAMPLE_TASKS) {
          const task = taskRepository.create({
            ...taskData,
            user,
            completed: Math.random() > 0.7, // 30% chance of being completed
            isArchived: Math.random() > 0.9, // 10% chance of being archived
          });
          await taskRepository.save(task);
        }

        // Create some completed tasks with historical dates for analytics
        for (let i = 0; i < 5; i++) {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));

          const historicalTask = taskRepository.create({
            title: `Historical task ${i + 1}`,
            description: `This is a historical task for analytics testing`,
            category: ["work", "personal", "health"][
              Math.floor(Math.random() * 3)
            ] as any,
            priority: ["low", "medium", "high"][
              Math.floor(Math.random() * 3)
            ] as any,
            tags: ["historical", "test"],
            completed: true,
            isArchived: false,
            user,
            createdAt: pastDate,
            updatedAt: pastDate,
          });
          await taskRepository.save(historicalTask);
        }
      }

      console.log("✅ Database seeding completed successfully!");
      console.log(`👥 Created ${users.length} users`);
      console.log(`📋 Created tasks for each user`);
      console.log("\n📧 Sample user credentials:");
      this.SAMPLE_USERS.forEach((user, index) => {
        console.log(
          `   ${index + 1}. Email: ${user.email}, Password: ${user.password}`
        );
      });
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }

  static async runSeeder(): Promise<void> {
    try {
      await this.seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    }
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  DataSeeder.runSeeder();
}
