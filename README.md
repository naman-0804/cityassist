# City Assist - Verified Household Help Hiring Platform

A full-stack web application where workers register with identity verification via Aadhaar OCR, and employers search for workers using semantic vector search powered by real trust scores.

## Features

- **Worker Registration**: Workers register with details and upload Aadhaar cards for OCR-based verification
- **Dynamic Trust Scoring**: Real computed trust scores based on verification status, experience, skills, ratings, and past employers
- **Semantic Search**: Natural language search using sentence-transformers (all-MiniLM-L6-v2) for 384-dimensional embeddings
- **Identity Verification**: Aadhaar card OCR using PaddleOCR to extract name, DOB, number, and address
- **Professional Interface**: Clean, responsive React + Vite frontend with trust score visualization

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (local, via SQLAlchemy)
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2) - 384 dimensions
- **Search**: Cosine similarity on stored embeddings (numpy)
- **OCR**: PaddleOCR for Aadhaar extraction
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18 + Vite
- **HTTP Client**: Axios
- **Styling**: Custom CSS with professional design

## Project Structure

```
cityassist/
  backend/
    main.py              # FastAPI application
    database.py          # SQLite + SQLAlchemy models
    embeddings.py        # SentenceTransformer encoding
    ocr.py               # PaddleOCR logic
    trust.py             # Trust score computation
    requirements.txt
    
  frontend/
    src/
      App.jsx
      main.jsx
      index.css
      App.css
      components/
        SearchTab.jsx
        RegisterTab.jsx
        WorkersTab.jsx
        WorkerCard.jsx
        TrustRing.jsx
    package.json
    vite.config.js
    index.html
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip and npm

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   This installs:
   - fastapi, uvicorn for API framework
   - sentence-transformers for embeddings
   - paddleocr, paddlepaddle for OCR
   - sqlalchemy for database ORM
   - numpy, pillow for image/math operations

4. **Start the backend server**
   ```bash
   python main.py
   ```
   
   The backend will start at `http://localhost:8000`
   - Health check: `http://localhost:8000/api/health`
   - API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will start at `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/api/health` → Returns `{status, workers_in_db}`

### Worker Management
- **POST** `/api/workers` → Register new worker with computed embedding and trust score
- **GET** `/api/workers` → List all workers with trust scores
- **DELETE** `/api/workers/{worker_id}` → Delete a worker

### OCR Verification
- **POST** `/api/ocr/aadhaar` → Upload Aadhaar image, extract name, DOB, number, address via PaddleOCR

### Search
- **POST** `/api/search` → `{query: string}` → Search workers by semantic similarity, ranked by cosine similarity + trust score
  - Ranking: `0.85 * similarity_score + 0.15 * (trust_score / 100)`

## Trust Score Calculation

Trust scores are computed server-side from real worker data:

| Factor | Points | Max |
|--------|--------|-----|
| Aadhaar Verified | +30 | 30 |
| Police Verified | +20 | 20 |
| Experience (capped at 10 years × 2) | +2/year | 20 |
| Skills Count (max 10) | +2/skill | 10 |
| Past Employers (max 10 occurrences) | +2/employer | 10 |
| Rating (0-5 scale × 2) | +rating/5 × 10 | 10 |
| **Total** | | **100** |

**Color Coding**:
- 🟢 Green: 80+ (Highly Trusted)
- 🟡 Amber: 60-79 (Moderately Trusted)
- 🔴 Red: <60 (Low Trust)

## Worker Data Flow

1. **Registration**:
   - User fills form with name, role, location, experience, skills, bio, rating, past employers, police verification
   - User uploads Aadhaar image
   - Backend runs PaddleOCR → extracts name, DOB, Aadhaar number, address
   - Backend encodes `{name} {role} {skills} {location} {bio}` → 384-dim embedding
   - Backend computes trust score from all fields
   - Worker saved to SQLite with embedding and trust score

2. **Search**:
   - User enters natural language query (e.g., "Find a trusted cook near Noida")
   - Query encoded to 384-dim embedding using same model
   - Cosine similarity computed against all worker embeddings
   - Results ranked by: `0.85 * similarity + 0.15 * (trust_score / 100)`
   - Sorted descending and returned to frontend

3. **Display**:
   - Worker card shows name, role, location, skills, badges (Aadhaar/Police), rating, trust score ring
   - Click card → modal with full details including extracted Aadhaar fields if verified
   - All Workers tab → sortable table by trust score, experience, rating

## Testing the Backend

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Register a Worker
```bash
curl -X POST http://localhost:8000/api/workers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Kumar",
    "role": "Cook",
    "location": "Noida",
    "experience": 5,
    "skills": "Cooking,Cleaning",
    "bio": "Expert in Indian cuisine",
    "police_verified": false,
    "past_employers": 3,
    "rating": 4.5,
    "aadhaar_verified": false
  }'
```

### Get All Workers
```bash
curl http://localhost:8000/api/workers
```

### Search Workers
```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "skilled cook near Noida"}'
```

## Running Both Servers

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Key Implementation Details

### No Hardcoded Data
- **All workers come from SQLite database** — No mock data
- **All trust scores are computed dynamically** from actual worker attributes
- **All embeddings are real vector calculations** stored in the database
- **Search is genuine cosine similarity** against stored embeddings

### Real Verification
- **Aadhaar OCR**: Uses PaddleOCR with regex to extract exact fields (12-digit Aadhaar, DD/MM/YYYY DOB, 6-digit PIN)
- **Trust Score**: 100% dependent on verified data (verified status, experience, skills, ratings, employers)
- **Semantic Search**: all-MiniLM-L6-v2 produces consistent 384-dimensional embeddings for query and profile matching

### Database
- SQLite database auto-created on first run
- SQLAlchemy ORM for models and queries
- Embeddings stored as JSON arrays of floats (384 dimensions)

## Future Enhancements

- User authentication for employers and workers
- Reviews and ratings from actual job completions
- Video verification for workers
- Real-time messaging/communication
- Payment integration
- Booking/job management system
- Advanced filtering by skills, availability, hourly rates
- Worker analytics dashboard

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ installed: `python --version`
- Reinstall requirements: `pip install -r requirements.txt --upgrade`
- Check port 8000 is free: `netstat -an | grep 8000`

### Frontend can't connect to backend
- Ensure backend is running at `http://localhost:8000`
- Check CORS is enabled in `main.py` (it is by default)
- Open browser console (F12) to see actual error

### PaddleOCR slow on first run
- First use downloads the OCR model (~120MB)
- Subsequent runs are cached and much faster

### Embedding model slow to load
- sentence-transformers downloads model on first run (~140MB)
- Model is cached after first run

## License

MIT
