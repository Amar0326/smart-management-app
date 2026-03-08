import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";

// Poll collection reference
const pollsCollection = collection(db, "polls");
const votesCollection = collection(db, "votes");

// Get current active poll
export const getCurrentPoll = async () => {
  try {
    const q = query(
      pollsCollection,
      where("isActive", "==", true),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const pollDoc = querySnapshot.docs[0];
    return {
      id: pollDoc.id,
      ...pollDoc.data()
    };
  } catch (error) {
    console.error("Error getting current poll:", error);
    throw error;
  }
};

// Vote in poll with transaction
export const voteInPoll = async (pollId, userId, optionId) => {
  try {
    const pollRef = doc(db, "polls", pollId);
    const voteRef = doc(db, "votes", `${userId}_${pollId}`);

    await runTransaction(db, async (transaction) => {
      // Check if user has already voted
      const voteDoc = await transaction.get(voteRef);
      if (voteDoc.exists()) {
        throw new Error("You have already voted in this poll");
      }

      // Get current poll data
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw new Error("Poll not found");
      }

      const pollData = pollDoc.data();
      
      // Check if poll is still active and not ended
      if (!pollData.isActive) {
        throw new Error("Poll is no longer active");
      }

      if (new Date() >= pollData.endTime.toDate()) {
        throw new Error("Poll has ended");
      }

      // Find and increment the selected option's vote count
      const updatedOptions = pollData.options.map(option => {
        if (option.id === optionId) {
          return {
            ...option,
            votes: option.votes + 1
          };
        }
        return option;
      });

      // Update poll with new vote count
      transaction.update(pollRef, {
        options: updatedOptions
      });

      // Create vote record
      transaction.set(voteRef, {
        userId,
        pollId,
        optionId,
        votedAt: serverTimestamp()
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error voting in poll:", error);
    throw error;
  }
};

// Check if user has voted in poll
export const hasUserVoted = async (pollId, userId) => {
  try {
    const voteRef = doc(db, "votes", `${userId}_${pollId}`);
    const voteDoc = await getDoc(voteRef);
    return voteDoc.exists();
  } catch (error) {
    console.error("Error checking if user voted:", error);
    return false;
  }
};

// Get user's vote in poll
export const getUserVote = async (pollId, userId) => {
  try {
    const voteRef = doc(db, "votes", `${userId}_${pollId}`);
    const voteDoc = await getDoc(voteRef);
    
    if (!voteDoc.exists()) {
      return null;
    }
    
    return voteDoc.data();
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};

// Create new poll (Admin)
export const createPoll = async (pollData) => {
  try {
    const newPoll = {
      question: pollData.question,
      options: pollData.options.map((opt, index) => ({
        id: `opt${index + 1}`,
        text: opt.text,
        votes: 0
      })),
      isActive: true,
      endTime: pollData.endTime,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(pollsCollection, newPoll);
    return { id: docRef.id, ...newPoll };
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

// Update poll (Admin)
export const updatePoll = async (pollId, updateData) => {
  try {
    const pollRef = doc(db, "polls", pollId);
    await updateDoc(pollRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

// Deactivate poll (Admin)
export const deactivatePoll = async (pollId) => {
  try {
    const pollRef = doc(db, "polls", pollId);
    await updateDoc(pollRef, {
      isActive: false
    });
    return { success: true };
  } catch (error) {
    console.error("Error deactivating poll:", error);
    throw error;
  }
};

// Reset poll votes (Admin)
export const resetPollVotes = async (pollId) => {
  try {
    const pollRef = doc(db, "polls", pollId);
    
    await runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw new Error("Poll not found");
      }

      const pollData = pollDoc.data();
      
      // Reset all vote counts to 0
      const resetOptions = pollData.options.map(option => ({
        ...option,
        votes: 0
      }));

      transaction.update(pollRef, {
        options: resetOptions
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting poll votes:", error);
    throw error;
  }
};

// Delete all votes for a poll (Admin)
export const deletePollVotes = async (pollId) => {
  try {
    const q = query(votesCollection, where("pollId", "==", pollId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error("Error deleting poll votes:", error);
    throw error;
  }
};

// Get all polls (Admin)
export const getAllPolls = async () => {
  try {
    const q = query(
      pollsCollection,
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all polls:", error);
    throw error;
  }
};
