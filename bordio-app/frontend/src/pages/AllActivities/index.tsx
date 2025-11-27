import { useState } from 'react';
import { Search, Filter, CalendarDays, LayoutGrid, List } from 'lucide-react';
import { activeProjects, closedProjects } from '../../mock-data/projects';
import { tasks } from '../../mock-data/tasks';
import { calendarEvents } from '../../mock-data/calendar-events';

// Define activity types for filtering
type ActivityType = 'all' | 'tasks' | 'projects' | 'events';

// Combined activity interface
interface Activity {
  id: number | string;
  type: ActivityType;
  title: string;
  status?: string;
  date?: string;
  owner?: string;
  color?: string;
}

// Function to transform data into unified activity format
const getAllActivities = (): Activity[] => {
  const projectActivities = [...activeProjects, ...closedProjects].map(project => ({
    id: `project-${project.id}`,
    type: 'projects' as ActivityType,
    title: project.name,
    status: project.status,
    date: project.startDate,
    owner: project.owner.avatar,
    color: project.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
  }));

  const taskActivities = [
    ...tasks.new_task,
    ...tasks.scheduled,
    ...tasks.in_progress,
    ...tasks.completed
  ].map(task => {
    // Extract date info from task (handling different task structures)
    let dateInfo = '';
    if ('daysLeft' in task && task.daysLeft) dateInfo = task.daysLeft;
    else if ('dueDate' in task && task.dueDate) dateInfo = String(task.dueDate);
    else if ('progress' in task && task.progress) dateInfo = `Progress: ${task.progress}`;
    
    return {
      id: `task-${task.id}`,
      type: 'tasks' as ActivityType,
      title: task.title,
      status: task.color.includes('green') ? 'completed' : 
              task.color.includes('purple') ? 'in_progress' : 
              task.color.includes('coral') ? 'scheduled' : 'new',
      date: dateInfo,
      owner: task.assignee,
      color: task.color
    };
  });

  const eventActivities = calendarEvents.map(event => ({
    id: `event-${event.id}`,
    type: 'events' as ActivityType,
    title: event.title,
    status: 'scheduled',
    date: event.time,
    owner: event.owner,
    color: event.color
  }));

  return [...projectActivities, ...taskActivities, ...eventActivities];
};

const AllActivities = () => {
  const [activities] = useState<Activity[]>(getAllActivities);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filter, setFilter] = useState<ActivityType>('all');

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'in_progress':
          return 'bg-orange-100 text-orange-800';
        case 'scheduled':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  // Owner avatar component
  const OwnerAvatar = ({ owner }: { owner: string }) => {
    const getOwnerAvatarColor = (initials: string) => {
      const colors: Record<string, string> = {
        'MM': 'bg-blue-500',
        'DT': 'bg-purple-500',
        'AN': 'bg-rose-500',
        'MW': 'bg-amber-500',
        'SB': 'bg-pink-500'
      };
      
      return colors[initials] || 'bg-gray-500';
    };

    return (
      <div 
        className={`h-7 w-7 rounded-full ${getOwnerAvatarColor(owner)} flex items-center justify-center text-white text-xs`}
      >
        {owner}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-2xl font-bold">All Activities</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="search" 
              placeholder="Search activities..." 
              className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('all')}
            >
              <span>All</span>
            </button>
            <button 
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm ${filter === 'tasks' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('tasks')}
            >
              <span>Tasks</span>
            </button>
            <button 
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm ${filter === 'projects' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('projects')}
            >
              <span>Projects</span>
            </button>
            <button 
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm ${filter === 'events' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setFilter('events')}
            >
              <CalendarDays size={14} className="mr-1" />
              <span>Events</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              className={`flex items-center justify-center h-8 w-8 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white border border-gray-300'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`flex items-center justify-center h-8 w-8 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white border border-gray-300'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>

          <button className="flex items-center text-sm text-gray-600">
            <Filter size={16} className="mr-1" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Owner</div>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-200px)]">
              {filteredActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="grid grid-cols-12 px-6 py-3 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <div className="col-span-5 font-medium">{activity.title}</div>
                  <div className="col-span-2 capitalize">{activity.type}</div>
                  <div className="col-span-2">
                    {activity.status && <StatusBadge status={activity.status} />}
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">{activity.date}</div>
                  <div className="col-span-1">
                    {activity.owner && <OwnerAvatar owner={activity.owner} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActivities.map(activity => (
              <div 
                key={activity.id} 
                className={`${activity.color || 'bg-white'} p-4 rounded-lg shadow cursor-pointer`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">{activity.title}</h3>
                  <span className="capitalize text-xs">{activity.type}</span>
                </div>
                
                {activity.status && (
                  <div className="mb-2">
                    <StatusBadge status={activity.status} />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">{activity.date}</div>
                  {activity.owner && <OwnerAvatar owner={activity.owner} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllActivities;
