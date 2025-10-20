import { useState } from 'react';
import { Search, Plus, Users, User } from 'lucide-react';
import type { Conversation } from '../../types/message';
import Avatar from '../Avatar';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  currentUserId,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    if (conv.type === 'direct') {
      const otherUserId = conv.participants.find((p) => p !== currentUserId);
      const otherUserName = otherUserId ? conv.participantNames[otherUserId] : '';
      return otherUserName?.toLowerCase().includes(searchLower);
    }
    return conv.name?.toLowerCase().includes(searchLower);
  });

  function formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getConversationName(conversation: Conversation): string {
    if (conversation.type === 'team') {
      return conversation.name || 'Team Chat';
    }
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    // Direct message - show other person's name
    const otherUserId = conversation.participants.find((p) => p !== currentUserId);
    return otherUserId ? conversation.participantNames[otherUserId] : 'Unknown';
  }

  function getConversationPhoto(conversation: Conversation): string | null {
    if (conversation.type === 'direct') {
      const otherUserId = conversation.participants.find((p) => p !== currentUserId);
      return otherUserId ? conversation.participantPhotos[otherUserId] : null;
    }
    return conversation.photoURL || null;
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <button
            onClick={onNewConversation}
            className="p-2 rounded-lg hover:bg-soft-blue-100 text-soft-blue-600 transition"
            title="New conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <button
              onClick={onNewConversation}
              className="mt-2 text-sm text-soft-blue-600 hover:underline"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
              const conversationName = getConversationName(conversation);
              const conversationPhoto = getConversationPhoto(conversation);

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    isActive
                      ? 'bg-soft-blue-100 border-l-4 border-soft-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.type === 'team' ? (
                        <div className="w-12 h-12 rounded-full bg-soft-orange-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-soft-orange-600" />
                        </div>
                      ) : conversation.type === 'group' ? (
                        <div className="w-12 h-12 rounded-full bg-soft-blue-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-soft-blue-600" />
                        </div>
                      ) : conversationPhoto ? (
                        <img
                          src={conversationPhoto}
                          alt={conversationName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Avatar name={conversationName} size="md" />
                      )}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversationName}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                          {conversation.lastMessage.text}
                        </p>
                      )}
                      {conversation.type === 'group' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {conversation.participants.length} members
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
