import React, { useState } from 'react';
import { X, Menu, Search, Bell, Settings, LogOut } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  isActive?: boolean;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  items: NavItem[];
  onItemClick: (path: string) => void;
  className?: string;
}

interface HeaderProps {
  onMenuToggle: () => void;
  onSearch: (query: string) => void;
  user: User;
  className?: string;
}

interface NavItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (path: string) => void;
  badge?: number;
}

// ============================================================================
// NavItem Component
// ============================================================================

const NavItemComponent: React.FC<NavItemProps> = ({
  label,
  path,
  icon,
  isActive,
  onClick,
  badge,
}) => {
  return (
    <button
      onClick={() => onClick(path)}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
        isActive
          ? 'bg-green-50 text-emerald-600 font-semibold border-l-4 border-emerald-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-left text-sm">{label}</span>
      {badge && (
        <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-semibold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// Sidebar Component
// ============================================================================

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  items,
  onItemClick,
  className = '',
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          left-0 top-16
          w-60 h-[calc(100vh-64px)]
          bg-white border-r border-gray-200
          z-40
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <nav className="py-4">
          {items.map((item) => (
            <NavItemComponent
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
              isActive={item.isActive || false}
              onClick={onItemClick}
              badge={item.badge}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

// ============================================================================
// Header Component
// ============================================================================

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSearch,
  user,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0
        h-16 bg-white border-b border-gray-200
        z-50
        ${className}
      `}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section: Logo + Hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="text-xl font-bold text-emerald-600">FarmToBiz</div>
        </div>

        {/* Middle Section: Search Bar (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors duration-150"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* Right Section: User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 relative"
          >
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button
            aria-label="Settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 hidden sm:block"
          >
            <Settings size={20} className="text-gray-700" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-transparent hover:border-emerald-600"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  프로필
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  설정
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-200 flex items-center gap-2">
                  <LogOut size={16} />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// Navigation Container Component (Example Usage)
// ============================================================================

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigate,
  user,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: '대시보드',
      path: '/dashboard',
      icon: <span>📊</span>,
      isActive: currentPath === '/dashboard',
    },
    {
      label: '상품 관리',
      path: '/products',
      icon: <span>🛒</span>,
      isActive: currentPath === '/products',
      badge: 3,
    },
    {
      label: '주문 관리',
      path: '/orders',
      icon: <span>📦</span>,
      isActive: currentPath === '/orders',
    },
    {
      label: '고객',
      path: '/customers',
      icon: <span>👥</span>,
      isActive: currentPath === '/customers',
    },
    {
      label: '분석',
      path: '/analytics',
      icon: <span>📈</span>,
      isActive: currentPath === '/analytics',
    },
    {
      label: '설정',
      path: '/settings',
      icon: <span>⚙️</span>,
      isActive: currentPath === '/settings',
    },
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        items={navItems}
        onItemClick={handleItemClick}
      />

      <div className="flex-1">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSearch={(query) => console.log('Search:', query)}
          user={user}
        />

        {/* Main Content Area - Add pt-16 for header height */}
        <main className="pt-16">
          {/* Your page content goes here */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              현재 경로: {currentPath}
            </h1>
            <p className="text-gray-600">메인 콘텐츠 영역입니다.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export {
  Navigation,
  Header,
  Sidebar,
  NavItemComponent,
  type User,
  type NavItem,
  type SidebarProps,
  type HeaderProps,
  type NavItemProps,
  type NavigationProps,
};

// ============================================================================
// Example Usage / Demo Component
// ============================================================================

export const NavigationDemo: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const demoUser: User = {
    name: '김소연',
    email: 'soyeon.kim@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  };

  return (
    <Navigation
      currentPath={currentPath}
      onNavigate={setCurrentPath}
      user={demoUser}
    />
  );
};
