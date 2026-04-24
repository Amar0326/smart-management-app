import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileText, 
  Bell, 
  Upload, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  CheckCircle,
  Users,
  Globe,
  Heart,
  MapPin,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { currentUser, userRole, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('../../services/authService');
      await logoutUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const userNavigation = [
    { name: 'Dashboard', href: '/user', icon: Home },
    { name: 'Create Complaint', href: '/user/create-complaint', icon: FileText },
    { name: 'My Complaints', href: '/user/my-complaints', icon: FileText },
    { name: 'Vote Poll', href: '/user/poll', icon: CheckCircle },
    { name: 'Important Contacts', href: '/user/contacts', icon: Users },
    { name: 'Government Websites', href: '/user/govt-websites', icon: Globe },
    { name: 'Community Activities', href: '/user/community-activities', icon: Heart },
    { name: 'Notices', href: '/user/notices', icon: Bell },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'All Complaints', href: '/admin/complaints', icon: FileText },
    { name: 'Upload Notice', href: '/admin/upload-notice', icon: Upload },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'User Poll', href: '/admin/poll', icon: CheckCircle },
    { name: 'Contacts', href: '/admin/contacts', icon: Users },
    { name: 'Government Websites', href: '/admin/govt-websites', icon: Globe },
    { name: 'Community Activities', href: '/admin/community-activities', icon: Heart },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-green-700 text-white flex flex-col z-40 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold">VILLTECH</h1>
              <p className="text-sm text-green-200">Smart Village Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="px-2">
            <h2 className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-4">
              {isAdmin ? 'Admin' : 'Citizen'} Menu
            </h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-green-600 border-l-4 border-white shadow-lg' : 'hover:bg-green-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-green-700">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-green-600 mb-2 w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-red-600 w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Header Title */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold text-green-800">
              {isAdmin ? 'Village Administration' : 'Citizen Portal'}
            </h1>
            <p className="text-sm text-gray-500">
              Smart Village Management System
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
