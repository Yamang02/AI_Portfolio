# Phase 3 사용 예시

**작성일**: 2025-01-04  
**참고**: [Phase 3 설계 문서](../../epic/portfolio-renewal-refactor/phase-3-design.md)  
**구현 가이드**: [Phase 3 구현 가이드](./phase-3-implementation-guide.md)

---

## 목차

1. [Featured Projects Section - Badge 적용 예시](#featured-projects-section---badge-적용-예시)
2. [Archive Projects Grid - Badge + Skeleton 적용 예시](#archive-projects-grid---badge--skeleton-적용-예시)
3. [Tooltip 사용 예시](#tooltip-사용-예시)

---

## Featured Projects Section - Badge 적용 예시

### 배경

기존 프로젝트 카드에서 태그를 plain text로 표시하던 방식을 Badge 컴포넌트로 대체합니다.

### Before (기존 코드)

```tsx
// ❌ 잘못된 방법: plain text로 태그 표시
<div className="project-card">
  <h3>{project.title}</h3>
  <p>{project.description}</p>
  <div className="tags">
    {project.tags.join(', ')} {/* plain text */}
  </div>
</div>
```

### After (업데이트된 코드)

```tsx
// ✅ 올바른 방법: Badge 컴포넌트 사용
import { Badge } from '@/design-system/components/Badge';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { Button } from '@/design-system/components/Button';

<div
  style={{
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--spacing-6)',
    boxShadow: 'var(--shadow-md)',
  }}
>
  <SectionTitle level="h3">{project.title}</SectionTitle>
  <p style={{ 
    color: 'var(--color-text-secondary)', 
    marginBottom: 'var(--spacing-4)' 
  }}>
    {project.description}
  </p>
  
  {/* Badge 컴포넌트로 태그 표시 */}
  <div style={{ 
    display: 'flex', 
    gap: '0.5rem', 
    flexWrap: 'wrap',
    marginBottom: 'var(--spacing-4)'
  }}>
    {project.tags.map((tag) => (
      <Badge key={tag} variant="default" size="sm">
        {tag}
      </Badge>
    ))}
  </div>
  
  <div style={{ marginTop: 'var(--spacing-4)' }}>
    <Button variant="primary" href={project.url}>
      View Project
    </Button>
  </div>
</div>
```

### 완전한 예시: Featured Projects Section

```tsx
import React from 'react';
import { Badge } from '@/design-system/components/Badge';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { Button } from '@/design-system/components/Button';
import { Divider } from '@/design-system/components/Divider';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  featured?: boolean;
}

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  projects,
}) => {
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <section style={{ padding: 'var(--spacing-12) 0' }}>
      <div style={{ maxWidth: 'var(--container-max-width-xl)', margin: '0 auto', padding: '0 var(--spacing-8)' }}>
        <SectionTitle level="h2">Featured Projects</SectionTitle>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--spacing-6)',
        }}>
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-6)',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <SectionTitle level="h3">{project.title}</SectionTitle>
              
              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-4)',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                {project.description}
              </p>
              
              {/* Badge로 태그 표시 */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: 'var(--spacing-4)',
              }}>
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button variant="primary" href={project.url}>
                View Project
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## Archive Projects Grid - Badge + Skeleton 적용 예시

### 배경

프로젝트 리스트 페이지에서 로딩 상태에 SkeletonCard를 표시하고, 태그 필터링에 Badge를 사용합니다.

### Before (기존 코드)

```tsx
// ❌ 잘못된 방법: 복잡한 Card 컴포넌트 사용
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>
    {projects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </div>
)}
```

### After (업데이트된 코드)

```tsx
// ✅ 올바른 방법: SkeletonCard + Badge 사용
import { SkeletonCard } from '@/design-system/components/Skeleton';
import { Badge } from '@/design-system/components/Badge';
import { useState } from 'react';

const ArchiveProjectsGrid: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // 모든 태그 추출
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags))
  );

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <section style={{ padding: 'var(--spacing-12) 0' }}>
      <div style={{ maxWidth: 'var(--container-max-width-xl)', margin: '0 auto', padding: '0 var(--spacing-8)' }}>
        <SectionTitle level="h2">All Projects</SectionTitle>
        
        {/* 태그 필터링 - Badge 사용 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: 'var(--spacing-6)',
        }}>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'primary' : 'default'}
              size="sm"
              onClick={() => handleTagClick(tag)}
              selected={selectedTags.includes(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 로딩 상태 - SkeletonCard 표시 */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)',
          }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)',
          }}>
            {projects
              .filter((project) =>
                selectedTags.length === 0 ||
                selectedTags.some((tag) => project.tags.includes(tag))
              )
              .map((project) => (
                <div
                  key={project.id}
                  style={{
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: 'var(--spacing-6)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <SectionTitle level="h3">{project.title}</SectionTitle>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-4)',
                  }}>
                    {project.description}
                  </p>
                  
                  {/* Badge로 태그 표시 */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--spacing-4)',
                  }}>
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button variant="primary" href={project.url}>
                    View Project
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};
```

### 완전한 예시: Archive Projects Grid

```tsx
import React, { useState, useEffect } from 'react';
import { SkeletonCard } from '@/design-system/components/Skeleton';
import { Badge } from '@/design-system/components/Badge';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { Button } from '@/design-system/components/Button';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
}

interface ArchiveProjectsGridProps {
  projects: Project[];
  isLoading: boolean;
}

export const ArchiveProjectsGrid: React.FC<ArchiveProjectsGridProps> = ({
  projects,
  isLoading,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 모든 고유 태그 추출
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags))
  ).sort();

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // 필터링된 프로젝트
  const filteredProjects = projects.filter((project) =>
    selectedTags.length === 0 ||
    selectedTags.some((tag) => project.tags.includes(tag))
  );

  return (
    <section style={{
      padding: 'var(--spacing-12) 0',
      minHeight: '60vh',
    }}>
      <div style={{
        maxWidth: 'var(--container-max-width-xl)',
        margin: '0 auto',
        padding: '0 var(--spacing-8)',
      }}>
        <SectionTitle level="h2">All Projects</SectionTitle>

        {/* 태그 필터링 영역 */}
        {allTags.length > 0 && (
          <div style={{
            marginBottom: 'var(--spacing-6)',
          }}>
            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-3)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Filter by tags:
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleTagClick(tag)}
                  selected={selectedTags.includes(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Badge
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                >
                  Clear all
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 결과 개수 표시 */}
        {!isLoading && (
          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-4)',
            fontSize: 'var(--font-size-sm)',
          }}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* 로딩 상태 - SkeletonCard 그리드 */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)',
          }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-12)',
            color: 'var(--color-text-secondary)',
          }}>
            <p>No projects found matching the selected tags.</p>
            {selectedTags.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setSelectedTags([])}
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)',
          }}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: 'var(--spacing-6)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <SectionTitle level="h3">{project.title}</SectionTitle>
                
                <p style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-4)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}>
                  {project.description}
                </p>
                
                {/* Badge로 태그 표시 */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--spacing-4)',
                }}>
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="primary" href={project.url}>
                  View Project
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
```

---

## Tooltip 사용 예시

### 기본 사용

```tsx
import { Tooltip } from '@/design-system/components/Tooltip';
import { Button } from '@/design-system/components/Button';

// 기본 사용
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

### 다양한 위치

```tsx
<div style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
  <Tooltip content="Top tooltip" placement="top">
    <Button>Top</Button>
  </Tooltip>

  <Tooltip content="Bottom tooltip" placement="bottom">
    <Button>Bottom</Button>
  </Tooltip>

  <Tooltip content="Left tooltip" placement="left">
    <Button>Left</Button>
  </Tooltip>

  <Tooltip content="Right tooltip" placement="right">
    <Button>Right</Button>
  </Tooltip>
</div>
```

### 지연 표시

```tsx
<Tooltip content="This tooltip appears after 500ms" delay={500}>
  <Button>Hover me (delayed)</Button>
</Tooltip>
```

### 텍스트와 함께 사용

```tsx
<p style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-relaxed)' }}>
  This portfolio uses{' '}
  <Tooltip content="TypeScript is a typed superset of JavaScript">
    <span style={{
      color: 'var(--color-link-default)',
      cursor: 'help',
      textDecoration: 'underline',
      textDecorationStyle: 'dotted',
    }}>
      TypeScript
    </span>
  </Tooltip>
  {' '}for type safety.
</p>
```

### 기술 스택 설명에 사용

```tsx
import { Tooltip } from '@/design-system/components/Tooltip';
import { Badge } from '@/design-system/components/Badge';

interface TechStackProps {
  technologies: Array<{
    name: string;
    description: string;
  }>;
}

export const TechStack: React.FC<TechStackProps> = ({ technologies }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    }}>
      {technologies.map((tech) => (
        <Tooltip key={tech.name} content={tech.description}>
          <Badge variant="accent" size="sm">
            {tech.name}
          </Badge>
        </Tooltip>
      ))}
    </div>
  );
};

// 사용 예시
<TechStack
  technologies={[
    {
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
    },
    {
      name: 'TypeScript',
      description: 'A typed superset of JavaScript that compiles to plain JavaScript',
    },
    {
      name: 'Node.js',
      description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    },
  ]}
/>
```

### 프로젝트 카드에서 사용

```tsx
import { Tooltip } from '@/design-system/components/Tooltip';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';

<div
  style={{
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--spacing-6)',
  }}
>
  <h3>{project.title}</h3>
  <p>{project.description}</p>
  
  {/* 태그에 Tooltip 추가 */}
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    {project.tags.map((tag) => (
      <Tooltip
        key={tag}
        content={`Click to filter projects by ${tag}`}
      >
        <Badge
          variant="default"
          size="sm"
          onClick={() => handleTagFilter(tag)}
        >
          {tag}
        </Badge>
      </Tooltip>
    ))}
  </div>
  
  {/* 버튼에 Tooltip 추가 */}
  <div style={{ marginTop: 'var(--spacing-4)' }}>
    <Tooltip content="Opens the project in a new tab">
      <Button variant="primary" href={project.url} target="_blank">
        View Project
      </Button>
    </Tooltip>
  </div>
</div>
```

### 접근성 고려

Tooltip은 키보드 사용자와 스크린 리더 사용자를 위해 접근성을 고려해야 합니다:

```tsx
// 접근성 개선 예시
<Tooltip
  content="This button saves your changes"
  showOnMount={false}
>
  <button
    aria-label="Save changes (Opens tooltip with more information)"
    onClick={handleSave}
  >
    Save
  </button>
</Tooltip>
```

---

## 완료 체크리스트

### Featured Projects Section
- [ ] Badge 컴포넌트로 태그 표시 적용
- [ ] 기존 plain text 태그 제거
- [ ] 디자인 시스템 컴포넌트 조합 사용 (ProjectCard 대신)

### Archive Projects Grid
- [ ] SkeletonCard 로딩 상태 적용
- [ ] Badge로 태그 필터링 구현
- [ ] 선택된 태그 시각적 피드백 (selected prop)
- [ ] 필터링 결과 표시

### Tooltip 사용
- [ ] 기본 Tooltip 사용 예시 적용
- [ ] 다양한 placement 사용
- [ ] 기술 스택 설명에 Tooltip 적용
- [ ] 접근성 고려 (키보드, 스크린 리더)

---

**참고 문서**:
- [Phase 3 설계 문서](../../epic/portfolio-renewal-refactor/phase-3-design.md)
- [Phase 3 구현 가이드](./phase-3-implementation-guide.md)
