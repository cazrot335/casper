'use client';
import { useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function StudyHubPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('Uploading syllabus...');
    const res = await fetch(`${backendUrl}/upload-syllabus`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setJobId(data.job_id);
      setResultUrl(data.result_url || null);
      setStatus(`Job ${data.job_id} created. Status: ${data.status}`);
    } else {
      setStatus(`Error: ${data.error || 'Upload failed'}`);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: 600, width: '100%', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>DePIN StudyHub</h1>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          style={{ marginTop: 12, padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 4 }}
        >
          Upload & Create Job
        </button>
        {status && <p style={{ marginTop: 16 }}>{status}</p>}
        {jobId !== null && (
          <p>Job ID: {jobId}</p>
        )}
        {resultUrl && (
          <a href={resultUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
            Download generated questions
          </a>
        )}
      </div>
    </main>
  );
}
