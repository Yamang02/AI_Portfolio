# Portfolio Site Renewal - Executable Tasks

## Task Execution Order & Priority

각 태스크는 하나의 commit 단위로 설계되었습니다. 번호 순서대로 실행하세요.

---

## Phase 1: Foundation & Database (Priority: Critical)

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