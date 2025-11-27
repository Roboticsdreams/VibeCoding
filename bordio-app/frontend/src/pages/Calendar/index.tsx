import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { calendarEvents } from '../../mock-data/calendar-events';

// Generate dates for the current week
const generateDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dates = [];
  
  // Calculate the Monday of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1);
  
  // Generate dates for Monday through Sunday
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

const Calendar = () => {
  const [dates] = useState(generateDates);
  const [currentDate] = useState(new Date());
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center border border-gray-300 rounded">
            <button className="px-3 py-1 text-sm border-r border-gray-300">Today</button>
            <button className="p-1 border-r border-gray-300">
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 py-1">
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button className="p-1">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center text-sm text-gray-600">
            <Filter size={16} className="mr-1" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Days of the week */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dates.map((date, index) => (
            <div 
              key={index} 
              className={`p-2 text-center ${date.toDateString() === currentDate.toDateString() ? 'bg-blue-50' : ''}`}
            >
              <div className="text-sm font-medium">{dayNames[index]}</div>
              <div className={`text-2xl mt-1 ${date.toDateString() === currentDate.toDateString() ? 'text-blue-600' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Calendar content */}
        <div className="grid grid-cols-7 h-[calc(100vh-250px)]">
          {dates.map((date, dayIndex) => (
            <div 
              key={dayIndex} 
              className={`border-r border-gray-200 p-2 ${
                dayIndex === 6 ? 'border-r-0' : ''
              } ${
                date.toDateString() === currentDate.toDateString() ? 'bg-blue-50' : ''
              }`}
            >
              {/* Filter events for this day */}
              {dayIndex < 5 && ( // Only show events on weekdays
                <div className="space-y-2">
                  {calendarEvents.filter((_, eventIndex) => {
                    // This is just a demo distribution of events
                    if (dayIndex === 0) return [0, 1].includes(eventIndex);
                    if (dayIndex === 1) return [2, 3, 4, 5].includes(eventIndex);
                    if (dayIndex === 2) return false;
                    if (dayIndex === 3) return [6, 7].includes(eventIndex);
                    if (dayIndex === 4) return [8].includes(eventIndex);
                    return false;
                  }).map(event => (
                    <div 
                      key={event.id} 
                      className={`${event.color} p-2 rounded border-l-4 text-sm cursor-pointer`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{event.time}</div>
                      {event.project && (
                        <div className="text-xs text-gray-500 mt-1">{event.project}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
