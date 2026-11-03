import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { profileContent } from './content';
import { ConnectSection } from './components/ConnectSection';
import { Footer } from './components/Footer';
import { HistorySection } from './components/history/HistorySection';
import { IntroSection } from './components/intro/IntroSection';
import { Nav } from './components/Nav';
import { OpeningScene } from './components/opening/OpeningScene';
import './styles/index.css';

interface ContactModalState {
  readonly Component: typeof import('./components/ContactModal').ContactModal;
  readonly isOpen: boolean;
}

export function App() {
  const [contactModal, setContactModal] = useState<ContactModalState | null>(null);
  const openContact = useCallback(async () => {
    try {
      const { ContactModal: Component } = await import('./components/ContactModal');
      setContactModal({ Component, isOpen: true });
    } catch (error) {
      console.error('Contact form load failed', error);
      window.alert(profileContent.site.contact.loadFailedMessage);
    }
  }, []);
  const closeContact = useCallback(() => {
    setContactModal(current => current ? { ...current, isOpen: false } : current);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <Nav content={profileContent.site} onOpenContact={openContact} />
        <main>
          <OpeningScene content={profileContent.opening} />
          <IntroSection content={profileContent.intro} />
          <HistorySection content={profileContent.history} />
          <ConnectSection content={profileContent.site.connect} onOpenContact={openContact} />
        </main>
        <Footer content={profileContent.site.footer} />
        {contactModal && (
          <contactModal.Component
            closeLabel={profileContent.site.closeLabel}
            content={profileContent.site.contact}
            isOpen={contactModal.isOpen}
            onClose={closeContact}
          />
        )}
      </div>
    </MotionConfig>
  );
}
