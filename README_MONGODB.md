# MongoDB Integration Setup

This project is now connected to MongoDB Atlas for user authentication.

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure MongoDB Connection

Edit `server/.env` file and replace `YOUR_PASSWORD_HERE` with your actual MongoDB password:

```
MONGODB_URI=mongodb+srv://abhishekjohnj411_db_user:YOUR_ACTUAL_PASSWORD@cluster4.usw81tp.mongodb.net/portfolio_builder?retryWrites=true&w=majority
PORT=5000
```

### 3. Start the Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The React app will run on `http://localhost:5173`

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  
- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`

- **GET** `/api/users/:id` - Get user by ID

- **GET** `/api/health` - Health check

## Features

- ✅ User registration with password hashing (bcrypt)
- ✅ User login with credential validation
- ✅ MongoDB Atlas integration
- ✅ Duplicate email prevention
- ✅ Password validation (minimum 6 characters)
- ✅ Error handling and validation
- ✅ CORS enabled for frontend communication

## Database Structure

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  createdAt: Date (default: now)
}
```

## Security Notes

- Passwords are hashed using bcrypt before storing
- Never commit `.env` file to version control
- Keep your MongoDB credentials secure
- Use environment variables for sensitive data

## Troubleshooting

1. **MongoDB Connection Error**: Verify your password in `.env` file
2. **CORS Error**: Make sure backend server is running on port 5000
3. **Port Already in Use**: Change PORT in `.env` file

## Next Steps

- Add JWT authentication for session management
- Implement password reset functionality
- Add user profile update endpoints
- Add email verification
