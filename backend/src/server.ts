import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import { submitJobOnChain } from './casperClient';  // <- remove .js

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
  deployHash?: string;
}

let jobCounter = 0;
const jobs = new Map<number, Job>();

app.post(
  '/upload-syllabus',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const buffer = req.file.buffer;
      const syllabusHash = crypto.createHash('sha256').update(buffer).digest('hex');

      const jobId = jobCounter++;
      const job: Job = {
        id: jobId,
        syllabusHash,
        status: 'pending',
      };
      jobs.set(jobId, job);

      // Call Casper StudyHub::submit_job on livenet
      let deployHash: string | undefined;
      try {
        deployHash = await submitJobOnChain(syllabusHash, 1);
        job.deployHash = deployHash;
      } catch (e) {
        console.error('Casper submit_job failed:', e);
      }

      // For now, immediately complete with dummy URL
      job.status = 'completed';
      job.resultUrl = `https://example.com/mock-questions/${jobId}.pdf`;

      res.json({
        syllabus_hash: syllabusHash,
        job_id: jobId,
        deploy_hash: deployHash,
        status: job.status,
        result_url: job.resultUrl,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'upload-syllabus failed' });
    }
  }
);

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
