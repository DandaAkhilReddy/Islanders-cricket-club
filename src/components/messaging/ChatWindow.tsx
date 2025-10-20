import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Loader2, Users, Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation, Message } from '../../types/message';
import MessageBubble from './MessageBubble';
import { sendMessage, markConversationAsRead, addReaction, removeReaction } from '../../services/messageService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  currentUserName: string;
  currentUserPhoto?: string | null;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  currentUserName,
  currentUserPhoto,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation) {
      markConversationAsRead(conversation.id, currentUserId).catch((error) => {
        console.error('Failed to mark as read:', error);
      });
    }
  }, [conversation, currentUserId]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    const trimmedText = messageText.trim();
    if (!trimmedText || sending) return;

    setSending(true);
    try {
      await sendMessage(conversation.id, currentUserId, currentUserName, currentUserPhoto, {
        text: trimmedText,
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const fileKey = `messages/${conversation.id}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, fileKey);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await sendMessage(conversation.id, currentUserId, currentUserName, currentUserPhoto, {
        text: file.name,
        attachments: [url],
      });

      toast.success('File uploaded');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleReaction(messageId: string, emoji: string, existingReactions?: Record<string, string[]>) {
    try {
      const hasReacted = existingReactions?.[emoji]?.includes(currentUserId);

      if (hasReacted) {
        await removeReaction(conversation.id, messageId, currentUserId, emoji);
      } else {
        await addReaction(conversation.id, messageId, currentUserId, emoji);
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  }

  function getConversationTitle(): string {
    if (conversation.type === 'team') {
      return conversation.name || 'Team Chat';
    }
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    // Direct message
    const otherUserId = conversation.participants.find((p) => p !== currentUserId);
    return otherUserId ? conversation.participantNames[otherUserId] : 'Unknown';
  }

  function getConversationSubtitle(): string {
    if (conversation.type === 'team') {
      return 'Team-wide communication';
    }
    if (conversation.type === 'group') {
      return `${conversation.participants.length} members`;
    }
    // Check if typing
    const typingUsers = conversation.typing?.filter((uid) => uid !== currentUserId) || [];
    if (typingUsers.length > 0) {
      return 'typing...';
    }
    return 'Active';
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {conversation.type === 'team' || conversation.type === 'group' ? (
              <div className="w-10 h-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-soft-blue-600" />
              </div>
            ) : null}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getConversationTitle()}</h2>
              <p className="text-sm text-gray-500">{getConversationSubtitle()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              title="Voice call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              title="Video call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                currentUserId={currentUserId}
                onAddReaction={(emoji) => handleReaction(message.id, emoji, message.reactions)}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
            title="Attach file"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="p-2 rounded-lg bg-soft-blue-600 text-white hover:bg-soft-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
