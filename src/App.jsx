import React, { useState } from 'react';
import './App.css';
import { Tabs, Tab, Button, Table, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fields, setFields] = useState({
    "First Name": "",
    "Last Name": "",
    "SSN": "",
    "Income": "",
    "Deductions": "",
    Spouse: { "First Name": "", "Last Name": "", "SSN": "" },
    Dependents: [],
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event) => {
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
        setUploadMessage('File processed successfully.');
        try {
          const json = JSON.parse(text);
          setFields(json);
        } catch {
          setUploadMessage('Error parsing response.');
        }
      } else {
        setUploadMessage(`Upload failed: ${text}`);
      }
    } catch (error) {
      setUploadMessage('Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFieldChange = (section, key, value) => {
    setFields((prev) => {
      const updated = { ...prev };
      if (section === 'Dependents') {
        updated[section][key] = value;
      } else {
        updated[section][key] = value;
      }
      return updated;
    });
  };

  const addDependent = () => {
    setFields((prev) => ({
      ...prev,
      Dependents: [...prev.Dependents, { "First Name": "", "Last Name": "", "SSN": "", "Relationship": "", "Age": "" }],
    }));
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Health Care Portal</h1>
      <p className="text-center">Upload your health documents securely below:</p>
      <form onSubmit={handleUpload} className="text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileChange}
        />
        <button type="submit" className="btn btn-primary ml-2" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
      {uploadMessage && (
        <p className={`text-center mt-3 ${uploadMessage.startsWith('File processed') ? 'text-success' : 'text-danger'}`}>{uploadMessage}</p>
      )}
      <Tabs defaultActiveKey="primary" id="individual-details-tabs" className="mt-4">
        <Tab eventKey="primary" title="Primary">
          <div className="mt-3">
            <Form>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fields["First Name"]}
                  onChange={(e) => handleFieldChange('Primary', 'First Name', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fields["Last Name"]}
                  onChange={(e) => handleFieldChange('Primary', 'Last Name', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>SSN</Form.Label>
                <Form.Control
                  type="text"
                  value={fields["SSN"]}
                  onChange={(e) => handleFieldChange('Primary', 'SSN', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Income</Form.Label>
                <Form.Control
                  type="text"
                  value={fields["Income"]}
                  onChange={(e) => handleFieldChange('Primary', 'Income', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Deductions</Form.Label>
                <Form.Control
                  type="text"
                  value={fields["Deductions"]}
                  onChange={(e) => handleFieldChange('Primary', 'Deductions', e.target.value)}
                />
              </Form.Group>
            </Form>
          </div>
        </Tab>
        <Tab eventKey="spouse" title="Spouse">
          <div className="mt-3">
            <Form>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fields.Spouse["First Name"]}
                  onChange={(e) => handleFieldChange('Spouse', 'First Name', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fields.Spouse["Last Name"]}
                  onChange={(e) => handleFieldChange('Spouse', 'Last Name', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>SSN</Form.Label>
                <Form.Control
                  type="text"
                  value={fields.Spouse["SSN"]}
                  onChange={(e) => handleFieldChange('Spouse', 'SSN', e.target.value)}
                />
              </Form.Group>
            </Form>
          </div>
        </Tab>
        <Tab eventKey="dependents" title="Dependents">
          <div className="mt-3">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>SSN</th>
                  <th>Relationship</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {fields.Dependents.map((dep, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        type="text"
                        value={dep["First Name"]}
                        onChange={(e) => handleFieldChange('Dependents', idx, { ...dep, "First Name": e.target.value })}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={dep["Last Name"]}
                        onChange={(e) => handleFieldChange('Dependents', idx, { ...dep, "Last Name": e.target.value })}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={dep["SSN"]}
                        onChange={(e) => handleFieldChange('Dependents', idx, { ...dep, "SSN": e.target.value })}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={dep["Relationship"]}
                        onChange={(e) => handleFieldChange('Dependents', idx, { ...dep, "Relationship": e.target.value })}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={dep["Age"]}
                        onChange={(e) => handleFieldChange('Dependents', idx, { ...dep, "Age": e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="primary" onClick={addDependent} className="mt-2">Add Dependent</Button>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default App;
