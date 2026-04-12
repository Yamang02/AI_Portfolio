import React, { useState, useEffect } from 'react';

import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { ChatMessage } from '@/main/features/chatbot/components/ChatMessage';
import { useChatMessages } from '@/main/features/chatbot/hooks/useChatMessages';
import { useChatUsageStatus } from '@/main/features/chatbot/hooks/useChatUsageStatus';
import { ChatInputSection } from '@/main/features/chatbot/ui/ChatInputSection';

import { ContactModal } from '@/main/shared/ui/modal';
import { Spinner, Modal } from '@/design-system';
import { PageMeta } from '@/main/shared/ui/page-meta';

import { ChatPageTopBar } from './ChatPageTopBar';
import { ChatPageInfoModalBody } from './ChatPageInfoModalBody';

import styles from './ChatPage.module.css';

const ChatPage: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { usageStatus, refreshUsageStatus } = useChatUsageStatus();
  const {
    messages,
    isLoading,
    messagesEndRef,
    messagesContainerRef,
    isScrolling,
    shouldShowEmptyState,
    handleSendMessage,
    handleMessagesScroll,
    resetChatbot,
  } = useChatMessages(refreshUsageStatus);

  useEffect(() => {
    const handleOpenModal = () => setIsContactModalOpen(true);
    const handleResetChatbot = () => resetChatbot();

    globalThis.addEventListener('openContactModal', handleOpenModal);
    globalThis.addEventListener('resetChatbot', handleResetChatbot);

    return () => {
      globalThis.removeEventListener('openContactModal', handleOpenModal);
      globalThis.removeEventListener('resetChatbot', handleResetChatbot);
    };
  }, [resetChatbot]);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const chatMeta = pageMetaDefaults.chat;

  return (
    <PageMeta
      scrollPolicy="internal"
      enableScrollDrivenAnimations={false}
      enablePageTransition={true}
      showFooter={false}
    >
      <SeoHead
        title={chatMeta.title}
        description={chatMeta.description}
        canonicalPath={chatMeta.canonicalPath}
      />
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <ChatPageTopBar
          usageStatus={usageStatus}
          onReset={resetChatbot}
          onOpenInfo={() => setIsInfoModalOpen(true)}
        />

        <div
          className={`${styles.chatPage} ${shouldShowEmptyState ? styles.emptyState : styles.hasMessages}`}
        >
          <div
            className={`${styles.messagesContainer} ${isScrolling ? styles.scrolling : ''}`}
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className={styles.loadingMessage}>
                <div className={styles.loadingBubble}>
                  <Spinner size="sm" ariaLabel="Generating response" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInputSection
            className={styles.inputContainer}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            inputValue={inputValue}
            onInputChange={setInputValue}
          />
        </div>

        <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

        <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chat Usage Guide">
          <ChatPageInfoModalBody />
        </Modal>
      </div>
    </PageMeta>
  );
};

export { ChatPage };
