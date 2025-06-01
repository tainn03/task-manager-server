# 🚀 Advanced Task Manager Backend

A robust, feature-rich task management backend built with TypeScript, Express, and TypeORM following SOLID, KISS, and DRY principles.

## ✨ Features

### 🏗️ Architecture & Design Patterns

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Dependency Injection**: Clean service layer with dependency injection container
- **Repository Pattern**: Database abstraction layer for clean data access
- **Middleware Architecture**: Modular middleware for authentication, validation, logging, and error handling

### 📋 Task Management

- **CRUD Operations**: Create, read, update, delete tasks
- **Rich Task Properties**: Title, description, priority (low/medium/high), category, tags, due dates
- **Task Categories**: Work, Personal, Shopping, Health, Education, Other
- **Task States**: Active, completed, archived
- **Bulk Operations**: Update multiple tasks at once
- **Advanced Filtering**: Filter by status, category, priority, tags, archive status
- **Sorting & Pagination**: Sort by multiple criteria with pagination support

### 📊 Analytics & Insights

- **Task Statistics**: Completion rates, category breakdowns, priority analysis
- **Productivity Analytics**: Track completion trends over time
- **Insights Dashboard**: Get personalized productivity recommendations
- **Time Tracking**: Average completion times by priority level
- **Streak Tracking**: Monitor consecutive productive days

### 🔔 Smart Features

- **Reminder System**: Automatic reminders for upcoming due dates
- **Overdue Task Detection**: Identify and track overdue tasks
- **Productivity Insights**: AI-like recommendations for improved productivity
- **Category Analytics**: Understand your most/least productive areas

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: Middleware-based route protection
- **User Management**: Registration, login, logout functionality

### 🛠️ Technical Features

- **TypeScript**: Full type safety and IntelliSense support
- **Express.js**: Fast, unopinionated web framework
- **TypeORM**: Object-relational mapping with MySQL support
- **Redis**: Caching layer for improved performance
- **Comprehensive Logging**: Structured logging with different levels
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Input Validation**: Request validation middleware
- **CORS Support**: Cross-origin resource sharing enabled

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Redis server
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.development .env
   # Edit .env with your database and Redis configuration
   ```

4. **Database Setup**

   - Create a MySQL database
   - Update database credentials in `.env`

5. **Start Redis server**

   ```bash
   redis-server
   ```

6. **Run database migrations** (TypeORM will auto-create tables)

   ```bash
   npm run dev
   ```

7. **Seed sample data** (optional)
   ```bash
   npm run seed
   ```

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:4000` (or your configured port).

## 🐳 Docker Setup

This project includes a comprehensive Docker setup with all services containerized for easy development and deployment.

### Services Included

- **Application**: Node.js/TypeScript backend
- **MySQL 8.0**: Primary database
- **Redis 7**: Caching and session storage
- **Development Services**: Separate MySQL and Redis instances for local development

### Quick Start with Docker

1. **Build and start all services:**

   ```bash
   npm run docker:up
   ```

2. **View logs:**

   ```bash
   npm run docker:logs
   ```

3. **Stop all services:**
   ```bash
   npm run docker:down
   ```

### Development Environment

For local development with separate database instances:

```bash
# Start development services (MySQL on port 3307, Redis on port 6380)
npm run docker:dev

# Stop development services
npm run docker:dev:down
```

### Docker Commands Reference

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run docker:build` | Build Docker images                 |
| `npm run docker:up`    | Start all services in detached mode |
| `npm run docker:down`  | Stop all services                   |
| `npm run docker:logs`  | View real-time logs                 |
| `npm run docker:dev`   | Start development services          |
| `npm run docker:clean` | Stop services and remove volumes    |

### Service Endpoints

| Service        | Production                       | Development                      |
| -------------- | -------------------------------- | -------------------------------- |
| **API**        | `http://localhost:4000`          | `http://localhost:4000`          |
| **Swagger UI** | `http://localhost:4000/api-docs` | `http://localhost:4000/api-docs` |
| **MySQL**      | `localhost:3306`                 | `localhost:3307`                 |
| **Redis**      | `localhost:6379`                 | `localhost:6380`                 |

### Environment Variables

The Docker setup uses the following environment variables:

#### Production (.env)

```bash
NODE_ENV=production
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DB=task_manager
REDIS_URL=redis://redis:6379
JWT_SECRET=production-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

#### Development (.env.local)

```bash
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DB=task_manager_dev
REDIS_URL=redis://localhost:6380
```

### Docker Compose Profiles

- **Default**: Runs application, MySQL, and Redis
- **dev**: Adds development-specific MySQL and Redis instances

### Health Checks

All services include health checks:

- **Application**: HTTP health endpoint (`/health`)
- **MySQL**: `mysqladmin ping`
- **Redis**: `redis-cli ping`

### Volumes & Persistence

- **mysql_data**: Production MySQL data
- **redis_data**: Production Redis data
- **mysql_dev_data**: Development MySQL data
- **redis_dev_data**: Development Redis data
- **./logs**: Application logs (mounted from host)

### Troubleshooting

1. **Port conflicts**: Ensure ports 3306, 3307, 6379, 6380, and 4000 are available
2. **Permission issues**: The app runs as non-root user `nextjs:nodejs`
3. **Database connection**: Wait for health checks to pass before connecting
4. **Logs**: Use `npm run docker:logs` to debug issues

## 📚 API Documentation

### Swagger UI

The API documentation is available via Swagger UI at:

- **Local**: `http://localhost:4000/api-docs`
- **Production**: `https://api.taskmanager.com/api-docs`

### Key Features

- **Interactive API Testing**: Test endpoints directly from the documentation
- **Authentication**: Built-in JWT authentication support
- **Request/Response Examples**: Comprehensive examples for all endpoints
- **Schema Validation**: Complete request/response schema documentation

### Authentication

All API endpoints (except registration and login) require JWT authentication:

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` - Returns JWT token
3. **Add Bearer Token**: Use the "Authorize" button in Swagger UI
4. **Access Protected Endpoints**: All task management endpoints

### Main Endpoints

- **Authentication**: `/api/auth/*`
- **Task Management**: `/api/tasks/*`
- **Health Check**: `/health`

---

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using TypeScript, Express, and modern development practices.**
