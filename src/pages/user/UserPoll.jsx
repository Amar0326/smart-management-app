import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Users, BarChart3 } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const UserPoll = () => {
  const { currentUser } = useAuth();
  const [poll, setPoll] = useState(null);
  const [pastPolls, setPastPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchActivePoll();
  }, []);

  useEffect(() => {
    // Set up real-time listener for active poll changes
    const q = query(collection(db, "polls"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      fetchActivePoll(); // Re-fetch when poll changes
    });

    return () => unsubscribe();
  }, []);

  const fetchActivePoll = async () => {
    try {
      // Fetch active poll
      const q = query(collection(db, "polls"), where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const pollDoc = querySnapshot.docs[0];
        const pollData = { id: pollDoc.id, ...pollDoc.data() };
        setPoll(pollData);
        
        // Check if user has already voted
        if (currentUser) {
          await checkUserVote();
        }
      } else {
        setPoll(null);
      }

      // Fetch past polls (closed polls with results)
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

  const checkUserVote = async () => {
  if (!currentUser || !poll) return;

  try {
    console.log("Checking vote for user:", currentUser.uid, "poll:", poll.id);

    // Create vote ID in format: userId_pollId
    const voteId = `${currentUser.uid}_${poll.id}`;
    console.log("Checking vote ID:", voteId);

    const voteRef = doc(db, "votes", voteId);
    const voteSnap = await getDoc(voteRef);

    console.log("Vote exists:", voteSnap.exists());
    setHasVoted(voteSnap.exists());

  } catch (error) {
    console.error("Error checking user vote:", error);
    setHasVoted(false);
  }
};

  const handleVote = async (selectedIndex) => {
  try {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    console.log("User UID:", currentUser.uid);
    console.log("Poll ID:", poll.id);

    // Create vote ID in format: userId_pollId
    const voteId = `${currentUser.uid}_${poll.id}`;
    console.log("Vote ID:", voteId);

    const voteRef = doc(db, "votes", voteId);

    // Check if vote already exists
    const existingVote = await getDoc(voteRef);
    if (existingVote.exists()) {
      alert("You already voted");
      return;
    }

    // Create vote document with correct structure
    await setDoc(voteRef, {
      userId: currentUser.uid,
      pollId: poll.id,
      optionIndex: selectedIndex,
      createdAt: serverTimestamp()
    });

    console.log("Vote created successfully");
    setHasVoted(true);

  } catch (error) {
    console.error("Error voting:", error);
    alert("Failed to vote. Please try again.");
  }
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Poll Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Community Poll</h1>
              <div className="flex items-center text-white">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm">
                  {poll ? (poll.status === "closed" ? 'Closed' : 'Active') : 'No active poll'}
                </span>
              </div>
            </div>
          </div>

          {/* Poll Content */}
          <div className="p-6">
            {poll ? (
              <>
                {/* Question Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {poll.question}
                    </h2>
                    {hasVoted && (
                      <span className="badge bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        Voted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Community Poll</span>
                  </div>
                </div>

                {/* Options Section - Different for active vs closed polls */}
                {poll.status === "closed" ? (
                  /* Closed Poll - Show Results */
                  <div className="space-y-3 mb-6">
                    {poll.options.map((option, index) => {
                      const voteCount = poll.results && poll.results[index] ? poll.results[index] : 0;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{option.text}</span>
                          <span className="text-gray-600 font-medium">{voteCount} votes</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Active Poll - Show Voting Options */
                  <div className="space-y-3 mb-6">
                    {poll.options.map((option, index) => (
                      <div
                        key={index}
                        className={`relative p-4 border-2 rounded-lg transition-all ${
                          hasVoted
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => !hasVoted && handleVote(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              hasVoted
                                ? 'border-gray-300'
                                : 'border-gray-300'
                            }`}>
                              {hasVoted && (
                                <div className="w-full h-full rounded-full bg-gray-400 scale-50"></div>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{option.text}</span>
                          </div>
                          {hasVoted && (
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vote Status - Only show for active polls */}
                {poll.status !== "closed" && (
                  hasVoted ? (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        You have already voted
                      </div>
                      <p className="text-gray-500 text-sm mt-2">
                        Thank you for participating in the community poll
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      Click on an option to cast your vote
                    </div>
                  )
                )}
              </>
            ) : (
              <>
                {/* No Active Poll */}
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No active poll available</p>
                  <p className="text-gray-500 text-sm mt-2">Community polls will appear here when available</p>
                </div>
              </>
            )}

            {/* Results Info */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              {poll ? (
                <div className="space-y-2">
                  <p>Your vote is confidential and secure</p>
                  <p>Results will be announced by the administrator</p>
                </div>
              ) : (
                <p>Results will be shown when a poll becomes active</p>
              )}
            </div>
          </div>
        </div>

        {/* Past Polls Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Past Polls</h2>
          </div>
          
          <div className="p-6">
            {pastPolls.length > 0 ? (
              <div className="space-y-4">
                {pastPolls.map((pastPoll) => (
                  <div key={pastPoll.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{pastPoll.question}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Closed
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Created on {new Date(pastPoll.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                    <div className="space-y-2">
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
    </div>
  );
};

export default UserPoll;
