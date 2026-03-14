import React from 'react';
import styles from './TableOfContents.module.css';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';

export interface TableOfContentsProps {
  items: TOCItem[];
}

const TOCItemComponent: React.FC<{
  item: TOCItem;
  level: number;
}> = ({ item, level }) => {
  return (
    <li className={styles.item} style={{ paddingLeft: `${level * 16}px` }}>
      <a href={`#${item.id}`} className={styles.link}>
        {item.text}
      </a>
      {item.subItems && item.subItems.length > 0 && (
        <ul className={styles.nested}>
          {item.subItems.map((child) => (
            <TOCItemComponent key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const TableOfContents: React.FC<TableOfContentsProps> = ({
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
