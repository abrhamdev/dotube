import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import VideoPlayer from './components/VideoPlayer';
import SearchResults from './components/SearchResults';
import YouTubeLoader from './components/linkDownload';

function App() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Router>
        <div className="flex min-h-screen">
          <main className="flex-1 min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:videoId" element={<VideoPlayer />} />
              <Route path="/search" element={<SearchResults />} />YouTubeLoader
              <Route path="/linkdownload" element={<YouTubeLoader/>} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
