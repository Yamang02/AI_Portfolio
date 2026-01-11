import React from 'react';
import { SectionTitle, Card, SkeletonCard, TextLink } from '@/design-system';
import { useCertificationsQuery } from '@/main/entities/certification/api/useCertificationQuery';
import { safeFormatDate } from '@/shared/utils/safeStringUtils';
import type { Certification } from '@/main/entities/certification/model/certification.types';
import styles from './CertificationSection.module.css';

export const CertificationSection: React.FC = () => {
  const { data: certifications = [], isLoading } = useCertificationsQuery();

  return (
    <div className={styles.container}>
      <SectionTitle level="h3" className={styles.sectionTitle}>
        자격증
      </SectionTitle>

      {isLoading ? (
        <Card variant="default" padding="lg" className={styles.card}>
          <div className={styles.certifications}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard
                key={index}
                showImage={false}
                showActions={false}
                lines={2}
              />
            ))}
          </div>
        </Card>
      ) : certifications.length === 0 ? (
        <Card variant="default" padding="lg" className={styles.card}>
          <p className={styles.emptyText}>등록된 자격증이 없습니다.</p>
        </Card>
      ) : (
        <Card variant="default" padding="lg" className={styles.card}>
          <div className={styles.certifications}>
            {certifications.map((certification) => (
              <div key={certification.id} className={styles.certificationItem}>
                <div className={styles.certificationHeader}>
                  <h4 className={styles.certificationName}>{certification.name}</h4>
                  {certification.credentialUrl && (
                    <TextLink
                      href={certification.credentialUrl}
                      external={true}
                      className={styles.credentialLink}
                      ariaLabel={`${certification.name} 자격증 확인`}
                    >
                      <svg
                        className={styles.externalIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </TextLink>
                  )}
                </div>
                <div className={styles.certificationDetails}>
                  <p className={styles.issuer}>{certification.issuer}</p>
                  <p className={styles.date}>
                    {safeFormatDate(certification.date)} 취득
                  </p>
                  {(certification as any).credentialId && (
                    <p className={styles.credentialId}>
                      자격증 번호: {(certification as any).credentialId}
                    </p>
                  )}
                  {certification.description && (
                    <p className={styles.description}>{certification.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
