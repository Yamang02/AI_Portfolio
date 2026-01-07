import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Modal } from '@/design-system';
import { Button } from '@/design-system';
import styles from './ContactModal.module.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, subject, message } = formData;
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    
    // 메시지 길이 검증
    if (message.length < 10) {
      alert('문의사항은 최소 10자 이상 입력해주세요.');
      return;
    }
    
    if (message.length > 1000) {
      alert('문의사항은 최대 1000자까지 입력 가능합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // EmailJS 설정 (환경변수에서 가져오기)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      if (!serviceId || !templateId || !publicKey) {
        // EmailJS 설정이 없으면 mailto로 폴백
        const developerEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com';
        const mailtoLink = `mailto:${developerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          `안녕하세요! 포트폴리오를 보고 연락드립니다.\n\n` +
          `문의자: ${name}\n` +
          `이메일: ${email}\n\n` +
          `문의사항:\n${message}`
        )}`;
        window.open(mailtoLink);
        onClose();
        return;
      }
      
      // EmailJS로 메일 전송
      const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message
      };
      
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      alert('문의사항이 성공적으로 전송되었습니다!');
      onClose();
      
      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('메일 전송 실패:', error);
      
      // 실패 시 mailto로 폴백
      const developerEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com';
      const mailtoLink = `mailto:${developerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `안녕하세요! 포트폴리오를 보고 연락드립니다.\n\n` +
        `문의자: ${name}\n` +
        `이메일: ${email}\n\n` +
        `문의사항:\n${message}`
      )}`;
      window.open(mailtoLink);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isMessageValid = formData.message.length >= 10 && formData.message.length <= 1000;
  const showMessageError = formData.message.length > 0 && formData.message.length < 10;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="문의하기"
      width="500px"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="이름을 입력하세요"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            이메일 *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="이메일을 입력하세요"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>
            제목 *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="문의 제목을 입력하세요"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            문의사항 *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className={styles.textarea}
            placeholder="문의사항을 입력하세요"
          />
          <p className={`${styles.helperText} ${showMessageError ? styles.error : ''}`}>
            {showMessageError 
              ? '10자 이상 입력해주세요' 
              : `${formData.message.length}/1000자`}
          </p>
        </div>
        
        <div className={styles.buttonGroup}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isLoading || !isMessageValid}
          >
            {isLoading ? '전송 중...' : '메일 보내기'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { ContactModal }; 