import { useState } from 'react';
import axios from 'axios';
import { WorkerCard } from './WorkerCard';

const API_BASE = 'http://localhost:8000/api';

export function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/search`, { query });
      setResults(response.data);
    } catch (err) {
      setError('Failed to search. Make sure the backend is running on http://localhost:8000');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content active">
      <div className="search-container">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Find a trusted cook near Noida..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            Searching...
          </div>
        )}

        {!loading && results.length === 0 && query && !error && (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try different keywords or check the All Workers tab for all registered workers.</p>
          </div>
        )}

        {!loading && results.length === 0 && !query && (
          <div className="empty-state">
            <h3>Search for workers</h3>
            <p>Enter your requirements above to find trusted household help.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Found {results.length} result(s)</h3>
            <div className="search-results">
              {results.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  similarity_score={worker.similarity_score}
                  onClick={() => setSelectedWorker(worker)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedWorker && (
        <div className="modal-overlay active" onClick={() => setSelectedWorker(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedWorker.name}</h2>
              <button className="modal-close" onClick={() => setSelectedWorker(null)}>×</button>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">Professional Details</h3>
              <div className="modal-field">
                <span className="modal-field-label">Role</span>
                <span className="modal-field-value">{selectedWorker.role}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Location</span>
                <span className="modal-field-value">{selectedWorker.location}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Experience</span>
                <span className="modal-field-value">{selectedWorker.experience} years</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Rating</span>
                <span className="modal-field-value">★ {selectedWorker.rating.toFixed(1)}/5</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Past Employers</span>
                <span className="modal-field-value">{selectedWorker.past_employers}</span>
              </div>
            </div>

            {selectedWorker.skills && (
              <div className="modal-section">
                <h3 className="modal-section-title">Skills</h3>
                <div className="skills" style={{ marginTop: '8px' }}>
                  {selectedWorker.skills.split(',').map((skill, i) => (
                    <span key={i} className="skill-chip">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedWorker.bio && (
              <div className="modal-section">
                <h3 className="modal-section-title">Bio</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{selectedWorker.bio}</p>
              </div>
            )}

            {selectedWorker.aadhaar_verified && (
              <div className="modal-section">
                <h3 className="modal-section-title">Aadhaar Verification</h3>
                <div className="aadhaar-preview">
                  {selectedWorker.aadhaar_name && (
                    <div className="aadhaar-field">
                      <strong>Name:</strong> {selectedWorker.aadhaar_name}
                    </div>
                  )}
                  {selectedWorker.aadhaar_dob && (
                    <div className="aadhaar-field">
                      <strong>Date of Birth:</strong> {selectedWorker.aadhaar_dob}
                    </div>
                  )}
                  {selectedWorker.aadhaar_number && (
                    <div className="aadhaar-field">
                      <strong>Aadhaar:</strong> {selectedWorker.aadhaar_number}
                    </div>
                  )}
                  {selectedWorker.aadhaar_address && (
                    <div className="aadhaar-field">
                      <strong>Address:</strong> {selectedWorker.aadhaar_address}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3 className="modal-section-title">Verification Status</h3>
              <div className="badges" style={{ marginTop: '8px' }}>
                {selectedWorker.aadhaar_verified && (
                  <span className="badge aadhaar">✓ Aadhaar Verified</span>
                )}
                {selectedWorker.police_verified && (
                  <span className="badge police">✓ Police Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
