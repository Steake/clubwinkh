# Club Win KH Gaming Platform API

Backend server for the Club Win KH gaming platform, providing authentication, game management, transactions, and leaderboard functionality.

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Swagger/OpenAPI Documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Configure your environment variables in `.env`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/clubwinkh |
| JWT_SECRET | Secret key for JWT tokens | - |
| JWT_EXPIRATION | JWT token expiration | 24h |
| BCRYPT_SALT_ROUNDS | Password hashing rounds | 10 |
| RATE_LIMIT_WINDOW_MS | Rate limiting window | 900000 (15 minutes) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| DEFAULT_HOUSE_EDGE | Default house edge percentage | 2.5 |
| MIN_BET_AMOUNT | Minimum bet amount | 1 |
| MAX_BET_AMOUNT | Maximum bet amount | 10000 |
| ADMIN_EMAIL | Default admin email | admin@clubwinkh.com |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:5173,http://localhost:3000 |
| LOG_LEVEL | Logging level | debug |

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload
- `npm test`: Run tests

## API Documentation

API documentation is available at `/api-docs` when the server is running. Visit `http://localhost:3000/api-docs` (or your configured port) to view the Swagger UI documentation.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Transactions
- `GET /api/v1/transactions` - List user transactions
- `POST /api/v1/transactions` - Create new transaction

### Games
- `GET /api/v1/games` - List available games
- `POST /api/v1/games/play` - Play a game

### Leaderboard
- `GET /api/v1/leaderboard` - Get leaderboard entries

## Project Structure

```
server/
├── src/
│   ├── index.js          # Application entry point
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   └── routes/          # API routes
├── .env.example         # Example environment variables
├── package.json         # Project dependencies
└── README.md           # This file
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "message": "Error message here",
    "stack": "Stack trace (development only)"
  }
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Environment variable configuration
- Input validation and sanitization

## Development

The server includes the following development features:
- Hot reloading with nodemon
- Jest testing framework
- Swagger UI for API documentation
- Development-specific error messages
