# AI-Powered Interview Platform

An automated interview platform that conducts technical interviews, evaluates candidates using AI, and provides comprehensive scoring and feedback.

## Features

- Resume parsing and candidate profile extraction
- AI-generated technical questions based on skills
- Timed interview with real-time chat interface
- Automatic answer evaluation and scoring
- Interviewer dashboard to review all candidates

## Tech Stack

**Frontend:** React, Redux Toolkit, TailwindCSS  
**Backend:** Node.js, Express, OpenAI API  

## Quick Start

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3000
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=URL
```

Start server:
```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
## API Endpoints

- `POST /api/v1/pdf/parsePdf` - Upload and parse resume
- `POST /api/v1/question/generate-question` - Generate interview questions
- `POST /api/v1/question/getScore` - Calculate score and feedback

## How It Works

1. Candidate uploads resume (PDF)
2. System extracts profile info and verifies details
3. AI generates personalized technical questions
4. Candidate answers questions with time limits (20s/60s/120s based on difficulty)
5. AI evaluates answers and provides score with feedback
6. Interviewer reviews results in dashboard


#### Built with ❤️ by Pragyan