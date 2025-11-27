"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bookmark as BookmarkType, bookmarks as mockBookmarks } from '../../data/mock/bookmarks';
import type { Category, CategorySection } from '../../data/mock/categories';
import { categories as categorySections } from '../../data/mock/categories';

// Using the Bookmark type from our mock data but with a local interface for props

interface BookmarkListProps {
  categoryId: string | null;
  selectedBookmarkId: string | null;
  onSelectBookmark: (id: string) => void;
  selectMode?: boolean;
  selectedItems?: string[];
  className?: string;
}

const findCategoryNode = (sections: CategorySection[], targetId: string): Category | undefined => {
  for (const section of sections) {
    const stack = [...section.items];
    while (stack.length) {
      const node = stack.pop();
      if (!node) {
        continue;
      }
      if (node.id === targetId) {
        return node;
      }
      if (node.subcategories) {
        stack.push(...node.subcategories);
      }
    }
  }
  return undefined;
};

const collectDescendantIds = (node: Category | undefined, acc: Set<string>) => {
  if (!node) {
    return;
  }
  if (node.subcategories) {
    node.subcategories.forEach(child => {
      acc.add(child.id);
      collectDescendantIds(child, acc);
    });
  }
};

export default function BookmarkList({ 
  categoryId, 
  onSelectBookmark,
  selectedItems = [],
  className = ''
}: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  
  // Fetch bookmarks from mock data based on category
  useEffect(() => {
    // In a real app, we'd fetch these from an API
    if (categoryId === 'all') {
      // When 'all' is selected, show all 36 bookmarks
      setBookmarks(mockBookmarks);
    } else if (categoryId === 'unsorted') {
      // For unsorted, include both explicitly marked 'unsorted' and those without a category
      const filtered = mockBookmarks.filter(bookmark => 
        bookmark.category === 'unsorted' || !bookmark.category
      );
      setBookmarks(filtered);
    } else if (categoryId) {
      const allowedIds = new Set<string>([categoryId]);
      const targetNode = findCategoryNode(categorySections, categoryId);
      collectDescendantIds(targetNode, allowedIds);

      const filtered = mockBookmarks.filter(bookmark => 
        allowedIds.has(bookmark.category || '') ||
        (bookmark.subcategory && allowedIds.has(bookmark.subcategory))
      );

      setBookmarks(filtered);
    } else {
      // If no category is selected, show all bookmarks
      setBookmarks(mockBookmarks);
    }
    // For 'all', verify we're showing all 36 bookmarks
    if (categoryId === 'all') {
      console.log(`All bookmarks count: ${mockBookmarks.length}`);
    }
  }, [categoryId]);

  // Log bookmarks count whenever it changes
  useEffect(() => {
    console.log(`Selected category: ${categoryId}, showing ${bookmarks.length} bookmarks`);
  }, [bookmarks.length, categoryId]);
  
  // We'll use direct dates in our UI since that's what the image shows

  return (
    <div className={`${className}`}>
      {/* Bookmark List */}
      <div className="overflow-y-auto h-full">
        {bookmarks.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
            <div className="text-5xl mb-4">📚</div>
            <div className="font-medium">No bookmarks found</div>
            <p className="text-sm mt-2">Try changing your filter or add some bookmarks</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bookmarks.map(bookmark => (
              <li 
                key={bookmark.id}
                className="border-b border-gray-200"
              >
                <div className="flex items-center py-4 px-4" style={{ height: '88px' }}>
                  {/* Selection checkbox */}
                  <div className="mr-4">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(bookmark.id)}
                      onChange={() => onSelectBookmark(bookmark.id)} 
                      className="h-4 w-4"
                    />
                  </div>
                                    {/* Thumbnail or icon */}
                  <div className="flex-shrink-0 mr-4">
                    {bookmark.thumbnail ? (
                      <div className="w-16 h-16 relative overflow-hidden rounded border border-gray-200">
                        <Image 
                          src={bookmark.thumbnail}
                          alt="" 
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : bookmark.favicon ? (
                      <div className="w-16 h-16 bg-[#F8F8F8] flex items-center justify-center rounded border border-gray-200">
                        <div className="relative w-6 h-6 overflow-hidden">
                          <Image 
                            src={bookmark.favicon || '/favicon.ico'} 
                            alt=""
                            width={24}
                            height={24}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#F8F8F8] flex items-center justify-center rounded border border-gray-200">
                        <span className="text-xl text-gray-400">{bookmark.title.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-base font-medium text-gray-800 line-clamp-1">{bookmark.title}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1 opacity-90">
                      {bookmark.description}
                    </p>
                    
                    {/* Source */}
                    <div className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                      <span>{bookmark.source}</span>
                      {bookmark.category && (
                        <span className="bg-gray-100 text-gray-600 rounded-sm px-1.5 py-0.5 text-[10px]">
                          {bookmark.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
