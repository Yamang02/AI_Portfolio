import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ProfileSiteContent } from '../content/types';
import { useModalBehavior } from '../hooks/useModalBehavior';
import { sendContactEmail } from '../lib/emailjs';

interface ContactModalProps {
  readonly content: ProfileSiteContent['contact'];
  readonly closeLabel: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ContactModal({ content, closeLabel, isOpen, onClose }: ContactModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);
  const closeModal = useCallback(() => {
    formRef.current?.reset();
    onClose();
  }, [onClose]);

  useModalBehavior(isOpen, closeModal);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fromName = String(formData.get('from_name') ?? '').trim();
    const fromEmail = String(formData.get('from_email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(fromEmail)) {
      window.alert(content.emailValidationMessage);
      return;
    }
    if (message.length < 10) {
      window.alert(content.messageValidationMessage);
      return;
    }

    setIsSending(true);

    try {
      await sendContactEmail({
        from_name: fromName,
        from_email: fromEmail,
        subject,
        message,
      }, content.toEmail);
      window.alert(content.successMessage);
      closeModal();
    } catch (error) {
      console.error('Contact form send failed', error);
      window.alert(content.sendFailedMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[150] items-center justify-center bg-black/60 p-4 backdrop-blur-sm md:p-8 ${isOpen ? 'flex' : 'hidden'}`}
      onClick={event => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        aria-modal={isOpen}
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-8 pb-6 pt-8">
          <div>
            <p className="mb-1 font-label text-[0.65rem] uppercase tracking-widest text-secondary">
              {content.eyebrow}
            </p>
            <h2 className="font-headline text-2xl text-on-surface">{content.title}</h2>
          </div>
          <button
            aria-label={closeLabel}
            className="flex size-9 items-center justify-center rounded-full bg-surface-container transition-colors duration-200 hover:bg-surface-container-high"
            onClick={closeModal}
            type="button"
          >
            <span className="material-symbols-outlined text-xl leading-none text-on-surface-variant">close</span>
          </button>
        </div>
        <form className="space-y-5 px-8 py-6" onSubmit={handleSubmit} ref={formRef}>
          <div>
            <label
              className="mb-2 block font-label text-xs uppercase tracking-wider text-on-surface-variant"
              htmlFor="contact-name"
            >
              {content.nameLabel}
            </label>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface transition-colors duration-200 placeholder:text-outline focus:border-primary focus:bg-surface focus:outline-none"
              id="contact-name"
              name="from_name"
              placeholder={content.namePlaceholder}
              required
              type="text"
            />
          </div>
          <div>
            <label
              className="mb-2 block font-label text-xs uppercase tracking-wider text-on-surface-variant"
              htmlFor="contact-email"
            >
              {content.emailLabel}
            </label>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface transition-colors duration-200 placeholder:text-outline focus:border-primary focus:bg-surface focus:outline-none"
              id="contact-email"
              name="from_email"
              placeholder={content.emailPlaceholder}
              autoComplete="email"
              inputMode="email"
              required
              type="email"
            />
          </div>
          <div>
            <label
              className="mb-2 block font-label text-xs uppercase tracking-wider text-on-surface-variant"
              htmlFor="contact-subject"
            >
              {content.subjectLabel}
            </label>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface transition-colors duration-200 placeholder:text-outline focus:border-primary focus:bg-surface focus:outline-none"
              id="contact-subject"
              name="subject"
              placeholder={content.subjectPlaceholder}
              required
              type="text"
            />
          </div>
          <div>
            <label
              className="mb-2 block font-label text-xs uppercase tracking-wider text-on-surface-variant"
              htmlFor="contact-message"
            >
              {content.messageLabel}
            </label>
            <textarea
              className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface transition-colors duration-200 placeholder:text-outline focus:border-primary focus:bg-surface focus:outline-none"
              id="contact-message"
              name="message"
              placeholder={content.messagePlaceholder}
              required
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-none border border-outline-variant/40 px-6 py-2.5 font-label text-sm text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-on-surface"
              onClick={closeModal}
              type="button"
            >
              {content.cancelLabel}
            </button>
            <button
              className="rounded-none bg-primary px-6 py-2.5 font-label text-sm text-on-primary transition-colors duration-200 hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSending}
              id="contact-submit"
              type="submit"
            >
              {isSending ? content.sendingLabel : content.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
