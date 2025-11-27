import { Plus, Bell, Filter } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-2 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="font-medium text-gray-700 mr-3">Tools</span>
          <button className="btn flex items-center bg-blue-500 text-white rounded-md px-3 py-1.5 text-sm">
            <Plus size={15} className="mr-1" />
            <span>Add new</span>
          </button>
        </div>

        <div className="ml-6 flex items-center">
          <span className="font-medium text-gray-700 mr-2">Today</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="flex items-center space-x-5">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5">
          <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="text-sm text-gray-600">Group by responsible</span>
        </div>

        <div className="flex items-center">
          <button className="flex items-center text-gray-600">
            <Filter size={16} className="mr-1" />
            <span className="text-sm">Filter</span>
          </button>
        </div>

        <div className="flex -space-x-2">
          <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">MW</div>
          <div className="h-8 w-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">SB</div>
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">MM</div>
          <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">DT</div>
        </div>

        <div className="relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </div>
        
        <div className="h-10 w-10 bg-amber-500 rounded-full text-white flex items-center justify-center font-medium ring-2 ring-white">
          G
        </div>
      </div>
    </header>
  );
};

export default Header;
