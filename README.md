# 🚴 Fitness Tracker API

A RESTful API for managing workouts, users, and health data. Built with Node.js, TypeScript, Drizzle ORM, and PostgreSQL.
Deployed on Railway.

## 🌟 Features

User registration, login, and authentication
Logging of workouts (exercise, sets, reps, duration, etc.)
Management of fitness goals and progress
Secure password hashing
Data validation
RESTful endpoints for CRUD operations

### 🚀 Getting Started

1. Clone the repository
   `git clone https://github.com/ChrisForti/fitness-tracker-api.git`
   cd fitness-tracker-api
2. Install dependencies
   `npm install`
3. Configure environment variables
   Copy the .env.example and update as needed:

```sh
cp .env.example .env
Example .env:
```

DATABASE_URL=postgresql://user:password@localhost:5432/fitness
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
Note: If deploying on Railway, configure these as project variables in the Railway dashboard.

4. Run database migrations
   npm run db:migrate
5. Start the API
   npm run dev
   Or for production:

```sh
npm run build
npm start
```

### ⚙️ Technologies Used

Node.js
TypeScript
Drizzle ORM (Postgres)
PostgreSQL
Railway (hosting/database)
bcrypt (password hashing)
jsonwebtoken (auth)
🧑‍💻 Development Scripts
Script What it does
`npm run dev` Runs dev server (nodemon)
`npm run build` Builds TypeScript to JS
`npm run start` Runs app in production
`npm run db:migrate` Runs pending migrations
