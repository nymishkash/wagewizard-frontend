'use client';

import { Typography, IconButton, Button } from '@mui/material';
import { MessageCircle, Send, PlusCircle, MessagesSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MainPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await axios.post(
        'http://localhost:8081/conversations/all',
        {
          companyId: companyId,
        }
      );
      setConversations(response.data?.conversations || []); // Updated to match response structure
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]); // Set empty array on error
    }
  };

  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (selectedConversation) {
      eventSourceRef.current = new EventSource(
        `http://localhost:8081/conversations/${selectedConversation}`
      );

      eventSourceRef.current.onmessage = (event) => {
        console.log('Received event:', event.data);
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource error:', error);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    }
  }, [selectedConversation]);

  const handleCreateConversation = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await axios.post(
        'http://localhost:8081/conversations/create',
        {
          companyId: companyId,
        }
      );
      localStorage.setItem('conversationId', response.data.conversationId);
      setSelectedConversation(response.data.conversationId);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const companyId = localStorage.getItem('companyId');

      const response = await axios.post(
        'http://localhost:8081/conversations/send',
        {
          payload: {
            userMessage: message,
            userId: userId,
            companyId: companyId,
            conversationId: selectedConversation,
          },
        }
      );

      console.log('Message sent:', response.data);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSelectConversation = (conversationId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close(); // Close existing connection before selecting a new conversation
    }
    localStorage.setItem('conversationId', conversationId);
    setSelectedConversation(conversationId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleBack = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close(); // Close connection when going back
    }
    setSelectedConversation(null);
    // Ensure all previous EventSource connections are closed
    eventSourceRef.current = null; // Clear the reference
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="w-3/4 max-w-2xl min-w-[300px] min-h-[500px] bg-[#1e1e1e] flex flex-col shadow-lg rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-600 flex items-center justify-between rounded-t-2xl">
          <Typography variant="h5" className="text-white">
            {selectedConversation ? 'Chat Window' : 'Conversations'}
          </Typography>
          {!selectedConversation && (
            <Button
              variant="contained"
              startIcon={<PlusCircle />}
              onClick={handleCreateConversation}
              style={{ backgroundColor: '#4a4a4a', color: '#ffffff' }}
            >
              Start New Conversation
            </Button>
          )}
          {selectedConversation && (
            <>
              <IconButton color="inherit" onClick={handleBack}>
                <MessageCircle />
              </IconButton>
              <Button
                variant="outlined"
                onClick={handleBack}
                style={{ color: '#ffffff', borderColor: '#ffffff' }}
              >
                Back
              </Button>
            </>
          )}
        </div>

        {!selectedConversation ? (
          <div className="flex-1 p-4 overflow-y-auto bg-[#1e1e1e] text-white">
            {!Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MessagesSquare size={48} />
                <Typography variant="body1" className="mt-4">
                  No conversations yet
                </Typography>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className="p-4 bg-[#cccccc] rounded cursor-pointer hover:bg-[#bebebe] transition-colors"
                  >
                    <div className="flex flex-col">
                      <Typography
                        variant="body1"
                        className="text-black font-semibold mb-1"
                      >
                        Conversation {conversation.id.slice(0, 8)}...
                      </Typography>
                      {conversation.lastMessage ? (
                        <div className="text-sm text-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {conversation.lastMessage.chatUser}:
                            </span>
                            <span className="text-xs">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2">
                            {conversation.lastMessage.chatText}
                          </p>
                        </div>
                      ) : (
                        <Typography
                          variant="body2"
                          className="text-gray-600 italic"
                        >
                          No messages yet
                        </Typography>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-[#1e1e1e] text-white">
              {/* Chat messages will go here */}
            </div>
            <div className="p-4 border-t border-gray-600 bg-slate-300 flex items-center gap-2 rounded-b-2xl">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-3 bg-transparent text-black placeholder:text-gray-500 outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <IconButton
                className="text-gray-600 hover:text-blue-500 transition-colors"
                onClick={handleSendMessage}
              >
                <Send size={20} />
              </IconButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainPage;
