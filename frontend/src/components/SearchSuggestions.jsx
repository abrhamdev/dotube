import React from 'react';
import { HiSearch } from 'react-icons/hi';

const SearchSuggestions = ({ suggestions, onSuggestionClick, searchQuery }) => {
  return (
    <div className="absolute top-full left-0 right-0 bg-[#0f0f0f] border border-gray-700 rounded-b-xl shadow-lg z-50">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="flex items-center px-4 py-2 hover:bg-gray-800 cursor-pointer"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <HiSearch className="text-gray-400 mr-4" size={20} />
          <span className="text-white">{suggestion}</span>
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions; 