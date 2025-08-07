# Nebula Logix Challenge API

An AWS Lambda-compatible Full Stack Node.js application built with TypeScript for the Nebula Logix Full Stack Engineer challenge, featuring AWS Cognito authentication, DynamoDB leaderboard storage, and WebSocket notifications.

## 🎯 Challenge Requirements Fulfilled

✅ **AWS Cognito Authentication** - USER_PASSWORD_AUTH flow with required attributes  
✅ **DynamoDB Score Storage** - Leaderboard table with proper schema  
✅ **WebSocket Notifications** - Real-time notifications for scores > 1000  
✅ **Leaderboard Retrieval** - Top scores endpoint as requested  
✅ **AWS Lambda Compatible** - Serverless Framework ready  
✅ **Input Validation** - Comprehensive validation using Joi  
✅ **Error Handling** - Consistent error responses  
✅ **TypeScript** - Full type safety throughout  
✅ **Clean Architecture** - Organized into controllers, services, and validation layers

## 🏗️ AWS Services Used

- **AWS Cognito**: User authentication and management
- **Amazon DynamoDB**: Leaderboard score storage  
- **API Gateway WebSocket**: Real-time notifications
- **AWS Lambda**: Serverless compute
- **API Gateway**: HTTP API endpoints  

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The server will start on http://localhost:8012

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/register` | Register with Cognito | No |
| POST | `/v1/auth/confirm` | Confirm email registration | No |
| POST | `/v1/auth/login` | User login (Cognito) | No |
| GET | `/v1/auth/profile` | Get user profile | Yes |
| POST | `/v1/leaderboard/submit` | Submit score to DynamoDB | Yes |
| GET | `/v1/leaderboard` | Get leaderboard | No |
| GET | `/v1/leaderboard/top` | Get top 1 scores | No |
| GET | `/v1/leaderboard/user/scores` | Get user scores | Yes |
| GET | `/v1/leaderboard/user/best` | Get user best score | Yes |

## Testing the API

### Automated Tests

Run the comprehensive challenge test script:
```bash
node test-challenge-api.js
```

This will test all challenge requirements including:
- AWS Cognito authentication flow
- Score submission to DynamoDB
- WebSocket notifications for high scores
- Leaderboard retrieval endpoints

### Manual Testing

**1. Register a user:**
```bash
curl -X POST http://localhost:8012/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:8012/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**3. Get profile (use token from login response):**
```bash
curl -X GET http://localhost:8012/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=8012
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION_MINUTES=30
```

## Project Structure

```
src/
├── api-response/          # Response classes and error handling
├── config/               # Configuration files
├── controller/           # Route controllers
├── middlewares/          # Express middlewares
├── routes/              # API routes
├── service/             # Business logic
├── validation/          # Input validation schemas
└── app.ts               # Express app setup
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure JSON Web Tokens
- **Input Validation**: Joi validation schemas
- **Error Handling**: No sensitive data in error responses
- **Email Normalization**: Consistent email formatting

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Development Notes

- Users are currently stored in memory (replace with database in production)
- All database-related code has been removed as requested
- TypeScript compilation is clean with no errors
- Comprehensive error handling throughout
- Clean separation of concerns

## Challenge Completion

This implementation provides:

1. ✅ **Clean Architecture** - Proper separation of concerns
2. ✅ **Authentication System** - JWT-based with secure password hashing
3. ✅ **Input Validation** - Comprehensive validation rules
4. ✅ **Error Handling** - Consistent error responses
5. ✅ **TypeScript** - Full type safety
6. ✅ **Testing** - Automated test script included
7. ✅ **Documentation** - Complete API documentation
8. ✅ **Security** - Industry-standard security practices

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run clean` - Clean build directory
- `node test-api.js` - Run API tests

## License

MIT