'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch, placeholder = "정류장명을 입력하세요 (예: 강남역, 홍대입구역)" }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">정류장 검색</h2>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 font-medium"
          >
            검색
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
