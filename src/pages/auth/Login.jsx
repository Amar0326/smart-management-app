import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, MapPin, Users, Shield } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/user'); // Will be redirected based on role
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="village-auth-container">
      <div className="village-auth-card village-fade-in-up">
        {/* Left Side - Village Image */}
        <div className="village-auth-left village-auth-image">
          <div className="village-auth-overlay"></div>
          <div className="village-auth-content village-slide-in-left">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6 village-float">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h1 className="village-auth-title village-slide-in-left">Welcome to Villtech</h1>
              <p className="village-auth-subtitle village-slide-in-left">Smart Village Portal</p>
              <p className="text-white/80 text-sm mt-2 village-slide-in-left">Empowering Villages Through Technology</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="village-auth-right">
          {/* Desktop Layout */}
          <div className="hidden lg:block w-full max-w-md village-fade-in-up">
            <div className="village-desktop-form-card">
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 village-gradient-icon village-pulse">
                    <MapPin className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold village-primary-text mb-2">Welcome Back</h1>
                <p className="text-gray-600">
                  Sign in to access your village portal
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="village-form-group">
                <label htmlFor="email" className="village-form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="village-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="village-input village-input-with-icon"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="village-form-group">
                <label htmlFor="password" className="village-form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="village-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="village-input village-input-with-icon pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-300"
              >
                {loading ? (
                  <div className="village-loading village-loading-md mx-auto"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="village-link"
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <div className="village-divider">
                <span>or continue with</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Empowering Villages Through Technology
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <span className="text-xs text-gray-400">© 2026 Villtech</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">Smart Village Initiative</span>
              </div>
            </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden village-fade-in-up">
            <div className="village-mobile-form-card">
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                <p className="text-gray-600 text-center">
                  Sign in to your village portal
                </p>
              </div>

              {/* Mobile Login Form */}
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="village-form-group">
                  <label htmlFor="email" className="village-form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="village-input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="village-mobile-input village-input-with-icon"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="village-form-group">
                  <label htmlFor="password" className="village-form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="village-input-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="village-mobile-input village-input-with-icon pr-12"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="village-mobile-button"
                >
                  {loading ? (
                    <div className="village-loading village-loading-md mx-auto"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="village-link"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
