import { TrustRing } from './TrustRing';

export function WorkerCard({ worker, onClick, similarity_score }) {
  const skills = worker.skills ? worker.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <div className="worker-card" onClick={onClick}>
      <div className="worker-name">{worker.name}</div>
      <div className="worker-role">{worker.role}</div>
      <div className="worker-location">📍 {worker.location}</div>

      <div className="badges">
        {worker.aadhaar_verified && (
          <span className="badge aadhaar">
            ✓ Aadhaar Verified
          </span>
        )}
        {worker.police_verified && (
          <span className="badge police">
            ✓ Police Verified
          </span>
        )}
        {!worker.aadhaar_verified && !worker.police_verified && (
          <span className="badge unverified">
            ⚠ Unverified
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="skills">
          {skills.map((skill, i) => (
            <span key={i} className="skill-chip">{skill}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="rating">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="stars">★</span>
            {worker.rating.toFixed(1)} ({worker.past_employers} jobs)
          </div>
          {similarity_score !== undefined && (
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
              TRUST SCORE: {worker.trust_score}
            </div>
          )}
        </div>
        <TrustRing 
          score={similarity_score !== undefined ? Math.round(similarity_score * 100) : worker.trust_score} 
          label={similarity_score !== undefined ? "Match Score" : "Trust Score"}
        />
      </div>
    </div>
  );
}
