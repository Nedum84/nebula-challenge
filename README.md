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

## 🚀 Base URLs

- **Express Server**: http://localhost:5500
- **Serverless Offline**: http://localhost:3000
- **React Frontend**: http://localhost:4000
- **AWS Lambda**: (deployed endpoint URL)

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
- Docker and Docker Compose

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Start Docker services:**

   ```bash
   npm run dc:up
   ```
   This starts local DynamoDB on port 8000 and DynamoDB Admin on port 8001.

3. **Initialize database:**

   ```bash
   npm run cli s:cli db:init
   ```

4. **Build the project:**

   ```bash
   npm run build
   ```

5. **Start all servers:**
   ```bash
   npm run start:all
   ```

This will concurrently start:
- 🟢 **Express Server**: http://localhost:5500
- 🔵 **Serverless Offline**: http://localhost:3000  
- 🟣 **React Frontend**: http://localhost:4000
- 🔧 **DynamoDB Admin**: http://localhost:8001

### 🔐 Test User Credentials

The application automatically creates test users on startup for easy testing:

**Primary Test User:**
- Email: `test@example.com`
- Password: `TestPass123!`

**Admin Test User:**
- Email: `admin@nebula.com`  
- Password: `AdminPass123!`

Use these credentials to log in immediately without going through the registration process.

### Development Mode

**Alternative: Individual Services**

If you prefer to run services separately:
```bash
npm run dev
```

Serverless Offline (Local AWS Lambda simulation):
```bash
npm run sls:offline
# or
sls offline
```

Frontend Only:
```bash
cd client && npm start
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

**Express Server:**

```bash
npm install
npm run build
npm start
```

**Serverless Offline:**

```bash
npm install
npm run sls:offline
```

### AWS Lambda Deployment

**Using Serverless Framework directly:**

```bash
# Install Serverless Framework globally
npm install -g serverless

# Deploy to development
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod

# Remove deployment
serverless remove --stage dev
```

**Using npm scripts:**

```bash
# Deploy to development
npm run sls:deploy

# Remove deployment
npm run sls:remove

# Start local serverless environment
npm run sls:offline
```

### Available Serverless Commands

**Development & Testing:**

- `npm run sls:offline` - Start serverless offline (localhost:3000)
- `sls offline --stage <stage>` - Start with specific stage

**Deployment:**

- `npm run sls:deploy` - Deploy to dev stage
- `sls deploy --stage <stage>` - Deploy to specific stage
- `sls deploy --stage prod` - Deploy to production

**Management:**

- `npm run sls:remove` - Remove deployment from dev stage
- `sls remove --stage <stage>` - Remove specific deployment
- `sls info --stage <stage>` - Get deployment information
- `sls logs --function api --stage <stage>` - View function logs

**Function Invocation with Commands:**

```bash
# Database Commands
sls invoke --function job -d "db:init" --stage dev         # Initialize database
sls invoke --function job -d "db:migrate" --stage dev      # Run database migrations
sls invoke --function job -d "db:status" --stage dev       # Check database status
sls invoke --function job -d "db:drop" --stage dev         # Drop database tables
sls invoke --function job -d "db:reset" --stage dev        # Reset database
sls invoke --function job -d "db:clear" --stage dev        # Clear all data

# Seeding Commands
sls invoke --function job -d "db:seed:all" --stage dev           # Seed all tables
sls invoke --function job -d "db:seed:leaderboard" --stage dev   # Seed leaderboard
sls invoke --function job -d "db:seed:highscores" --stage dev    # Seed high scores
sls invoke --function job -d "db:seed:user" --stage dev          # Seed user data

# Cognito Management
sls invoke --function job -d "cognito:list" --stage dev          # List Cognito users
sls invoke --function job -d "cognito:clear" --stage dev         # Clear all users
sls invoke --function job -d "cognito:delete" --stage dev        # Delete specific user

# System Commands
sls invoke --function job -d "system:status" --stage dev         # Check system status
sls invoke --function job -d "help" --stage dev                  # Show help
```

**Examples:**

```bash
# Initialize database on production
sls invoke --function job -d "db:init" --stage prod

# Check system status on development
sls invoke --function job -d "system:status" --stage dev

# Seed all data for testing
sls invoke --function job -d "db:seed:all" --stage dev

# Clear development data
sls invoke --function job -d "db:clear" --stage dev
```

---

## 🛠️ CLI Commands

The application includes a comprehensive CLI with various commands for database management, AWS Cognito operations, and development utilities.

### Production-Safe Commands

```bash
npm run cli s:cli db:init         # Initialize database tables
npm run cli s:cli db:status       # Check database status
npm run cli s:cli system:status   # Check system health
npm run cli s:cli help           # Show available commands
```

### Development Commands

⚠️ **Warning**: These commands can modify or delete data. Use with caution in development only.

```bash
# Database Management
npm run cli s:cli db:drop         # Drop all database tables
npm run cli s:cli db:reset        # Reset database (drop + init)
npm run cli s:cli db:clear        # Clear all data from tables
npm run cli s:cli db:seed:all     # Seed all tables with sample data

# Specific Seeding
npm run cli s:cli db:seed:leaderboard    # Seed leaderboard table
npm run cli s:cli db:seed:highscores     # Seed high scores
npm run cli s:cli db:seed:user           # Seed user data

# AWS Cognito Management
npm run cli s:cli cognito:list           # List all users in Cognito
npm run cli s:cli cognito:clear          # Clear all users from Cognito
npm run cli s:cli cognito:delete <email> # Delete specific user

# Mock Commands (Local Development)
# Additional mock commands available for local testing
```

### Usage Examples

```bash
# Check if everything is set up correctly
npm run cli s:cli system:status

# Initialize fresh database
npm run cli s:cli db:init

# Seed with sample data for development
npm run cli s:cli db:seed:all

# Clean up development data
npm run cli s:cli db:clear
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

---

## 🎨 Frontend Application

The project includes a complete React TypeScript frontend application that provides a user interface for the challenge API.

### Frontend Features

✅ **React TypeScript** - Modern React 19 with TypeScript
✅ **Authentication UI** - Registration, login, email confirmation flows  
✅ **Dashboard** - User dashboard with profile information
✅ **Score Submission** - Interactive score submission interface
✅ **Live Leaderboard** - Real-time leaderboard with WebSocket updates
✅ **Responsive Design** - TailwindCSS for mobile-first design
✅ **Toast Notifications** - User-friendly feedback with react-hot-toast

### 📸 Application Screenshots

Here are screenshots of the complete frontend application showcasing all the key features:

> **Note**: To display screenshots properly, you may need to rename the files in the `screenshots/` directory. See `RENAME_SCREENSHOTS.md` for instructions.

**Key Features Demonstrated:**
- 🔐 **Secure Authentication** - Login/Register with validation and email confirmation (123456 for testing)
- 📊 **Interactive Dashboard** - Real-time user statistics and game metrics
- 🏆 **Live Leaderboard** - Dynamic rankings with user highlighting and filtering
- 🎯 **Score Submission** - Intuitive score entry with achievement notifications
- 👤 **User Profile** - Complete account management and score history
- 📱 **Responsive Design** - Mobile-first UI with TailwindCSS styling

#### Authentication Flow
<div align="center">
<img src="screenshots/01-login-page.png" alt="Login Page" width="800"/>
<p><em>Login Page - Clean and modern authentication interface</em></p>
</div>

<div align="center">
<img src="screenshots/02-register-page.png" alt="Register Page" width="800"/>
<p><em>Registration Page - User registration with validation</em></p>
</div>

#### Main Application
<div align="center">
<img src="screenshots/03-dashboard.png" alt="Dashboard" width="800"/>
<p><em>Dashboard - User statistics, best scores, and quick actions</em></p>
</div>

<div align="center">
<img src="screenshots/04-leaderboard.png" alt="Leaderboard" width="800"/>
<p><em>Leaderboard - Real-time rankings with user highlighting</em></p>
</div>

#### Game Features
<div align="center">
<img src="screenshots/05-submit-score.png" alt="Submit Score" width="800"/>
<p><em>Score Submission - Interactive form with achievement notifications</em></p>
</div>

<div align="center">
<img src="screenshots/06-profile.png" alt="User Profile" width="800"/>
<p><em>User Profile - Account information and complete score history</em></p>
</div>

### Frontend Structure
```
client/
├── public/                 # Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── WebSocketContext.tsx
│   ├── pages/              # Page components
│   │   ├── Register.tsx
│   │   ├── Login.tsx
│   │   ├── ConfirmEmail.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SubmitScore.tsx
│   │   ├── Leaderboard.tsx
│   │   └── Profile.tsx
│   ├── services/           # API services
│   │   ├── auth.service.ts
│   │   ├── leaderboard.service.ts
│   │   └── websocket.service.ts
│   ├── types/              # TypeScript definitions
│   │   ├── auth.types.ts
│   │   └── leaderboard.types.ts
│   ├── App.tsx             # Main App component
│   └── index.tsx           # React entry point
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### Quick Start (Frontend)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on http://localhost:4000 and automatically connect to the backend API.

### Frontend Technologies

- **React 19** - Latest React with modern features
- **TypeScript** - Full type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **TailwindCSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library

---

## 🔄 CI/CD Pipeline (GitLab CI)

Complete GitLab CI/CD pipeline for automated testing, building, and deployment.

### Pipeline Configuration

Create `.gitlab-ci.yml` in the project root:

```yaml
stages:
  - install
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  AWS_DEFAULT_REGION: "eu-north-1"

# Cache configuration
cache:
  paths:
    - node_modules/
    - client/node_modules/

# Install dependencies
install:
  stage: install
  image: node:$NODE_VERSION
  script:
    - npm ci
    - cd client && npm ci
  artifacts:
    paths:
      - node_modules/
      - client/node_modules/
    expire_in: 1 hour

# Run backend tests
test:backend:
  stage: test
  image: node:$NODE_VERSION
  dependencies:
    - install
  script:
    - npm run test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

# Run frontend tests
test:frontend:
  stage: test
  image: node:$NODE_VERSION
  dependencies:
    - install
  script:
    - cd client && npm test -- --coverage --watchAll=false
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

# Build backend
build:backend:
  stage: build
  image: node:$NODE_VERSION
  dependencies:
    - install
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# Build frontend
build:frontend:
  stage: build
  image: node:$NODE_VERSION
  dependencies:
    - install
  script:
    - cd client && npm run build
  artifacts:
    paths:
      - client/build/
    expire_in: 1 hour

# Deploy to development
deploy:dev:
  stage: deploy
  image: node:$NODE_VERSION
  dependencies:
    - build:backend
    - build:frontend
  before_script:
    - npm install -g serverless
    - export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_DEV
    - export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_DEV
  script:
    - sls deploy --stage dev
  environment:
    name: development
    url: $DEV_API_URL
  only:
    - develop
    - merge_requests

# Deploy to production
deploy:prod:
  stage: deploy
  image: node:$NODE_VERSION
  dependencies:
    - build:backend
    - build:frontend
  before_script:
    - npm install -g serverless
    - export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_PROD
    - export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_PROD
  script:
    - sls deploy --stage prod
    # Initialize production database
    - sls invoke --function job -d "db:init" --stage prod
  environment:
    name: production
    url: $PROD_API_URL
  only:
    - main
    - master
  when: manual

# Database migrations
migrate:prod:
  stage: deploy
  image: node:$NODE_VERSION
  before_script:
    - npm install -g serverless
    - export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_PROD
    - export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_PROD
  script:
    - sls invoke --function job -d "db:migrate" --stage prod
  environment:
    name: production
  only:
    - main
    - master
  when: manual
```

### Required GitLab CI/CD Variables

Configure these variables in GitLab Project Settings > CI/CD > Variables:

```bash
# Development Environment
AWS_ACCESS_KEY_ID_DEV=your_dev_access_key
AWS_SECRET_ACCESS_KEY_DEV=your_dev_secret_key
DEV_API_URL=https://your-dev-api-url.com

# Production Environment  
AWS_ACCESS_KEY_ID_PROD=your_prod_access_key
AWS_SECRET_ACCESS_KEY_PROD=your_prod_secret_key
PROD_API_URL=https://your-prod-api-url.com

# AWS Configuration
AWS_REGION=eu-north-1
COGNITO_USER_POOL_ID=eu-north-1_example
COGNITO_CLIENT_ID=54p32d5n5j5m2t0gt45e9og8vo
COGNITO_CLIENT_SECRET=your_cognito_secret

# DynamoDB
DYNAMODB_LEADERBOARD_TABLE=leaderboard
DYNAMODB_LEADERBOARD_ARN=arn:aws:dynamodb:eu-north-1:893130088846:table/leaderboard

# WebSocket
WEBSOCKET_URL=wss://your-websocket-url.com/production/
WEBSOCKET_CONNECTION_URL=https://your-websocket-url.com/production/@connections
```

### Pipeline Features

✅ **Automated Testing** - Both backend and frontend tests
✅ **Code Coverage** - Coverage reports for quality assurance  
✅ **Multi-Stage Builds** - Separate build processes for backend/frontend
✅ **Environment Management** - Separate dev/prod deployments
✅ **Manual Production Deploy** - Controlled production releases
✅ **Database Migrations** - Automated database setup and migrations
✅ **Artifact Caching** - Faster builds with dependency caching

### Deployment Workflow

1. **Feature Branch** → Triggers tests only
2. **Develop Branch** → Deploys to development environment
3. **Main/Master Branch** → Manual deployment to production
4. **Database Changes** → Manual migration trigger available

This ensures a robust CI/CD pipeline with proper testing, building, and deployment automation.
