import type { ReactNode } from 'react';

interface TaskColumnProps {
  title: string;
  count: number;
  children: ReactNode;
}

const TaskColumn = ({ title, count, children }: TaskColumnProps) => {
  return (
    <div className="min-w-[272px] bg-white rounded-lg shadow flex-shrink-0">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{title}</span>
          <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3.5C8.28 3.5 8.5 3.72 8.5 4V8C8.5 8.28 8.28 8.5 8 8.5C7.72 8.5 7.5 8.28 7.5 8V4C7.5 3.72 7.72 3.5 8 3.5Z" fill="currentColor"/>
            <path d="M8 11.5C8.28 11.5 8.5 11.28 8.5 11C8.5 10.72 8.28 10.5 8 10.5C7.72 10.5 7.5 10.72 7.5 11C7.5 11.28 7.72 11.5 8 11.5Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default TaskColumn;
