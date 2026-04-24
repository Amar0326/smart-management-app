import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import toast from "react-hot-toast";

import {
  FileText,
  Upload,
  BarChart3,
  Users,
  Calendar,
  Shield,
  Home,
  Globe,
  Heart,
  CheckCircle,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUser = { email: "admin@gmail.com" };
  const userRole = "admin";

  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    totalNotices: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    const unsubComplaints = onSnapshot(collection(db, "complaints"), () => {
      fetchStats();
    });

    const unsubNotices = onSnapshot(collection(db, "notices"), () => {
      fetchStats();
    });

    const unsubUsers = onSnapshot(collection(db, "users"), () => {
      fetchStats();
    });

    return () => {
      unsubComplaints();
      unsubNotices();
      unsubUsers();
    };
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const fetchStats = async () => {
    setLoading(true);

    try {
      const complaintsSnapshot = await getDocs(collection(db, "complaints"));

      const resolvedSnapshot = await getDocs(
        query(collection(db, "complaints"), where("status", "==", "Resolved"))
      );

      const noticesSnapshot = await getDocs(collection(db, "notices"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      setStats({
        totalComplaints: complaintsSnapshot.size,
        resolvedComplaints: resolvedSnapshot.size,
        totalNotices: noticesSnapshot.size,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const adminQuickAccess = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/admin",
    },
    {
      title: "All Complaints",
      icon: FileText,
      href: "/admin/complaints",
    },
    {
      title: "Notice Management",
      icon: Upload,
      href: "/admin/upload-notice",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
    },
    {
      title: "User Poll",
      icon: CheckCircle,
      href: "/admin/poll",
    },
    {
      title: "Contacts",
      icon: Users,
      href: "/admin/contacts",
    },
    {
      title: "Government Websites",
      icon: Globe,
      href: "/admin/govt-websites",
    },
    {
      title: "Community Activities",
      icon: Heart,
      href: "/admin/community-activities",
    },
  ];

  const statCards = [
    {
      title: "Total Complaints",
      value: stats.totalComplaints,
      icon: FileText,
    },
    {
      title: "Resolved Complaints",
      value: stats.resolvedComplaints,
      icon: CheckCircle,
    },
    {
      title: "Active Notices",
      value: stats.totalNotices,
      icon: Calendar,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F4EFD9] min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gray-600 text-white py-12 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Administration Portal
        </h1>
        <p className="text-sm sm:text-lg opacity-90">
          Manage Complaints, Notices & Activities Efficiently
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Administration Overview Section */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-white" size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            📊 Administration Overview
          </h2>
          
          <p className="text-gray-600">
            Real-time statistics and performance metrics
          </p>
          
          <div className="w-24 h-1 bg-green-700 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <Icon className="text-green-700" size={28} />
                  <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {adminQuickAccess.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                onClick={() => navigate(item.href)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
              >
                <Icon className="text-green-700 mb-3" size={28} />
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard