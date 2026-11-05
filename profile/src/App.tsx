import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { getProfileContent } from './content';
import type { ProfileLocale } from './content/types';
import { ConnectSection } from './components/ConnectSection';
import { Footer } from './components/Footer';
import { HistorySection } from './components/history/HistorySection';
import { IntroSection } from './components/intro/IntroSection';
import { Nav } from './components/Nav';
import { OpeningScene } from './components/opening/OpeningScene';
import './styles/index.css';

interface AppProps {
  readonly locale: ProfileLocale;
}

interface ContactModalState {
  readonly Component: typeof import('./components/ContactModal').ContactModal;
  readonly isOpen: boolean;
}

export function App({ locale }: AppProps) {
  const profileContent = getProfileContent(locale);
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
        <Nav content={profileContent.site} locale={locale} onOpenContact={openContact} />
        <main>
          <OpeningScene content={profileContent.opening} />
          <IntroSection content={profileContent.intro} />
          <HistorySection content={profileContent.history} locale={locale} />
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
