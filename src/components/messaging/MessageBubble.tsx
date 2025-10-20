import { useState } from 'react';
import { Smile, Check, CheckCheck } from 'lucide-react';
import type { Message } from '../../types/message';
import Avatar from '../Avatar';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId: string;
  onAddReaction?: (emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🏏', '💪'];

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  currentUserId,
  onAddReaction,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  function formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const isRead = message.readBy && message.readBy.length > 1;
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          message.senderPhotoURL ? (
            <img
              src={message.senderPhotoURL}
              alt={message.senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Avatar name={message.senderName} size="sm" />
          )
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name & Time */}
        {showAvatar && !isOwn && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-sm font-medium text-gray-700">{message.senderName}</span>
            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative group/message">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-soft-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

            {message.edited && (
              <span
                className={`text-xs italic mt-1 block ${
                  isOwn ? 'text-soft-blue-100' : 'text-gray-500'
                }`}
              >
                (edited)
              </span>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={url}
                      alt="Attachment"
                      className="rounded-lg max-w-sm max-h-64 object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Reaction Button */}
          {onAddReaction && (
            <div className="absolute -bottom-2 right-2 opacity-0 group-hover/message:opacity-100 transition">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                title="Add reaction"
              >
                <Smile className="w-4 h-4 text-gray-600" />
              </button>

              {/* Reaction Picker */}
              {showReactionPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onAddReaction(emoji);
                        setShowReactionPicker(false);
                      }}
                      className="hover:bg-gray-100 rounded p-1 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {hasReactions && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {Object.entries(message.reactions!).map(([emoji, userIds]) => {
              if (!userIds || userIds.length === 0) return null;
              const hasReacted = userIds.includes(currentUserId);

              return (
                <button
                  key={emoji}
                  onClick={() => onAddReaction?.(emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                    hasReacted
                      ? 'bg-soft-blue-100 border-soft-blue-300 text-soft-blue-700'
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={`${userIds.length} reaction${userIds.length > 1 ? 's' : ''}`}
                >
                  <span>{emoji}</span>
                  <span className="font-medium">{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Read Status & Time (for own messages) */}
        {isOwn && (
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
            {isRead ? (
              <CheckCheck className="w-3 h-3 text-soft-blue-600" title="Read" />
            ) : (
              <Check className="w-3 h-3 text-gray-400" title="Sent" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
