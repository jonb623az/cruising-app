import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, Calendar, FileText,
  Settings, Bell, ChevronDown, TreePine, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USER_ROLES } from '../data/defaults';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/properties', label: 'Properties', icon: MapPin },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/proposals', label: 'Proposals', icon: FileText },
];

const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.OFFICE]: 'Office Staff',
  [USER_ROLES.ESTIMATOR]: 'Estimator',
  [USER_ROLES.CREW_LEADER]: 'Crew Leader',
  [USER_ROLES.CREW]: 'Crew Member',
};

const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
  [USER_ROLES.OFFICE]: 'bg-blue-100 text-blue-700',
  [USER_ROLES.ESTIMATOR]: 'bg-green-100 text-green-700',
  [USER_ROLES.CREW_LEADER]: 'bg-orange-100 text-orange-700',
  [USER_ROLES.CREW]: 'bg-gray-100 text-gray-600',
};

export default function Layout({ children }) {
  const { state, actions, selectors } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = selectors.getUnreadAlerts();
  const currentUser = state.currentUser;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-gray-900 flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-800 flex-shrink-0">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Cruising</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {selectors.canManageSettings() && (
            <>
              <p className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
              <NavLink
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                Settings
              </NavLink>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="px-3 py-3 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate leading-tight">{currentUser?.name}</p>
              <p className="text-gray-400 text-xs">{ROLE_LABELS[currentUser?.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-4 px-6 h-14 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Alerts bell */}
          <div className="relative">
            <button
              onClick={() => { setShowAlerts(v => !v); setShowUserMenu(false); }}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5">
                  {unread.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                  <span className="text-xs text-gray-400">{unread.length} unread</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {state.alerts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                  ) : (
                    state.alerts.slice(0, 15).map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => actions.markAlertRead(alert.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !alert.read ? 'bg-green-50 border-l-2 border-l-green-500' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-800">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(v => !v); setShowAlerts(false); }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                {currentUser?.name?.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-800 leading-tight">{currentUser?.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{ROLE_LABELS[currentUser?.role]}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800 text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{currentUser?.email}</p>
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[currentUser?.role]}`}>
                    {ROLE_LABELS[currentUser?.role]}
                  </span>
                </div>
                <div className="py-1">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Switch Role (Demo)
                  </p>
                  {state.users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { actions.switchUser(user); setShowUserMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        currentUser?.id === user.id ? 'text-green-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {user.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Dropdown click-away */}
      {(showAlerts || showUserMenu) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowAlerts(false); setShowUserMenu(false); }} />
      )}
    </div>
  );
}
