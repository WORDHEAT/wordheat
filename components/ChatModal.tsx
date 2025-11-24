import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { X, MessageSquare, ChevronLeft, Send, User, UserPlus, Trash2 } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { profile, addFriend, removeFriend, sendMessage, markChatRead, deleteChatHistory } = useUser();
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [friendInput, setFriendInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setActiveFriend(null);
      setFriendInput('');
    }
  }, [isOpen]);

  // Smart scroll to bottom - only when new messages arrive AND user is near bottom
  useEffect(() => {
    if (!activeFriend) return;

    const currentMessages = profile.messages.filter(m =>
      (m.from === profile.username && m.to === activeFriend) ||
      (m.from === activeFriend && m.to === profile.username)
    );

    const currentMessageCount = currentMessages.length;
    const hasNewMessage = currentMessageCount > prevMessageCountRef.current;

    if (hasNewMessage && messagesEndRef.current && messageContainerRef.current) {
      const container = messageContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // Only auto-scroll if user was already near the bottom
      if (isNearBottom || prevMessageCountRef.current === 0) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMessageCountRef.current = currentMessageCount;
  }, [activeFriend, profile.messages]);

  // Reset message count when changing active friend
  useEffect(() => {
    prevMessageCountRef.current = 0;
  }, [activeFriend]);

  // Mark read
  useEffect(() => {
    if (activeFriend) {
      markChatRead(activeFriend);
    }
  }, [activeFriend, profile.messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeFriend && messageInput.trim()) {
      sendMessage(activeFriend, messageInput);
      setMessageInput('');
      // Keep keyboard open without flashing - call focus synchronously
      messageInputRef.current?.focus({ preventScroll: true });
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (addFriend(friendInput)) {
      setFriendInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div
        className="bg-slate-900/95 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85vh] sm:h-[600px] sm:max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            {activeFriend ? (
              <button onClick={() => setActiveFriend(null)} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <MessageSquare size={20} strokeWidth={2.5} />
              </div>
            )}
            <h3 className="text-lg font-bold text-white">
              {activeFriend ? activeFriend : 'Friends & Chat'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {activeFriend && (
              <button
                onClick={() => {
                  if (confirm(`Delete all messages with ${activeFriend}?`)) {
                    deleteChatHistory(activeFriend);
                    setActiveFriend(null);
                  }
                }}
                className="w-8 h-8 rounded-full hover:bg-red-900/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                title="Delete conversation"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950/30">
          {activeFriend ? (
            <>
              {/* Messages Area */}
              <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide overscroll-y-contain touch-action-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {profile.messages
                  .filter(m => (m.from === profile.username && m.to === activeFriend) || (m.from === activeFriend && m.to === profile.username))
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                    <MessageSquare size={48} className="mb-2" />
                    <p>Say hello to {activeFriend}!</p>
                  </div>
                ) : (
                  profile.messages
                    .filter(m => (m.from === profile.username && m.to === activeFriend) || (m.from === activeFriend && m.to === profile.username))
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((msg, index, arr) => {
                      const isMe = msg.from === profile.username;
                      const isLast = index === arr.length - 1;
                      const showTime = isLast || (index < arr.length - 1 && arr[index + 1].timestamp - msg.timestamp > 300000); // Show time if last or gap > 5min

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                            }`}>
                            {msg.text}
                          </div>
                          {showTime && (
                            <div className={`text-[10px] mt-1 px-1 opacity-50 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  autoFocus
                  enterKeyHint="send"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl w-12 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            /* Friends List View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Add Friend Input */}
              <div className="p-4 border-b border-slate-800/50">
                <form onSubmit={handleAddFriend} className="flex gap-2">
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Add friend by username..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!friendInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl w-10 flex items-center justify-center transition-colors"
                  >
                    <UserPlus size={18} />
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {profile.friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500">
                    <UserPlus size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No friends yet.</p>
                    <p className="text-xs opacity-70">Add someone to start chatting!</p>
                  </div>
                ) : (
                  profile.friends.map((friendName, i) => {
                    const unreadCount = profile.messages.filter(m => m.from === friendName && !m.read).length;
                    const lastMsg = profile.messages
                      .filter(m => (m.from === profile.username && m.to === friendName) || (m.from === friendName && m.to === profile.username))
                      .sort((a, b) => b.timestamp - a.timestamp)[0];

                    return (
                      <div
                        key={i}
                        onClick={() => setActiveFriend(friendName)}
                        className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10 shrink-0 relative">
                          <User size={18} />
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-slate-900">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{friendName}</span>
                            {lastMsg && (
                              <span className="text-[9px] text-slate-500">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {lastMsg ? (
                              <span className={unreadCount > 0 ? 'text-slate-300 font-medium' : ''}>
                                {lastMsg.from === profile.username ? 'You: ' : ''}{lastMsg.text}
                              </span>
                            ) : (
                              <span className="italic opacity-50">No messages yet</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFriend(friendName); }}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};