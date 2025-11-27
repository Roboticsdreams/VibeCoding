"use client";

import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Star, 
  Edit, 
  Trash, 
  Share2,
  Calendar,
  Globe
} from 'lucide-react';
import Image from 'next/image';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  screenshot?: string;
  category?: string;
  notes?: string;
}

interface BookmarkDetailProps {
  bookmarkId: string;
  className?: string;
}

export default function BookmarkDetail({ bookmarkId, className = '' }: BookmarkDetailProps) {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch bookmark details
    setLoading(true);
    
    // In a real app, fetch the bookmark by ID from your API
    setTimeout(() => {
      setBookmark({
        id: bookmarkId,
        url: 'https://react.dev',
        title: 'React Documentation',
        description: 'The library for web and native user interfaces. React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video. Then combine them into entire screens, pages, and apps.',
        favicon: 'https://react.dev/favicon.ico',
        isFavorite: true,
        createdAt: '2023-11-15T10:30:00Z',
        updatedAt: '2023-11-15T10:30:00Z',
        tags: ['development', 'frontend', 'javascript', 'react', 'ui', 'library'],
        screenshot: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop',
        category: 'Work',
        notes: 'This is the official React documentation. Great reference for learning React fundamentals and advanced concepts. Recently updated for React 18 with new hooks and features.'
      });
      setLoading(false);
    }, 500);
  }, [bookmarkId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className={`${className} bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800`}>
        <div className="p-6 animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className={`${className} bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex items-center justify-center`}>
        <div className="text-center text-gray-500 p-8">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="text-xl font-medium mb-2">Select a bookmark</h3>
          <p>Choose a bookmark from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto ${className} bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800`}>
      {/* Header Area */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 px-6 py-4">
        {/* Top Line - Title with Favicon */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Favicon */}
            {bookmark.favicon && (
              <div className="relative w-6 h-6 rounded overflow-hidden">
                <Image
                  src={bookmark.favicon}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h1 className="text-xl font-semibold">{bookmark.title}</h1>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Star size={20} className={bookmark.isFavorite ? "fill-yellow-500 text-yellow-500" : ""} />
            </button>
          </div>
        </div>
        
        {/* Metadata Line */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="font-medium text-gray-700 dark:text-gray-300 mr-3">{bookmark.category}</span>
          <span>{formatDate(bookmark.createdAt)}</span>
        </div>

        {/* Button Toolbar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            <ExternalLink size={14} className="mr-1.5" />
            Open Website
          </a>
          <button className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Edit size={14} className="mr-1.5" />
            Edit
          </button>
          <button className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Share2 size={14} className="mr-1.5" />
            Share
          </button>
          <button className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400">
            <Trash size={14} className="mr-1.5" />
            Delete
          </button>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {bookmark.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-md text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {/* Website Preview Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Globe size={14} className="mr-2" />
            Website Preview
          </h3>
          
          {/* URL display with copy button */}
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-2 mb-4">
            <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate">
              {bookmark.url}
            </span>
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          
          {/* Screenshot */}
          {bookmark.screenshot && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="relative w-full h-64">
                <Image
                  src={bookmark.screenshot}
                  alt="Screenshot of website"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Description
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <p>{bookmark.description}</p>
          </div>
        </div>

        {/* Notes Section */}
        {bookmark.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Your Notes
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <p>{bookmark.notes}</p>
            </div>
          </div>
        )}
        
        {/* Metadata Details */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Calendar size={12} className="mr-2" />
            <span>Added on {new Date(bookmark.createdAt).toLocaleDateString()} at {new Date(bookmark.createdAt).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center mb-2">
            <Calendar size={12} className="mr-2" />
            <span>Last modified on {new Date(bookmark.updatedAt).toLocaleDateString()} at {new Date(bookmark.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
