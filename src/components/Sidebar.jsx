import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  CheckSquare,
  Trophy,
  Info,
  Menu,
  X,
  ScanSearch
} from 'lucide-react';
import './Sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Resume Builder', icon: FileText, path: '/resume-builder' },
    { name: 'Portfolio', icon: Briefcase, path: '/portfolio' },
    { name: 'My Resumes', icon: CheckSquare, path: '/my-resumes' },
    { name: 'My Portfolios', icon: Trophy, path: '/my-portfolios' },
    { name: 'AI Analyser', icon: ScanSearch, path: '/ai-analyser' },
    { name: 'About', icon: Info, path: '/about' }
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item)}
              >
                <Icon className="sidebar-icon" size={20} />
                <span className="sidebar-text">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

