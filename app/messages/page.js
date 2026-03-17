'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Send } from 'lucide-react';

export default function Messages() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    fetchMessages();
  }, [user, token]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages || []);

      // Extract unique conversations
      const uniqueUsers = new Map();
      data.messages?.forEach((msg) => {
        const otherUser = msg.sender._id === user.id ? msg.receiver : msg.sender;
        if (!uniqueUsers.has(otherUser._id)) {
          uniqueUsers.set(otherUser._id, otherUser);
        }
      });

      setConversations(Array.from(uniqueUsers.values()));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedUser._id,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages([...messages, data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getConversationMessages = (userId) => {
    return messages.filter(
      (msg) =>
        (msg.sender._id === user.id && msg.receiver._id === userId) ||
        (msg.sender._id === userId && msg.receiver._id === user.id)
    );
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Sign in to view messages</p>
          <p className="text-muted-foreground">You need to be logged in to chat with sellers</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
        {/* Conversations List */}
        <div className="w-full md:w-64 border-r border-border bg-muted/50 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <div className="text-center text-muted-foreground">Loading messages...</div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full px-4 py-3 border-b border-border text-left hover:bg-muted transition-colors ${
                  selectedUser?._id === conv._id ? 'bg-primary/10' : ''
                }`}
              >
                <p className="font-medium text-foreground">{conv.name}</p>
                <p className="text-xs text-muted-foreground">@{conv.email}</p>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col hidden md:flex">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-border p-4 bg-card">
                <p className="font-semibold text-foreground">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">@{selectedUser.email}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getConversationMessages(selectedUser._id).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${
                        msg.sender._id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-border p-4 bg-card flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {conversations.length > 0
                ? 'Select a conversation to start chatting'
                : 'No conversations yet'}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
