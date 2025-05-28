import React, { useState, useRef, useEffect } from 'react';
import { HiMenu, HiSearch, HiMicrophone, HiVideoCamera, HiBell, HiUserCircle, HiFolderDownload } from 'react-icons/hi';
import SearchSuggestions from './SearchSuggestions';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sample search suggestions data
  const sampleSuggestions = [
    'react tutorial',
    'react hooks',
    'react router',
    'react native',
    'react vs angular',
    'react state management',
    'react context api',
    'react performance',
    'react best practices',
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      // Filter suggestions based on input
      const filtered = sampleSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 z-50">
      <div className="flex items-center">
        <button 
          className="p-2 hover:bg-gray-800 rounded-full"
          onClick={onMenuClick}
        >
          <HiMenu size={24} />
        </button>
        <div className="flex items-center ml-4">
          <HiFolderDownload size={24} />
          <span className="text-2xl font-bold text-red-600">Do</span>
          <span className="text-2xl font-bold">Tube</span>
        </div>
      </div>

      <div className="flex items-center flex-1 max-w-2xl mx-8" ref={searchRef}>
        <div className="flex items-center flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full bg-[#121212] border border-gray-700 rounded-l-full px-4 py-1.5 focus:outline-none focus:border-blue-500"
          />
          <button 
            className="bg-gray-700 px-6 py-2 rounded-r-full hover:bg-gray-600"
            onClick={() => handleSearch(searchQuery)}
          >
            <HiSearch size={20} />
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <SearchSuggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              searchQuery={searchQuery}
            />
          )}
        </div>
        <button className="ml-4 p-2 hover:bg-gray-800 rounded-full">
          <HiMicrophone size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <HiVideoCamera size={20} />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <HiBell size={20} />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <HiUserCircle size={20} />
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 