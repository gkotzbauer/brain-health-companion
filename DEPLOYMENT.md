# Deploying to Render.com

## Prerequisites
- Render.com account
- PostgreSQL database (Render provides this)
- Git repository with your code

## Step 1: Database Setup
1. Create a new PostgreSQL service in Render
2. Note down the connection string
3. Run the `schema.sql` file in your database

## Step 2: Environment Variables
In your Render service, set these environment variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=10000
```

## Step 3: Deploy
1. Connect your Git repository to Render
2. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Health Check Path**: `/api/users`

## Step 4: Verify
- Check that your API endpoints work: `/api/users`
- Verify the React app loads correctly
- Test user creation and chat functionality

## Troubleshooting
- If build fails, check Node.js version (use 18+)
- If database connection fails, verify DATABASE_URL format
- If static files don't serve, ensure build completed successfully
