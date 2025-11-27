import { NavLink } from 'react-router-dom';
import { Home, Calendar, Folder, CheckSquare, BarChart3, Users, Activity } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-60 bg-sidebar-bg text-white flex flex-col h-full rounded-l-lg">
      <div className="p-4 flex items-center">
        <div className="text-white font-bold text-xl">Bordio</div>
      </div>
      
      <div className="p-4">
        <div className="text-white/50 text-xs uppercase mb-2 font-medium">Menu</div>
        <nav>
          <NavLink 
            to="/" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
            end
          >
            <Home size={18} className="mr-3" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
          >
            <CheckSquare size={18} className="mr-3" />
            <span>My Tasks</span>
          </NavLink>

          <NavLink 
            to="/calendar" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
          >
            <Calendar size={18} className="mr-3" />
            <span>Calendar</span>
          </NavLink>
          
          <NavLink 
            to="/planner" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
          >
            <BarChart3 size={18} className="mr-3" />
            <span>Planner</span>
          </NavLink>

          <NavLink 
            to="/projects" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
          >
            <Folder size={18} className="mr-3" />
            <span>Projects</span>
          </NavLink>

          <NavLink 
            to="/activities" 
            className={({isActive}) => 
              `sidebar-item mb-1 ${isActive ? 'active' : ''}`
            }
          >
            <Activity size={18} className="mr-3" />
            <span>All Activities</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-4 mt-4">
        <div className="text-white/50 text-xs uppercase mb-2 font-medium">Projects</div>
        <div className="sidebar-item">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
          <span>Website Development</span>
        </div>
        <div className="sidebar-item">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
          <span>Mobile App</span>
        </div>
        <div className="sidebar-item">
          <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
          <span>CRM Integration</span>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/10">
        <button className="sidebar-item">
          <Users size={18} className="mr-3" />
          <span>Invite Team Members</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
