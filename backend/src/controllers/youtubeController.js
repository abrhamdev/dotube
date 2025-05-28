import { searchVideos as searchYouTube } from '../services/youtubeservice.js';
import {getVideoDetails as getVideoDetailsService} from "../services/youtubeservice.js"
import {getVideos as getVideosService} from "../services/youtubeservice.js"
import ytdl from '@distube/ytdl-core';
import {getChannelThumbnail as getChannelThumbnailService} from "../services/youtubeservice.js"

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

export async function downloadVideo(req, res){
  const { videoUrl } = req.query;
  
  if (!ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: 'Invalid URL please copy the link download it using url feature!' });
  }
  
  try {
    const info = await ytdl.getBasicInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(videoUrl, { quality: 'highestvideo' }).pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Download failed' });
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
