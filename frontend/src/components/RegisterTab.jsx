import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const ROLES = ['Cook', 'Driver', 'Nanny', 'Gardener', 'Caregiver', 'Security', 'Cleaner'];

export function RegisterTab() {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cook',
    location: '',
    experience: 0,
    skills: '',
    bio: '',
    police_verified: false,
    past_employers: 0,
    rating: 0,
    aadhaar_verified: false,
    aadhaar_name: null,
    aadhaar_dob: null,
    aadhaar_number: null,
    aadhaar_address: null,
  });

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value),
    });
  };

  const handleAadhaarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAadhaarFile(file);
    setLoading(true);
    setError('');
    setOcrResult(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await axios.post(`${API_BASE}/ocr/aadhaar`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOcrResult(response.data);
      setFormData({
        ...formData,
        aadhaar_verified: true,
        aadhaar_name: response.data.name,
        aadhaar_dob: response.data.dob,
        aadhaar_number: response.data.aadhaarNumber,
        aadhaar_address: response.data.address,
      });
    } catch (err) {
      setError('Failed to process Aadhaar image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE}/workers`, formData);
      setSuccess(`✓ Worker "${formData.name}" registered successfully with Trust Score: ${response.data.trust_score}`);

      // Reset form
      setFormData({
        name: '',
        role: 'Cook',
        location: '',
        experience: 0,
        skills: '',
        bio: '',
        police_verified: false,
        past_employers: 0,
        rating: 0,
        aadhaar_verified: false,
        aadhaar_name: null,
        aadhaar_dob: null,
        aadhaar_number: null,
        aadhaar_address: null,
      });
      setAadhaarFile(null);
      setOcrResult(null);
    } catch (err) {
      setError('Failed to register worker. Please check your input.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content active">
      <div className="register-container">
        <h2>Register New Worker</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={formData.role} onChange={handleInputChange}>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, area"
                required
              />
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="e.g., Cooking, Cleaning, Child Care"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="4"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Past Employers</label>
              <input
                type="number"
                name="past_employers"
                value={formData.past_employers}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="police_verified"
              name="police_verified"
              checked={formData.police_verified}
              onChange={handleInputChange}
            />
            <label htmlFor="police_verified">Police Verified</label>
          </div>

          {/* Aadhaar Upload */}
          <div className="aadhaar-upload">
            <h3>Upload Aadhaar Card</h3>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
              Upload a clear photo of your Aadhaar card for identity verification
            </p>
            <label htmlFor="aadhaar-file" style={{ display: 'block' }}>
              <input
                id="aadhaar-file"
                type="file"
                accept="image/*"
                onChange={handleAadhaarUpload}
              />
              <span style={{ cursor: 'pointer', color: '#0066cc', textDecoration: 'underline' }}>
                Choose file or drag and drop
              </span>
            </label>
            {aadhaarFile && <p style={{ marginTop: '8px', fontSize: '13px' }}>Selected: {aadhaarFile.name}</p>}
          </div>

          {ocrResult && (
            <div className="aadhaar-preview">
              <h4>✓ Aadhaar Details Extracted</h4>
              {ocrResult.name && <div className="aadhaar-field"><strong>Name:</strong> {ocrResult.name}</div>}
              {ocrResult.dob && <div className="aadhaar-field"><strong>DOB:</strong> {ocrResult.dob}</div>}
              {ocrResult.aadhaarNumber && <div className="aadhaar-field"><strong>Aadhaar #:</strong> {ocrResult.aadhaarNumber}</div>}
              {ocrResult.address && <div className="aadhaar-field"><strong>Address:</strong> {ocrResult.address}</div>}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
