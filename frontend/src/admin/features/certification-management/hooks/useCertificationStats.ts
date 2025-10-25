/**
 * Certification 통계 훅
 */

import { useMemo } from 'react';
import type { Certification, CertificationStats, CertificationCategory } from '../../../entities/certification';

const isExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const isExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const expiry = new Date(expiryDate);
  return expiry <= threeMonthsFromNow && expiry > new Date();
};

export const useCertificationStats = (certifications?: Certification[]): CertificationStats => {
  return useMemo(() => {
    if (!certifications || certifications.length === 0) {
      return {
        total: 0,
        expired: 0,
        expiringSoon: 0,
        byCategory: {} as Record<CertificationCategory, number>,
      };
    }

    const byCategory = certifications.reduce((acc, certification) => {
      if (certification.category) {
        acc[certification.category] = (acc[certification.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<CertificationCategory, number>);

    const expired = certifications.filter(cert => isExpired(cert.expiryDate)).length;
    const expiringSoon = certifications.filter(cert => isExpiringSoon(cert.expiryDate)).length;

    return {
      total: certifications.length,
      expired,
      expiringSoon,
      byCategory,
    };
  }, [certifications]);
};

