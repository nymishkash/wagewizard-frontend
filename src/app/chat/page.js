'use client';

import { Typography, IconButton, Button, Fade, Divider, CircularProgress } from '@mui/material';
import {
  MessageCircle,
  Send,
  PlusCircle,
  MessagesSquare,
  ArrowLeft,
  Clock,
  User,
  Bot,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MainPage = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Check if there's a saved conversation ID in localStorage
    const savedConversationId = localStorage.getItem('conversationId');
    if (savedConversationId) {
      setSelectedConversation(savedConversationId);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await axios.post(
        'http://localhost:8081/conversations/all',
        { companyId }
      );
      setConversations(response.data?.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/conversations/${conversationId}/messages`
      );
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (selectedConversation) {
      // Save the selected conversation ID to localStorage
      localStorage.setItem('conversationId', selectedConversation);
      
      // Fetch previous messages when a conversation is selected
      fetchConversationMessages(selectedConversation);
      
      eventSourceRef.current = new EventSource(
        `http://localhost:8081/conversations/${selectedConversation}`
      );
      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.eventType) {
          return;
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            chatUser: data.eventType === 'message_v1' ? 'user' : 'assistant',
            chatText: data.data.chatText || data.data.response,
          },
        ]);
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSourceRef.current.close();
      };
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    const message = currentMessage;
    setCurrentMessage('');
    try {
      const userId = localStorage.getItem('userId');
      const companyId = localStorage.getItem('companyId');
      await axios.post('http://localhost:8081/conversations/send', {
        payload: {
          userMessage: message,
          userId,
          companyId,
          conversationId: selectedConversation,
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setCurrentMessage(message);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const createNewConversation = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const companyId = localStorage.getItem('companyId');
      const response = await axios.post(
        'http://localhost:8081/conversations/create',
        {
          userId,
          companyId,
        }
      );
      if (response.data && response.data.conversationId) {
        setSelectedConversation(response.data.conversationId);
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
    // Remove the conversationId from localStorage when going back
    localStorage.removeItem('conversationId');
  };

  return (
    <div className="flex h-screen justify-center items-center bg-[#1a1a1a]">
      <div className="w-[800px] h-[600px] bg-[#2d2d2d] flex flex-col shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="p-3 flex items-center justify-between text-[#e0e0e0] bg-[#333333] border-b border-[#444444]">
          {selectedConversation && (
            <IconButton
              onClick={handleBackToConversations}
              className="text-[#e0e0e0] hover:text-white mr-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <ArrowLeft size={20} />
            </IconButton>
          )}
          <Typography variant="h6" className="flex-1 font-light">
            {selectedConversation ? 'WageWizard Chat' : 'Your Conversations'}
          </Typography>
          {!selectedConversation && (
            <Button
              variant="text"
              startIcon={<PlusCircle size={16} />}
              onClick={createNewConversation}
              style={{ color: '#cccccc' }}
              size="small"
              className="hover:bg-[#444444] transition-colors duration-200"
            >
              New Chat
            </Button>
          )}
        </div>

        {!selectedConversation ? (
          <div className="flex-1 overflow-y-auto text-[#e0e0e0] bg-[#252525] scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-[#252525]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-[#e0e0e0]">
                <CircularProgress size={40} style={{ color: '#cccccc' }} />
                <Typography variant="body1" className="mt-4 text-[#cccccc] font-light">
                  Loading conversations...
                </Typography>
              </div>
            ) : conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#e0e0e0]">
                <div className="p-8 rounded-full bg-[#333333] mb-4 shadow-inner">
                  <MessagesSquare size={48} className="text-[#cccccc]" />
                </div>
                <Typography variant="body1" className="mt-2 text-[#cccccc] font-light">
                  No conversations yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PlusCircle size={16} />}
                  onClick={createNewConversation}
                  style={{
                    borderColor: '#cccccc',
                    color: '#cccccc',
                    marginTop: '16px',
                  }}
                  className="hover:bg-[#333333] transition-all duration-300"
                >
                  Start a new conversation
                </Button>
              </div>
            ) : (
              <div className="w-full">
                {conversations.map((conv, index) => (
                  <div key={conv.id}>
                    <div
                      onClick={() => setSelectedConversation(conv.id)}
                      className="p-4 cursor-pointer hover:bg-[#333333] transition-all duration-200 border-l-2 border-transparent hover:border-l-[#cccccc]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Typography
                          variant="body2"
                          className="font-medium flex items-center text-[#cccccc]"
                        >
                          <MessageCircle
                            size={14}
                            className="mr-2 text-[#cccccc]"
                          />
                          Conversation {conv.id.slice(0, 6)}...
                        </Typography>
                        <div className="flex items-center text-xs text-[#aaaaaa]">
                          <Clock size={12} className="mr-1" />
                          {conv.lastMessage && conv.lastMessage.createdAt 
                            ? formatDate(conv.lastMessage.createdAt)
                            : "No messages yet"}
                        </div>
                      </div>
                      <div className="text-sm text-[#aaaaaa] truncate">
                        <span className="flex items-center">
                          {conv.lastMessage && conv.lastMessage.chatUser ? (
                            conv.lastMessage.chatUser === 'assistant' ? (
                              <Bot size={12} className="mr-1 text-[#cccccc]" />
                            ) : (
                              <User size={12} className="mr-1 text-[#cccccc]" />
                            )
                          ) : (
                            <MessageCircle size={12} className="mr-1 text-[#cccccc]" />
                          )}
                          {conv.lastMessage && conv.lastMessage.chatText 
                            ? conv.lastMessage.chatText 
                            : "No messages yet"}
                        </span>
                      </div>
                    </div>
                    {index < conversations.length - 1 && (
                      <Divider
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-y-auto text-[#e0e0e0] flex flex-col gap-4 bg-[#252525] scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-[#252525]">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center text-[#e0e0e0]">
                  <CircularProgress size={40} style={{ color: '#cccccc' }} />
                  <Typography variant="body1" className="mt-4 text-[#cccccc] font-light">
                    Loading messages...
                  </Typography>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#aaaaaa]">
                  <div className="p-8 rounded-full bg-[#333333] mb-4 shadow-inner">
                    <Bot size={48} className="text-[#cccccc]" />
                  </div>
                  <Typography variant="body1" className="text-center max-w-xs font-light text-[#cccccc]">
                    Hi there! I'm WageWizard, your payroll assistant. How can I
                    help you today?
                  </Typography>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <Fade in key={msg.id || index} timeout={400}>
                    <div className="flex flex-col">
                      <div
                        className={`p-3 max-w-sm rounded-lg shadow-sm ${
                          msg.chatUser === 'user'
                            ? 'bg-[#333333] self-end rounded-br-none text-[#cccccc]'
                            : 'bg-[#3a3a3a] self-start rounded-bl-none text-[#e0e0e0]'
                        }`}
                      >
                        {msg.chatText}
                      </div>
                      <div className={`text-xs text-[#aaaaaa] mt-1 ${
                        msg.chatUser === 'user' ? 'self-end mr-2' : 'self-start ml-2'
                      }`}>
                        {msg.chatUser === 'user' ? 'You' : 'Assistant'}
                        {msg.createdAt && (
                          <span className="ml-2">{formatDate(msg.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </Fade>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-[#333333] flex items-center gap-2 border-t border-[#444444]">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 bg-[#252525] text-[#e0e0e0] placeholder-gray-500 rounded-md outline-none focus:ring-1 focus:ring-[#cccccc] border border-[#444444] transition-all duration-200"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loadingMessages}
              />
              <IconButton
                className="text-[#333333] bg-[#cccccc] hover:bg-[#ffffff] transition-colors duration-200"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || loadingMessages}
              >
                <Send size={18} />
              </IconButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainPage;
