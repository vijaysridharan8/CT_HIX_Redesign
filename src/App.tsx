
import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadMessage("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadMessage("");
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      if (response.ok) {
        setUploadMessage(text);
      } else {
        setUploadMessage(`Upload failed: ${text}`);
      }
    } catch (error) {
      setUploadMessage('Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Health Care Portal</h1>
      <p>Upload your health documents securely below:</p>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileChange}
        />
        <button type="submit" style={{ marginLeft: '10px' }} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
      {uploadMessage && (
        <p style={{ color: uploadMessage.startsWith('Received') ? 'green' : 'red', marginTop: '20px' }}>{uploadMessage}</p>
      )}
    </div>
  );
}

export default App;
