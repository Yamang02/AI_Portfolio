# Portfolio Site Renewal - Executable Tasks

## Task Execution Order & Priority

각 태스크는 하나의 commit 단위로 설계되었습니다. 번호 순서대로 실행하세요.

**최근 업데이트**: 2025-10-07
- 프로젝트 모달 마크다운 기반 포트폴리오 개선 (Phase 8 추가)
- 프로젝트 버전 관리 시스템 (Phase 9 추가)

---

## Phase 1: Foundation & Database (Priority: Critical) ✅ COMPLETED

### 🔧 Task 1: Database Schema Migration
**Commit**: `feat: add role and screenshots fields to projects table`

**Scope**: Backend database schema update
**Files to modify**:
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/entity/ProjectJpaEntity.java`

**Executable Steps**:
1. Add `role` field to ProjectJpaEntity
   - Type: `@Column(name = "role") private String role;`
   - Add validation annotations if needed
2. Add `screenshots` field to ProjectJpaEntity
   - Type: `@Column(name = "screenshots", columnDefinition = "text[]") @JdbcTypeCode(SqlTypes.ARRAY) private List<String> screenshots;`
3. Create SQL migration script in comments for manual DB update
4. Test entity serialization/deserialization

**Definition of Done**:
- [ ] ProjectJpaEntity compiles without errors
- [ ] New fields are properly annotated
- [ ] SQL migration script documented

---

### 🔄 Task 2: Domain Model Updates
**Commit**: `feat: update domain models to include new project fields`

**Scope**: Backend domain layer
**Files to modify**:
- `backend/src/main/java/com/aiportfolio/backend/domain/portfolio/model/Project.java`
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/mapper/ProjectMapper.java`

**Executable Steps**:
1. Add `role` and `screenshots` fields to domain Project model
2. Update ProjectMapper to handle new fields (entity ↔ domain mapping)
3. Update any existing validation logic
4. Ensure backward compatibility

**Definition of Done**:
- [ ] Domain model includes new fields
- [ ] Mapper correctly handles new fields
- [ ] No compilation errors

---

### 🔄 Task 3: API Response Enhancement
**Commit**: `feat: include role and screenshots in project API response`

**Scope**: Backend API layer
**Files to modify**:
- Backend API response DTOs (if separate from domain models)
- Controller tests

**Executable Steps**:
1. Verify API response includes new fields
2. Update any DTO classes if they exist separately
3. Test API response format
4. Update API documentation/comments

**Definition of Done**:
- [ ] API returns new fields in response
- [ ] Backward compatibility maintained
- [ ] API tests pass

---

## Phase 2: Frontend Types & Hooks (Priority: High)

### 📝 Task 4: TypeScript Type Definitions
**Commit**: `feat: add TypeScript types for enhanced project data`

**Scope**: Frontend type definitions
**Files to create/modify**:
- `frontend/src/entities/project/types.ts` (or similar type file)

**Executable Steps**:
1. Add `role?: string` and `screenshots?: string[]` to Project interface
2. Define `ProjectType` and `ProjectStatus` enums if not exists
3. Create computed field types (`duration`, `primaryTechs`, etc.)
4. Export all types for component usage

**Definition of Done**:
- [ ] Project interface includes all required fields
- [ ] Types match API response structure
- [ ] No TypeScript compilation errors

---

### 🎣 Task 5: Custom Hooks Implementation
**Commit**: `feat: implement useProjects and useModal hooks`

**Scope**: Frontend state management
**Files to create**:
- `frontend/src/shared/hooks/useProjects.ts`
- `frontend/src/shared/hooks/useModal.ts`
- `frontend/src/shared/hooks/useProjectFilter.ts`

**Executable Steps**:
1. Implement `useProjects` hook with API integration
2. Implement `useModal` hook for project modal state
3. Implement `useProjectFilter` hook for filtering logic
4. Add proper TypeScript types and error handling

**Definition of Done**:
- [ ] Hooks compile without errors
- [ ] Proper state management for projects
- [ ] Modal open/close functionality
- [ ] Filter state management

---

## Phase 3: Core Components (Priority: High)

### 🎴 Task 6: ProjectCard Component
**Commit**: `feat: implement ProjectCard component with new fields`

**Scope**: Frontend component development
**Files to create/modify**:
- `frontend/src/widgets/project/ui/ProjectCard.tsx` (or appropriate path)
- `frontend/src/widgets/project/ui/ProjectCard.module.css`

**Executable Steps**:
1. Create ProjectCard component structure
2. Implement card layout (thumbnail, title, summary, tech tags, badges)
3. Add team icon and role display for team projects
4. Add click handler for modal opening
5. Style according to design specification

**Definition of Done**:
- [ ] Component renders correctly
- [ ] Shows all required fields from design
- [ ] Handles team vs individual project display
- [ ] Responsive on mobile

---

### 🖼️ Task 7: ImageGallery Component
**Commit**: `feat: implement ImageGallery component for project modal`

**Scope**: Frontend component development
**Files to create**:
- `frontend/src/shared/ui/ImageGallery.tsx`
- `frontend/src/shared/ui/ImageGallery.module.css`

**Executable Steps**:
1. Create ImageGallery component for main image + screenshots
2. Implement image carousel/slider functionality
3. Add mobile swipe support
4. Handle loading states and error cases
5. Optimize for performance (lazy loading)

**Definition of Done**:
- [ ] Gallery displays main image and screenshots
- [ ] Navigation between images works
- [ ] Mobile swipe functionality
- [ ] Loading states handled

---

### 🔍 Task 8: ProjectModal Component
**Commit**: `feat: implement comprehensive ProjectModal component`

**Scope**: Frontend component development
**Files to create**:
- `frontend/src/widgets/project/ui/ProjectModal.tsx`
- `frontend/src/widgets/project/ui/ProjectModal.module.css`

**Executable Steps**:
1. Create modal structure (header, image gallery, content sections)
2. Implement conditional rendering for team projects (role/contributions)
3. Add external links section
4. Implement mobile full-screen vs desktop overlay
5. Add close functionality and escape key handling

**Definition of Done**:
- [ ] Modal shows complete project information
- [ ] Team project data displays correctly
- [ ] External links work
- [ ] Responsive design implemented
- [ ] Close functionality works

---

## Phase 4: Grid & Layout (Priority: High)

### 📱 Task 9: ProjectGrid Component
**Commit**: `feat: implement responsive ProjectGrid with toggle functionality`

**Scope**: Frontend layout component
**Files to create**:
- `frontend/src/widgets/project/ui/ProjectGrid.tsx`
- `frontend/src/widgets/project/ui/ProjectGrid.module.css`

**Executable Steps**:
1. Create grid layout component
2. Implement responsive grid (1/2/3 columns based on screen size)
3. Add toggle functionality for additional projects
4. Handle loading and empty states
5. Integrate with useProjects hook

**Definition of Done**:
- [ ] Grid layout responds to screen size
- [ ] Toggle shows/hides maintenance and lab projects
- [ ] Loading states handled
- [ ] Proper spacing and alignment

---

## Phase 5: Filtering & Sorting (Priority: Medium)

### 🔽 Task 10: FilterControls Component
**Commit**: `feat: implement project filtering and sorting controls`

**Scope**: Frontend filtering UI
**Files to create**:
- `frontend/src/widgets/project/ui/FilterControls.tsx`
- `frontend/src/widgets/project/ui/FilterControls.module.css`

**Executable Steps**:
1. Create filter controls UI (type, status, tech filters)
2. Implement sorting controls (date, priority)
3. Connect to useProjectFilter hook
4. Add clear/reset functionality
5. Make mobile-friendly

**Definition of Done**:
- [ ] All filter options available
- [ ] Sorting works correctly
- [ ] Mobile-friendly interface
- [ ] Clear filters functionality

---

### 🔄 Task 11: Filter Logic Integration
**Commit**: `feat: integrate filtering and sorting with project display`

**Scope**: Frontend state integration
**Files to modify**:
- Hook files from Task 5
- Grid component from Task 9

**Executable Steps**:
1. Connect filter controls to project grid
2. Implement real-time filtering
3. Add URL parameter support for filters (optional)
4. Test all filter combinations
5. Ensure performance with large datasets

**Definition of Done**:
- [ ] Filters affect displayed projects
- [ ] Sorting works with filters
- [ ] Performance is acceptable
- [ ] State persists appropriately

---

## Phase 6: Integration & Polish (Priority: Medium)

### 🔗 Task 12: Portfolio Section Integration
**Commit**: `feat: integrate new project components into portfolio section`

**Scope**: Frontend page integration
**Files to modify**:
- Main portfolio page/section files
- Any existing project-related components

**Executable Steps**:
1. Replace existing project components with new ones
2. Ensure proper props passing
3. Test full user flow
4. Handle migration of any existing data
5. Update any routing if needed

**Definition of Done**:
- [ ] New components integrated into main page
- [ ] Full user flow works end-to-end
- [ ] No broken functionality
- [ ] Data displays correctly

---

### 🎨 Task 13: Responsive Design Polish
**Commit**: `style: optimize responsive design and mobile UX`

**Scope**: Frontend styling and UX
**Files to modify**:
- All component CSS files
- Global styles if needed

**Executable Steps**:
1. Test on various screen sizes
2. Optimize touch targets for mobile
3. Improve loading animations
4. Polish visual hierarchy
5. Ensure accessibility standards

**Definition of Done**:
- [ ] Works well on all device sizes
- [ ] Touch interactions are smooth
- [ ] Visual polish applied
- [ ] Accessibility requirements met

---

### 🧪 Task 14: Testing & Bug Fixes
**Commit**: `test: add tests and fix identified issues`

**Scope**: Testing and quality assurance
**Files to create/modify**:
- Component test files
- Integration test files

**Executable Steps**:
1. Write unit tests for components
2. Write integration tests for user flows
3. Test with real data
4. Fix any identified bugs
5. Performance testing

**Definition of Done**:
- [ ] Key components have tests
- [ ] User flows tested
- [ ] No critical bugs
- [ ] Performance is acceptable

---

## Phase 7: Future Enhancements (Priority: Low)

### 📚 Task 15: RAG Data Fields (Optional)
**Commit**: `feat: add achievements and learning fields for RAG enhancement`

**Scope**: Backend database and API
**Files to modify**:
- ProjectJpaEntity
- Domain models
- API responses

**Executable Steps**:
1. Add `achievements` field (TEXT[])
2. Add `learning` field (TEXT[])
3. Update all related mappings
4. Test API responses

**Definition of Done**:
- [ ] New fields available in database
- [ ] API includes new fields
- [ ] Ready for future RAG integration

---

## Execution Guidelines

### Pre-execution Checklist for Each Task:
1. ✅ Previous task completed and committed
2. ✅ Current branch is up to date
3. ✅ All dependencies for the task are available
4. ✅ Task scope and files are clearly identified

### Post-execution Checklist for Each Task:
1. ✅ All files compile without errors
2. ✅ Manual testing completed
3. ✅ Code follows project conventions
4. ✅ Commit message follows format
5. ✅ No unnecessary files committed

### Emergency Guidelines:
- If a task becomes too complex, split it into smaller tasks
- If dependencies are missing, create prerequisite tasks
- If major design changes are needed, update the design document first
- Always maintain backward compatibility unless explicitly planned otherwise

---

## Phase 8: Markdown-Based Portfolio Modal (Priority: High)

> 참고 문서: `project-modal-markdown-enhancement.md`

### 📝 Task 16: Install Markdown Libraries
**Commit**: `feat: install react-markdown and related plugins`

**Scope**: Frontend dependencies
**Files to modify**:
- `frontend/package.json`

**Executable Steps**:
```bash
npm install react-markdown remark-gfm rehype-sanitize rehype-highlight remark-heading-id
```

**Definition of Done**:
- [ ] All markdown libraries installed
- [ ] Package.json updated
- [ ] No dependency conflicts

---

### 🎨 Task 17: Markdown Renderer Component
**Commit**: `feat: implement MarkdownRenderer component with custom styles`

**Scope**: Frontend markdown rendering
**Files to create**:
- `frontend/src/shared/components/Markdown/MarkdownRenderer.tsx`
- `frontend/src/shared/components/Markdown/markdownComponents.tsx`

**Executable Steps**:
1. Create MarkdownRenderer wrapper component
2. Configure react-markdown with plugins (remark-gfm, rehype-sanitize, rehype-highlight)
3. Define custom components for headings (with auto-generated IDs)
4. Add TailwindCSS prose styling
5. Handle code block syntax highlighting

**Definition of Done**:
- [ ] Markdown renders correctly
- [ ] Headings have auto-generated IDs
- [ ] Code blocks have syntax highlighting
- [ ] Links, images, tables render properly

---

### 🔗 Task 18: Table of Contents Hook
**Commit**: `feat: implement useTOC hook for markdown heading parsing`

**Scope**: Frontend custom hook
**Files to create**:
- `frontend/src/features/projects/hooks/useTOC.ts`

**Executable Steps**:
1. Install `unified`, `remark-parse`, `unist-util-visit`
2. Parse markdown AST to extract headings
3. Generate TOC items with id, text, level
4. Memoize parsing for performance
5. Add TypeScript types

**Definition of Done**:
- [ ] Hook extracts all headings (h1-h6)
- [ ] Returns structured TOC items
- [ ] Properly memoized
- [ ] No performance issues

---

### 👁️ Task 19: Active Section Tracking Hook
**Commit**: `feat: implement useActiveSection hook with Intersection Observer`

**Scope**: Frontend scroll tracking
**Files to create**:
- `frontend/src/features/projects/hooks/useActiveSection.ts`

**Executable Steps**:
1. Implement Intersection Observer setup
2. Track visible heading elements
3. Update active section ID on scroll
4. Clean up observers on unmount
5. Handle edge cases (multiple visible sections)

**Definition of Done**:
- [ ] Active section updates on scroll
- [ ] Intersection Observer properly configured
- [ ] No memory leaks
- [ ] Smooth scroll behavior

---

### 📑 Task 20: TOC Sidebar Component
**Commit**: `feat: implement ProjectModalTOC sidebar component`

**Scope**: Frontend component
**Files to create**:
- `frontend/src/shared/components/Modal/ProjectModalTOC.tsx`

**Executable Steps**:
1. Create TOC sidebar component
2. Display hierarchical TOC items with indentation
3. Highlight active section
4. Implement anchor link navigation
5. Add collapse/expand functionality for mobile
6. Style with TailwindCSS

**Definition of Done**:
- [ ] TOC displays all headings
- [ ] Active section highlighted
- [ ] Click navigates to section
- [ ] Responsive (collapsible on mobile)

---

### 🖼️ Task 21: Update ProjectModal Layout
**Commit**: `feat: refactor ProjectModal with sidebar layout and markdown content`

**Scope**: Frontend component refactoring
**Files to modify**:
- `frontend/src/shared/components/Modal/ProjectModal.tsx`
- `frontend/src/shared/components/Modal/ProjectModalHeader.tsx` (create)
- `frontend/src/shared/components/Modal/ProjectModalContent.tsx` (create)

**Executable Steps**:
1. Split ProjectModal into sub-components (Header, Content, TOC)
2. Change layout to flex-row (TOC left, content right)
3. Move fixed metadata to sticky header
4. Replace description with markdown rendering (readme field)
5. Integrate MarkdownRenderer component
6. Add responsive layout (TOC overlay on tablet/mobile)
7. Keep existing image gallery in header or markdown

**Definition of Done**:
- [ ] Modal has sidebar layout on desktop
- [ ] TOC on left, content on right
- [ ] Header is sticky with metadata
- [ ] Markdown renders in content area
- [ ] Responsive on all devices
- [ ] Existing functionality preserved

---

### 🎨 Task 22: Markdown Content Styling
**Commit**: `style: enhance markdown prose styling and code blocks`

**Scope**: Frontend styling
**Files to modify**:
- Markdown component styles
- Global CSS if needed

**Executable Steps**:
1. Apply TailwindCSS Typography (@tailwindcss/typography)
2. Customize prose styles (headings, code, links)
3. Add scroll-margin-top for anchor navigation
4. Style code blocks with syntax highlighting theme
5. Ensure images are responsive

**Definition of Done**:
- [ ] Markdown content is readable
- [ ] Code blocks styled properly
- [ ] Anchor links scroll correctly
- [ ] Images scale responsively

---

### 🧪 Task 23: Markdown Modal Testing
**Commit**: `test: add tests for markdown modal and TOC functionality`

**Scope**: Testing
**Files to create**:
- Component test files

**Executable Steps**:
1. Test useTOC parsing with various markdown inputs
2. Test useActiveSection tracking
3. Test TOC navigation clicks
4. Test responsive layout changes
5. Test with sample project markdown

**Definition of Done**:
- [ ] TOC parsing tested
- [ ] Active section tracking tested
- [ ] Navigation tested
- [ ] Responsive behavior tested

---

## Phase 9: Project Version Management (Priority: Medium)

> 참고 문서: `project-version-management-design.md`

### 🗄️ Task 24: Version Management Database Schema
**Commit**: `feat: add project version management schema`

**Scope**: Backend database migration
**Files to create**:
- `backend/src/main/resources/db/migration/V005__create_project_versions.sql`

**Executable Steps**:
1. Create `project_versions` table
2. Create `project_version_tech_stacks` table
3. Migrate existing project data to version 1.0
4. Add indexes for performance
5. Add `default_version_id` to projects table
6. Create unique constraints and foreign keys

**Definition of Done**:
- [ ] Migration script runs without errors
- [ ] Existing data migrated to v1.0
- [ ] Foreign key constraints working
- [ ] Indexes created

---

### 🏗️ Task 25: Version Management JPA Entities
**Commit**: `feat: implement ProjectVersion JPA entities`

**Scope**: Backend persistence layer
**Files to create**:
- `backend/src/main/java/.../entity/ProjectVersionJpaEntity.java`
- `backend/src/main/java/.../entity/ProjectVersionTechStackJpaEntity.java`

**Executable Steps**:
1. Create ProjectVersionJpaEntity
2. Create ProjectVersionTechStackJpaEntity
3. Add relationships to ProjectJpaEntity
4. Add validation annotations
5. Update repositories

**Definition of Done**:
- [ ] Entities compile without errors
- [ ] Relationships properly configured
- [ ] Repositories created
- [ ] Validation annotations added

---

### 🔄 Task 26: Version Management Domain Models
**Commit**: `feat: add ProjectVersion domain models and mappers`

**Scope**: Backend domain layer
**Files to create/modify**:
- `backend/src/main/java/.../domain/portfolio/model/ProjectVersion.java`
- `backend/src/main/java/.../mapper/ProjectVersionMapper.java`

**Executable Steps**:
1. Create ProjectVersion domain model
2. Create ProjectVersionMapper
3. Update existing Project model to include versions
4. Add version-related service methods

**Definition of Done**:
- [ ] Domain models created
- [ ] Mappers implemented
- [ ] Service layer updated
- [ ] No compilation errors

---

### 🌐 Task 27: Version Management API Endpoints
**Commit**: `feat: add API endpoints for project version management`

**Scope**: Backend API layer
**Files to modify**:
- Backend controller files

**Executable Steps**:
1. Add version query parameter to existing GET /projects/{id}
2. Add GET /projects/{id}/versions endpoint
3. Update response DTOs to include version info
4. Test API responses
5. Update API documentation

**Definition of Done**:
- [ ] API accepts version parameter
- [ ] Version list endpoint works
- [ ] Responses include version data
- [ ] Backward compatible (default version)

---

### 📝 Task 28: Frontend Version Types
**Commit**: `feat: add TypeScript types for project versions`

**Scope**: Frontend types
**Files to modify**:
- `frontend/src/entities/project/types.ts`

**Executable Steps**:
1. Add ProjectVersionMeta interface
2. Add ProjectVersionDetail interface
3. Update Project interface to include versions
4. Export all version-related types

**Definition of Done**:
- [ ] All version types defined
- [ ] Types match API response
- [ ] No TypeScript errors

---

### 🎣 Task 29: Version Selection Hook
**Commit**: `feat: implement useProjectVersion hook`

**Scope**: Frontend custom hook
**Files to create**:
- `frontend/src/features/projects/hooks/useProjectVersion.ts`

**Executable Steps**:
1. Create useProjectVersion hook
2. Fetch project with specific version
3. Handle version switching
4. Integrate with React Query
5. Add loading and error states

**Definition of Done**:
- [ ] Hook fetches version data
- [ ] Version switching works
- [ ] Loading states handled
- [ ] Error handling implemented

---

### 🎨 Task 30: Version Selector Component
**Commit**: `feat: implement VersionSelector dropdown component`

**Scope**: Frontend component
**Files to create**:
- `frontend/src/shared/components/VersionSelector/VersionSelector.tsx`

**Executable Steps**:
1. Create dropdown component
2. Display available versions
3. Show version metadata (name, date, status)
4. Handle version selection
5. Style with badges for status
6. Add mobile-friendly UI

**Definition of Done**:
- [ ] Dropdown displays all versions
- [ ] Version selection works
- [ ] Status badges shown
- [ ] Responsive design

---

### 🔗 Task 31: Integrate Versions into ProjectModal
**Commit**: `feat: integrate version selection into ProjectModal`

**Scope**: Frontend integration
**Files to modify**:
- `frontend/src/shared/components/Modal/ProjectModal.tsx`

**Executable Steps**:
1. Add VersionSelector to modal header
2. Connect to useProjectVersion hook
3. Update content when version changes
4. Add loading state during version switch
5. Add transition animations
6. Update tech stacks, screenshots, links per version

**Definition of Done**:
- [ ] Version selector in modal header
- [ ] Content updates on version change
- [ ] Smooth transitions
- [ ] All version-specific data updates

---

### 🎬 Task 32: Version Transition Animations
**Commit**: `feat: add smooth animations for version transitions`

**Scope**: Frontend UX enhancement
**Files to modify**:
- Modal and content components

**Executable Steps**:
1. Install framer-motion (if not already)
2. Add AnimatePresence wrapper
3. Implement fade/slide transitions
4. Optimize animation performance
5. Test on different devices

**Definition of Done**:
- [ ] Smooth version transitions
- [ ] No layout shift
- [ ] Good performance
- [ ] Works on mobile

---

### 📊 Task 33: Sample Version Data
**Commit**: `chore: add sample version data for testing`

**Scope**: Data preparation
**Files to create**:
- Sample markdown files for different versions

**Executable Steps**:
1. Create v1.0 markdown for 2-3 projects
2. Create v2.0 markdown with different content
3. Add version-specific screenshots
4. Insert data into database
5. Test version switching

**Definition of Done**:
- [ ] Sample versions created
- [ ] Different markdown content per version
- [ ] Different screenshots per version
- [ ] Version switching works with real data

---

### 🧪 Task 34: Version Management Testing
**Commit**: `test: add comprehensive tests for version management`

**Scope**: Testing
**Files to create**:
- Test files for version components and hooks

**Executable Steps**:
1. Test version API endpoints
2. Test version switching hook
3. Test VersionSelector component
4. Test version data persistence
5. Integration tests for full flow

**Definition of Done**:
- [ ] API tests pass
- [ ] Component tests pass
- [ ] Integration tests pass
- [ ] No regression bugs

---

## Updated Execution Priority

### Immediate (Next Sprint)
1. **Phase 8: Markdown Modal** (Tasks 16-23)
   - Core portfolio presentation upgrade
   - High user value
   - ~11-17 hours estimated

### Short-term (Following Sprint)
2. **Phase 9: Version Management** (Tasks 24-34)
   - Advanced feature for showcasing project evolution
   - Medium complexity
   - ~20-25 hours estimated

### Continuous
3. **Phase 6-7: Polish & Testing** (Tasks 12-15)
   - Ongoing refinement
   - Can be done in parallel

---

## Updated Dependencies Graph

```
Phase 8 (Markdown Modal):
  Task 16 → Task 17 → Task 18, 19 → Task 20, 21 → Task 22 → Task 23

Phase 9 (Version Management):
  Task 24 → Task 25 → Task 26 → Task 27
         ↓
  Task 28 → Task 29 → Task 30 → Task 31 → Task 32 → Task 33 → Task 34
```

**Critical Path**: Phase 8 should be completed before Phase 9 for optimal integration.