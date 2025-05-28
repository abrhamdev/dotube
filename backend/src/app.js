import express from 'express';
import dotenv from 'dotenv';
import youtubeRoutes from './routes/youtubeRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/youtube', youtubeRoutes);

export default app;
