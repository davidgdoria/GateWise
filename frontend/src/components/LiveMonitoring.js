import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LiveMonitoring.css';

const LiveMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [ws, setWs] = useState(null);

  const connectWebSocket = () => {
    const wsUrl = `ws://${window.location.hostname}:8000/api/monitoring/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'vehicle_update') {
        setVehicles(data.vehicles);
      } else if (data.type === 'status_update') {
        setSystemStatus(data.status);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to monitoring system');
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null);
    };

    setWs(websocket);
  };

  const startMonitoring = async () => {
    try {
      await axios.post('/api/monitoring/start');
      setIsMonitoring(true);
      connectWebSocket();
      setError(null);
    } catch (err) {
      setError('Failed to start monitoring system');
      console.error('Error starting monitoring:', err);
    }
  };

  const stopMonitoring = async () => {
    try {
      await axios.post('/api/monitoring/stop');
      setIsMonitoring(false);
      if (ws) {
        ws.close();
      }
      setError(null);
    } catch (err) {
      setError('Failed to stop monitoring system');
      console.error('Error stopping monitoring:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/monitoring/status');
      setSystemStatus(response.data);
      setIsMonitoring(response.data.is_active);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="live-monitoring">
      <div className="monitoring-header">
        <h2>Live Vehicle Monitoring</h2>
        <div className="monitoring-controls">
          {!isMonitoring ? (
            <button className="control-button start" onClick={startMonitoring}>
              Start Monitoring
            </button>
          ) : (
            <button className="control-button stop" onClick={stopMonitoring}>
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {systemStatus && (
        <div className="status-section">
          <h3>System Status</h3>
          <div className="status-details">
            <p><strong>Status:</strong> {systemStatus.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Camera:</strong> {systemStatus.camera_status ? 'Connected' : 'Disconnected'}</p>
            <p><strong>Active Vehicles:</strong> {systemStatus.active_vehicles}</p>
            <p><strong>Connected Clients:</strong> {systemStatus.connected_clients}</p>
          </div>
        </div>
      )}

      <div className="vehicles-section">
        <h3>Active Vehicles</h3>
        {vehicles.length === 0 ? (
          <div className="no-vehicles">No vehicles currently being monitored</div>
        ) : (
          <div className="vehicles-list">
            {vehicles.map((vehicle) => (
              <div key={vehicle.license_plate} className="vehicle-card">
                <div className="vehicle-info">
                  <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
                  <p><strong>Entry Time:</strong> {new Date(vehicle.entry_time).toLocaleString()}</p>
                  <p><strong>Status:</strong> {vehicle.status}</p>
                  <p><strong>Confidence:</strong> {(vehicle.confidence * 100).toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring; 