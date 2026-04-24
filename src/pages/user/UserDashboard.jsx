import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  getFirestore
} from "firebase/firestore";
import {
  FileText,
  Bell,
  Plus,
  Shield,
  Users,
  CheckCircle,
  Globe,
  Heart,
  BarChart3,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare
} from "lucide-react";
import SpeechButton from "../../components/common/SpeechButton";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    complaints: 0,
    resolved: 0,
    pending: 0,
    notices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.uid) return;

      try {
        const db = getFirestore();
        
        // Fetch user's complaints with userId filter
        const complaintsSnapshot = await getDocs(
          query(collection(db, "complaints"), where("userId", "==", currentUser.uid))
        );

        let total = 0;
        let resolved = 0;
        let pending = 0;

        // Process each complaint to count by status
        complaintsSnapshot.forEach((doc) => {
          const data = doc.data();
          total++;

          if (data.status === "resolved") resolved++;
          if (data.status === "pending") pending++;
        });

        // Fetch notices (no user filter needed for public notices)
        const noticesSnapshot = await getDocs(collection(db, "notices"));

        setStats({
          complaints: total,
          resolved: resolved,
          pending: pending,
          notices: noticesSnapshot.size
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Quick access actions
  const quickActions = [
    { title: "Create Complaint", icon: Plus, href: "/user/create-complaint" },
    { title: "My Complaints", icon: FileText, href: "/user/my-complaints" },
    { title: "Community Activities", icon: Heart, href: "/user/community-activities" },
    { title: "Important Notices", icon: Bell, href: "/user/notices" },
    { title: "Vote Poll", icon: CheckCircle, href: "/user/poll" },
    { title: "Important Contacts", icon: Users, href: "/user/contacts" },
    { title: "Government Websites", icon: Globe, href: "/user/govt-websites" },
    { title: "Analytics", icon: BarChart3, href: "/user/analytics" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4EFD9] min-h-screen p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          User Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome to VILLTECH Smart Village Portal
        </p>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-3">
            <FileText className="text-green-700" size={28} />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{stats.complaints}</span>
              <SpeechButton 
                text={`आपल्या तक्रींची एकूण संख्या ${stats.complaints} आहे`} 
                className="p-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">My Complaints</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-3">
            <CheckCircle className="text-green-700" size={28} />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{stats.resolved}</span>
              <SpeechButton 
                text={`${stats.resolved} तक्री सुटल्या आहेत`} 
                className="p-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">Resolved</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-3">
            <Clock className="text-green-700" size={28} />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
              <SpeechButton 
                text={`${stats.pending} तक्री प्रलंबित आहेत`} 
                className="p-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-3">
            <Bell className="text-green-700" size={28} />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{stats.notices}</span>
              <SpeechButton 
                text={`आपल्याल ${stats.notices} सूचना आहेत`} 
                className="p-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">Notices</p>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🚀 Quick Actions
          </h2>
          
          <p className="text-gray-600">
            Access all village services and manage your requests
          </p>
          
          <div className="w-24 h-1 bg-green-700 mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.href)}
                className="bg-white p-6 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition cursor-pointer"
              >
                <Icon className="text-green-700 mb-3" size={28} />
                <h3 className="font-semibold text-gray-800">{action.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;