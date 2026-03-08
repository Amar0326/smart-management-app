import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Power, Users, Clock, CheckCircle, X, Trash2 } from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const AdminPoll = () => {
  const { currentUser } = useAuth();
  const [poll, setPoll] = useState(null);
  const [pastPolls, setPastPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voteCounts, setVoteCounts] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: ''
  });

  // Get user role from currentUser
  const userRole = currentUser?.role || 'user';

  useEffect(() => {
    fetchPoll();
  }, []);

  useEffect(() => {
    if (poll) {
      // Set up real-time listener for votes
      const q = query(collection(db, "votes"), where("pollId", "==", poll.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Initialize vote counts array with zeros for each option
        const voteCounts = Array(poll.options.length).fill(0);

        // Count votes for each option
        snapshot.forEach(doc => {
          const voteData = doc.data();
          const index = voteData.optionIndex;
          if (index >= 0 && index < voteCounts.length) {
            voteCounts[index]++;
          }
        });

        setVoteCounts(voteCounts);
      });

      return () => unsubscribe();
    }
  }, [poll]);

  const fetchPoll = async () => {
    try {
      // Fetch active poll
      const activeQ = query(collection(db, "polls"), where("status", "==", "active"));
      const activeSnapshot = await getDocs(activeQ);
      
      if (!activeSnapshot.empty) {
        const pollDoc = activeSnapshot.docs[0];
        setPoll({ id: pollDoc.id, ...pollDoc.data() });
      } else {
        setPoll(null);
        setVoteCounts([]);
      }

      // Fetch past polls
      const pastQ = query(
        collection(db, "polls"), 
        where("status", "==", "closed"),
        orderBy("createdAt", "desc")
      );
      const pastSnapshot = await getDocs(pastQ);
      const pastPollsData = pastSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPastPolls(pastPollsData);

    } catch (error) {
      console.error('Error fetching poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const checkActivePoll = async () => {
    const q = query(collection(db, "polls"), where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleCreatePoll = async () => {
    const hasActive = await checkActivePoll();
    if (hasActive) {
      toast.error('Close current poll first');
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmitPoll = async () => {
    const { question, option1, option2, option3, option4 } = formData;
    
    if (!question.trim() || !option1.trim() || !option2.trim()) {
      toast.error('Question and first two options are required');
      return;
    }

    try {
      setCreating(true);
      
      const options = [
        { text: option1.trim() },
        { text: option2.trim() }
      ];
      
      if (option3.trim()) {
        options.push({ text: option3.trim() });
      }
      if (option4.trim()) {
        options.push({ text: option4.trim() });
      }

      await addDoc(collection(db, "polls"), {
        question: question.trim(),
        options: options,
        status: "active",
        createdAt: serverTimestamp()
      });

      toast.success('Poll created successfully!');
      setShowCreateModal(false);
      setFormData({ question: '', option1: '', option2: '', option3: '', option4: '' });
      fetchPoll();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const handleClosePoll = async () => {
    try {
      setClosing(true);
      
      // Query all votes for this poll
      const votesQuery = query(collection(db, "votes"), where("pollId", "==", poll.id));
      const votesSnapshot = await getDocs(votesQuery);
      
      // Initialize results array with zeros
      const results = Array(poll.options.length).fill(0);
      
      // Count votes per option
      votesSnapshot.forEach((voteDoc) => {
        const voteData = voteDoc.data();
        const optionIndex = voteData.optionIndex;
        if (optionIndex >= 0 && optionIndex < results.length) {
          results[optionIndex]++;
        }
      });
      
      console.log("Vote counts:", results);
      
      // Update poll document with status and results
      const pollRef = doc(db, "polls", poll.id);
      await updateDoc(pollRef, {
        status: "closed",
        results: results
      });

      toast.success('Poll closed successfully!');
      fetchPoll();
    } catch (error) {
      console.error('Error closing poll:', error);
      toast.error('Failed to close poll');
    } finally {
      setClosing(false);
    }
  };

  const handleDeletePoll = async () => {
    try {
      setDeleting(true);
      
      // Delete poll document
      const pollRef = doc(db, "polls", poll.id);
      await deleteDoc(pollRef);
      
      // Delete all votes related to this poll
      const votesQuery = query(collection(db, "votes"), where("pollId", "==", poll.id));
      const votesSnapshot = await getDocs(votesQuery);
      
      const deletePromises = votesSnapshot.docs.map(voteDoc => 
        deleteDoc(doc(db, "votes", voteDoc.id))
      );
      
      await Promise.all(deletePromises);

      toast.success('Poll deleted successfully!');
      setShowDeleteConfirm(false);
      fetchPoll();
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePastPoll = async (pollId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this poll?");
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "polls", pollId));

      const votesQuery = query(
        collection(db, "votes"),
        where("pollId", "==", pollId)
      );

      const snapshot = await getDocs(votesQuery);

      for (const voteDoc of snapshot.docs) {
        await deleteDoc(doc(db, "votes", voteDoc.id));
      }

      toast.success('Past poll deleted successfully!');
      fetchPoll(); // refresh

    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error('Failed to delete poll');
    }
  };

  const getTotalVotes = () => {
    return voteCounts.reduce((total, count) => total + count, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Poll</h1>
              <p className="text-gray-600 mt-1">Create and manage community polls</p>
            </div>
            <button 
              onClick={handleCreatePoll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Poll
            </button>
          </div>
        </div>

        {/* Active Poll Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Poll</h2>
            {poll?.status === "active" && (
              <div className="flex space-x-2">
                <button 
                  onClick={handleClosePoll}
                  disabled={closing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {closing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Closing...
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Close Poll
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Poll
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {poll ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{poll.question}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{getTotalVotes()} total votes</span>
                  <Clock className="h-4 w-4 ml-4 mr-2" />
                  <span>Status: {poll.status === "active" ? 'Active' : 'Closed'}</span>
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium text-gray-900">{option.text}</span>
                    <span className="text-gray-600">{voteCounts[index] || 0} votes</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No active poll at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Create a new poll to get started</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Poll Results</h2>
          
          {poll ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Poll is currently {poll.status === "active" ? 'active' : 'closed'}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {poll.status === "active" 
                    ? 'Results will be available when the poll is closed' 
                    : 'Poll has been closed and results are final'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No poll results available</p>
              <p className="text-gray-500 text-sm mt-2">Results will appear here when polls are completed</p>
            </div>
          )}
        </div>

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New Poll</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your poll question..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option 1 *
                      </label>
                      <input
                        type="text"
                        value={formData.option1}
                        onChange={(e) => setFormData({...formData, option1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First option..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option 2 *
                      </label>
                      <input
                        type="text"
                        value={formData.option2}
                        onChange={(e) => setFormData({...formData, option2: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Second option..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option 3 (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.option3}
                        onChange={(e) => setFormData({...formData, option3: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Third option..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option 4 (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.option4}
                        onChange={(e) => setFormData({...formData, option4: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Fourth option..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleSubmitPoll}
                    disabled={creating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Submit Poll'
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Poll</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this poll? This action cannot be undone and will also delete all associated votes.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleDeletePoll}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Past Polls Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Polls</h2>
          
          {pastPolls.length > 0 ? (
            <div className="space-y-4">
              {pastPolls.map((pastPoll) => (
                <div key={pastPoll.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{pastPoll.question}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Closed
                      </span>
                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDeletePastPoll(pastPoll.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created on {new Date(pastPoll.createdAt?.toDate()).toLocaleDateString()}
                  </div>
                  <div className="mt-3 space-y-2">
                    {pastPoll.options.map((option, index) => {
                      const voteCount = pastPoll.results && pastPoll.results[index] ? pastPoll.results[index] : 0;
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{option.text}</span>
                          <span className="text-sm text-gray-600 font-medium">{voteCount} votes</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No past polls available</p>
              <p className="text-gray-500 text-sm mt-2">Closed polls will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPoll;
