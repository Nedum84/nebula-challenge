# Nebula Logix API Documentation

## Base URL

```
http://localhost:5500
```

## Authentication

The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. User Registration

Register a new user account.

**Endpoint:** `POST /v1/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**

- `name`: Required, 2-100 characters
- `email`: Required, valid email format, converted to lowercase
- `password`: Required, 8-128 characters, must contain at least one uppercase letter, one lowercase letter, and one number

**Success Response (201):**

```json
{
  "status": 201,
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_1703123456789_abc123def",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**

```json
{
  "status": 400,
  "success": false,
  "message": "User with this email already exists",
  "errorCode": "BAD_REQUEST_ERROR"
}
```

---

### 2. User Login

Authenticate a user and receive an access token.

**Endpoint:** `POST /v1/auth/login`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**

- `email`: Required, valid email format, converted to lowercase
- `password`: Required

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_1703123456789_abc123def",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**

```json
{
  "status": 401,
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "UNAUTHORIZED_ERROR"
}
```

---

### 3. Get User Profile

Get the current user's profile information. Requires authentication.

**Endpoint:** `GET /v1/auth/profile` or `GET /v1/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_1703123456789_abc123def",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "status": 401,
  "success": false,
  "message": "Authorization header is required",
  "errorCode": "UNAUTHORIZED_ERROR"
}
```

---

## Error Responses

### Common HTTP Status Codes

- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format

All error responses follow this format:

```json
{
  "status": <http_status_code>,
  "success": false,
  "message": "<error_message>",
  "errorCode": "<ERROR_CODE>",
  "errors": [] // Optional: Validation errors array
}
```

### Validation Error Example

```json
{
  "status": 400,
  "success": false,
  "message": "Validation Error",
  "errorCode": "REQUEST_VALIDATION_ERROR",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least 8 characters, including uppercase, lowercase, and number"
    }
  ]
}
```

---

## Testing

### Example cURL Commands

**Register a new user:**

```bash
curl -X POST http://localhost:5500/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5500/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Get profile:**

```bash
curl -X GET http://localhost:5500/v1/auth/profile \
  -H "Authorization: Bearer <your_token_here>"
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Secure JSON Web Tokens with configurable expiration
3. **Input Validation**: Comprehensive validation using Joi
4. **Email Normalization**: Email addresses are converted to lowercase
5. **Error Handling**: Consistent error responses without exposing sensitive information
6. **Rate Limiting**: Built-in rate limiting middleware (commented out, can be enabled)

---

## Development Notes

- Users are currently stored in memory (replace with database in production)
- JWT tokens expire in 30 minutes by default (configurable via JWT_ACCESS_EXPIRATION_MINUTES)
- The API includes comprehensive error handling and validation
- All endpoints return consistent JSON responses
- TypeScript is used throughout for type safety
