# GigFlow - Freelance Marketplace Platform

GigFlow is a mini-freelance marketplace platform where Clients can post jobs (Gigs) and Freelancers can apply for them (Bids). The platform features secure authentication, real-time notifications, and transactional integrity to prevent race conditions.

## 🚀 Features

### Core Features
- **User Authentication**: Secure sign-up and login with JWT and HttpOnly cookies
- **Gig Management**: Create, browse, and search for gigs
- **Bidding System**: Freelancers can submit bids on open gigs
- **Hiring Logic**: Clients can hire freelancers with atomic transactions
- **Real-time Notifications**: Socket.io integration for instant updates (Bonus 2)
- **Transactional Integrity**: MongoDB transactions prevent race conditions (Bonus 1)

### Technical Highlights
- **Frontend**: React.js with Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HttpOnly cookies
- **Real-time**: Socket.io for live notifications
- **State Management**: Redux Toolkit

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file if needed:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and set HttpOnly cookie
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs?search=<query>` - Fetch all open gigs (with optional search)
- `POST /api/gigs` - Create a new job post (requires authentication)

### Bids
- `POST /api/bids` - Submit a bid for a gig (requires authentication)
- `GET /api/bids/:gigId` - Get all bids for a specific gig (Owner only, requires authentication)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (Atomic update with transaction, requires authentication)

## 🗄️ Database Schema

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `timestamps`: createdAt, updatedAt

### Gig
- `title`: String (required)
- `description`: String (required)
- `budget`: Number (required, min: 0)
- `ownerId`: ObjectId (ref: User, required)
- `status`: String (enum: 'open', 'assigned', default: 'open')
- `timestamps`: createdAt, updatedAt

### Bid
- `gigId`: ObjectId (ref: Gig, required)
- `freelancerId`: ObjectId (ref: User, required)
- `message`: String (required)
- `price`: Number (required, min: 0)
- `status`: String (enum: 'pending', 'hired', 'rejected', default: 'pending')
- `timestamps`: createdAt, updatedAt

## 🎯 How It Works

### User Flow

1. **Registration/Login**: Users can register or login to access the platform
2. **Browse Gigs**: All users can browse open gigs and search by title
3. **Post a Gig**: Logged-in users can post new gigs with title, description, and budget
4. **Submit Bids**: Freelancers can submit bids on open gigs (cannot bid on their own gigs)
5. **Review Bids**: Gig owners can view all bids for their gigs
6. **Hire Freelancer**: Gig owners can hire a freelancer, which:
   - Changes the gig status from 'open' to 'assigned'
   - Marks the chosen bid as 'hired'
   - Marks all other bids for that gig as 'rejected'
   - Sends a real-time notification to the hired freelancer

## 📊 Implementation Flowchart

### System Architecture Flow

```mermaid
graph TD
    A[User Visits Application] --> B{Authenticated?}
    B -->|No| C[Login/Register Page]
    B -->|Yes| D[Dashboard]
    
    C --> E[POST /api/auth/register<br/>or<br/>POST /api/auth/login]
    E --> F[JWT Token in HttpOnly Cookie]
    F --> D
    
    D --> G[Browse Gigs]
    D --> H[Post New Gig]
    
    G --> I[GET /api/gigs?search=query]
    I --> J[Display Open Gigs]
    J --> K[Click on Gig]
    K --> L[Gig Detail Page]
    
    L --> M{Is Owner?}
    M -->|Yes| N[View Bids Button]
    M -->|No| O[Submit Bid Form]
    
    O --> P[POST /api/bids]
    P --> Q{Bid Valid?}
    Q -->|Yes| R[Bid Created]
    Q -->|No| S[Error Message]
    
    H --> T[POST /api/gigs]
    T --> U[Gig Created with status='open']
    
    N --> V[GET /api/bids/:gigId]
    V --> W[Display All Bids]
    W --> X[Click Hire Button]
    
    X --> Y[PATCH /api/bids/:bidId/hire]
    Y --> Z[Start MongoDB Transaction]
    
    Z --> AA{Check Gig Status}
    AA -->|open| AB[Update Gig: status='assigned']
    AA -->|assigned| AC[Abort: Already Assigned]
    
    AB --> AD[Update Bid: status='hired']
    AD --> AE[Update Other Bids: status='rejected']
    AE --> AF[Commit Transaction]
    
    AF --> AG[Socket.io Emit 'hired' Event]
    AG --> AH[Freelancer Receives Real-time Notification]
    
    style Y fill:#e1f5ff
    style Z fill:#fff4e6
    style AF fill:#e8f5e9
    style AG fill:#f3e5f5
```

### Detailed Hiring Process Flow (With Transaction)

```mermaid
sequenceDiagram
    participant C as Client/Owner
    participant FE as Frontend
    participant BE as Backend API
    participant DB as MongoDB
    participant SIO as Socket.io
    participant F as Freelancer
    
    C->>FE: Click "Hire" Button
    FE->>BE: PATCH /api/bids/:bidId/hire
    BE->>BE: Start MongoDB Session & Transaction
    
    BE->>DB: Find Bid (with session)
    DB-->>BE: Bid Document
    
    BE->>DB: Find Gig (with session)
    DB-->>BE: Gig Document
    
    BE->>BE: Validate: Gig status = 'open'?
    BE->>BE: Validate: Bid status = 'pending'?
    BE->>BE: Validate: User is Owner?
    
    alt All Validations Pass
        BE->>DB: Update Gig: status='assigned' (transaction)
        BE->>DB: Update Bid: status='hired' (transaction)
        BE->>DB: Update Other Bids: status='rejected' (transaction)
        BE->>DB: Commit Transaction
        DB-->>BE: Transaction Committed
        
        BE->>SIO: Emit 'hired' to user room
        SIO->>F: Real-time Notification
        
        BE-->>FE: Success Response
        FE-->>C: Show Success Message
    else Validation Fails
        BE->>DB: Abort Transaction
        BE-->>FE: Error Response
        FE-->>C: Show Error Message
    end
```

### Authentication Flow

```mermaid
graph LR
    A[User Request] --> B{Auth Required?}
    B -->|No| C[Public Route]
    B -->|Yes| D[Read HttpOnly Cookie]
    
    D --> E{Token Exists?}
    E -->|No| F[401 Unauthorized]
    E -->|Yes| G[Verify JWT Token]
    
    G --> H{Valid Token?}
    H -->|No| F
    H -->|Yes| I[Extract userId]
    I --> J[Add userId to req]
    J --> K[Protected Route Handler]
    
    style D fill:#e1f5ff
    style G fill:#fff4e6
    style I fill:#e8f5e9
```

### Real-time Notification Flow

```mermaid
graph TD
    A[Backend: Hire Action] --> B[Transaction Committed]
    B --> C[Get Socket.io Instance]
    C --> D[Emit to User Room:<br/>user-{freelancerId}]
    
    E[Frontend: User Logs In] --> F[Socket.io Client Connects]
    F --> G[Emit 'join-user-room'<br/>with userId]
    G --> H[Socket Joins Room]
    
    D --> I[Socket.io Server]
    I --> J[Room: user-{freelancerId}]
    J --> K[Event: 'hired']
    
    H --> J
    K --> L[Client Receives Event]
    L --> M[Update Notification State]
    M --> N[Display Notification UI]
    N --> O[Auto-hide after 5s]
    
    style D fill:#f3e5f5
    style G fill:#e1f5ff
    style K fill:#fff4e6
    style N fill:#e8f5e9
```

### Hiring Logic (Bonus 1)

The hiring process uses MongoDB transactions to ensure atomicity and prevent race conditions:

The hiring process uses MongoDB transactions to ensure atomicity and prevent race conditions:
- All updates (gig status, bid statuses) happen within a single transaction
- If two users try to hire different freelancers simultaneously, only one transaction will succeed
- The transaction ensures data consistency across all related documents

### Real-time Notifications (Bonus 2)

- Uses Socket.io for real-time communication
- When a freelancer is hired, they receive an instant notification
- Notifications appear in the top-right corner of the screen
- Users join their own room based on their user ID

## 🔒 Security Features

- JWT authentication with HttpOnly cookies (prevents XSS attacks)
- Password hashing with bcrypt
- Protected routes requiring authentication
- Owner-only access to bid lists
- Validation on all inputs
- CORS configuration for secure cross-origin requests

## 📦 Project Structure

```
assignment/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── bidRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── GigList.jsx
│   │   │   ├── CreateGig.jsx
│   │   │   ├── GigDetail.jsx
│   │   │   ├── BidList.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── context/
│   │   │   └── NotificationContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🧪 Testing the Hiring Flow

1. Register/Login as User A (Client)
2. Post a gig
3. Register/Login as User B (Freelancer)
4. Browse gigs and submit a bid on User A's gig
5. Login as User A again
6. View bids for your gig
7. Click "Hire" on a bid
8. User B should receive a real-time notification (if logged in)

## 📝 Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS and Socket.io

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## 🔧 GitHub Setup

1. **Initialize Git Repository** (if not already initialized):
```bash
git init
```

2. **Add all files to Git**:
```bash
git add .
```

3. **Create initial commit**:
```bash
git commit -m "Initial commit: GigFlow platform"
```

4. **Create a new repository on GitHub**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `gigflow` or any name you prefer
   - **Do NOT** initialize with README, .gitignore, or license

5. **Add remote and push**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/gigflow.git
git branch -M main
git push -u origin main
```

6. **Your repository is now on GitHub!** 🎉

## 🗄️ MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a New Cluster**:
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add Render's IP ranges or use 0.0.0.0/0
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `gigflow` (or your preferred database name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gigflow?retryWrites=true&w=majority`

## 🚀 Deployment on Render

### Backend Deployment

1. **Push code to GitHub** (if not already done)

2. **Create Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Fill in the details:
     - **Name**: `gigflow-backend` (or any name)
     - **Region**: Choose closest to you
     - **Branch**: `main` (or your main branch)
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**:
   Click "Add Environment Variable" and add:
   ```
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-strong-secret-key>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
   **Note**: 
   - Render assigns a port automatically, but you can use 10000
   - Generate JWT_SECRET: Use `openssl rand -base64 32` or any random string generator
   - FRONTEND_URL will be your frontend Render URL (update after frontend deployment)

4. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://gigflow-backend.onrender.com`)

### Frontend Deployment

1. **Update Frontend Environment**:
   - Before deploying, update your frontend `.env` or create one for production
   - You'll set this in Render's environment variables

2. **Create Static Site on Render**:
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Fill in the details:
     - **Name**: `gigflow-frontend` (or any name)
     - **Branch**: `main` (or your main branch)
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

3. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   Replace `your-backend-url` with your actual backend URL from step above

4. **Deploy**:
   - Click "Create Static Site"
   - Render will build and deploy your frontend
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://gigflow-frontend.onrender.com`)

5. **Update Backend Environment**:
   - Go back to your backend service on Render
   - Go to "Environment" tab
   - Update `FRONTEND_URL` to your frontend URL: `https://gigflow-frontend.onrender.com`
   - Save changes (this will trigger a redeploy)

### Post-Deployment Checklist

1. ✅ Backend is deployed and running
2. ✅ Frontend is deployed and running
3. ✅ MongoDB Atlas connection is configured
4. ✅ Environment variables are set correctly
5. ✅ FRONTEND_URL in backend matches frontend URL
6. ✅ VITE_API_URL in frontend matches backend API URL
7. ✅ Test the application:
   - Register a new user
   - Create a gig
   - Submit a bid
   - Test the hiring flow

### Important Notes

- **Free Tier Limitations**: Render's free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.
- **MongoDB Atlas Free Tier**: Limited to 512MB storage, perfect for development/testing
- **CORS Configuration**: Backend CORS is configured to accept requests from your frontend URL
- **Socket.io**: Real-time features work on Render, but WebSocket connections may have delays on free tier
- **Environment Variables**: Never commit `.env` files to GitHub. Always use Render's environment variables.

### Troubleshooting

- **Backend won't start**: Check logs in Render dashboard, verify MongoDB connection string
- **CORS errors**: Ensure FRONTEND_URL in backend matches your frontend URL exactly
- **API calls failing**: Check VITE_API_URL in frontend, ensure it points to `/api` endpoint
- **MongoDB connection failed**: Verify network access in MongoDB Atlas allows Render IPs

## 👨‍💻 Author

Built as an assignment for ServiceHive internship

## 📄 License

This project is for educational/assignment purposes.

## 📧 Submission

- **Email**: ritik.yadav@servicehive.tech
- **CC**: hiring@servicehive.tech
