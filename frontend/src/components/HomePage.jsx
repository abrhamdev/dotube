import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import VideoCard from './VideoCard';
import axios from 'axios';
import { apiUrl } from '../../apiurl';

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [videos,setVideos] = useState([]);
  const [loading,setLoading]=useState(false);
  
  useEffect(() => {
    const fetchRandomVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/youtube/getVideos`);
        setVideos(res.data.items);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('Failed to load random videos:', err);
      }
    };

    fetchRandomVideos();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <NavBar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
      {loading ? <div className='w-full flex justify-center '>Loading...</div> :<div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Trending</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos?.length > 0 ? (
              videos.map((video,index) => (
                <VideoCard key={`${video.id}-${index}`} video={video} />
              ))
            ) : (
              <div className='w-full flex items-center '>No videos found</div>
            )} 
          </div>
        </div>}
</div>

    </div>
  );
};

export default HomePage; 