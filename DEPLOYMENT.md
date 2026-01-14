# Deployment Guide

## Security Checklist

Before pushing to GitHub:
- ✅ `.env` files are in `.gitignore`
- ✅ API keys are NEVER committed
- ✅ `.env.example` templates provided for reference
- ✅ `Procfile` excluded from tracking (in `.gitignore`)

## GitHub Setup

1. Create a new repository on GitHub
2. Add remote:
   ```bash
   git remote add origin https://github.com/yourusername/whatif-novel.git
   ```
3. Push:
   ```bash
   git push -u origin main
   ```

## Environment Variables for Deployment

### Heroku
```bash
heroku config:set GROQ_API_KEY=your_key_here
```

### Vercel (Frontend)
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` pointing to your backend

### Railway / Render / Other Platforms
Add environment variables through platform dashboard.

## Production Deployment

### Backend (Heroku Example)
```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create whatif-novel-api

# Set environment variables
heroku config:set GROQ_API_KEY=your_key_here

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend (Vercel Example)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Database

### Local Development
Uses SQLite (file-based, no setup needed)

### Production
For PostgreSQL:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

Update `DATABASE_URL` in `.env`

## Important Notes

⚠️ **Never share or commit `.env` files!**

- Keep API keys in environment variables only
- Use `.env.example` for documentation
- Different environments should have different API keys/database URLs
- Rotate API keys periodically

## Monitoring

- Monitor Groq API usage at https://console.groq.com
- Check database size for production SQLite vs PostgreSQL
- Set up error logging (consider Sentry, LogRocket, etc.)

## Troubleshooting

### Backend fails to start
```bash
cd backend
source .venv/bin/activate
python main.py
```

### Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend is running on correct port
- Check CORS settings in `main.py`

### Database errors
```bash
# Reset database
rm backend/whatif.db
python backend/main.py  # Will create fresh DB
```
