import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from './VideoCard';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../apiurl';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const query = searchParams.get('q');
  const navigate = useNavigate();
  const [loading,setLoading]=useState(false);
  const [loadingMore,setLoadingMore]=useState(false);

  const [page, setPage] = useState();
  

  const fetchMoreVideos = async () => {
    setLoadingMore(true);
    try {
      const response = await axios.post(`${apiUrl}/youtube/search`, { query, page });
      
        setVideos(prev => [...prev, ...response.data.items]);
        setPage(response.data.nextPageToken);
        console.log(response.data.nextPageToken);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };
  

  useEffect(() => {
    setPage(1);
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${apiUrl}/youtube/search`, {
          query,page:1
        });
  
        setVideos(response.data.items);
        setPage(response.data.nextPageToken);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching videos:', error);
      }
    };
  
    if (query) {
      fetchVideos();
    }
  }, [query]);

  const handleVideoClick = (videoId)=>{
    navigate(`/watch/${videoId}`)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /*function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
  
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
  }*/
  

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <NavBar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
          <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
           {loading? <div className='w-full text-center'>Loading ... </div> : videos.length != 0 ? <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6 text-white">
              Search Results for: "{query}"
            </h1>
            <div className="flex flex-col gap-6">
                 {videos.map((video,index) => (
                 <div
                   key={`video-${video.id.videoId || video.id}-${index}`}
                   className="flex flex-col md:flex-row gap-4 text-white cursor-pointer p-2  hover:bg-[#1f1f1f]"
                   onClick={()=>handleVideoClick(video.id.videoId)}
                 >
                   {/* Thumbnail */}
                   <img
                     src={`${video? video.snippet.thumbnails.medium.url:null}`}
                     alt={video.snippet.title}
                     className="w-full md:w-60 h-36 object-cover rounded-lg"
                   />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                       {/*formatDuration(video.contentDetails.duration)*/ video.contentDetails.duration}
                      </div>

                      <div className="flex flex-col justify-between">
                        <h2 className="text-lg font-semibold hover:text-red-500 transition">
                          {video.snippet.title}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">{video.snippet.channelTitle}</p>
                        <p className="text-sm text-gray-400 mt-1">{video.snippet.publishedAt.slice(0, 10)}</p>
                        <p className="text-sm mt-2 text-gray-300 line-clamp-2">
                          {video.snippet.description}
                        </p>
                      </div>
                  </div>
                  
              ))}
            </div>
        {loadingMore ? <div className="text-end text-gray-400 mt-8">Loading ... </div>:<div className="text-end p-4 text-gray-400 mt-8 cursor-pointer" onClick={fetchMoreVideos}>More</div>}
        </div>:<div className="text-center text-gray-400 mt-8">No videos found for "{query}"</div>
        }
      </div>

      
    </div>
  );
};

export default SearchResults; 