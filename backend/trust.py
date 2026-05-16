def compute_trust_score(worker_data: dict) -> int:
    """
    Compute trust score for a worker based on their verified data.
    Score is capped at 100.
    
    Scoring:
    - Aadhaar verified: +30
    - Police verified: +20
    - Experience: min(years, 10) * 2 → max +20
    - Skills count: min(count * 2, 10) → max +10
    - Past employers: min(count * 2, 10) → max +10
    - Rating: (rating/5) * 10 → max +10
    """
    score = 0
    
    # Aadhaar verified
    if worker_data.get('aadhaar_verified', False):
        score += 30
    
    # Police verified
    if worker_data.get('police_verified', False):
        score += 20
    
    # Experience (years)
    experience = worker_data.get('experience', 0)
    exp_score = min(experience, 10) * 2
    score += exp_score
    
    # Skills count
    skills_str = worker_data.get('skills', '')
    if skills_str:
        skills_list = [s.strip() for s in skills_str.split(',') if s.strip()]
        skills_count = len(skills_list)
    else:
        skills_count = 0
    
    skills_score = min(skills_count * 2, 10)
    score += skills_score
    
    # Past employers
    past_employers = worker_data.get('past_employers', 0)
    employers_score = min(past_employers * 2, 10)
    score += employers_score
    
    # Rating (0-5)
    rating = worker_data.get('rating', 0.0)
    rating_score = min(int((rating / 5.0) * 10), 10)
    score += rating_score
    
    # Cap at 100
    return min(score, 100)
