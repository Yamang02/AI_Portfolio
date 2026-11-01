import emailjs from '@emailjs/browser';

export interface ContactMessage {
  readonly from_name: string;
  readonly from_email: string;
  readonly subject: string;
  readonly message: string;
}

export function sendContactEmail(message: ContactMessage, toEmail: string) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    { ...message, to_email: toEmail },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}
