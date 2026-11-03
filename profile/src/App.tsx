import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { profileContent } from './content';
import { ConnectSection } from './components/ConnectSection';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { HistorySection } from './components/history/HistorySection';
import { IntroSection } from './components/intro/IntroSection';
import { Nav } from './components/Nav';
import { OpeningScene } from './components/opening/OpeningScene';
import './styles/index.css';

export function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const openContact = useCallback(() => setIsContactOpen(true), []);
  const closeContact = useCallback(() => setIsContactOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <Nav content={profileContent.site} />
        <main>
          <OpeningScene content={profileContent.opening} />
          <IntroSection content={profileContent.intro} />
          <HistorySection content={profileContent.history} />
          <ConnectSection content={profileContent.site.connect} onOpenContact={openContact} />
        </main>
        <Footer content={profileContent.site.footer} />
        <ContactModal
          closeLabel={profileContent.site.closeLabel}
          content={profileContent.site.contact}
          isOpen={isContactOpen}
          onClose={closeContact}
        />
      </div>
    </MotionConfig>
  );
}
