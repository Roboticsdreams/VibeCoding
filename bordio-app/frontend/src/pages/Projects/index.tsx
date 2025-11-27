import { useState } from 'react';
import { Plus, Search, Group, Filter } from 'lucide-react';
import { activeProjects, closedProjects } from '../../mock-data/projects';
import { teams } from '../../mock-data/planner-data';

// Using mock data imported from mock-data files

// Using teams data imported from mock-data/planner-data.ts

const Projects = () => {
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'new_project':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'new_project':
        return 'New Project';
      default:
        return 'Unknown';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getOwnerAvatarColor = (initials: string) => {
    const colors = {
      'MM': 'bg-blue-500',
      'DT': 'bg-purple-500',
      'AN': 'bg-rose-500',
      'MW': 'bg-amber-500',
      'SB': 'bg-pink-500'
    };
    
    return colors[initials as keyof typeof colors] || 'bg-gray-500';
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="search" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          
          <button className="flex items-center justify-center h-8 w-8 rounded border border-gray-300 hover:bg-gray-100">
            <Group size={16} />
          </button>
          
          <button className="flex items-center justify-center h-8 w-8 rounded border border-gray-300 hover:bg-gray-100">
            <Filter size={16} />
          </button>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button 
              className={`px-3 py-1 text-sm ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          
          <button className="btn btn-primary flex items-center">
            <Plus size={16} className="mr-1" />
            Add project
          </button>
        </div>
      </div>
      
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Projects */}
          {activeProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(project.progress)}`} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="text-gray-500">Start date</div>
                    <div className="font-medium">{project.startDate}</div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-gray-500">Due date</div>
                    <div className="font-medium">{project.dueDate || 'Not set'}</div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className={`h-8 w-8 rounded-full ${getOwnerAvatarColor(project.owner.avatar)} flex items-center justify-center text-white text-sm`}
                    title={project.owner.name}
                  >
                    {project.owner.avatar}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className="text-gray-500">Owner</div>
                    <div className="font-medium">{project.owner.name}</div>
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  {/* Show team members for the project */}
                  {teams.map((team, index) => (
                    team.members.slice(0, 2).map((member, memberIndex) => (
                      <div 
                        key={`${index}-${memberIndex}`}
                        className={`h-8 w-8 rounded-full ${getOwnerAvatarColor(member)} flex items-center justify-center text-white text-sm border-2 border-white`}
                      >
                        {member}
                      </div>
                    ))
                  ))}
                  {/* Extra members indicator */}
                  {teams.reduce((acc, team) => acc + team.members.length, 0) > 3 && (
                    <div 
                      className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs border-2 border-white"
                    >
                      +{teams.reduce((acc, team) => acc + team.members.length, 0) - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Project name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Start date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Due date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Owner</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
              </tr>
            </thead>
            <tbody>
              {[...activeProjects, ...closedProjects].map(project => (
                <tr key={project.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{project.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(project.progress)}`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{project.progress}%</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{project.startDate}</td>
                  <td className="py-3 px-4 text-gray-600">{project.dueDate || 'Not set'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div 
                        className={`h-8 w-8 rounded-full ${getOwnerAvatarColor(project.owner.avatar)} flex items-center justify-center text-white text-sm`}
                        title={project.owner.name}
                      >
                        {project.owner.avatar}
                      </div>
                      <span className="ml-2">{project.owner.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex -space-x-2">
                      {/* Show team members for the project */}
                      {teams.map((team, index) => (
                        team.members.slice(0, 2).map((member, memberIndex) => (
                          <div 
                            key={`${index}-${memberIndex}`}
                            className={`h-8 w-8 rounded-full ${getOwnerAvatarColor(member)} flex items-center justify-center text-white text-sm border-2 border-white`}
                          >
                            {member}
                          </div>
                        ))
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Projects;
