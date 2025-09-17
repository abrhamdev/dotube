import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiThumbUp, HiThumbDown,HiSearch, HiShare, HiDotsHorizontal, HiDownload } from 'react-icons/hi';
import VideoCard from './VideoCard';
import axios from 'axios';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import { apiUrl } from '../../apiurl';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [video, setVideo] =useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [channel, setChannel] = useState(null);
  const shortDescription = video ? video.snippet.description.split("\n").slice(0, 1).join("\n") : "";

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    // Example API call (replace with your own backend or YouTube API)
    const fetchVideoDetails = async () => {
      const res = await axios.get(`${apiUrl}/youtube/videos/${videoId}`);
      setVideo(res.data.videoDetails);
      //setRelatedVideos(data.related);
    };
  
    fetchVideoDetails();
    
  }, [videoId]);

  useEffect(() => {
    const fetchChannelDetails = async () => {
      const res = await axios.get(`${apiUrl}/youtube/getChannelThumbnail?channelId=${video?video.snippet.channelId:null}`);
      setChannel(res.data);
      //setRelatedVideos(data.related);
    };
  
    fetchChannelDetails();
    
  }, [video]);

  

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const handleDownload = async () => {
    try {
      const response = await axios.get(`${apiUrl}/youtube/download?videoUrl=https://www.youtube.com/watch?v=${video.id}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download progress: ${percent}%`);
        },
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${video.title}.mp4`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };


  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      
        <NavBar onMenuClick={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} />
        
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
            <button 
          className="p-2 hover:bg-gray-800 rounded-full mr-4"
          onClick={() => navigate(-1)}
        >
          <HiArrowLeft size={24} />
        </button>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="80%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
          <div className="mt-4">
         <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
           <h1 className="text-xl font-bold text-white">{video ? video.snippet.title : <Skeleton width={200} height={24} />}</h1>
         </SkeletonTheme>
         <div className="flex items-center justify-between mt-2">
           <div className="flex items-center">
             <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
               <span className="text-gray-400 text-sm">{video ? Number(video.statistics.viewCount).toLocaleString() : <Skeleton width={100} height={20} />} Views</span>
             </SkeletonTheme>
             <span className="mx-2 text-gray-400">•</span>
             <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
               <span className="text-gray-400 text-sm">{video ? new Date(video.snippet.publishedAt).toLocaleDateString() : <Skeleton width={120} height={16} />}</span>
             </SkeletonTheme>
           </div>
           <div className="flex items-center space-x-4">
             <button
               className={`flex items-center cursor-pointer space-x-2 bg-gray-800 px-4 py-2 rounded-full ${
                 isLiked ? 'bg-gray-700' : 'hover:bg-gray-800'
               }`}
               onClick={handleLike}
             >
               <HiThumbUp size={20} />
               <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
                 <span className="text-sm">{video ? Number(video.statistics.likeCount).toLocaleString() : <Skeleton width={64} height={16} />}</span>
               </SkeletonTheme>
             </button>
             <button
               className={`flex items-center cursor-pointer space-x-2 px-4 bg-gray-800  py-2 rounded-full ${
                 isDisliked ? 'bg-gray-700' : 'hover:bg-gray-800'
               }`}
               onClick={handleDislike}
             >
               <HiThumbDown size={20} />
               <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
                 <span className="text-sm">{video ? video.statistics.dislikeCount : <Skeleton width={64} height={16} />}</span>
               </SkeletonTheme>
             </button>

             <div>
               <Link to={`/linkdownload?url=https://www.youtube.com/watch?v=${videoId}`} className='flex hover:text-blue-800 transition-all duration-300'>
                 <HiDownload size={20} /><p className="text-sm">Download</p>
               </Link>
             </div>
           </div>
         </div>

    <div className="flex items-center justify-between mt-4 p-4 bg-[#1f1f1f] rounded-lg">
      <div className="flex items-center">
        <img
          src={`${channel ? channel[0].snippet.thumbnails.default.url : null}`}
            alt={video ? video.snippet.channelTitle : ""}
            className="w-10 h-10 rounded-full mr-4 skeleton-loader"
        />
        <div>
          <SkeletonTheme baseColor="#2d2d2d" highlightColor="#3d3d3d">
            <h3 className="font-medium text-white">{video ? video.snippet.channelTitle : <Skeleton width={160} height={20} />}</h3>
          </SkeletonTheme>
        </div>
      </div>
    </div>

    <div className="text-white my-5 bg-gray-800 p-4 rounded-lg">
      <p className="text-sm whitespace-pre-line break-words overflow-hidden">
        {isExpanded ? video.snippet.description : shortDescription}
      </p>

      {video && video.snippet.description.length > 0 && (
        <button
          className="text-blue-500 mt-2 text-sm"
          onClick={toggleDescription}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
    </div>

   </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default VideoPlayer; 









{/*
     <div className="mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Comments</h3>
      {video.comments.map((comment) => (
        <div key={comment.id} className="flex mb-6">
          <img
            src={comment.avatar}
            alt={comment.author}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="font-medium text-white">{comment.author}</h4>
              <span className="ml-2 text-sm text-gray-400">
                {comment.timestamp}
              </span>
            </div>
            <p className="text-white mt-1">{comment.text}</p>
            <div className="flex items-center mt-2">
              <button className="flex items-center text-gray-400 hover:text-white">
                <HiThumbUp size={16} className="mr-1" />
                <span className="text-sm">{comment.likes}</span>
              </button>
              <button className="ml-4 text-gray-400 hover:text-white">
                Reply
              </button>
            </div>
            {comment.replies.length > 0 && (
              <div className="ml-4 mt-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex mb-4">
                    <img
                      src={reply.avatar}
                      alt={reply.author}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-white">
                          {reply.author}
                        </h4>
                        <span className="ml-2 text-sm text-gray-400">
                          {reply.timestamp}
                        </span>
                      </div>
                      <p className="text-white mt-1">{reply.text}</p>
                      <div className="flex items-center mt-2">
                        <button className="flex items-center text-gray-400 hover:text-white">
                          <HiThumbUp size={16} className="mr-1" />
                          <span className="text-sm">{reply.likes}</span>
                        </button>
                        <button className="ml-4 text-gray-400 hover:text-white">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

<div className="w-full lg:w-80 space-y-2">
  <h3 className="text-lg font-bold text-white mb-2">Related videos</h3>
  {relatedVideos.map((video) => (
    <div key={video.id} className="flex gap-2 hover:bg-[#1f1f1f] p-1 rounded-lg">
      <div className="w-40 flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm line-clamp-2">
          {video.title}
        </h4>
        <p className="text-gray-400 text-xs mt-1">
          {video.channel}
        </p>
        <div className="flex items-center text-gray-400 text-xs mt-1">
          <span>{video.views}</span>
          <span className="mx-1">•</span>
          <span>{video.timestamp}</span>
        </div>
      </div>
    </div>
  ))}
    */}