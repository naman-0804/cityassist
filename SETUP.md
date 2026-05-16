# Quick Start Guide

## One-Command Setup (Windows PowerShell)

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend (in new PowerShell window)
```powershell
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`

---

## Detailed Steps

### Backend Setup (Python/FastAPI)

1. **Open PowerShell and navigate to backend folder**
   ```powershell
   cd f:\cityassist\backend
   ```

2. **Create Python virtual environment**
   ```powershell
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```powershell
   .\venv\Scripts\activate
   ```

4. **Install dependencies** (this takes ~5-10 minutes first time due to model downloads)
   ```powershell
   pip install -r requirements.txt
   ```

5. **Run the backend server**
   ```powershell
   python main.py
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   ```

6. **Test the API** (in another terminal)
   ```powershell
   curl http://localhost:8000/api/health
   ```

   Expected response:
   ```json
   {"status":"healthy","workers_in_db":0}
   ```

---

### Frontend Setup (React/Vite)

1. **Open a NEW PowerShell window**
   ```powershell
   cd f:\cityassist\frontend
   ```

2. **Install Node dependencies**
   ```powershell
   npm install
   ```

3. **Start development server**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
     VITE v5.0.0  ready in XXX ms
   
     ➜  Local:   http://localhost:3000/
   ```

4. **Open in browser**
   - Go to `http://localhost:3000`

---

## Testing Workflow

### 1. Register a Worker (via Frontend or curl)

**Frontend Method:**
- Go to "Register Worker" tab
- Fill form: Name=`Ramesh Kumar`, Role=`Cook`, Location=`Noida`, Experience=`5`
- Add Skills: `Cooking, Cleaning`
- Add Bio: `Expert in Indian cuisine`
- Rating: `4.5`, Past employers: `3`
- Check "Police Verified"
- Upload Aadhaar image (any image file will work for OCR testing)
- Click "Register Worker"

**curl Method:**
```powershell
$body = @{
    name = "Ramesh Kumar"
    role = "Cook"
    location = "Noida"
    experience = 5
    skills = "Cooking, Cleaning"
    bio = "Expert in Indian cuisine"
    police_verified = $true
    past_employers = 3
    rating = 4.5
    aadhaar_verified = $false
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/workers `
  -H "Content-Type: application/json" `
  -Body $body
```

### 2. Register Another Worker

- Name: `Priya Singh`, Role: `Nanny`, Location: `Delhi`, Experience: `8`
- Skills: `Child Care, Cooking, First Aid`
- Rating: `5.0`, Police Verified: `true`, Aadhaar Verified: `true`

### 3. Search (Frontend)

- Go to "Search" tab
- Enter: "experienced nanny in delhi"
- Click "Search"
- Should show Priya Singh at top (high similarity + high trust score)

### 4. View All Workers

- Go to "All Workers" tab
- Table shows all registered workers
- Click column headers to sort by Trust Score, Experience, or Rating
- Click "Delete" button to remove a worker

---

## What Happens Behind the Scenes

### Worker Registration
1. Form submitted with all details
2. Backend creates embedding: `encode("{name} {role} {skills} {location} {bio}")`
3. Trust score computed from verified data
4. Worker saved to SQLite database
5. Response includes computed trust score (0-100)

### Search Process
1. User types: "trusted cook near noida"
2. Backend encodes query to same embedding format
3. Computes cosine similarity vs all worker embeddings
4. Combines: `0.85 * similarity + 0.15 * (trust_score/100)`
5. Returns results ranked by combined score

### Trust Score Components
- **Aadhaar Verified**: +30 points
- **Police Verified**: +20 points
- **Experience**: min(years, 10) × 2 (max +20)
- **Skills**: min(count × 2, 10) (max +10)
- **Past Employers**: min(count × 2, 10) (max +10)
- **Rating**: (rating/5) × 10 (max +10)

---

## Database

Database file: `backend/cityassist.db` (SQLite)

Delete this file to reset and start fresh:
```powershell
rm backend/cityassist.db
```

---

## Common Issues & Fixes

### Backend won't start
```powershell
# Check Python version (need 3.8+)
python --version

# Make sure venv is activated (should see "(venv)" in prompt)
# Check port 8000 is free
netstat -aon | findstr :8000
```

### Frontend can't connect
- Ensure backend is running at `http://localhost:8000`
- Check browser console (F12 → Console tab) for errors
- Restart frontend server if backend started after it

### PaddleOCR/Models slow
- First run downloads ~300MB of models (takes 2-5 min)
- Afterwards cached locally, much faster
- Can ignore the download during testing by using fake Aadhaar upload

### Import errors in backend
```powershell
# Full reinstall
pip uninstall -y sentence-transformers paddleocr paddlepaddle
pip install -r requirements.txt
```

---

## File Locations

```
f:\cityassist\
├── backend/
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── database.py             # SQLAlchemy models & queries
│   ├── embeddings.py           # Sentence-transformers encoding
│   ├── ocr.py                  # PaddleOCR extraction
│   ├── trust.py                # Trust score computation
│   ├── requirements.txt        # Python dependencies
│   ├── venv/                   # Virtual environment (auto-created)
│   └── cityassist.db           # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # All styles
│   │   ├── App.css             # Component-specific styles
│   │   └── components/
│   │       ├── SearchTab.jsx
│   │       ├── RegisterTab.jsx
│   │       ├── WorkersTab.jsx
│   │       ├── WorkerCard.jsx
│   │       └── TrustRing.jsx
│   ├── index.html              # HTML entry point
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/           # Node dependencies (auto-created)
│
├── README.md                    # Full project documentation
└── .gitignore
```

---

## Next Steps After Setup

1. ✅ Start backend (`python main.py`)
2. ✅ Start frontend (`npm run dev`)
3. ✅ Register 3-4 test workers via "Register Worker" tab
4. ✅ Test searches on "Search" tab
5. ✅ View all workers on "All Workers" tab
6. ✅ Try deleting a worker

---

## API Documentation

Once backend is running, visit:
```
http://localhost:8000/docs
```

This shows interactive Swagger UI for all endpoints.

---

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in backend terminal
- **Frontend**: Press `Ctrl+C` in frontend terminal

Then run commands again to restart.
