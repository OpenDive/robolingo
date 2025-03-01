# Language Learning Marketplace API

A Node.js TypeScript backend API for a language learning marketplace platform where users can buy, sell, and interact with language learning courses and lectures.

## Architecture

The application follows a layered architecture:

```
Models → Repositories → Services → Controllers → Routes → App
```

- **Models**: Data structures and relationships
- **Repositories**: Data access layer with database operations
- **Services**: Business logic layer (to be implemented)
- **Controllers**: Request handling and response formatting (to be implemented)
- **Routes**: API endpoint definitions (to be implemented)

## Core Features

- User authentication and registration
- Course management and discovery
- Lecture delivery and progress tracking
- Quiz assessment with multiple question types
- User enrollment and progress tracking
- Language-specific content organization

## Tech Stack

- **Node.js** with **TypeScript** for type safety
- **Express** for HTTP server and routing
- **PostgreSQL** for relational data storage
- **Sequelize ORM** for database interactions
- **JWT** for authentication
- **Winston** for logging

## Models

The system includes the following key models:

- **User**: Account information and roles (student, instructor, admin)
- **Course**: Language courses with metadata and enrollment details
- **Lecture**: Individual lessons within courses
- **Quiz**: Assessments for courses or lectures
- **Question**: Quiz questions with different question types
- **Enrollment**: Student course enrollments with progress tracking
- **Progress**: Detailed tracking of lecture completion

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd language-marketplace-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Setup the database:
   ```bash
   # Create database in PostgreSQL
   createdb language_marketplace
   ```

5. Build and run the application:
   ```bash
   npm run build
   npm start
   ```

   For development with hot-reload:
   ```bash
   npm run dev
   ```

## Database Design

The database schema follows the entity relationships shown in the models with appropriate foreign key constraints and indexes for performance.

### Key Relationships:

- A User can create multiple Courses (as instructor)
- A User can enroll in multiple Courses (as student)
- A Course consists of multiple Lectures
- A Course or Lecture can have one Quiz
- A Quiz contains multiple Questions
- An Enrollment tracks a User's progress in a Course
- Progress tracks detailed lecture-by-lecture completion

## API Endpoints (Planned)

The API will include endpoints for:

- Authentication and user management
- Course CRUD operations and discovery
- Lecture delivery and management
- Quiz taking and assessment
- Enrollment management
- Progress tracking and reporting

## Development

### Project Structure

```
language-marketplace-api/
├── src/
│   ├── config/         # Configuration files
│   ├── models/         # Data models/entities
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic layer (to be added)
│   ├── controllers/    # API Controllers (to be added)
│   ├── routes/         # API Routes (to be added)
│   ├── middleware/     # Custom middleware (to be added)
│   ├── utils/          # Utility functions
│   └── app.ts          # Express application setup
├── .env                # Environment variables
└── tsconfig.json       # TypeScript configuration
```

### Running Tests (Future)

```bash
npm test
```

## License

[MIT License](LICENSE)