"use client";

import React, { useState } from 'react';
// Import components from local index file
import { SideNavigation, BookmarkList } from '.';

export default function RaindropLayout() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const handleSelectItem = (id: string) => {
    if (selectMode) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedBookmark(id);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Side Navigation - From the very top */}
      <SideNavigation 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        className="flex-shrink-0 h-full"
      />
      
      {/* Main Content Column */}
      <div className="flex flex-col flex-1 bg-[#F6F7F8]">
        {/* Header - Only in main content area */}
        <header className="h-12 border-b border-[#E8E8E8] flex items-center px-3 bg-white">
          {/* Search input */}
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#F2F2F2] border-none pl-10 pr-3 py-1.5 w-full rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0880FF] focus:bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-[#0880FF] flex items-center justify-center text-white font-bold text-sm">
              US
            </button>
          </div>
        </header>
        
        {/* Toolbar - Only in main content area */}
        <div className="flex items-center px-3 py-2 text-sm text-gray-500 border-b border-[#E8E8E8] bg-white">
          <span className="text-[#606060]">2 of 10</span>
          <div className="flex items-center ml-4">
            <input 
              type="checkbox" 
              className="mr-2 h-4 w-4 accent-[#0880FF]" 
              onChange={() => setSelectMode(!selectMode)} 
            />
            <span className="text-[#606060]">Select all</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="flex items-center text-[#606060] hover:text-[#0880FF]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>To favorite</span>
            </button>
            <button className="flex items-center text-[#606060] hover:text-[#0880FF]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
              </svg>
              <span>Add tags</span>
            </button>
            <button className="flex items-center text-[#606060] hover:text-[#0880FF]">
              <span>More</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      
        {/* Bookmark List - Takes remaining space */}
        <BookmarkList
          categoryId={selectedCategory}
          selectedBookmarkId={selectedBookmark}
          onSelectBookmark={handleSelectItem}
          selectMode={selectMode}
          selectedItems={selectedItems}
          className="flex-1 overflow-auto"
        />
      </div>
    </div>
  );
}
