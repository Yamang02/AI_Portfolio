# Portfolio Project Section: Data-UI Mapping Sheet

## 1. Project Types
| Type | Description | UI Representation |
|------|-------------|----------------|
| Build / Highlight | Key projects, external showcase | Large / highlighted card, top section |
| Maintenance / Improvement | Site upkeep, feature updates | Standard card, toggle to expand, label: "Maintenance" |
| Lab / Experiment | Learning / PoC / side projects | Small card, toggle to expand, label: "Lab" |

---

## 2. Card Fields Mapping
| Field | Data Source | UI Element | Notes |
|-------|------------|-----------|-------|
| Thumbnail | project.imageUrl | Image on card | Visual representation, responsive size |
| Title | project.title | Text, bold | Primary identifier |
| One-line Summary | project.description | Text | Short overview / first sentence |
| Technologies | project.technologies | Tag/Icon list | 2-4 major techs displayed |
| Status Label | project.status | Badge / label | Completed / In Progress / Maintenance |
| Team Icon | project.isTeam | Icon | Optional, indicates team project |
| Role | project.role | Text | Only for team projects |
| Category Label | project.type | Badge / label | Build / Maintenance / Lab |
| Click Action | n/a | Open Modal | Opens detailed project modal |

---

## 3. Modal Fields Mapping
| Section | Field | Data Source | UI Element | Notes |
|---------|-------|------------|-----------|------|
| Header | Title | project.title | Text, bold | Display project name |
| Header | Duration | project.startDate / project.endDate | Text | Display YYYY-MM format |
| Header | Category | project.type | Badge | Build / Maintenance / Lab |
| Header | Status | project.status | Badge | Completed / In Progress / Maintenance |
| Image Gallery | Main + Screenshots | project.imageUrl / metadata.screenshots | Slider / carousel | Touch swipe enabled for mobile |
| Tech Stack | Full Stack | project.technologies | Tag/Icon list | Detailed skill visualization |
| Description | Summary + Details | project.description / project.readme | Text block | Full context |
| Achievements / Learning | Key Takeaways | project.achievements / project.learning | Bullet list | Highlight growth and improvements |
| Team Contribution | My Contributions | project.myContributions / project.role | Text / bullet | Optional, only for team projects |
| External Links | GitHub / Live / Other | project.githubUrl / project.liveUrl / project.externalUrl | Buttons / links | Opens in new tab |

---

## 4. Toggle / Filter / Sort Mapping
| Feature | Data Source | UI Element | Notes |
|---------|------------|-----------|------|
| Toggle | n/a | Button | Show/Hide Maintenance & Lab projects |
| Filter by Type | project.type | Dropdown / tabs | Build / Maintenance / Lab |
| Filter by Status | project.status | Dropdown | Completed / In Progress / Maintenance |
| Filter by Technologies | project.technologies | Multi-select dropdown | Allows filtering by skills |
| Sort by Date | project.startDate / project.endDate | Dropdown / buttons | Newest → Oldest or Oldest → Newest |
| Sorting Interaction | All visible projects | Dynamic re-ordering | Works with toggle and filters together |

---

## 5. UX Notes for Agent
- Initial card load: representative projects only  
- Toggle expands additional projects → agent must update card list dynamically  
- Clicking a card opens modal → agent can pull all modal data fields  
- Filters/Sorting apply to all visible projects → agent needs to re-order cards accordingly  
- Mobile adaptation: vertical scroll, touch swipe, full-screen modal, responsive icons/labels
