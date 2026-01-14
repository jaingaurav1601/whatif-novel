# What If Novel AI

Generate alternative storylines in your favorite fictional universes using AI.

## Features

- 🎬 **Multiple Universes**: Harry Potter, Lord of the Rings, Marvel MCU, Star Wars
- ✨ **AI-Powered Stories**: Uses Groq API with advanced LLMs to generate creative alternate universes
- ⭐ **Rating System**: Rate and review generated stories
- 📚 **Story History**: Browse and filter all past generated stories
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- ⚡ **Fast Generation**: Streaming responses with loading indicators

## Project Structure

```
whatif-novel/
├── backend/           # Python FastAPI server
│   ├── main.py       # FastAPI app with endpoints
│   ├── database.py   # SQLAlchemy models and DB config
│   ├── story_generator.py  # Groq API integration
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
└── frontend/         # Next.js React application
    ├── app/
    │   ├── page.js       # Story generator page
    │   └── history/      # Story history page
    ├── lib/
    │   └── api.js        # API client functions
    └── .env.example
```

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (get from https://console.groq.com)

### Backend Setup

1. Create Python virtual environment:
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

4. Run the server:
```bash
python main.py
```
Server will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables (optional):
```bash
cp .env.example .env.local
# Defaults to http://localhost:8000 for backend
```

3. Run development server:
```bash
npm run dev
```
Application will be available at `http://localhost:3000`

## API Endpoints

### GET /universes
List all available story universes.

**Response:**
```json
{
  "universes": ["Harry Potter", "Lord of the Rings", "Marvel MCU", "Star Wars"],
  "count": 4
}
```

### POST /story/generate
Generate a new story.

**Request:**
```json
{
  "universe": "Harry Potter",
  "what_if": "Harry was sorted into Slytherin",
  "length": "short"
}
```

**Response:**
```json
{
  "id": 1,
  "universe": "Harry Potter",
  "what_if": "Harry was sorted into Slytherin",
  "story": "The Sorting Ceremony had just concluded...",
  "word_count": 587,
  "rating": 0,
  "created_at": "2026-01-14T05:06:17.577942"
}
```

### GET /story/history
Get all generated stories.

**Query Parameters:**
- `limit` (default: 20): Maximum number of stories to return

### GET /story/{id}
Get a specific story by ID.

### POST /story/{id}/rate
Rate a story (1-5 stars).

**Query Parameters:**
- `rating`: 1-5 star rating

### GET /story/trending
Get top-rated stories.

## Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./whatif.db  # Optional, defaults to SQLite
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

Backend module tests:
```bash
cd backend
.venv/bin/python test_modules.py
.venv/bin/python test_story_generation.py
.venv/bin/python test_manual_endpoints.py
```

## Technologies

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM and database toolkit
- Groq - API for AI models
- Uvicorn - ASGI web server

**Frontend:**
- Next.js 15+ - React framework
- Tailwind CSS - Utility-first CSS
- React Hooks - State management

## Security

⚠️ **Important**: Never commit `.env` files. They are automatically ignored by git.

- API keys are protected in `.env` files (in `.gitignore`)
- Use `.env.example` as a template for required variables
- Configure environment variables in deployment platform

## Performance

- Stories are generated asynchronously
- Loading spinners provide visual feedback during generation
- Database is optimized with proper indexing
- Frontend uses Next.js optimizations for fast load times

## Future Enhancements

- [ ] Additional universes (more franchises)
- [ ] Story continuation ("Write the next chapter")
- [ ] Sharing stories via URL
- [ ] User authentication and favorites
- [ ] Advanced filtering and search
- [ ] Multi-language support
- [ ] Export stories to PDF/EPUB

## Deployment

See `Procfile` for deployment configuration examples.

### Heroku
```bash
git push heroku main
```

### Other Platforms
Ensure you set environment variables through your platform's dashboard/CLI.

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
