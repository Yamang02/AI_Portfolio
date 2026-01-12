import React from 'react';
import styles from './ProjectDetailTOC.module.css';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';

interface ProjectDetailTOCProps {
  items: TOCItem[];
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

const TOCItemComponent: React.FC<{
  item: TOCItem;
  level: number;
}> = ({ item, level }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection(item.id);
  };

  return (
    <li className={styles.item} style={{ paddingLeft: `${level * 16}px` }}>
      <a
        href={`#${item.id}`}
        className={styles.link}
        onClick={handleClick}
      >
        {item.text}
      </a>
      {item.children && item.children.length > 0 && (
        <ul className={styles.nested}>
          {item.children.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const ProjectDetailTOC: React.FC<ProjectDetailTOCProps> = ({
  items,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc}>
      <ul className={styles.list}>
        {items.map((item) => (
          <TOCItemComponent key={item.id} item={item} level={0} />
        ))}
      </ul>
    </nav>
  );
};
