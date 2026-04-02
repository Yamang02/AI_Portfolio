# Portfolio Site Renewal - Design Specification

## 1. Architecture Overview

### 1.1 System Architecture
```
Frontend (React/Next.js)
├── Components
│   ├── ProjectCard
│   ├── ProjectModal
│   ├── ProjectGrid
│   └── FilterControls
├── Hooks
│   ├── useProjects
│   ├── useProjectFilter
│   └── useModal
└── Types
    └── Project.types.ts

Backend (Java Spring Boot)
├── Controller
│   └── DataController
├── Service
│   └── PortfolioService
├── Repository
│   └── ProjectRepository
└── Entity
    └── ProjectJpaEntity

Database (PostgreSQL)
└── projects table (enhanced)
```

### 1.2 Data Flow
```
DB → Repository → Service → Controller → API → Frontend → UI Components
```

---

## 2. Database Design

### 2.1 Enhanced Projects Table Schema
```sql
CREATE TABLE projects (
    -- Existing fields
    id BIGSERIAL PRIMARY KEY,
    business_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    technologies TEXT[] NOT NULL,
    start_date DATE,
    end_date DATE,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    readme TEXT,
    type VARCHAR(100),
    source VARCHAR(100),
    is_team BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'completed',
    sort_order INTEGER DEFAULT 0,
    external_url VARCHAR(500),
    my_contributions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- New fields for UI enhancement
    role VARCHAR(255),              -- 팀 프로젝트에서의 역할
    screenshots TEXT[]              -- 추가 스크린샷 URL 배열
);
```

### 2.2 Migration Plan
```sql
-- Migration: Add new fields
ALTER TABLE projects
ADD COLUMN role VARCHAR(255),
ADD COLUMN screenshots TEXT[];

-- Update existing team projects with role information
-- (Manual data entry required)
```

---

## 3. API Design

### 3.1 Enhanced Project API Response
```typescript
interface ProjectResponse {
  // Existing fields
  id: number;
  businessId: string;
  title: string;
  description: string;
  detailedDescription?: string;
  technologies: string[];
  startDate?: string;  // YYYY-MM-DD format
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  readme?: string;
  type?: ProjectType;
  source?: string;
  isTeam: boolean;
  status: ProjectStatus;
  sortOrder: number;
  externalUrl?: string;
  myContributions?: string[];

  // New fields
  role?: string;
  screenshots?: string[];

  // Computed fields for UI
  duration?: string;        // "2023-01 ~ 2023-06"
  isActive?: boolean;       // computed from endDate
  primaryTechs?: string[];  // first 3-4 technologies for card display
}

type ProjectType = 'BUILD' | 'MAINTENANCE' | 'LAB';
type ProjectStatus = 'COMPLETED' | 'IN_PROGRESS' | 'MAINTENANCE';
```

### 3.2 API Endpoints
```typescript
// Get all projects with optional filtering
GET /api/data/projects?type={type}&status={status}&tech={tech}&sort={sort}

// Response
interface ProjectsResponse {
  projects: ProjectResponse[];
  totalCount: number;
  filters: {
    availableTypes: ProjectType[];
    availableStatuses: ProjectStatus[];
    availableTechnologies: string[];
  };
}
```

---

## 4. Frontend Component Design

### 4.1 Component Hierarchy
```
ProjectSection
├── FilterControls
│   ├── ToggleButton (Show/Hide additional projects)
│   ├── TypeFilter (Build/Maintenance/Lab)
│   ├── StatusFilter (Completed/In Progress/Maintenance)
│   ├── TechFilter (Multi-select dropdown)
│   └── SortControl (Date/Priority)
├── ProjectGrid
│   └── ProjectCard[]
└── ProjectModal
    ├── ModalHeader
    ├── ImageGallery
    ├── TechStack
    ├── Description
    ├── TeamContribution (conditional)
    └── ExternalLinks
```

### 4.2 ProjectCard Component Specification
```typescript
interface ProjectCardProps {
  project: ProjectResponse;
  onClick: () => void;
}

// Card Layout
<Card className={`project-card ${project.type.toLowerCase()}`}>
  <CardImage src={project.imageUrl} alt={project.title} />
  <CardContent>
    <CardHeader>
      <Title>{project.title}</Title>
      <CategoryBadge type={project.type} />
      <StatusBadge status={project.status} />
      {project.isTeam && <TeamIcon />}
    </CardHeader>
    <Summary>{project.description}</Summary>
    <TechTags technologies={project.primaryTechs} />
    {project.isTeam && project.role && (
      <Role>Role: {project.role}</Role>
    )}
  </CardContent>
</Card>
```

### 4.3 ProjectModal Component Specification
```typescript
interface ProjectModalProps {
  project: ProjectResponse;
  isOpen: boolean;
  onClose: () => void;
}

// Modal Layout
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <Title>{project.title}</Title>
    <Duration>{project.duration}</Duration>
    <Badges>
      <CategoryBadge type={project.type} />
      <StatusBadge status={project.status} />
    </Badges>
  </ModalHeader>

  <ImageGallery
    mainImage={project.imageUrl}
    screenshots={project.screenshots}
  />

  <TechStack technologies={project.technologies} />

  <Description>
    <Section title="Overview">
      {project.description}
    </Section>
    {project.detailedDescription && (
      <Section title="Details">
        {project.detailedDescription}
      </Section>
    )}
    {project.readme && (
      <Section title="Technical Details">
        {project.readme}
      </Section>
    )}
  </Description>

  {project.isTeam && (
    <TeamContribution>
      <Section title="My Role">
        {project.role}
      </Section>
      {project.myContributions && (
        <Section title="My Contributions">
          <ul>
            {project.myContributions.map(contribution => (
              <li key={contribution}>{contribution}</li>
            ))}
          </ul>
        </Section>
      )}
    </TeamContribution>
  )}

  <ExternalLinks>
    {project.githubUrl && (
      <LinkButton href={project.githubUrl} icon="github">
        GitHub
      </LinkButton>
    )}
    {project.liveUrl && (
      <LinkButton href={project.liveUrl} icon="external">
        Live Demo
      </LinkButton>
    )}
    {project.externalUrl && (
      <LinkButton href={project.externalUrl} icon="link">
        More Info
      </LinkButton>
    )}
  </ExternalLinks>
</Modal>
```

---

## 5. State Management Design

### 5.1 Project State Interface
```typescript
interface ProjectState {
  // Data
  projects: ProjectResponse[];
  loading: boolean;
  error: string | null;

  // Filters
  showAdditionalProjects: boolean;  // toggle state
  typeFilter: ProjectType[];
  statusFilter: ProjectStatus[];
  techFilter: string[];
  sortBy: 'date' | 'priority';
  sortOrder: 'asc' | 'desc';

  // UI State
  selectedProject: ProjectResponse | null;
  modalOpen: boolean;
}
```

### 5.2 Custom Hooks
```typescript
// useProjects hook
const useProjects = () => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchProjects = useCallback(async (filters) => {
    // API call logic
  }, []);

  const filteredProjects = useMemo(() => {
    // Filter and sort logic
  }, [state.projects, state.filters]);

  return {
    projects: filteredProjects,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    updateFilter,
    toggleAdditionalProjects,
    sortProjects
  };
};

// useModal hook
const useModal = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (project: ProjectResponse) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedProject(null);
  };

  return { selectedProject, isOpen, openModal, closeModal };
};
```

---

## 6. Responsive Design Specifications

### 6.1 Breakpoints
```css
/* Mobile First Approach */
.project-grid {
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .project-grid {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .project-grid {
    /* Desktop: 3 columns */
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

### 6.2 Mobile Modal Adaptations
```typescript
// Mobile: Full-screen modal
<Modal
  className={`project-modal ${isMobile ? 'modal-mobile' : 'modal-desktop'}`}
>
  {isMobile ? (
    // Full-screen with vertical scroll
    <MobileModalLayout />
  ) : (
    // Overlay with fixed dimensions
    <DesktopModalLayout />
  )}
</Modal>
```

---

## 7. Performance Considerations

### 7.1 Optimization Strategies
- **Lazy Loading**: Load project images as they come into viewport
- **Virtual Scrolling**: For large numbers of projects
- **Memoization**: React.memo for ProjectCard components
- **Image Optimization**: WebP format with fallbacks
- **API Caching**: Cache project data with proper invalidation

### 7.2 Bundle Optimization
- Code splitting by routes
- Dynamic imports for modal components
- Tree shaking for unused utilities

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Component rendering tests
- Filter logic tests
- API integration tests
- Custom hooks tests

### 8.2 Integration Tests
- User interaction flows
- Filter + sort combinations
- Modal open/close behaviors
- Responsive design tests

### 8.3 E2E Tests
- Complete user journey
- Cross-browser compatibility
- Mobile touch interactions