import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export function WorkersTab() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('trust_score');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/workers`);
      setWorkers(response.data);
    } catch (err) {
      setError('Failed to load workers. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const getSortedWorkers = () => {
    let sorted = [...workers];

    sorted.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === 'trust_score') {
        aVal = a.trust_score;
        bVal = b.trust_score;
      } else if (sortBy === 'experience') {
        aVal = a.experience;
        bVal = b.experience;
      } else if (sortBy === 'rating') {
        aVal = a.rating;
        bVal = b.rating;
      } else {
        aVal = a[sortBy];
        bVal = b[sortBy];
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleDelete = async (workerId) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
      await axios.delete(`${API_BASE}/workers/${workerId}`);
      setWorkers(workers.filter(w => w.id !== workerId));
    } catch (err) {
      alert('Failed to delete worker');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="content active">
        <div className="loading">
          <div className="spinner"></div>
          Loading workers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content active">
        <div className="workers-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const sortedWorkers = getSortedWorkers();

  return (
    <div className="content active">
      <div className="workers-container">
        <div style={{ marginBottom: '16px' }}>
          <h2>All Workers ({workers.length})</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Click column headers to sort</p>
        </div>

        {workers.length === 0 ? (
          <div className="empty-state">
            <h3>No workers registered yet</h3>
            <p>Go to the "Register Worker" tab to add new workers.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Location</th>
                <th>
                  <button onClick={() => handleSort('experience')}>
                    Experience {sortBy === 'experience' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button onClick={() => handleSort('rating')}>
                    Rating {sortBy === 'rating' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button onClick={() => handleSort('trust_score')}>
                    Trust Score {sortBy === 'trust_score' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedWorkers.map((worker) => {
                const statusLabel = worker.aadhaar_verified ? '✓ Verified' :
                  worker.police_verified ? '✓ Police' :
                    '⚠ Unverified';

                return (
                  <tr key={worker.id}>
                    <td><strong>{worker.name}</strong></td>
                    <td>{worker.role}</td>
                    <td>{worker.location}</td>
                    <td>{worker.experience} yrs</td>
                    <td>★ {worker.rating.toFixed(1)}</td>
                    <td>
                      <strong style={{
                        color: worker.trust_score >= 80 ? '#22c55e' :
                          worker.trust_score >= 60 ? '#f59e0b' :
                            '#ef4444'
                      }}>
                        {worker.trust_score}
                      </strong>
                    </td>
                    <td>{statusLabel}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(worker.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
