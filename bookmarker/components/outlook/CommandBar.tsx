"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash, 
  Edit, 
  Star,
  RefreshCw,
  Archive,
  Clock,
  Tag,
  ExternalLink,
  Filter,
  List,
  Grid, 
  PanelRightClose, 
  PanelRightOpen
} from 'lucide-react';

interface CommandBarProps {
  onToggleDetailPane: () => void;
  isDetailOpen: boolean;
}

export default function CommandBar({ onToggleDetailPane, isDetailOpen }: CommandBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Top Bar - Search */}
      <div className="flex items-center justify-between p-2 gap-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center w-full max-w-md relative">
          <div className="absolute left-3 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 
              bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Filter size={18} />
          </button>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} className={viewMode === 'list' ? 'text-blue-600' : ''} />
            </button>
            <button 
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} className={viewMode === 'grid' ? 'text-blue-600' : ''} />
            </button>
          </div>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onToggleDetailPane}
          >
            {isDetailOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </div>

      {/* Command Ribbon - Outlook style with grouping */}
      <div className="flex items-center px-1 py-1 gap-1 overflow-x-auto bg-gray-50 dark:bg-gray-800/50">
        {/* New group */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <div className="flex justify-center mb-1">
            <button className="px-3 py-1.5 flex items-center gap-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} />
              <span className="font-medium">New</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500">Create</div>
        </div>
        
        {/* Actions group */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <div className="flex items-center gap-1">
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Edit size={16} />
              <span>Edit</span>
            </button>
            
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Trash size={16} />
              <span>Delete</span>
            </button>
            
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Archive size={16} />
              <span>Archive</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500">Actions</div>
        </div>
        
        {/* Bookmark actions */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
          <div className="flex items-center gap-1">
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Star size={16} className="text-yellow-500" />
              <span>Favorite</span>
            </button>
            
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Tag size={16} />
              <span>Tag</span>
            </button>
            
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <ExternalLink size={16} />
              <span>Open</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500">Organize</div>
        </div>
        
        {/* Refresh */}
        <div className="flex flex-col pr-2 mr-1">
          <div className="flex items-center gap-1">
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            <button className="p-1.5 flex flex-col items-center rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-700 w-16">
              <Clock size={16} />
              <span>History</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500">Refresh</div>
        </div>
      </div>
    </div>
  );
}
