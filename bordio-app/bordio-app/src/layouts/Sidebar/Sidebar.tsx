import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="w-60 bg-sidebar-bg text-white flex flex-col h-full">
            <div>
                <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            </div>
        </aside>
    );
};
export default Sidebar;