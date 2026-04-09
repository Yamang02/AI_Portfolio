// EmailJS 설정을 Vite env vars에서 읽어 전역 변수로 노출
// 배포 시 GitHub repository variables에서 주입됨
(globalThis as Record<string, unknown>).EMAILJS_CONFIG = {
  serviceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '',
  publicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '',
};
