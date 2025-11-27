import { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Filter, Plus } from 'lucide-react';
import { plannerTasks, plannerMilestones } from '../../mock-data/planner-data';

// Generate dates for the Gantt chart
const generateDates = () => {
  const startDate = new Date(2024, 10, 1); // November 1, 2024
  const endDate = new Date(2024, 11, 10); // December 10, 2024
  const dates = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Define interfaces for task and milestone
interface Task {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: number[];
  assignee: string;
  color: string;
}

interface Milestone {
  id: number;
  name: string;
  date: Date;
  color: string;
}

// Helper function to calculate position and width
const calculateTaskPosition = (task: Task, allDates: Date[]) => {
  const startIndex = allDates.findIndex(
    date => date.toDateString() === task.startDate.toDateString()
  );
  const endIndex = allDates.findIndex(
    date => date.toDateString() === task.endDate.toDateString()
  );
  
  return {
    left: `${startIndex * 40}px`,
    width: `${(endIndex - startIndex + 1) * 40}px`
  };
};

const calculateMilestonePosition = (milestone: Milestone, allDates: Date[]) => {
  const index = allDates.findIndex(
    date => date.toDateString() === milestone.date.toDateString()
  );
  
  return {
    left: `${index * 40}px`
  };
};

const getAvatarColor = (initials: string) => {
  const colors: Record<string, string> = {
    'MM': 'bg-blue-500',
    'DT': 'bg-purple-500',
    'AN': 'bg-rose-500',
    'MW': 'bg-amber-500',
    'SB': 'bg-pink-500'
  };
  
  return colors[initials] || 'bg-gray-500';
};

const Planner = () => {
  const [dates] = useState(generateDates);
  const [showGrid, setShowGrid] = useState(true);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Project Planner</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button className="px-3 py-1 text-sm bg-gray-100">Timeline</button>
            <button className="px-3 py-1 text-sm">Resources</button>
          </div>
          
          <button className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-1" />
            <span>Nov 2024</span>
          </button>
          
          <button className="flex items-center text-sm text-gray-600">
            <Filter size={16} className="mr-1" />
            <span>Filter</span>
          </button>
          
          <button className="btn btn-primary flex items-center">
            <Plus size={16} className="mr-1" />
            <span>Add task</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="mr-2 text-gray-500"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <span className="font-medium">Website Redesign Project</span>
          </div>
          <div className="text-sm text-gray-500">
            Nov 1 - Dec 5, 2024 (35 days)
          </div>
        </div>
        
        {showGrid && (
          <div>
            <div className="flex">
              <div className="w-64 border-r border-gray-200 p-3 font-medium">
                Task
              </div>
              <div className="overflow-x-auto">
                <div className="flex">
                  {dates.map((date, index) => (
                    <div 
                      key={index} 
                      className={`w-10 flex-shrink-0 text-center text-xs py-3 ${
                        date.getDay() === 0 || date.getDay() === 6 
                          ? 'bg-gray-100' 
                          : ''
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tasks */}
            {plannerTasks.map(task => (
              <div key={task.id} className="flex border-t border-gray-200">
                <div className="w-64 border-r border-gray-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-gray-500">
                      {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div 
                    className={`h-6 w-6 rounded-full ${getAvatarColor(task.assignee)} flex items-center justify-center text-white text-xs`}
                  >
                    {task.assignee}
                  </div>
                </div>
                <div className="relative overflow-hidden flex-1" style={{ height: '50px' }}>
                  {/* Task bar */}
                  <div 
                    className={`absolute top-3 ${task.color} h-8 rounded-sm`}
                    style={calculateTaskPosition(task, dates)}
                  >
                    <div className="h-full relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Milestones */}
            <div className="flex border-t border-gray-200">
              <div className="w-64 border-r border-gray-200 p-3">
                <div className="font-medium">Milestones</div>
              </div>
              <div className="relative overflow-hidden flex-1" style={{ height: '50px' }}>
                {plannerMilestones.map(milestone => (
                  <div 
                    key={milestone.id}
                    className="absolute top-3 -translate-x-1/2"
                    style={calculateMilestonePosition(milestone, dates)}
                  >
                    <div 
                      className={`${milestone.color} w-5 h-5 transform rotate-45`} 
                      title={milestone.name}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
