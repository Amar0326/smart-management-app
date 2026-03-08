import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Users, Shield, MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData.email, formData.password);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to register');
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
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="village-auth-title village-slide-in-left">Welcome to Villtech</h1>
              <p className="village-auth-subtitle village-slide-in-left">Smart Village Portal</p>
              <p className="text-white/80 text-sm mt-2 village-slide-in-left">Empowering Villages Through Technology</p>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="village-auth-right">
          {/* Desktop Layout */}
          <div className="hidden lg:block w-full max-w-md village-fade-in-up">
            <div className="village-desktop-form-card">
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 village-gradient-icon village-pulse">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold village-primary-text mb-2">Create Account</h1>
                <p className="text-gray-600">
                  Join your village community today
                </p>
              </div>

              {/* Register Form */}
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
                    autoComplete="email"
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
                    autoComplete="new-password"
                    required
                    className="village-input village-input-with-icon pr-12"
                    placeholder="Create a password"
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

              {/* Confirm Password */}
              <div className="village-form-group">
                <label htmlFor="confirmPassword" className="village-form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="village-input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="village-input village-input-with-icon pr-12"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="village-link"
                >
                  Sign in here
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
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
                <p className="text-gray-600 text-center">
                  Join your village community today
                </p>
              </div>

              {/* Mobile Register Form */}
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
                      autoComplete="new-password"
                      required
                      className="village-mobile-input village-input-with-icon pr-12"
                      placeholder="Create a password"
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

                {/* Confirm Password */}
                <div className="village-form-group">
                  <label htmlFor="confirmPassword" className="village-form-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="village-input-icon" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="village-mobile-input village-input-with-icon pr-12"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="village-link"
                  >
                    Sign in here
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

export default Register;
