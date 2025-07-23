import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">문의하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="문의 제목을 입력하세요"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              문의사항 *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="문의사항을 입력하세요"
            />
            <p className={`text-xs mt-1 ${formData.message.length > 0 && formData.message.length < 10 ? 'text-red-500' : 'text-gray-400'}`}>
              10자 이상 입력해주세요
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '전송 중...' : '메일 보내기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal; 