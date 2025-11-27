import { Settings } from 'lucide-react';

interface Owner {
  name: string;
  avatar: string;
}

interface ProjectProps {
  id: number;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  dueDate: string;
  owner: Owner;
}

const ProjectCard = ({ project }: { project: ProjectProps }) => {
  const getStatusElement = (status: string) => {
    switch (status) {
      case 'new_project':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">New project</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">In Progress</span>;
      case 'on_hold':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">On Hold</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      default:
        return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // We use the pre-defined avatars in this demo
  // Normally, this would generate initials from the name

  const getOwnerAvatarColor = (initials: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    
    // Simple hash function to always get the same color for the same initials
    const hash = initials.charCodeAt(0) + (initials.length > 1 ? initials.charCodeAt(1) : 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="grid grid-cols-12 px-6 py-4 border-b hover:bg-gray-50 transition-colors">
      <div className="col-span-4 font-medium">{project.name}</div>
      <div className="col-span-2">{getStatusElement(project.status)}</div>
      <div className="col-span-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(project.progress)}`} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{project.progress}%</div>
      </div>
      <div className="col-span-2 text-sm text-gray-600">{project.startDate}</div>
      <div className="col-span-2 text-sm text-gray-600">{project.dueDate}</div>
      <div className="col-span-1 flex items-center justify-between">
        <div 
          className={`h-8 w-8 rounded-full ${getOwnerAvatarColor(project.owner.avatar)} flex items-center justify-center text-white text-sm`}
          title={project.owner.name}
        >
          {project.owner.avatar}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
