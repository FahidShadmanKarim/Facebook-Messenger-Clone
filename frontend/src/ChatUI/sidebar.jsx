import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Search, Settings, Edit, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setSelectedConversation }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { userId, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);  // State to store search results
  const [searchTerm, setSearchTerm] = useState('');        // State for search term
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${baseUrl}/conversation/user/${userId}`);
        setConversations(response.data.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (userId) {
      fetchConversations();
    }
  }, [userId, baseUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to get initials if no avatar URL is available
  const getInitials = (name) => {
    const initials = name.split(' ').map((word) => word[0]).join('');
    return initials.toUpperCase();
  };

  // Handle search input change
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() !== '') {
      try {
        const response = await axios.get(`${baseUrl}/users/search?q=${value}`);
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]); // Clear search results when the search term is cleared
    }
  };

  return (
    <div className="w-80 h-screen bg-gray-100 flex flex-col border-r border-gray-300">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Settings size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Edit size={20} className="text-gray-600" />
          </button>
          {/* Logout button */}
          <button className="p-2 rounded-full hover:bg-gray-200" onClick={handleLogout}>
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Messenger"
            className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={20} className="absolute left-3 top-2 text-gray-500" />
        </div>
      </div>

      {/* Display search results if any, otherwise show conversation list */}
      {searchTerm && searchResults.length > 0 ? (
        <ul className="flex-1 overflow-y-auto">
          {searchResults.map((user) => (
            <li
              key={user._id}
              className="px-4 py-3 flex items-center space-x-3 hover:bg-gray-200 cursor-pointer"
              onClick={() => setSelectedConversation(user._id)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.username}'s avatar`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl">
                    {getInitials(user.username)}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {user.username}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <li
                key={conversation._id}
                className="px-4 py-3 flex items-center space-x-3 hover:bg-gray-200 cursor-pointer"
                onClick={() => setSelectedConversation(conversation._id)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold">
                  {conversation.participants
                    .filter((participant) => participant._id !== userId)
                    .map((participant) => (
                      participant.avatarUrl ? (
                        <img
                          key={participant._id}
                          src={participant.avatarUrl}
                          alt={`${participant.username}'s avatar`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span key={participant._id} className="text-xl">
                          {getInitials(participant.username)}
                        </span>
                      )
                    ))}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {conversation.participants
                      .filter((participant) => participant._id !== userId)
                      .map((participant) => participant.username)
                      .join(', ')}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="p-4 text-gray-500">No conversations found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
