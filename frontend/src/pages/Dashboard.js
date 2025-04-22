import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OCRUpload from '../components/OCRUpload';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>GateWise Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.full_name || user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Users</h3>
              <p className="stat-value">5</p>
            </div>
            <div className="stat-item">
              <h3>Active Sessions</h3>
              <p className="stat-value">2</p>
            </div>
            <div className="stat-item">
              <h3>Today's Entries</h3>
              <p className="stat-value">12</p>
            </div>
            <div className="stat-item">
              <h3>Today's Exits</h3>
              <p className="stat-value">8</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>License Plate Recognition</h2>
          <OCRUpload />
        </div>

        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">10:45 AM</span>
              <span className="activity-text">Vehicle ABC123 entered</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">10:30 AM</span>
              <span className="activity-text">Vehicle XYZ789 exited</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">10:15 AM</span>
              <span className="activity-text">New user registered</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">10:00 AM</span>
              <span className="activity-text">System backup completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-btn"
          onClick={() => navigate('/users')}
        >
          Manage Users
        </button>
        <button className="action-btn">
          View Reports
        </button>
        <button className="action-btn">
          System Settings
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 