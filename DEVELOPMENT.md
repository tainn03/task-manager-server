# Development Setup Guide

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone and setup:**

   ```bash
   git clone <repository-url>
   cd task-manager-backend
   cp .env.example .env
   ```

2. **Start with Docker:**

   ```bash
   npm run docker:up
   ```

3. **View Swagger API Documentation:**
   Open `http://localhost:4000/api-docs`

### Option 2: Local Development

1. **Prerequisites:**

   - Node.js 18+
   - MySQL 8.0
   - Redis 7

2. **Setup:**

   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

3. **Start services:**
   ```bash
   # Start MySQL and Redis locally
   npm run dev
   ```

## Available Commands

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Run database seeder

### Docker

- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services
- `npm run docker:dev` - Start development environment
- `npm run docker:logs` - View logs
- `npm run docker:clean` - Clean up volumes

## API Testing

1. **Register a user:**

   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Login:**

   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Create a task:**
   ```bash
   curl -X POST http://localhost:4000/api/tasks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"title":"My Task","description":"Task description","priority":"medium"}'
   ```

## Troubleshooting

- **Port 4000 in use**: Change PORT in .env file
- **Database connection failed**: Check MySQL credentials and ensure service is running
- **Redis connection failed**: Ensure Redis is running on specified port
- **JWT errors**: Verify JWT_SECRET is set in .env

## Development Tips

- Use the Swagger UI for interactive API testing
- Check logs with `npm run docker:logs` when using Docker
- The development environment uses separate database instances to avoid conflicts
