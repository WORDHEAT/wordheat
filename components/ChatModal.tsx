import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { X, MessageSquare, ChevronLeft, Send, User, UserPlus, Trash2, MoreVertical, Search } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Sub-components ---

const FriendList = ({
  friends,
  activeFriend,
  onSelectFriend,
  onAddFriend,
  onRemoveFriend,
  friendInput,
  setFriendInput,
  messages,
  username
}: {
  friends: string[];
  activeFriend: string | null;
  onSelectFriend: (friend: string) => void;
  onAddFriend: (e: React.FormEvent) => void;
  onRemoveFriend: (friend: string) => void;
  friendInput: string;
  setFriendInput: (val: string) => void;
  messages: any[];
  username: string;
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* Add Friend Input */}
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <form onSubmit={onAddFriend} className="flex gap-2 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            placeholder="Find or add a friend..."
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!friendInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl w-10 flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
          >
            <UserPlus size={18} />
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <UserPlus size={32} className="opacity-50" />
            </div>
            <p className="text-base font-medium text-slate-400">No friends yet</p>
            <p className="text-sm opacity-60 mt-1 max-w-[200px]">Add someone by their username to start chatting!</p>
          </div>
        ) : (
          friends.map((friendName, i) => {
            const unreadCount = messages.filter(m => m.from === friendName && !m.read).length;
            const lastMsg = messages
              .filter(m => (m.from === username && m.to === friendName) || (m.from === friendName && m.to === username))
              .sort((a, b) => b.timestamp - a.timestamp)[0];

            return (
              <div
                key={i}
                onClick={() => onSelectFriend(friendName)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {friendName.charAt(0).toUpperCase()}
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-slate-900 shadow-sm animate-bounce-subtle">
                      {unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{friendName}</span>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-500 font-medium">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate pr-2">
                    {lastMsg ? (
                      <span className={unreadCount > 0 ? 'text-slate-200 font-medium' : ''}>
                        {lastMsg.from === username ? 'You: ' : ''}{lastMsg.text}
                      </span>
                    ) : (
                      <span className="italic opacity-50">Start a conversation</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFriend(friendName); }}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove friend"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const MessageList = ({
  messages,
  username,
  activeFriend,
  messagesEndRef
}: {
  messages: any[];
  username: string;
  activeFriend: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  const filteredMessages = messages
    .filter(m => (m.from === username && m.to === activeFriend) || (m.from === activeFriend && m.to === username))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60 animate-fade-in">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={40} className="text-indigo-400" />
        </div>
        <p className="text-lg font-medium text-slate-300">No messages yet</p>
        <p className="text-sm">Say hello to {activeFriend}!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {filteredMessages.map((msg, index, arr) => {
        const isMe = msg.from === username;
        const isLast = index === arr.length - 1;
        const showTime = isLast || (index < arr.length - 1 && arr[index + 1].timestamp - msg.timestamp > 300000);
        const isFirstInGroup = index === 0 || arr[index - 1].from !== msg.from || (msg.timestamp - arr[index - 1].timestamp > 300000);

        return (
          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
            <div className={`max-w-[85%] relative group ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed shadow-md transition-all ${isMe
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700'
                  } ${isFirstInGroup ? 'mt-2' : 'mt-1'}`}
              >
                {msg.text}
              </div>
              {showTime && (
                <div className={`text-[10px] mt-1 px-1 opacity-50 font-medium ${isMe ? 'text-right text-indigo-200' : 'text-left text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

// --- Main Component ---

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { profile, addFriend, removeFriend, sendMessage, markChatRead, deleteChatHistory } = useUser();
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [friendInput, setFriendInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setActiveFriend(null);
      setFriendInput('');
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeFriend && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeFriend, profile.messages]);

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
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-slate-900/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[650px] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            {activeFriend ? (
              <button
                onClick={() => setActiveFriend(null)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ChevronLeft size={22} />
              </button>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <MessageSquare size={20} strokeWidth={2.5} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {activeFriend ? activeFriend : 'Messages'}
              </h3>
              {activeFriend && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </p>
              )}
            </div>
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
                className="w-9 h-9 rounded-full hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                title="Delete conversation"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950/30 relative z-0">
          {activeFriend ? (
            <>
              <MessageList
                messages={profile.messages}
                username={profile.username}
                activeFriend={activeFriend}
                messagesEndRef={messagesEndRef}
              />

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-md flex gap-2 shrink-0">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoFocus
                  enterKeyHint="send"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl w-12 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  <Send size={20} className={messageInput.trim() ? 'ml-0.5' : ''} />
                </button>
              </form>
            </>
          ) : (
            <FriendList
              friends={profile.friends}
              activeFriend={activeFriend}
              onSelectFriend={setActiveFriend}
              onAddFriend={handleAddFriend}
              onRemoveFriend={removeFriend}
              friendInput={friendInput}
              setFriendInput={setFriendInput}
              messages={profile.messages}
              username={profile.username}
            />
          )}
        </div>
      </div>
    </div>
  );
};