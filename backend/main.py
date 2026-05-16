from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import json

from database import SessionLocal, Worker, get_db, get_all_workers, get_worker_by_id, create_worker, delete_worker, update_worker
from embeddings import compute_worker_embedding, encode_text, cosine_similarity
from trust import compute_trust_score
from ocr import extract_aadhaar_info

app = FastAPI(title="City Assist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WorkerRegisterRequest(BaseModel):
    name: str
    role: str
    location: str
    experience: int = 0
    skills: str = ""
    bio: str = ""
    police_verified: bool = False
    past_employers: int = 0
    rating: float = 0.0
    
    aadhaar_address: Optional[str] = None


class WorkerResponse(BaseModel):
    id: int
    name: str
    role: str
    location: str
    experience: int
    skills: str
    police_verified: bool
    past_employers: int
    rating: float
    aadhaar_verified: bool
    aadhaar_name: Optional[str]
    aadhaar_dob: Optional[str]
    aadhaar_number: Optional[str]
    aadhaar_address: Optional[str]
    bio: str
    trust_score: int
    created_at: str


class SearchRequest(BaseModel):
    query: str


class SearchResult(BaseModel):
    id: int
    name: str
    role: str
    location: str
    experience: int
    skills: str
    police_verified: bool
    past_employers: int
    rating: float
    aadhaar_verified: bool
    aadhaar_name: Optional[str]
    aadhaar_dob: Optional[str]
    aadhaar_number: Optional[str]
    aadhaar_address: Optional[str]
    bio: str
    trust_score: int
    similarity_score: float


class OCRResponse(BaseModel):
    name: Optional[str]
    dob: Optional[str]
    aadhaarNumber: Optional[str]
    address: Optional[str]
    rawText: str


class HealthResponse(BaseModel):
    status: str
    workers_in_db: int



def worker_to_response(worker: Worker, trust_score: Optional[int] = None) -> WorkerResponse:
    """Convert Worker DB object to API response"""
    if trust_score is None:
        trust_score = compute_trust_score({
            'aadhaar_verified': worker.aadhaar_verified,
            'police_verified': worker.police_verified,
            'experience': worker.experience,
            'skills': worker.skills,
            'past_employers': worker.past_employers,
            'rating': worker.rating,
        })
    
    return WorkerResponse(
        id=worker.id,
        name=worker.name,
        role=worker.role,
        location=worker.location,
        experience=worker.experience,
        skills=worker.skills,
        police_verified=worker.police_verified,
        past_employers=worker.past_employers,
        rating=worker.rating,
        aadhaar_verified=worker.aadhaar_verified,
        aadhaar_name=worker.aadhaar_name,
        aadhaar_dob=worker.aadhaar_dob,
        aadhaar_number=worker.aadhaar_number,
        aadhaar_address=worker.aadhaar_address,
        bio=worker.bio,
        trust_score=trust_score,
        created_at=worker.created_at.isoformat() if worker.created_at else None
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    workers = get_all_workers(db)
    return HealthResponse(
        status="healthy",
        workers_in_db=len(workers)
    )


@app.post("/api/workers", response_model=dict)
async def register_worker(worker_data: WorkerRegisterRequest, db: Session = Depends(get_db)):
    worker_dict = worker_data.dict()
    embedding = compute_worker_embedding(worker_dict)
    worker_dict['embedding'] = embedding
    
    trust_score = compute_trust_score(worker_dict)
    
    db_worker = create_worker(db, worker_dict)
    
    return {
        "id": db_worker.id,
        "name": db_worker.name,
        "trust_score": trust_score,
        "message": f"Worker '{db_worker.name}' registered successfully",
    }


@app.get("/api/workers", response_model=List[WorkerResponse])
async def list_workers(db: Session = Depends(get_db)):
    """List all registered workers with trust scores"""
    workers = get_all_workers(db)
    
    results = []
    for worker in workers:
        trust_score = compute_trust_score({
            'aadhaar_verified': worker.aadhaar_verified,
            'police_verified': worker.police_verified,
            'experience': worker.experience,
            'skills': worker.skills,
            'past_employers': worker.past_employers,
            'rating': worker.rating,
        })
        results.append(worker_to_response(worker, trust_score))
    
    return results


@app.delete("/api/workers/{worker_id}")
async def delete_worker_endpoint(worker_id: int, db: Session = Depends(get_db)):
    """Delete a worker by ID"""
    success = delete_worker(db, worker_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    return {"message": f"Worker {worker_id} deleted successfully"}


@app.post("/api/ocr/aadhaar", response_model=OCRResponse)
async def ocr_aadhaar(file: UploadFile = File(...)):
    image_data = await file.read()
    result = extract_aadhaar_info(image_data)
    
    return OCRResponse(
        name=result.get('name'),
        dob=result.get('dob'),
        aadhaarNumber=result.get('aadhaarNumber'),
        address=result.get('address'),
        rawText=result.get('rawText')
    )


@app.post("/api/search", response_model=List[SearchResult])
async def search_workers(search_req: SearchRequest, db: Session = Depends(get_db)):
    workers = get_all_workers(db)
    
    if not workers:
        return []
    
    query_embedding = encode_text(search_req.query)
    results = []
    
    for worker in workers:
        if not worker.embedding:
            continue
        
        similarity = cosine_similarity(query_embedding, worker.embedding)
        
        trust_score = compute_trust_score({
            'aadhaar_verified': worker.aadhaar_verified,
            'police_verified': worker.police_verified,
            'experience': worker.experience,
            'skills': worker.skills,
            'past_employers': worker.past_employers,
            'rating': worker.rating,
        })
        
        normalized_similarity = (similarity + 1) / 2 if similarity < 0 else similarity
        final_score = 0.85 * normalized_similarity + 0.15 * (trust_score / 100.0)
        
        result = SearchResult(
            id=worker.id,
            name=worker.name,
            role=worker.role,
            location=worker.location,
            experience=worker.experience,
            skills=worker.skills,
            police_verified=worker.police_verified,
            past_employers=worker.past_employers,
            rating=worker.rating,
            aadhaar_verified=worker.aadhaar_verified,
            aadhaar_name=worker.aadhaar_name,
            aadhaar_dob=worker.aadhaar_dob,
            aadhaar_number=worker.aadhaar_number,
            aadhaar_address=worker.aadhaar_address,
            bio=worker.bio,
            trust_score=trust_score,
            similarity_score=normalized_similarity
        )
        results.append((result, final_score))
    
    results.sort(key=lambda x: x[1], reverse=True)
    return [r[0] for r in results]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
