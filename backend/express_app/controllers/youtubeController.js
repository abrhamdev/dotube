import { searchVideos as searchYouTube } from '../services/youtubeService.js';
import {getVideoDetails as getVideoDetailsService} from "../services/youtubeService.js"
import {getVideos as getVideosService} from "../services/youtubeService.js"
import ytdl from 'ytdl-core';
import {getChannelThumbnail as getChannelThumbnailService} from "../services/youtubeService.js"

export async function searchVideos(req, res) {
  const { query,page } = req.body;
  try {
    const videos = await searchYouTube(query,page);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
export async function getVideoDetails(req, res){
  const {id} = req.params;
  try{
    const videoDetails = await getVideoDetailsService(id);
    res.json({videoDetails});
  }catch(error){
    res.status(500).json({error:"Failed to fetch video details"});
    }
}

export async function getVideos(req, res){
  try{
    const videos = await getVideosService();
    res.json(videos);
  }catch(error){
    res.status(500).json({error:"Failed to fetch videos"});
  }
}

export async function downloadVideo(req, res) {
  const { videoUrl } = req.query;

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({
      error: 'Invalid or missing URL. Please provide a valid YouTube video URL.',
    });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
    
    if (!format || !format.url) {
      return res.status(500).json({ error: 'No suitable format found.' });
    }

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_').substring(0, 100); // sanitized + truncated title

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    ytdl(videoUrl, { format })
      .on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream video.' });
        }
      })
      .pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed. Please try again.' });
  }
}


export async function getChannelThumbnail(req, res){
  try{
    const {channelId} = req.query;
    const channel = await getChannelThumbnailService(channelId);
    res.json(channel);
  }catch(error){
    res.status(500).json({error:"Failed to fetch channel thumbnail"});
  }
}
