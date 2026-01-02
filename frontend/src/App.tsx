'use client';

import { useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function StudyHubPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [syllabusHash, setSyllabusHash] = useState<string | null>(null);
  const [deployHash, setDeployHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a syllabus file first.');
      return;
    }

    try {
      setLoading(true);
      setStatus('Uploading syllabus and creating job...');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/upload-syllabus`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`Error: ${data.error || 'Upload failed'}`);
        return;
      }

      setJobId(typeof data.job_id === 'number' ? data.job_id : null);
      setResultUrl(data.result_url || null);
      setSyllabusHash(data.syllabus_hash || null);
      setDeployHash(data.deploy_hash || null);
      setStatus(`Job ${data.job_id} created. Status: ${data.status}`);
    } catch (err) {
      console.error(err);
      setStatus('Unexpected error while uploading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          padding: 24,
          border: '1px solid #1f2937',
          borderRadius: 8,
          background: '#020617',
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>DePIN StudyHub</h1>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: 'block', marginBottom: 8 }}
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#22c55e',
            color: '#020617',
            borderRadius: 4,
            border: 'none',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            opacity: loading || !file ? 0.6 : 1,
          }}
        >
          {loading ? 'Processing...' : 'Upload & Create Job'}
        </button>

        {status && <p style={{ marginTop: 16 }}>{status}</p>}

        {jobId !== null && (
          <p style={{ marginTop: 8 }}>Job ID: {jobId}</p>
        )}

        {syllabusHash && (
          <p style={{ marginTop: 4, fontSize: 12, wordBreak: 'break-all' }}>
            <strong>Syllabus hash:</strong> {syllabusHash}
          </p>
        )}

        {deployHash && (
          <p style={{ marginTop: 4, fontSize: 12, wordBreak: 'break-all' }}>
            <strong>Planned Casper deploy hash:</strong> {deployHash}
          </p>
        )}

        {resultUrl && (
          <a
            href={resultUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#22c55e', display: 'inline-block', marginTop: 12 }}
          >
            Download generated questions
          </a>
        )}
      </div>
    </main>
  );
}
