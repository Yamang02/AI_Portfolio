# Portfolio Site Renewal Plan

## 1. Main Plan (High-Level)

### Purpose
- Redesign and renew the portfolio site for better **external visibility**, **usability**, and **professional branding**.
- Ensure **information hierarchy**: highlight key projects while keeping optional projects accessible.
- Support **mobile-friendly design** while maintaining desktop UX.
- Improve **technical skills visibility** and project details exploration.

### Key Goals
- Clear personal branding: Who you are, your expertise, and your growth.
- Project emphasis: Highlight core projects while allowing access to maintenance, improvement, and experimental projects.
- Simplify UI: Focus on essential information for external visitors first.
- Prepare structure for **filtering and sorting** by project type, status, technologies, and date.

---

## 2. Sub Plans (Detailed Improvements)

### 2.1 Project Section Enhancement

**Objectives:**
- Display representative projects prominently.
- Allow optional expansion to show maintenance/improvement and experimental projects.
- Integrate **toggle** functionality to maintain a clean initial view.
- Ensure projects are **automatically sorted** according to filters and categories.

**Implementation Notes:**
- Initial view: representative projects only.
- Toggle button: show/hide additional projects (Maintenance / Lab).
- Card fields: Thumbnail, Title, One-line Summary, Technologies, Status, Team Icon, Role, Category.
- Visual differentiation: Highlight representative projects; labels or color codes for others.
- Mobile UX: vertical scroll, touch-friendly buttons, consistent card sizes.

---

### 2.2 Modal Display Enhancement

**Objectives:**
- Provide detailed project information without overwhelming external visitors.
- Maintain consistency across all project types.

**Modal Structure:**
- Header: Title + Duration + Category + Status
- Image Gallery: Main image + additional screenshots
- Full Tech Stack: detailed skill representation
- Description: project context
- Achievements / Learning: key takeaways, improvements, outcomes
- Team Contribution: personal role and contributions
- External Links: GitHub / Live / other resources

**UX Notes:**
- Desktop: modal window overlay
- Mobile: full-screen modal with vertical scroll, swipe-enabled image gallery, optional accordion/tabs for sections

---

### 2.3 Technical Skills Display Area

**Objectives:**
- Visually showcase technical skills to reinforce professional branding.
- Connect skills to projects where applicable.

**Implementation Notes:**
- Skills represented by icons or tags.
- Section can show a **summary of core skills**.
- Optional: hover or tap to see which projects use each skill.

---

### 2.4 Filter and Sorting Integration

**Objectives:**
- Enable external visitors to explore all projects efficiently.
- Maintain initial simplicity while allowing flexible exploration.

**Features:**
- Filter by Project Type (Build / Maintenance / Lab)
- Filter by Status (Completed / In Progress / Maintenance)
- Filter by Technologies
- Sort by Date (newest → oldest)
- Sorting should work in combination with toggle: all visible projects update dynamically

---

## 3. Summary

- **Main Plan:** Overall portfolio site renewal with focus on external visitor UX, simplicity, and professional branding.
- **Sub Plans:**  
  1. Project Section Improvement → toggle + cards + project hierarchy  
  2. Modal Display Enhancement → consistent, detailed project info  
  3. Technical Skills Display Area → skills visualization and linking to projects  
  4. Filter & Sorting Integration → flexible, automated exploration
