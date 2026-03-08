import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCurrentPoll, 
  createPoll, 
  updatePoll, 
  deactivatePoll, 
  resetPollVotes, 
  deletePollVotes,
  getAllPolls 
} from '../../services/pollService';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Clock, 
  Users, 
  BarChart3, 
  Power, 
  RotateCcw, 
  Trash2,
  Calendar,
  Save,
  X
} from 'lucide-react';

const AdminPoll = () => {
  const { currentUser } = useAuth();
  const [currentPoll, setCurrentPoll] = useState(null);
  const [allPolls, setAllPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { id: 'opt1', text: '' },
    { id: 'opt2', text: '' }
  ]);
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [current, polls] = await Promise.all([
        getCurrentPoll(),
        getAllPolls()
      ]);
      
      setCurrentPoll(current);
      setAllPolls(polls);
    } catch (error) {
      console.error('Error fetching poll data:', error);
      toast.error('Failed to load poll data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    if (validOptions.length > 4) {
      toast.error('Maximum 4 options allowed');
      return;
    }

    if (!endTime) {
      toast.error('Please set an end time');
      return;
    }

    try {
      setCreating(true);
      
      const pollData = {
        question: question.trim(),
        options: validOptions,
        endTime: new Date(endTime)
      };

      await createPoll(pollData);
      
      // Reset form
      setQuestion('');
      setOptions([
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' }
      ]);
      setEndTime('');
      setIsActive(true);
      setShowCreateForm(false);
      
      toast.success('Poll created successfully!');
      fetchData();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivatePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to deactivate this poll?')) {
      return;
    }

    try {
      await deactivatePoll(pollId);
      toast.success('Poll deactivated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deactivating poll:', error);
      toast.error('Failed to deactivate poll');
    }
  };

  const handleResetVotes = async (pollId) => {
    if (!window.confirm('Are you sure you want to reset all votes for this poll?')) {
      return;
    }

    try {
      await resetPollVotes(pollId);
      toast.success('Votes reset successfully!');
      fetchData();
    } catch (error) {
      console.error('Error resetting votes:', error);
      toast.error('Failed to reset votes');
    }
  };

  const handleDeleteVotes = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete all vote records for this poll? This cannot be undone.')) {
      return;
    }

    try {
      await deletePollVotes(pollId);
      toast.success('Vote records deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting votes:', error);
      toast.error('Failed to delete vote records');
    }
  };

  const addOption = () => {
    if (options.length < 4) {
      const newId = `opt${options.length + 1}`;
      setOptions([...options, { id: newId, text: '' }]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, text) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = text;
    setOptions(updatedOptions);
  };

  const getTotalVotes = (poll) => {
    if (!poll) return 0;
    return poll.options.reduce((total, option) => total + option.votes, 0);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Poll Management</h1>
              <p className="text-gray-600 mt-1">Create and manage community polls</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {showCreateForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              {showCreateForm ? 'Cancel' : 'Create Poll'}
            </button>
          </div>
        </div>

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Poll</h2>
            
            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your poll question..."
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (2-4)
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 4 && (
                  <button
                    onClick={addOption}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Activate poll immediately
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreatePoll}
                  disabled={creating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Poll
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Active Poll */}
        {currentPoll && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Current Active Poll</h2>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
                <button
                  onClick={() => handleDeactivatePoll(currentPoll.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Deactivate Poll"
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{currentPoll.question}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{getTotalVotes(currentPoll)} votes</span>
                  <Clock className="h-4 w-4 ml-4 mr-2" />
                  <span>Ends: {formatDateTime(currentPoll.endTime)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {currentPoll.options.map((option) => (
                  <div key={option.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium text-gray-900">{option.text}</span>
                    <span className="text-gray-600">{option.votes} votes</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleResetVotes(currentPoll.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Votes
                </button>
                <button
                  onClick={() => handleDeleteVotes(currentPoll.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vote Records
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Polls History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Poll History</h2>
          
          {allPolls.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No polls created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allPolls.map((poll) => (
                <div key={poll.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{poll.question}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{getTotalVotes(poll)} votes</span>
                        <Calendar className="h-4 w-4 ml-4 mr-2" />
                        <span>Created: {formatDateTime(poll.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {poll.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPoll;
