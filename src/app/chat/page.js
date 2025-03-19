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
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            chatUser: data.eventType === 'message_v1' ? 'user' : 'assistant',
            chatText: data.data.chatText || data.data.response,
            createdAt: Date.now(),
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
    <div className="flex h-screen justify-center items-center bg-[#f5f5f5]">
      <div className="w-[800px] h-[80vh] bg-white flex flex-col shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div
          className={`p-3 flex h-20 items-center ${selectedConversation ? 'justify-start' : 'justify-between'} text-[#e0e0e0] bg-[#333333] border-b border-[#444444]`}
        >
          {selectedConversation && (
            <button
              onClick={handleBackToConversations}
              className="text-[#e0e0e0] size-8 hover:bg-gray-800 mr-3 cursor-pointer rounded-md flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="ml-4">
            <Typography variant="h6" className="font-light">
              {selectedConversation ? 'WageWizard Chat' : 'Your Conversations'}
            </Typography>
          </div>
          {!selectedConversation && (
            <div className="mr-3">
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
            </div>
          )}
        </div>

        {!selectedConversation ? (
          <div className="flex-1 overflow-y-auto text-[#333333] bg-white scrollbar-thin scrollbar-thumb-[#cccccc] scrollbar-track-white">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <CircularProgress size={40} style={{ color: '#333333' }} />
                <Typography
                  variant="body1"
                  className="mt-4 text-[#333333] font-light"
                >
                  Loading conversations...
                </Typography>
              </div>
            ) : conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="p-8 rounded-full bg-[#f0f0f0] mb-4 shadow-inner">
                  <MessagesSquare size={48} className="text-[#333333]" />
                </div>
                <Typography
                  variant="body1"
                  className="mt-2 text-[#333333] font-light"
                >
                  No conversations yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PlusCircle size={16} />}
                  onClick={createNewConversation}
                  style={{
                    borderColor: '#333333',
                    color: '#333333',
                    marginTop: '16px',
                  }}
                  className="hover:bg-[#f0f0f0] transition-all duration-300"
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
                        className="p-4 cursor-pointer hover:bg-[#f0f0f0] transition-all duration-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Typography
                            variant="body2"
                            className="font-medium flex items-center text-[#333333]"
                          >
                            <span className="font-semibold">
                              Conversation on{' '}
                              {formatDate(
                                conv?.lastMessage?.createdAt || conv?.createdAt
                              )}
                            </span>
                          </Typography>
                        </div>
                        <div className="text-sm text-[#666666] truncate">
                          <span className="flex items-center">
                            {conv.lastMessage && conv.lastMessage.chatUser ? (
                              conv.lastMessage.chatUser === 'assistant' ? (
                                <Bot
                                  size={12}
                                  className="mr-1 text-[#333333]"
                                />
                              ) : (
                                <User
                                  size={12}
                                  className="mr-1 text-[#333333]"
                                />
                              )
                            ) : (
                              <MessageCircle
                                size={12}
                                className="mr-1 text-[#333333]"
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
            <div className="flex-1 p-4 overflow-y-auto text-[#333333] flex flex-col gap-4 bg-white scrollbar-thin scrollbar-thumb-[#cccccc] scrollbar-track-white">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <CircularProgress size={40} style={{ color: '#333333' }} />
                  <Typography
                    variant="body1"
                    className="mt-4 text-[#333333] font-light"
                  >
                    Loading messages...
                  </Typography>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#666666]">
                  <div className="p-8 rounded-full bg-[#f0f0f0] mb-4 shadow-inner">
                    <Bot size={48} className="text-[#333333]" />
                  </div>
                  <Typography
                    variant="body1"
                    className="text-center max-w-xs font-light text-[#333333]"
                  >
                    Hi there! I'm WageWizard, your payroll assistant. How can I
                    help you today?
                  </Typography>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <Fade in key={msg.id || index} timeout={400}>
                    <div className="flex flex-col">
                      <div
                        className={`p-3 rounded-lg shadow-sm ${
                          msg.chatUser === 'user'
                            ? 'bg-gray-200 self-end rounded-br-none text-[#333333] max-w-sm'
                            : 'bg-gray-100 self-start rounded-bl-none text-[#333333] max-w-md'
                        }`}
                      >
                        {msg.chatText ? (
                          <div className="markdown-content prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ node, ...props }) => (
                                  <p className="mb-2 last:mb-0" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul
                                    className="list-disc pl-5 mb-2"
                                    {...props}
                                  />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol
                                    className="list-decimal pl-5 mb-2"
                                    {...props}
                                  />
                                ),
                                li: ({ node, ...props }) => (
                                  <li className="mb-1" {...props} />
                                ),
                                h1: ({ node, ...props }) => (
                                  <h1
                                    className="text-xl font-bold mb-2 mt-3"
                                    {...props}
                                  />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2
                                    className="text-lg font-bold mb-2 mt-3"
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
                                    className="text-blue-600 hover:underline"
                                    {...props}
                                  />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote
                                    className="border-l-2 border-[#cccccc] pl-3 italic my-2"
                                    {...props}
                                  />
                                ),
                                code: ({ node, inline, ...props }) =>
                                  inline ? (
                                    <code
                                      className="bg-[#f0f0f0] px-1 py-0.5 rounded text-[#333333]"
                                      {...props}
                                    />
                                  ) : (
                                    <code
                                      className="block bg-[#2a2a2a] p-2 rounded text-[#e0e0e0] overflow-x-auto my-2"
                                      {...props}
                                    />
                                  ),
                                hr: ({ node, ...props }) => (
                                  <hr
                                    className="border-[#444444] my-3"
                                    {...props}
                                  />
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table
                                      className="min-w-full border-collapse border border-[#444444]"
                                      {...props}
                                    />
                                  </div>
                                ),
                                th: ({ node, ...props }) => (
                                  <th
                                    className="border border-[#444444] px-3 py-2 bg-[#2a2a2a]"
                                    {...props}
                                  />
                                ),
                                td: ({ node, ...props }) => (
                                  <td
                                    className="border border-[#444444] px-3 py-2"
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
                        className={`text-[10px] text-[#aaaaaa] mt-1 ${
                          msg.chatUser === 'user' ? 'self-end' : 'self-start'
                        }`}
                      >
                        {msg.chatUser === 'user' ? 'You' : 'Assistant'}
                        <span className="font-extrabold">{' · '}</span>
                        {msg.createdAt && (
                          <span className="">{formatDate(msg.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </Fade>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 flex h-20 items-center gap-2 border-t border-gray-300">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 text-black placeholder-gray-500 outline-none transition-all duration-200"
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
