import React from 'react';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { formatDateRange } from '@/shared/utils/safeStringUtils';
import type { Experience } from '@/main/entities/experience';
import type { Education } from '@/main/entities/education';
import styles from './CareerCard.module.css';

// Briefcase 아이콘 (경력)
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

// GraduationCap 아이콘 (교육)
const GraduationCapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);

interface CareerCardProps {
  type: 'experience' | 'education';
  data: Experience | Education;
}

export const CareerCard: React.FC<CareerCardProps> = ({ type, data }) => {
  const Icon = type === 'experience' ? BriefcaseIcon : GraduationCapIcon;
  const organization = type === 'experience' 
    ? (data as Experience).organization 
    : (data as Education).organization;
  const title = type === 'experience' 
    ? (data as Experience).title 
    : (data as Education).title;
  const role = type === 'experience' ? (data as Experience).role : undefined;
  const degree = type === 'education' ? (data as Education).degree : undefined;
  const description = data.description;
  const technologies = data.technologies;
  const startDate = data.startDate;
  const endDate = data.endDate;
  
  // 경력 전용 필드
  const mainResponsibilities = type === 'experience' 
    ? (data as Experience).mainResponsibilities 
    : undefined;
  const achievements = type === 'experience' 
    ? (data as Experience).achievements 
    : undefined;

  return (
    <Card variant="default" padding="lg" className={styles.card}>
      {/* 헤더: 아이콘, 조직/회사, title, 근무기간 */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Icon className={styles.icon} />
        </div>
        <div className={styles.headerContent}>
          <h3 className={styles.organization}>{organization}</h3>
          <p className={styles.title}>{title}</p>
          {degree && <p className={styles.degree}>{degree}</p>}
        </div>
        <div className={styles.date}>
          {formatDateRange(startDate, endDate, ' - ')}
        </div>
      </div>

      {/* 컨텐츠: 역할, 주요업무, 성과, 설명 */}
      <div className={styles.content}>
        {role && (
          <div className={styles.roleSection}>
            <p className={styles.role}>{role}</p>
          </div>
        )}

        {mainResponsibilities && mainResponsibilities.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>주요 업무</h4>
            <ul className={styles.list}>
              {mainResponsibilities.map((item, index) => (
                <li key={index} className={styles.listItem}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>성과</h4>
            <ul className={styles.list}>
              {achievements.map((item, index) => (
                <li key={index} className={styles.listItem}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {description && (
          <div className={styles.descriptionSection}>
            <Card variant="default" padding="md" className={styles.descriptionCard}>
              <p className={styles.description}>{description}</p>
            </Card>
          </div>
        )}
      </div>

      {/* 푸터: 기술스택 배지들 */}
      {technologies && technologies.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.techStackList}>
            {technologies.map((tech, index) => (
              <Badge
                key={index}
                variant="outline"
                size="sm"
                className={styles.techBadge}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
