import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentPoll, voteInPoll, hasUserVoted, getUserVote } from '../../services/pollService';
import toast from 'react-hot-toast';
import { BarChart3, Clock, CheckCircle, Users } from 'lucide-react';

const UserPoll = () => {
  const { currentUser } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchPoll();
    
    // Update current time every second to check poll end time
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const currentPoll = await getCurrentPoll();
      
      if (currentPoll) {
        setPoll(currentPoll);
        
        if (currentUser) {
          const voted = await hasUserVoted(currentPoll.id, currentUser.uid);
          setHasVoted(voted);
          
          if (voted) {
            const voteData = await getUserVote(currentPoll.id, currentUser.uid);
            setUserVote(voteData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (!currentUser) {
      toast.error('Please login to vote');
      return;
    }

    try {
      setVoting(true);
      await voteInPoll(poll.id, currentUser.uid, selectedOption);
      
      setHasVoted(true);
      const voteData = await getUserVote(poll.id, currentUser.uid);
      setUserVote(voteData);
      
      // Update poll to reflect new vote count
      const updatedPoll = { ...poll };
      const optionIndex = updatedPoll.options.findIndex(opt => opt.id === selectedOption);
      if (optionIndex !== -1) {
        updatedPoll.options[optionIndex].votes += 1;
      }
      setPoll(updatedPoll);
      
      toast.success('Vote submitted successfully!');
      setSelectedOption('');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((total, option) => total + option.votes, 0);
  };

  const isPollEnded = () => {
    if (!poll) return true;
    return currentTime >= poll.endTime.toDate();
  };

  const getTimeRemaining = () => {
    if (!poll) return '';
    
    const now = currentTime;
    const end = poll.endTime.toDate();
    const diff = end - now;
    
    if (diff <= 0) return 'Poll ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    } else {
      return `${seconds}s remaining`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Poll</h2>
          <p className="text-gray-600">There are no active polls at the moment.</p>
        </div>
      </div>
    );
  }

  const pollEnded = isPollEnded();
  const totalVotes = getTotalVotes();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Poll Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Community Poll</h1>
              <div className="flex items-center text-white">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm">{getTimeRemaining()}</span>
              </div>
            </div>
          </div>

          {/* Poll Content */}
          <div className="p-6">
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {poll.question}
              </h2>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
              </div>
            </div>

            {/* Voting Section */}
            {!pollEnded && !hasVoted && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Select your option below. Results will be shown after the poll ends.
                </div>
                
                {poll.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-lg text-gray-900">{option.text}</span>
                  </label>
                ))}

                <button
                  onClick={handleVote}
                  disabled={voting || !selectedOption}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {voting ? 'Submitting...' : 'Submit Vote'}
                </button>
              </div>
            )}

            {/* Already Voted Section */}
            {!pollEnded && hasVoted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    You have voted in this poll
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  Your vote: <span className="font-semibold">
                    {poll.options.find(opt => opt.id === userVote?.optionId)?.text}
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  Results will be shown after the poll ends.
                </div>
              </div>
            )}

            {/* Results Section */}
            {pollEnded && (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  Poll Results
                </div>
                
                {poll.options.map((option) => {
                  const percentage = calculatePercentage(option.votes, totalVotes);
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-medium">{option.text}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{option.votes} votes</span>
                          <span className="text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                          className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 0 && `${percentage}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Votes: {totalVotes}</span>
                    <span>Poll Ended</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPoll;
