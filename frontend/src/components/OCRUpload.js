import React, { useState } from 'react';
import './OCRUpload.css';

const OCRUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/ocr/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ocr-upload">
      <h2>License Plate Recognition</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        {preview && (
          <div className="preview-section">
            <img src={preview} alt="Preview" className="image-preview" />
          </div>
        )}
        
        <button 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="upload-button"
        >
          {loading ? 'Processing...' : 'Recognize License Plate'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && (
        <div className="result-section">
          <h3>Recognition Result</h3>
          <div className="result-details">
            <p><strong>License Plate:</strong> {result.license_plate}</p>
            <p><strong>Confidence:</strong> {result.confidence}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRUpload; 