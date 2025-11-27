interface Task {
  id: number;
  title: string;
  assignee: string;
  tag?: string;
  color: string;
  progress?: string;
  daysLeft?: string;
  dueDate?: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const getAvatarColor = (initials: string) => {
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
    <div className={`${task.color} task-card relative`}>
      {task.tag && (
        <div className="absolute top-0 right-0 mt-1 mr-1">
          {task.tag === 'Feedback' && (
            <span className="inline-block px-2 py-0.5 bg-white bg-opacity-80 rounded text-xs font-medium">
              Feedback
            </span>
          )}
          {task.tag === 'ASAP' && (
            <span className="inline-block px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium">
              ASAP
            </span>
          )}
          {task.tag === 'Blocked' && (
            <span className="inline-block px-2 py-0.5 bg-gray-700 text-white rounded text-xs font-medium">
              Blocked
            </span>
          )}
        </div>
      )}
      
      <p className="font-medium text-sm mb-3">{task.title}</p>
      
      <div className="flex items-center justify-between">
        <div 
          className={`h-6 w-6 rounded-full ${getAvatarColor(task.assignee)} flex items-center justify-center text-white text-xs`}
        >
          {task.assignee}
        </div>
        
        <div className="flex items-center space-x-1">
          {task.progress && (
            <span className="text-xs text-gray-700">
              <svg className="inline-block w-3 h-3 mr-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 3.5V7L9.33333 8.16667" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {task.progress}
            </span>
          )}
          
          {task.daysLeft && (
            <span className="text-xs text-gray-700">
              <svg className="inline-block w-3 h-3 mr-0.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.99996 12.8334C10.2216 12.8334 12.8333 10.2217 12.8333 7.00008C12.8333 3.77842 10.2216 1.16675 6.99996 1.16675C3.7783 1.16675 1.16663 3.77842 1.16663 7.00008C1.16663 10.2217 3.7783 12.8334 6.99996 12.8334Z" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 3.5V7L9.33333 8.16667" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {task.daysLeft}
            </span>
          )}
          
          {task.dueDate && (
            <span className="text-xs text-red-500 font-medium">
              {task.dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
