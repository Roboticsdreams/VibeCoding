import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Tasks = () => {
  const [currentDate] = useState(new Date());
  const [expandedUser, setExpandedUser] = useState('all');
  
  // Generate dates for the current week starting Monday
  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Calculate Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    
    for (let i = 0; i < 5; i++) { // Just show Mon-Fri
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = generateWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Calculate the hours for each day (9am - 6pm)
  const hours = [];
  for (let i = 8; i <= 18; i++) {
    hours.push(i);
  }

  // Simulated user data from the screenshot
  const users = [
    {
      id: 1,
      name: 'Marry Williams',
      avatar: 'MW',
      color: 'bg-amber-500',
      tasks: [
        {
          id: 1,
          title: 'Analyze last week\'s results',
          time: '8h 15m',
          startHour: 9,
          startMinute: 15, 
          endHour: 10,
          endMinute: 30,
          day: 0, // Monday
          color: 'bg-blue-100 border-blue-400',
          project: 'Website Translation'
        },
        {
          id: 2,
          title: 'Executive meeting',
          time: '9:30 - 11:00',
          startHour: 9,
          startMinute: 30,
          endHour: 11,
          endMinute: 0,
          day: 1, // Tuesday
          color: 'bg-purple-100 border-purple-400',
        },
        {
          id: 3,
          title: 'Negotiate contract terms with John',
          time: '12:30 - 14:00',
          startHour: 12,
          startMinute: 30,
          endHour: 14,
          endMinute: 0,
          day: 1, // Tuesday
          color: 'bg-yellow-100 border-yellow-400'
        }
      ]
    },
    {
      id: 2,
      name: 'Anastasia Novak',
      avatar: 'AN',
      color: 'bg-rose-500',
      tasks: [
        {
          id: 4,
          title: 'Discuss what languages we need on the website',
          time: '1h 30m',
          startHour: 10,
          startMinute: 45,
          endHour: 11,
          endMinute: 45,
          day: 0, // Monday
          color: 'bg-blue-100 border-blue-400',
          project: 'Website Translation'
        },
        {
          id: 5,
          title: 'Write email copy for onboarding',
          time: '1h 30m',
          startHour: 14,
          startMinute: 0,
          endHour: 15,
          endMinute: 30,
          day: 3, // Thursday
          color: 'bg-pink-100 border-pink-400',
          project: 'Blog Post Writing'
        },
        {
          id: 6,
          title: 'Write website copy',
          time: '5h (3 days left)',
          startHour: 9, 
          startMinute: 0,
          endHour: 17,
          endMinute: 0,
          day: 3, // Thursday
          color: 'bg-blue-100 border-blue-400',
          project: 'Website Development'
        }
      ]
    }
  ];

  // Calculate task position based on time
  const getTaskPosition = (task: any) => {
    const hourHeight = 60; // height for each hour in pixels
    const startPos = (task.startHour - 8) * hourHeight + (task.startMinute / 60) * hourHeight;
    const endPos = (task.endHour - 8) * hourHeight + (task.endMinute / 60) * hourHeight;
    const height = endPos - startPos;
    
    return {
      top: `${startPos}px`,
      height: `${height}px`,
      left: '10px', // Add some margin from the left
      right: '10px' // Add some margin from the right
    };
  };

  const toggleUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? 'all' : userId);
  };
  return (
    <div className="p-0">
      {/* Date navigation */}
      <div className="mb-6 flex items-center">
        <button className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex justify-between flex-1 mx-4">
          {dates.map((date, index) => (
            <div 
              key={index} 
              className={`text-center ${date.toDateString() === currentDate.toDateString() ? 'text-blue-600' : ''}`}
            >
              <div className="text-sm font-medium">{dayNames[index]}</div>
              <div className={`text-lg mt-0.5 ${date.toDateString() === currentDate.toDateString() ? 'font-bold' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <button className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid with hours and tasks */}
      <div className="relative bg-white rounded-lg shadow overflow-hidden">
        {/* Users column */}
        <div className="flex">
          {/* Time column */}
          <div className="w-20 relative border-r border-gray-200">
            {hours.map((hour, index) => (
              <div 
                key={index} 
                className="h-[60px] border-t border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-start"
                style={{ paddingTop: '8px' }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* User columns with tasks */}
          {users.map((user) => (
            <div 
              key={user.id} 
              className="flex-1 relative border-r border-gray-200"
              style={{ minWidth: '180px' }}
            >
              {/* User header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 py-2 px-4 flex items-center z-10">
                <div 
                  className={`h-7 w-7 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-medium mr-2`}
                >
                  {user.avatar}
                </div>
                <span className="font-medium text-sm">{user.name}</span>
              </div>
              
              {/* Time slots */}
              <div>
                {hours.map((hour, index) => (
                  <div 
                    key={index} 
                    className="h-[60px] border-t border-gray-200"
                  ></div>
                ))}
                
                {/* Tasks */}
                {user.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`absolute ${task.color} rounded border-l-4 p-2 overflow-hidden`} 
                    style={{
                      ...getTaskPosition(task),
                      left: `${task.day * 20}%`, 
                      right: `${(4 - task.day) * 20}%`,
                      zIndex: 5
                    }}
                  >
                    <div className="text-sm font-medium truncate">{task.title}</div>
                    <div className="text-xs mt-1">{task.time}</div>
                    {task.project && (
                      <div className="text-xs text-gray-500 mt-1 truncate">{task.project}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
