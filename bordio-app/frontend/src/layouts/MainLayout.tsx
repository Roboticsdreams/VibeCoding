import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto bg-gray-50">
            <Outlet />
          </main>
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Waiting list</h2>
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">8</span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              {/* Waiting list items */}
              <div className="bg-green-100 border-l-4 border-green-500 rounded p-3 mb-3">
                <div className="text-sm font-medium">Write an email announcement for the new website</div>
                <div className="text-xs text-gray-500 mt-1">Employee Training</div>
                <div className="text-xs font-medium mt-1">1:00h</div>
              </div>
              
              <div className="bg-blue-100 border-l-4 border-blue-500 rounded p-3 mb-3">
                <div className="text-sm font-medium">Publish article: Marketing trends this year</div>
                <div className="text-xs text-gray-500 mt-1">Blog Post Writing</div>
                <div className="text-xs font-medium mt-1">2:00h</div>
              </div>
              
              <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded p-3 mb-3">
                <div className="text-sm font-medium">Send email campaign to all employees introducing new website</div>
                <div className="text-xs text-gray-500 mt-1">Marketing</div>
                <div className="text-xs font-medium mt-1">0:45h</div>
              </div>
              
              <div className="bg-purple-100 border-l-4 border-purple-500 rounded p-3 mb-3">
                <div className="text-sm font-medium">Check article: Marketing trends this year</div>
                <div className="text-xs text-gray-500 mt-1">Blog Post Writing</div>
                <div className="text-xs font-medium mt-1">0:30h</div>
              </div>
              
              <div className="bg-pink-100 border-l-4 border-pink-500 rounded p-3 mb-3">
                <div className="text-sm font-medium">Upload all completed translations into the admin panel</div>
                <div className="text-xs text-gray-500 mt-1">Website Translation</div>
                <div className="text-xs font-medium mt-1">1:00h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
