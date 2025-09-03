import youtube from '../config/youtubeConfig.js';
import ytSearch from 'yt-search';
import  getChannelInfo  from 'yt-channel-info';

export async function searchVideos(query,page) {
  try{
    const response = await youtube.search.list({
    part: 'snippet,contentDetails',
    q: query,
    maxResults: 10,
    type: 'video',
    pageToken: page,
  });

  return {
    items: response.data.items,
    nextPageToken: response.data.nextPageToken,
  };

}catch(error){
    const result = await ytSearch(query);
    const videos = result.videos.slice((page - 1) * 10, page * 10);

  const formattedResponse = {
    items:videos.map(video => ({
      kind: 'youtube#searchResult',
      etag: '', // Optional: Generate if needed
      id: {
        kind: 'youtube#video',
        videoId: video.videoId,
      },
      snippet: {
        publishedAt: video.ago, // yt-search doesn't provide full timestamp
        channelId: video.author.url.split('/').pop(), // crude parsing
        title: video.title,
        description: video.description,
        thumbnails: {
          default: { url: video.thumbnail },
          medium: { url: video.thumbnail },
          high: { url: video.thumbnail },
        },
        channelTitle: video.author.name,
        liveBroadcastContent: video.live ? 'live' : 'none',
        publishTime: '', // yt-search doesn't provide exact time
      },
      contentDetails: {
        duration: video.timestamp,
      },
      
    })),
    nextPageToken: page + 1,
  };

  return formattedResponse;
}}

export async function getVideoDetails(id){
    try{
        const video = await youtube.videos.list({
            part: 'snippet,statistics,contentDetails',
            id: id,
        });
        return video.data.items[0];
    }catch(error){

      const result = await ytSearch({ id });
       console.log(id);
      if (!result || !result.video) {
        throw new Error("Video not found");
      }
  
      const video = result.video;
  
      const formattedResponse = {
        etag: '',
        id: {
          kind: 'youtube#video',
          videoId: video.videoId,
        },
        snippet: {
          publishedAt: video.ago,
          channelId: video.author.url.split('/').pop(),
          title: video.title,
          description: video.description,
          thumbnails: {
            default: { url: video.thumbnail },
            medium: { url: video.thumbnail },
            high: { url: video.thumbnail },
          },
          channelTitle: video.author.name,
          liveBroadcastContent: video.live ? 'live' : 'none',
          publishTime: '',
        },
        contentDetails: {
          duration: video.timestamp,
        },
        statistics: {
          viewCount: video.views,
        },
      };
     console.log(formattedResponse);
      return formattedResponse;
  
    }
}

export async function getVideos(){
  try {
    const response = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: 12,
      regionCode: 'US',
    });
  
    const formattedResponse = {
      items: response.data.items.map(video => ({
        etag: video.etag || '',
        id: {
          kind: 'youtube#video',
          videoId: video.id,
        },
        snippet: {
          publishedAt: video.snippet.publishedAt,
          channelId: video.snippet.channelId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnails: {
            default: video.snippet.thumbnails.default,
            medium: video.snippet.thumbnails.medium,
            high: video.snippet.thumbnails.high,
          },
          channelTitle: video.snippet.channelTitle,
          liveBroadcastContent: video.snippet.liveBroadcastContent || 'none',
          publishTime: video.snippet.publishedAt,
        },
        contentDetails: {
          duration: video.contentDetails?.duration || '',
        },
        statistics: {
          viewCount: video.statistics?.viewCount || '0',
        },
      })),
      // nextPageToken: response.data.nextPageToken || null,
    };
  
    return formattedResponse;
  
  } catch (error) {
    const fallbackQuery = 'trending';
    const result = await ytSearch(fallbackQuery);
  
    const formattedResponse = {
      items: result.videos.slice(0, 30).map(video => ({
        etag: '',
        id: {
          kind: 'youtube#video',
          videoId: video.videoId,
        },
        snippet: {
          publishedAt: video.ago,
          channelId: video.author.url.split('/').pop(),
          title: video.title,
          description: video.description,
          thumbnails: {
            default: { url: video.thumbnail },
            medium: { url: video.thumbnail },
            high: { url: video.thumbnail },
          },
          channelTitle: video.author.name,
          liveBroadcastContent: video.live ? 'live' : 'none',
          publishTime: '',
        },
        contentDetails: {
          duration: video.timestamp,
        },
        statistics: {
          viewCount: video.views,
        },
      })),
      // nextPageToken: page + 1,
    };
  
    return formattedResponse;
  }
    }

export async function getChannelThumbnail(channelId){
    try{
        const channel = await youtube.channels.list({
            part: 'snippet',
            id: channelId,
        });
        return channel.data.items;
    }catch(error){
      const channel = await getChannelInfo({ channelId });

      const formattedChannel = {
        id: channelId,
        name: channel.author,
        thumbnail: channel.authorThumbnails?.[0]?.url || '',
        subscribers: channel.subCountText,
        videoCount: channel.videoCount,
        description: channel.description,
        banner: channel.banner?.[0]?.url || '',
        country: channel.country,
      };
  
      return formattedChannel;
    }
}

