import { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import ProjectCard from '../../components/Project/ProjectCard';
import { activeProjects, closedProjects } from '../../mock-data/projects';

const Dashboard = () => {
  const [showActive, setShowActive] = useState(true);
  const [showClosed, setShowClosed] = useState(true);
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Active Projects */}
      <div className="mb-8">
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setShowActive(!showActive)}
        >
          <div className="flex items-center">
            <ChevronDown size={20} className={`mr-2 transition-transform ${!showActive ? '-rotate-90' : ''}`} />
            <h2 className="text-lg font-semibold">Active projects</h2>
            <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{activeProjects.length}</span>
          </div>
          <div className="flex items-center">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        {showActive && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-4">Project name</div>
              <div className="col-span-2">Project status</div>
              <div className="col-span-1">Progress</div>
              <div className="col-span-2">Start date</div>
              <div className="col-span-2">Due date</div>
              <div className="col-span-1">Project owner</div>
            </div>
            
            <div>
              {activeProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Closed Projects */}
      <div className="mb-8">
        <div 
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setShowClosed(!showClosed)}
        >
          <div className="flex items-center">
            <ChevronDown size={20} className={`mr-2 transition-transform ${!showClosed ? '-rotate-90' : ''}`} />
            <h2 className="text-lg font-semibold">Closed projects</h2>
            <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{closedProjects.length}</span>
          </div>
          <div className="flex items-center">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        {showClosed && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-4">Project name</div>
              <div className="col-span-2">Project status</div>
              <div className="col-span-1">Progress</div>
              <div className="col-span-2">Start date</div>
              <div className="col-span-2">Due date</div>
              <div className="col-span-1">Project owner</div>
            </div>
            
            <div>
              {closedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
