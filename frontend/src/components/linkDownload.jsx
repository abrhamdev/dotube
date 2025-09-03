import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HiDownload, HiSearch, HiX, HiCheck, HiInformationCircle, HiPlay } from 'react-icons/hi';
import { apiUrl } from '../../apiurl';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import { useSearchParams } from 'react-router-dom';

const YouTubeLoader = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [param] = useSearchParams();
  const urlParam = param?.get("url");

  // Reset messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  useEffect(()=>{
    if(urlParam != ""){
      setVideoUrl(urlParam);
    }
  },[urlParam])
  
  // Fetch video details from Flask API
  useEffect(() => {
    if (!videoUrl.trim()) {
      setVideoDetails(null);
      return;
    }

    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:7000/info?url=${videoUrl}`);
        console.log(res.data);
        setVideoDetails(res.data);
        
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to fetch video details. Please check the URL.');
        setVideoDetails(null);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchVideoDetails, 800);
    return () => clearTimeout(delay);
  }, [videoUrl]);

  // Handle download
  const handleDownload = async (formatId, formatNote, extension) => {
    if (!videoDetails) return;
    setProgress(0);
    setDownloading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const response = await fetch("http://localhost:7000/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: videoUrl,
          format: formatId,
          ext: extension,
        }),
      });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const reader = response.body.getReader();
      const contentLength = +response.headers.get("Content-Length") || 0;
  
      let receivedLength = 0;
      const chunks = [];
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        chunks.push(value);
        receivedLength += value.length;
  
        if (contentLength) {
          const percent = Math.round((receivedLength / contentLength) * 100);
          setProgress(percent);
        }
      }
      console.log("working here");
      // Combine chunks into a Blob
      const blob = new Blob(chunks, { type: extension.startsWith("mp") ? "video/mp4" : "video/webm" });
      const url = window.URL.createObjectURL(blob);
  
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${videoDetails.title || "video"}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      setSuccess(`Download of ${formatNote} completed successfully!`);
      setProgress(100);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Download failed. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const clearInput = () => {
    setVideoUrl('');
    setVideoDetails(null);
    setError(null);
    inputRef.current.focus();
  };

  // Extract available formats
  const getAvailableFormats = () => {
    if (!videoDetails || !videoDetails.formats) return { merged: [], video: [], audio: [] };
    
    const mergedFormats = [];
    const videoFormats = [];
    const audioFormats = [];
    
    videoDetails.formats.forEach(format => {
      // Progressive (video + audio in one)
      if (format.vcodec && format.vcodec !== "none" && format.acodec && format.acodec !== "none") {
        mergedFormats.push({
          id: format.format_id,
          quality: `${format.height}p`,
          note: format.format_note,
          ext: format.ext,
          size: format.filesize ? `(${(format.filesize / (1024 * 1024)).toFixed(1)} MB)` : '',
          tbr: format.tbr
        });
      }
      // Video-only
      else if (format.vcodec && format.vcodec !== "none" && format.acodec === "none") {
        videoFormats.push({
          id: format.format_id,
          quality: `${format.height}p `,
          note: format.format_note,
          ext: format.ext,
          size: format.filesize ? `(${(format.filesize / (1024 * 1024)).toFixed(1)} MB)` : '',
          tbr: format.tbr
        });
      }
      // Audio-only
      else if (format.acodec && format.acodec !== "none" && format.vcodec === "none") {
        audioFormats.push({
          id: format.format_id,
          quality: `${format.abr} kbps`,
          note: format.format_note,
          ext: format.ext,
          size: format.filesize ? `(${(format.filesize / (1024 * 1024)).toFixed(1)} MB)` : '',
          abr: format.abr
        });
      }
    });
  
    // Deduplicate & sort
    const uniqueMerged = Array.from(new Map(mergedFormats.map(item => [item.quality, item])).values())
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  
    const uniqueVideo = Array.from(new Map(videoFormats.map(item => [item.quality, item])).values())
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  
    const uniqueAudio = Array.from(new Map(audioFormats.map(item => [item.quality, item])).values())
      .sort((a, b) => parseFloat(b.abr || b.quality) - parseFloat(a.abr || a.quality));
  
    return {
      merged: uniqueMerged,
      video: uniqueVideo,
      audio: uniqueAudio
    };
  };

  const formats = getAvailableFormats();

  // Format numbers with commas
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format duration from seconds to HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-10">
      <NavBar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Download your favorite YouTube videos in high quality. Simply paste the URL below.
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-gray-800 rounded-lg shadow-md relative flex items-center mb-4">
          <HiSearch className="absolute left-3 text-gray-400" size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste YouTube URL here"
            className="w-full pl-9 pr-8 py-2 bg-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          {videoUrl && (
            <button
              onClick={clearInput}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              <HiX size={16} />
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded-md flex items-center text-sm">
            <HiInformationCircle className="text-red-400 mr-2 flex-shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-900/30 border border-green-700 rounded-md flex items-center text-sm">
            <HiCheck className="text-green-400 mr-2 flex-shrink-0" size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center my-6">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-400 text-sm">Loading video details...</p>
          </div>
        )}
        {downloading && (
          <div className="my-4 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <p>{progress}%</p>
          </div>
        )}
        
        {/* Video Details */}
        {videoDetails && !loading && (
          <div className="mt-4 bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="p-4 flex flex-col md:flex-row gap-4 items-center md:items-start">
              {/* Thumbnail */}
              <div className="md:w-1/3 flex-shrink-0 flex flex-col items-center">
                <div className="relative group">
                  <img 
                    src={videoDetails.thumbnail} 
                    alt={videoDetails.title}
                    className="w-full h-auto rounded-md max-w-xs"
                  />
                </div>
                
                {/* Video Info */}
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-center">
                  <div className="text-gray-400">Duration:</div>
                  <div>{formatDuration(videoDetails.duration)}</div>
                  
                  <div className="text-gray-400">Views:</div>
                  <div>{formatNumber(videoDetails.view_count)}</div>
                  
                  <div className="text-gray-400">Likes:</div>
                  <div>{formatNumber(videoDetails.like_count)}</div>
                  
                  <div className="text-gray-400">Uploaded:</div>
                  <div>{videoDetails.upload_date || videoDetails.release_date}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-md font-bold mb-1 line-clamp-2">{videoDetails.title}</h2>
                <p className="text-gray-400 text-xs mb-2">
                  By {videoDetails.uploader || videoDetails.channel}
                </p>
                
                <div className="mb-3 p-2 bg-gray-900 rounded-md text-xs">
                  <p className="text-gray-300 line-clamp-3">
                    {videoDetails.description}
                  </p>
                </div>

                {/* Download Options */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold mb-2 border-b border-gray-700 pb-1 text-center">Video + Audio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formats.merged.map((format, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded-md flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-xs">{format.quality}</div>
                          <div className="text-xs text-gray-400">{format.size} • {format.ext.toUpperCase()}</div>
                        </div>
                        <button
                          onClick={() => handleDownload(format.id, `${format.quality} ${format.note}`, format.ext, true)}
                          disabled={downloading}
                          className="bg-green-600 hover:bg-green-500 text-white py-1 px-2 rounded text-xs flex items-center transition-colors disabled:opacity-50"
                        >
                          <HiDownload size={12} className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/*<div className="mb-3">
                  <h3 className="text-sm font-semibold mb-2 border-b border-gray-700 pb-1 text-center">Video</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formats.video.map((format, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded-md flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-xs">{format.quality}</div>
                          <div className="text-xs text-gray-400">{format.size}-{format.ext.toUpperCase()}</div>
                        </div>
                        <button
                          onClick={() => handleDownload(format.id, `${format.quality} ${format.note}`, format.ext,true)}
                          disabled={downloading}
                          className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded text-xs flex items-center transition-colors disabled:opacity-50"
                        >
                          <HiDownload size={12} className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>*/}

                <div>
                  <h3 className="text-sm font-semibold mb-2 border-b border-gray-700 pb-1 text-center">Audio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formats.audio.map((format, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded-md flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-xs">{format.quality}</div>
                          <div className="text-xs text-gray-400">{format.size} • {format.ext.toUpperCase()}</div>
                        </div>
                        <button
                          onClick={() => handleDownload(format.id, `${format.quality} ${format.note}`, format.ext,false)}
                          disabled={downloading}
                          className="bg-purple-600 hover:bg-purple-500 text-white py-1 px-2 rounded text-xs flex items-center transition-colors disabled:opacity-50"
                        >
                          <HiDownload size={12} className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoDetails && !loading && (
          <div className="text-center py-6 text-gray-500">
            <HiSearch size={32} className="mx-auto mb-2 opacity-50" />
            <h3 className="text-md font-medium mb-1">Enter a YouTube URL</h3>
            <p className="text-sm">Paste a YouTube video link above to get started</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-xs border-t border-gray-800 mt-6">
        <p>YouTube Downloader • For personal use only</p>
      </footer>
    </div>
  );
};

export default YouTubeLoader;