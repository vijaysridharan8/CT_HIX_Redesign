import React, { useState, useRef } from 'react';
import './App.css';
import { Tabs, Tab, Button, Table, Form, Spinner, Alert, Navbar, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fields, setFields] = useState({
    "First Name": "",
    "Last Name": "",
    "SSN": "",
    "Address Line 1": "",
    "Address Line 2": "",
    "City": "",
    "State": "",
    "Zip": "",
    "Income": "",
    "Deductions": "",
    Spouse: { "First Name": "", "Last Name": "", "SSN": "" },
    Dependents: [],
  });
  const [isUploaded, setIsUploaded] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

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
        setIsUploaded(true);
        const newSessionId = response.headers.get('x-session-id');
        if (newSessionId) setSessionId(newSessionId);
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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Session ID missing or question is empty.' }]);
      return;
    }
    setChatHistory((prev) => [...prev, { role: 'user', content: chatInput }]);
    setChatInput("");
    try {
      console.log('Sending chat with sessionId:', sessionId, 'question:', chatInput);
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({ question: chatInput }),
      });
      console.log('Chat response:', response);
      if (!response.ok) {
        const errorText = await response.text();
        setChatHistory((prev) => [...prev, { role: 'assistant', content: `Error: ${errorText}` }]);
        return;
      }
      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Error getting answer.' }]);
      console.error('Chat error:', err);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="justify-content-center">
        <Navbar.Brand href="#home">Health Care Portal</Navbar.Brand>
      </Navbar>
      <div className="container mt-5">
        <h1 className="text-center">Upload Your Health Documents</h1>
        <p className="text-center">Securely upload your health documents below:</p>
        <form onSubmit={handleUpload} className="text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileChange}
          />
          <button type="submit" className="btn btn-primary ml-2" disabled={isUploading}>
            {isUploading ? <Spinner animation="border" size="sm" /> : 'Upload Document'}
          </button>
        </form>
        {uploadMessage && (
          <Alert variant={uploadMessage.startsWith('File processed') ? 'success' : 'danger'} className="mt-3">
            {uploadMessage}
          </Alert>
        )}
        <Tabs defaultActiveKey="individual" id="main-tabs" className="mt-4">
          <Tab eventKey="individual" title="Individual Sections">
            <Tabs defaultActiveKey="primary" id="individual-details-tabs" className="mt-3">
              <Tab eventKey="primary" title="Primary">
                <div className="mt-3">
                  <Form>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fields["First Name"]}
                        onChange={(e) => handleFieldChange('Primary', 'First Name', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fields["Last Name"]}
                        onChange={(e) => handleFieldChange('Primary', 'Last Name', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>SSN</Form.Label>
                      <Form.Control
                        type="text"
                        value={fields["SSN"]}
                        onChange={(e) => handleFieldChange('Primary', 'SSN', e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                </div>
              </Tab>
              <Tab eventKey="spouse" title="Spouse">
                <div className="mt-3">
                  <Form>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fields.Spouse["First Name"]}
                        onChange={(e) => handleFieldChange('Spouse', 'First Name', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fields.Spouse["Last Name"]}
                        onChange={(e) => handleFieldChange('Spouse', 'Last Name', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex">
                      <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>SSN</Form.Label>
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
          </Tab>
          <Tab eventKey="address" title="Address">
            <div className="mt-3">
              <Form>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Address Line 1</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["Address Line 1"]}
                    onChange={(e) => handleFieldChange('Primary', 'Address Line 1', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["Address Line 2"]}
                    onChange={(e) => handleFieldChange('Primary', 'Address Line 2', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["City"]}
                    onChange={(e) => handleFieldChange('Primary', 'City', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["State"]}
                    onChange={(e) => handleFieldChange('Primary', 'State', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Zip</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["Zip"]}
                    onChange={(e) => handleFieldChange('Primary', 'Zip', e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          </Tab>
          <Tab eventKey="income" title="Income & Deductions">
            <div className="mt-3">
              <Form>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Income</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["Income"]}
                    onChange={(e) => handleFieldChange('Primary', 'Income', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex">
                  <Form.Label className="mr-3" style={{ width: "150px", textAlign: "left" }}>Deductions</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields["Deductions"]}
                    onChange={(e) => handleFieldChange('Primary', 'Deductions', e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          </Tab>
        </Tabs>
      </div>
      {isUploaded && (
        <div className="container mt-5">
          <h3>Document Chatbot</h3>
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minHeight: 200, maxHeight: 300, overflowY: 'auto', background: '#fafafa' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                <span style={{ fontWeight: msg.role === 'user' ? 'bold' : 'normal' }}>{msg.role === 'user' ? 'You' : 'Assistant'}: </span>
                <span>{msg.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="d-flex mt-2">
            <Form.Control
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a question about your document..."
              className="mr-2"
            />
            <Button type="submit" variant="primary">Send</Button>
          </form>
        </div>
      )}
      <footer className="text-center mt-5">
        <p>&copy; 2025 Health Care Portal. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
