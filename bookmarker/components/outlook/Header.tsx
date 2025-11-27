"use client";

import React from 'react';
import { 
  Settings, 
  HelpCircle, 
  Bell,
  Mail,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  Menu
} from 'lucide-react';

export default function OutlookHeader() {
  return (
    <header className="flex items-center h-12 bg-[#0078d4] text-white px-2">
      {/* App Drawer Button */}
      <button className="p-2 hover:bg-blue-700 rounded">
        <Menu size={20} />
      </button>
      
      {/* Logo and Title */}
      <div className="flex items-center ml-2">
        <span className="font-semibold text-lg">Bookmarker</span>
      </div>
      
      {/* App Switcher */}
      <div className="flex items-center ml-6 space-x-1">
        <AppButton icon={<Mail size={16} />} active={true} name="Bookmarks" />
        <AppButton icon={<Calendar size={16} />} active={false} name="Calendar" />
        <AppButton icon={<Users size={16} />} active={false} name="People" />
        <AppButton icon={<FileText size={16} />} active={false} name="Files" />
        <AppButton icon={<CheckSquare size={16} />} active={false} name="To Do" />
      </div>
      
      {/* Spacer */}
      <div className="flex-grow"></div>
      
      {/* Right-side actions */}
      <div className="flex items-center space-x-1">
        <button className="p-2 hover:bg-blue-700 rounded">
          <Settings size={18} />
        </button>
        <button className="p-2 hover:bg-blue-700 rounded">
          <HelpCircle size={18} />
        </button>
        <button className="p-2 hover:bg-blue-700 rounded">
          <Bell size={18} />
        </button>
        
        {/* Avatar - replace with actual profile image or initials */}
        <button className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center ml-2 overflow-hidden">
          <span className="font-medium text-sm">US</span>
        </button>
      </div>
    </header>
  );
}

// App Switcher Button Component
function AppButton({ 
  icon, 
  active, 
  name 
}: { 
  icon: React.ReactNode; 
  active: boolean; 
  name: string;
}) {
  return (
    <button 
      className={`flex flex-col items-center py-1 px-2 rounded ${
        active ? 'bg-blue-800' : 'hover:bg-blue-700'
      }`}
      title={name}
    >
      {icon}
    </button>
  );
}
