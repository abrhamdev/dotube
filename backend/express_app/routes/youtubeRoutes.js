import express from 'express';
import { searchVideos } from '../controllers/youtubeController.js';
import {getVideoDetails} from '../controllers/youtubeController.js';
import {getVideos} from '../controllers/youtubeController.js';
import {downloadVideo} from '../controllers/youtubeController.js';
import {getChannelThumbnail} from '../controllers/youtubeController.js';
const router = express.Router();

router.post('/search', searchVideos);
router.get('/videos/:id', getVideoDetails);
router.get('/getVideos', getVideos);
router.get('/download', downloadVideo);
router.get('/getChannelThumbnail', getChannelThumbnail);

export default router;
