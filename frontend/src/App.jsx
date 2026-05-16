import { useState } from 'react'
import { SearchTab } from './components/SearchTab'
import { RegisterTab } from './components/RegisterTab'
import { WorkersTab } from './components/WorkersTab'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('search')

  return (
    <div>
      <header>
        <div className="container">
          <h1>🏢 City Assist</h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Verified Household Help Hiring Platform</p>
          <nav>
            <button
              className={`nav-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              🔍 Search
            </button>
            <button
              className={`nav-button ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              ➕ Register Worker
            </button>
            <button
              className={`nav-button ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => setActiveTab('workers')}
            >
              👥 All Workers
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'workers' && <WorkersTab />}
      </main>

      <footer style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', marginTop: '60px', borderTop: '1px solid #e5e7eb' }}>
        <p>City Assist © 2024 - Connecting trusted workers with employers</p>
      </footer>
    </div>
  )
}

export default App
