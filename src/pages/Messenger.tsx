import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Conversation, Message } from '../types/message';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import {
  subscribeToUserConversations,
  subscribeToConversationMessages,
  getTeamConversation,
  createConversation,
} from '../services/messageService';
import toast from 'react-hot-toast';

export default function Messenger() {
  const { currentUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to user's conversations
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserConversations(currentUser.uid, (convs) => {
      setConversations(convs);
      setLoading(false);

      // Auto-select team conversation if no active conversation
      if (!activeConversation && convs.length > 0) {
        const teamConv = convs.find((c) => c.type === 'team');
        if (teamConv) {
          setActiveConversation(teamConv);
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Subscribe to messages in active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToConversationMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, [activeConversation]);

  // Create team conversation if it doesn't exist
  useEffect(() => {
    if (!currentUser || conversations.length > 0) return;

    async function ensureTeamConversation() {
      try {
        const teamConvId = await getTeamConversation();
        // Subscription will pick it up
      } catch (error) {
        console.error('Failed to create team conversation:', error);
      }
    }

    ensureTeamConversation();
  }, [currentUser, conversations]);

  function handleSelectConversation(conversation: Conversation) {
    setActiveConversation(conversation);
  }

  function handleNewConversation() {
    toast('Direct messaging coming soon! For now, use the team chat.', {
      icon: '💬',
    });
    // TODO: Implement new conversation modal
    // This would show a modal to select users and create a DM or group chat
  }

  if (!authLoading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-soft-blue-200 border-t-soft-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            currentUserId={currentUser!.uid}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              currentUserId={currentUser!.uid}
              currentUserName={currentUser!.displayName || 'Unknown'}
              currentUserPhoto={currentUser!.photoURL}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Islanders Messenger
                </h2>
                <p className="text-lg mb-4">Select a conversation to start messaging</p>
                <button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition"
                >
                  Start a Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
