import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

type JobStatus = 'pending' | 'completed';

interface Job {
  id: number;
  syllabusHash: string;
  status: JobStatus;
  resultUrl?: string;
}

let jobCounter = 0;
const jobs = new Map<number, Job>();

// POST /upload-syllabus -> returns syllabus_hash and job_id (mock submit_job)
app.post(
  '/upload-syllabus',
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const syllabusHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Mock StudyHub::submit_job: create new job_id
    const jobId = jobCounter++;
    const job: Job = {
      id: jobId,
      syllabusHash,
      status: 'pending',
    };
    jobs.set(jobId, job);

    // For now, immediately mark as completed with dummy URL
    job.status = 'completed';
    job.resultUrl = `https://example.com/mock-questions/${jobId}.pdf`;

    res.json({
      syllabus_hash: syllabusHash,
      job_id: jobId,
      status: job.status,
      result_url: job.resultUrl,
    });
  }
);

// GET /jobs/:id -> status + result
app.get('/jobs/:id', (req, res) => {
  const id = Number(req.params.id);
  const job = jobs.get(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
