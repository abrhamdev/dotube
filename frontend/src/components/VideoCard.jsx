import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  return (
    <Link to={`/watch/${video.id.videoId}`} className="block">
      <div className="bg-[#0f0f0f] rounded-lg overflow-hidden hover:bg-[#1f1f1f] transition-colors duration-200">
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={video.snippet.thumbnails.high.url}
            alt={video.snippet.title}
            className="w-full aspect-video object-cover"
          />
        </div>

        {/* Video Info */}
        <div className="p-3">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
            {video.snippet.title}
          </h3>
          <p className="text-gray-400 text-xs">
            {video.snippet.channelTitle}
          </p>
          <div className="flex items-center text-gray-400 text-xs mt-1">
            <span>{video.statistics.viewCount} views</span>
            <span className="mx-1">•</span>
            <span>{video.snippet.publishedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard; 