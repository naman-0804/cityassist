def compute_trust_score(worker_data: dict) -> int:
    """
    Compute trust score (0-100) based on verified data:
    - Aadhaar: +30, Police: +20
    - Exp: +2/yr (max 20)
    - Skills: +2 each (max 10)
    - Employers: +2 each (max 10)
    - Rating: up to +10
    """
    score = 0
    
    if worker_data.get('aadhaar_verified', False):
        score += 30
    
    if worker_data.get('police_verified', False):
        score += 20
    
    experience = worker_data.get('experience', 0)
    score += min(experience, 10) * 2
    
    skills_str = worker_data.get('skills', '')
    if skills_str:
        skills_list = [s.strip() for s in skills_str.split(',') if s.strip()]
        score += min(len(skills_list) * 2, 10)
    
    past_employers = worker_data.get('past_employers', 0)
    score += min(past_employers * 2, 10)
    
    rating = worker_data.get('rating', 0.0)
    score += min(int((rating / 5.0) * 10), 10)
    
    return min(score, 100)
