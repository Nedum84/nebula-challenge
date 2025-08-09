# Nebula Logix Challenge API

A complete AWS Lambda-compatible Node.js application built for the Nebula Logix Full Stack Engineer challenge, featuring AWS Cognito authentication, DynamoDB leaderboard storage, and WebSocket notifications.

## 🎯 Challenge Requirements Fulfilled

✅ **AWS Cognito Authentication**

- AUTH Flow: `USER_PASSWORD_AUTH`
- Required Attributes: `email`, `preferred_username`, `name`
- App Client ID: `54p32d5n5j5m2t0gt45e9og8vo`
- App Secret: `dnel7s515mgqk74rurtt1rhqsb0p21kgmu1nf1jdlcfvo04lvde`

✅ **DynamoDB Score Storage**

- Table: `leaderboard`
- ARN: `arn:aws:dynamodb:eu-north-1:893130088846:table/leaderboard`
- Columns: `id`, `user_id`, `user_name`, `score`, `timestamp`

✅ **WebSocket Notifications**

- Triggered for scores > 1000
- URL: `wss://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/`
- Connection URL: `https://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/@connections`

✅ **Leaderboard Retrieval**

- Top 1 scores endpoint as requested
- Full leaderboard with pagination support

✅ **AWS Lambda Compatible**

- Serverless Framework configuration
- Existing robust Lambda handler with routing (`src/aws/lambda-handler.ts`)
- Supports API Gateway, Function URLs, and various AWS event sources

---

## 🚀 Base URL

```
Local Development: http://localhost:5500
AWS Lambda: (deployed endpoint)
```

## 🔐 Authentication

The API uses AWS Cognito access tokens for authentication:

```
Authorization: Bearer <cognito_access_token>
```

---

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

The server will start on http://localhost:5500

### Development Mode

For development with auto-reload:

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication Endpoints

#### 1. User Registration

Register a new user with AWS Cognito.

**Endpoint:** `POST /v1/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "preferred_username": "johndoe123",
  "password": "SecurePass123!"
}
```

**Validation Rules:**

- `name`: Required, 2-100 characters
- `email`: Required, valid email format, lowercase
- `preferred_username`: Required, 3-50 characters, alphanumeric only
- `password`: Required, 8-128 characters, must contain uppercase, lowercase, number, and special character

**Success Response (201):**

```json
{
  "status": 201,
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "message": "Registration successful. Please check your email for verification code.",
    "user_id": "12345678-1234-1234-1234-123456789012"
  }
}
```

#### 2. Email Confirmation

Confirm user registration with the code sent via email.

**Endpoint:** `POST /v1/auth/confirm`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "confirmationCode": "123456"
}
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Email confirmation successful",
  "data": {
    "message": "Email confirmation successful"
  }
}
```

#### 3. User Login

Authenticate with AWS Cognito using USER_PASSWORD_AUTH flow.

**Endpoint:** `POST /v1/auth/login`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "12345678-1234-1234-1234-123456789012",
      "email": "john.doe@example.com",
      "preferred_username": "johndoe123",
      "name": "John Doe",
      "email_verified": true
    },
    "accessToken": "eyJraWQiOiJ...",
    "idToken": "eyJraWQiOiJ...",
    "refreshToken": "eyJjdHki..."
  }
}
```

#### 4. Get User Profile

Get the current user's profile information.

**Endpoint:** `GET /v1/auth/profile` or `GET /v1/auth/me`

**Headers:**

```
Authorization: Bearer <cognito_access_token>
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user_id": "12345678-1234-1234-1234-123456789012",
    "email": "john.doe@example.com",
    "preferred_username": "johndoe123",
    "name": "John Doe",
    "email_verified": true
  }
}
```

---

### Leaderboard Endpoints

#### 5. Submit Score

Submit a user's score to the DynamoDB leaderboard table.

**Endpoint:** `POST /v1/leaderboard/submit`

**Headers:**

```
Authorization: Bearer <cognito_access_token>
```

**Request Body:**

```json
{
  "score": 1250
}
```

**Validation Rules:**

- `score`: Required, integer, 0-999999

**Success Response (201):**

```json
{
  "status": 201,
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "id": "uuid-generated-id",
    "user_id": "12345678-1234-1234-1234-123456789012",
    "user_name": "John Doe",
    "score": 1250,
    "timestamp": 1703123456789
  }
}
```

**WebSocket Notification:**
If score > 1000, a WebSocket notification is sent:

```json
{
  "type": "HIGH_SCORE_ACHIEVEMENT",
  "data": {
    "user_id": "12345678-1234-1234-1234-123456789012",
    "user_name": "John Doe",
    "score": 1250,
    "timestamp": 1703123456789,
    "message": "🎉 John Doe achieved a high score of 1250!"
  }
}
```

#### 6. Get Leaderboard

Get the top scores from the leaderboard.

**Endpoint:** `GET /v1/leaderboard?limit=10`

**Query Parameters:**

- `limit`: Optional, integer, 1-100, default 10

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "user_id": "12345678-1234-1234-1234-123456789012",
      "user_name": "John Doe",
      "score": 1250,
      "timestamp": 1703123456789
    },
    {
      "id": "uuid-2",
      "user_id": "87654321-4321-4321-4321-210987654321",
      "user_name": "Jane Smith",
      "score": 1100,
      "timestamp": 1703123456788
    }
  ]
}
```

#### 7. Get Top Score

Get the current top 1 scores from the leaderboard.

**Endpoint:** `GET /v1/leaderboard/top`

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "Top score retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "user_id": "12345678-1234-1234-1234-123456789012",
      "user_name": "John Doe",
      "score": 1250,
      "timestamp": 1703123456789
    }
  ]
}
```

#### 8. Get User's Scores

Get all scores for the authenticated user.

**Endpoint:** `GET /v1/leaderboard/user/scores`

**Headers:**

```
Authorization: Bearer <cognito_access_token>
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "User scores retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "user_id": "12345678-1234-1234-1234-123456789012",
      "user_name": "John Doe",
      "score": 1250,
      "timestamp": 1703123456789
    },
    {
      "id": "uuid-2",
      "user_id": "12345678-1234-1234-1234-123456789012",
      "user_name": "John Doe",
      "score": 750,
      "timestamp": 1703123456788
    }
  ]
}
```

#### 9. Get User's Best Score

Get the highest score for the authenticated user.

**Endpoint:** `GET /v1/leaderboard/user/best`

**Headers:**

```
Authorization: Bearer <cognito_access_token>
```

**Success Response (200):**

```json
{
  "status": 200,
  "success": true,
  "message": "User best score retrieved successfully",
  "data": {
    "id": "uuid-1",
    "user_id": "12345678-1234-1234-1234-123456789012",
    "user_name": "John Doe",
    "score": 1250,
    "timestamp": 1703123456789
  }
}
```

---

## 🧪 Testing

### Automated Tests

Run the comprehensive test script:

```bash
node test-challenge-api.js
```

### Manual Testing Examples

**1. Register a user:**

```bash
curl -X POST http://localhost:5500/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "preferred_username": "johndoe123",
    "password": "SecurePass123!"
  }'
```

**2. Confirm registration:**

```bash
curl -X POST http://localhost:5500/v1/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "confirmationCode": "123456"
  }'
```

**3. Login:**

```bash
curl -X POST http://localhost:5500/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**4. Submit a high score:**

```bash
curl -X POST http://localhost:5500/v1/leaderboard/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "score": 1250
  }'
```

**5. Get top scores:**

```bash
curl -X GET http://localhost:5500/v1/leaderboard/top
```

## 🔧 AWS Configuration

### Environment Variables

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA474VTUGHK62Y2HHT
AWS_SECRET_ACCESS_KEY=XCLmzk1X6TlvNkyRwI9CFq6ZmiEFdzixkX/wwVUI

# AWS Cognito
COGNITO_USER_POOL_ID=eu-north-1_example
COGNITO_CLIENT_ID=54p32d5n5j5m2t0gt45e9og8vo
COGNITO_CLIENT_SECRET=dnel7s515mgqk74rurtt1rhqsb0p21kgmu1nf1jdlcfvo04lvde

# DynamoDB
DYNAMODB_LEADERBOARD_TABLE=leaderboard
DYNAMODB_LEADERBOARD_ARN=arn:aws:dynamodb:eu-north-1:893130088846:table/leaderboard

# WebSocket
WEBSOCKET_URL=wss://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/
WEBSOCKET_CONNECTION_URL=https://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/@connections
```

### DynamoDB Table Structure

```json
{
  "TableName": "leaderboard",
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}
```

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:SignUp",
        "cognito-idp:ConfirmSignUp",
        "cognito-idp:InitiateAuth",
        "cognito-idp:GetUser"
      ],
      "Resource": "arn:aws:cognito-idp:eu-north-1:893130088846:userpool/*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:eu-north-1:893130088846:table/leaderboard"
    },
    {
      "Effect": "Allow",
      "Action": ["execute-api:ManageConnections"],
      "Resource": "arn:aws:execute-api:eu-north-1:893130088846:gdjtdhxwkf/production/@connections/*"
    }
  ]
}
```

---

## 🏗️ Architecture

### Project Structure

```
src/
├── controller/           # Route controllers
│   ├── auth.controller.ts
│   └── leaderboard.controller.ts
├── service/             # Business logic
│   ├── auth.service.ts
│   ├── leaderboard.service.ts
│   └── websocket.service.ts
├── validation/          # Input validation schemas
│   ├── auth.validation.ts
│   └── leaderboard.validation.ts
├── routes/              # API routes
│   ├── auth.route.ts
│   └── leaderboard.route.ts
├── middlewares/         # Express middlewares
├── api-response/        # Response classes and error handling
├── config/             # Configuration files
├── aws/                # AWS Lambda handlers
│   └── lambda-handler.ts # Robust Lambda handler with routing
├── aws-events/         # AWS event handlers
└── app.ts              # Express app setup
```

### AWS Services Used

- **AWS Cognito**: User authentication and management
- **Amazon DynamoDB**: Leaderboard score storage
- **API Gateway WebSocket**: Real-time notifications
- **AWS Lambda**: Serverless compute
- **API Gateway**: HTTP API endpoints

---

## 🚀 Deployment

### Local Development

```bash
npm install
npm run build
npm start
```

### AWS Lambda Deployment

```bash
# Install Serverless Framework
npm install -g serverless

# Deploy to AWS
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

---

## 📋 Error Responses

### Common HTTP Status Codes

- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "status": 400,
  "success": false,
  "message": "Validation Error",
  "errorCode": "REQUEST_VALIDATION_ERROR",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character"
    }
  ]
}
```

---

## 🎯 Challenge Verification

This implementation fully satisfies all challenge requirements:

1. ✅ **AWS Cognito Authentication** with `USER_PASSWORD_AUTH` flow
2. ✅ **Required attributes**: `email`, `preferred_username`, `name`
3. ✅ **Correct Cognito configuration**: Client ID and Secret as specified
4. ✅ **DynamoDB leaderboard table** with exact schema specified
5. ✅ **WebSocket notifications** for scores > 1000
6. ✅ **Top 1 scores endpoint** as requested
7. ✅ **AWS Lambda compatibility** with proper handlers
8. ✅ **Mock AWS credentials** integrated as specified

The application is production-ready and follows AWS best practices for serverless applications.
