'use client';

import { BASE_URL, wwAPI } from '@/utils/api_instance';
import {
  Button,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ArrowLeft,
  Bot,
  Clock,
  MessageCircle,
  MessagesSquare,
  MessagesSquareIcon,
  PlusCircle,
  Send,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const MainPage = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const eventSourceRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await wwAPI.post('/auth/verifyToken', {
          token: localStorage.getItem('token'),
        });
      } catch (error) {
        console.error('Token verification failed:', error);
        window.location.href = '/auth/login';
      }
    };

    verifyToken();
  }, []);

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
  }, [messages, isTyping]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await wwAPI.post('/conversations/all', { companyId });
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
      const response = await wwAPI.get(
        `/conversations/${conversationId}/messages`
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
        `${BASE_URL}/sse/${selectedConversation}`
      );
      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.eventType) {
          return;
        }

        if (data.eventType === 'response_v1') {
          setIsTyping(false);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              chatUser: 'assistant',
              chatText: data.data.response,
              createdAt: Date.now(),
            },
          ]);
        } else if (data.eventType === 'message_v1') {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              chatUser: 'user',
              chatText: data.data.chatText,
              createdAt: Date.now(),
            },
          ]);
        }
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
    if (isTyping) {
      return;
    }
    if (!currentMessage.trim()) return;
    const message = currentMessage;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        chatUser: 'user',
        chatText: message,
        createdAt: Date.now(),
      },
    ]);
    setCurrentMessage('');
    setIsTyping(true);
    try {
      const userId = localStorage.getItem('userId');
      const companyId = localStorage.getItem('companyId');
      await wwAPI.post('/conversations/send', {
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
      setIsTyping(false);
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
      const response = await wwAPI.post('/conversations/create', {
        userId,
        companyId,
      });
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
    fetchConversations();
    // Remove the conversationId from localStorage when going back
    localStorage.removeItem('conversationId');
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="w-[650px] h-[85vh] bg-white flex flex-col shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 border border-gray-200">
        <div
          className={`p-4 flex h-20 items-center ${selectedConversation ? 'justify-start' : 'justify-between'} text-white bg-gradient-to-r from-gray-800 to-black border-b border-gray-600`}
        >
          {selectedConversation && (
            <button
              onClick={handleBackToConversations}
              className="text-white size-9 hover:bg-white/25 focus:bg-white/30 mr-3 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="ml-2">
            <Typography
              variant="h6"
              className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-sm"
            >
              {selectedConversation ? 'WageWizard Chat' : 'Your Conversations'}
            </Typography>
          </div>
          {!selectedConversation && (
            <div className="mr-2">
              <button
                onClick={createNewConversation}
                className="text-white hover:bg-white/25 focus:bg-white/30 cursor-pointer rounded-full flex items-center justify-center gap-2 px-4 py-2 transition-all duration-200"
              >
                <PlusCircle size={16} /> New Chat
              </button>
            </div>
          )}
        </div>

        {!selectedConversation ? (
          <div className="flex-1 overflow-y-auto text-gray-800 bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <CircularProgress size={40} style={{ color: '#555555' }} />
                <Typography
                  variant="body1"
                  className="mt-4 text-gray-600 font-light"
                >
                  Loading conversations...
                </Typography>
              </div>
            ) : conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="p-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 mb-6 shadow-inner">
                  <MessagesSquare size={52} className="text-gray-600" />
                </div>
                <Typography
                  variant="body1"
                  className="mt-2 text-gray-700 font-light text-lg"
                >
                  No conversations yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PlusCircle size={18} />}
                  onClick={createNewConversation}
                  style={{
                    borderColor: '#555555',
                    color: '#555555',
                    marginTop: '20px',
                  }}
                  className="hover:bg-gray-100 transition-all duration-300 rounded-full px-6 py-2 text-sm"
                >
                  Start a new conversation
                </Button>
              </div>
            ) : (
              <div className="w-full">
                {[...conversations]
                  .sort((a, b) => {
                    // If a has no lastMessage, it should come first
                    if (!a.lastMessage || !a.lastMessage.createdAt) return -1;
                    // If b has no lastMessage, a should come after
                    if (!b.lastMessage || !b.lastMessage.createdAt) return 1;
                    // Otherwise sort by date, newest first
                    return (
                      new Date(b.lastMessage.createdAt) -
                      new Date(a.lastMessage.createdAt)
                    );
                  })
                  .map((conv, index) => (
                    <div key={conv.id}>
                      <div
                        onClick={() => setSelectedConversation(conv.id)}
                        className="p-5 flex flex-row items-center cursor-pointer hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="mr-5 p-2 border border-gray-300 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-sm">
                          <MessagesSquareIcon
                            size={28}
                            strokeWidth={1.5}
                            className="text-gray-700"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <Typography
                              variant="body2"
                              className="font-medium flex items-center text-gray-800"
                            >
                              <span className="font-semibold">
                                Conversation on{' '}
                                {formatDate(
                                  conv?.lastMessage?.createdAt ||
                                    conv?.createdAt
                                )}
                              </span>
                            </Typography>
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            <span className="flex items-center">
                              {conv.lastMessage && conv.lastMessage.chatUser ? (
                                conv.lastMessage.chatUser === 'assistant' ? (
                                  <Bot
                                    size={12}
                                    className="mr-1 text-gray-600"
                                  />
                                ) : (
                                  <User
                                    size={12}
                                    className="mr-1 text-gray-600"
                                  />
                                )
                              ) : (
                                <MessageCircle
                                  size={12}
                                  className="mr-1 text-gray-600"
                                />
                              )}
                              {conv.lastMessage && conv.lastMessage.chatText
                                ? conv.lastMessage.chatText.length > 75
                                  ? conv.lastMessage.chatText.substring(0, 75) +
                                    '...'
                                  : conv.lastMessage.chatText
                                : 'No messages yet'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < conversations.length - 1 && (
                        <Divider
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 p-5 overflow-y-auto text-gray-800 flex flex-col gap-5 bg-gradient-to-br from-gray-100 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <CircularProgress size={40} style={{ color: '#555555' }} />
                  <Typography
                    variant="body1"
                    className="mt-4 text-gray-600 font-light"
                  >
                    Loading messages...
                  </Typography>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <div className="p-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 mb-6 shadow-inner">
                    <Bot size={52} className="text-gray-600" />
                  </div>
                  <Typography
                    variant="body1"
                    className="text-center max-w-sm font-light text-gray-700 text-lg"
                  >
                    Hi there! I'm WageWizard, your payroll assistant. How can I
                    help you today?
                  </Typography>
                </div>
              ) : (
                messages
                  .filter((msg) => msg.chatText)
                  .map((msg, index) => (
                    <Fade in key={msg.id || index} timeout={400}>
                      <div className="flex flex-col">
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            msg.chatUser === 'user'
                              ? 'bg-gray-200 self-end rounded-br-none text-gray-800 max-w-sm'
                              : 'bg-white border border-gray-200 self-start rounded-bl-none text-gray-800 max-w-md'
                          }`}
                        >
                          {msg.chatText ? (
                            <div className="markdown-content prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p className="mb-3 last:mb-0" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc pl-5 mb-3"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal pl-5 mb-3"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="mb-1" {...props} />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="text-xl font-bold mb-3 mt-4"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="text-lg font-bold mb-3 mt-4"
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className="text-md font-bold mb-2 mt-3"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong className="font-bold" {...props} />
                                  ),
                                  em: ({ node, ...props }) => (
                                    <em className="italic" {...props} />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className="text-gray-700 hover:underline font-medium"
                                      {...props}
                                    />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      className="border-l-3 border-gray-400 pl-4 italic my-3 text-gray-600"
                                      {...props}
                                    />
                                  ),
                                  code: ({ node, inline, ...props }) =>
                                    inline ? (
                                      <code
                                        className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-sm"
                                        {...props}
                                      />
                                    ) : (
                                      <code
                                        className="block bg-gray-900 p-3 rounded-lg text-gray-100 overflow-x-auto my-3 font-mono text-sm"
                                        {...props}
                                      />
                                    ),
                                  hr: ({ node, ...props }) => (
                                    <hr
                                      className="border-gray-300 my-4"
                                      {...props}
                                    />
                                  ),
                                  table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
                                      <table
                                        className="min-w-full border-collapse"
                                        {...props}
                                      />
                                    </div>
                                  ),
                                  th: ({ node, ...props }) => (
                                    <th
                                      className="border-b border-gray-300 px-4 py-2 bg-gray-100 text-left"
                                      {...props}
                                    />
                                  ),
                                  td: ({ node, ...props }) => (
                                    <td
                                      className="border-b border-gray-200 px-4 py-2"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {msg.chatText}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div>{msg.chatText}</div>
                          )}
                        </div>
                        <div
                          className={`text-[11px] text-gray-500 mt-1.5 ${
                            msg.chatUser === 'user'
                              ? 'self-end mr-1'
                              : 'self-start ml-1'
                          }`}
                        >
                          {msg.chatUser === 'user' ? 'You' : 'Assistant'}
                          <span className="font-extrabold">{' · '}</span>
                          {msg.createdAt && (
                            <span className="">
                              {formatDate(msg.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Fade>
                  ))
              )}
              {isTyping && (
                <Fade in={isTyping}>
                  <div className="flex flex-col mb-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-[80%] self-start rounded-bl-none shadow-sm">
                      <div className="flex items-center">
                        <div className="flex space-x-1.5">
                          <div
                            className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1.5 self-start ml-1">
                      Assistant<span className="font-extrabold">{' · '}</span>
                      <span className="">Typing...</span>
                    </div>
                  </div>
                </Fade>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 flex h-24 items-center gap-3 border-t border-gray-200 bg-white">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-3 text-gray-800 placeholder-gray-400 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loadingMessages}
              />
              <IconButton
                className="text-[#333333] bg-[#cccccc] hover:bg-[#ffffff] transition-colors duration-200"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || loadingMessages || isTyping}
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
