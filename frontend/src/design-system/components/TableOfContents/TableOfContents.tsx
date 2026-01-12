import React from 'react';
import styles from './TableOfContents.module.css';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';

export interface TableOfContentsProps {
  items: TOCItem[];
  headerOffset?: number;
}

const scrollToSection = (id: string, headerOffset: number = 80) => {
  const element = document.getElementById(id);
  if (element) {
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
  headerOffset: number;
}> = ({ item, level, headerOffset }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection(item.id, headerOffset);
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
              headerOffset={headerOffset}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  headerOffset = 80,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc}>
      <ul className={styles.list}>
        {items.map((item) => (
          <TOCItemComponent key={item.id} item={item} level={0} headerOffset={headerOffset} />
        ))}
      </ul>
    </nav>
  );
};
