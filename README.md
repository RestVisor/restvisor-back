# Restvisor Backend

This is the backend server for the Restvisor application, a restaurant management system built with Node.js, Express, and Supabase.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd restvisor-back
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
```

4. Set up the database by running the following SQL in your Supabase SQL editor:
```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('waiter', 'chef', 'admin'))
);

-- Create necessary indexes
CREATE INDEX users_email_idx ON users(email);
```

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

### Authentication

#### Register a new user
- **POST** `/api/auth/register`
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "waiter"
}
```

#### Login
- **POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Users

#### Get all users
- **GET** `/api/usuarios`
- Requires authentication

#### Get user by ID
- **GET** `/api/usuarios/:id`
- Requires authentication

## Project Structure

```
restvisor-back/
├── src/
│   ├── config/
│   │   └── db.js         # Database configuration
│   ├── controllers/
│   │   └── usuariosController.js  # User-related controllers
│   └── routes/
│       ├── index.js      # Main router
│       └── authRoutes.js # Authentication routes
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── README.md            # This file
└── server.js           # Main application file
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: (Optional) Port number for the server (defaults to 3000)

## Database Schema

### Users Table
| Column   | Type   | Constraints                                    |
|----------|--------|-----------------------------------------------|
| id       | SERIAL | PRIMARY KEY                                   |
| name   | TEXT   | NOT NULL                                      |
| email    | TEXT   | NOT NULL, UNIQUE                              |
| password | TEXT   | NOT NULL                                      |
| role      | TEXT   | NOT NULL, CHECK (role IN ('waiter','chef','admin')) |

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Development

1. Start the development server with auto-reload:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

3. Check for linting errors:
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check if your Supabase credentials are correct in `.env`
   - Verify that the database is accessible
   - Check if the tables exist with correct schema

2. **Authentication Issues**
   - Ensure JWT_SECRET is properly set in `.env`
   - Verify that the token is being sent in the Authorization header

3. **Registration Errors**
   - Verify email format
   - Password must be at least 6 characters
   - Role must be one of: 'waiter', 'chef', 'admin'

## License

This project is licensed under the MIT License. 
