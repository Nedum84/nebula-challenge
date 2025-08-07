# Nebula Logix Authentication API

A robust authentication API built with Node.js, TypeScript, and Express.js for the Nebula Logix Full Stack Engineer challenge.

## Features

✅ **User Registration** - Secure user account creation  
✅ **User Authentication** - JWT-based login system  
✅ **Password Security** - bcrypt hashing with salt rounds  
✅ **Input Validation** - Comprehensive validation using Joi  
✅ **Error Handling** - Consistent error responses  
✅ **TypeScript** - Full type safety throughout  
✅ **Clean Architecture** - Organized into controllers, services, and validation layers  

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
| POST | `/v1/auth/register` | Register new user | No |
| POST | `/v1/auth/login` | User login | No |
| GET | `/v1/auth/profile` | Get user profile | Yes |
| GET | `/v1/auth/me` | Get user profile (alias) | Yes |

## Testing the API

### Automated Tests

Run the included test script:
```bash
node test-api.js
```

This will test all endpoints automatically and show you the results.

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