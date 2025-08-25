import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const api = {
  // User management
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getUser: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  createUser: async (username, diagnosticProfile) => {
    try {
      const response = await axios.post(`${API_BASE}/users`, {
        username,
        diagnostic_profile: diagnosticProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, diagnosticProfile) => {
    try {
      const response = await axios.put(`${API_BASE}/users/${userId}`, {
        diagnostic_profile: diagnosticProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Conversation state
  getConversationState: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/conversation-states/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation state:', error);
      return null;
    }
  },

  saveConversationState: async (userId, stateData) => {
    try {
      const response = await axios.post(`${API_BASE}/conversation-states`, {
        user_id: userId,
        state_data: stateData
      });
      return response.data;
    } catch (error) {
      console.error('Error saving conversation state:', error);
      throw error;
    }
  },

  // Sessions
  saveSession: async (userId, sessionNumber, sessionData) => {
    try {
      const response = await axios.post(`${API_BASE}/sessions`, {
        user_id: userId,
        session_number: sessionNumber,
        session_data: sessionData
      });
      return response.data;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  getUserSessions: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/sessions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }
};