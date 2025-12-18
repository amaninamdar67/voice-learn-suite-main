# Domain Management - Academic Hierarchy Guide

## Overview
The Super Admin Domain Management UI has been redesigned to follow proper academic hierarchy and provide better clarity.

## New UI Structure

### 1. Sub-Sidebar (Left Side)
- **Location**: Left side of the screen, beside the main sidebar
- **Features**:
  - Lists all existing Domains (Organizations/Schools/Colleges)
  - Search bar at the top to quickly filter domains
  - Click any domain to view its structure
  - "Add Domain" button at the bottom

### 2. Main Content Area
- **Header**: Shows selected domain name and description
- **Tabs**: Three tabs following the correct academic hierarchy

## Academic Hierarchy (Corrected Order)

```
Domain (Organization/School/College)
  ├── Sub-Domains (Primary School / High School / College / UG / PG / PhD)
  │   └── Examples: Primary School, High School, Undergraduate, Postgraduate, PhD
  │
  ├── Departments (1st-10th Grade / CS / Commerce / Mechanical)
  │   └── Examples: 1st Grade, 2nd Grade, Computer Science, Commerce, Mechanical Engineering
  │
  └── Semesters
      └── Examples: Semester 1, Semester 2, Fall 2025, Spring 2026
      └── Can be linked to specific departments or apply to all
```

## Tab Structure

### Tab 1: Sub-Domains
- **Purpose**: Define the broad academic levels within the institution
- **Types Available**:
  - Primary School
  - High School
  - College
  - Undergraduate (UG)
  - Postgraduate (PG)
  - PhD
  - Other
- **CRUD Operations**: Create, Read, Update, Delete unlimited sub-domains

### Tab 2: Departments
- **Purpose**: Define specific departments or grade levels
- **Examples**:
  - For Schools: 1st Grade, 2nd Grade, 3rd Grade, etc.
  - For Colleges: Computer Science, Commerce, Mechanical Engineering, etc.
- **CRUD Operations**: Create, Read, Update, Delete unlimited departments

### Tab 3: Semesters
- **Purpose**: Define time periods or academic terms
- **Features**:
  - Can be linked to specific departments
  - Can apply to all departments (leave department field empty)
- **Examples**: Semester 1, Semester 2, Fall 2025, Spring 2026
- **CRUD Operations**: Create, Read, Update, Delete unlimited semesters

## Key Features

### Flexible Structure
- Super Admin can create **unlimited** Sub-Domains, Departments, and Semesters
- Each level is independent and can be customized per domain
- No restrictions on naming or quantity

### Domain Isolation
- When a domain is selected from the sub-sidebar, only that domain's data is displayed
- Each tab shows only the items belonging to the selected domain
- Complete data isolation between domains

### Standard CRUD Operations
All levels support:
- ✅ Create new items
- ✅ Read/View existing items
- ✅ Update item details
- ✅ Delete items (with confirmation)
- ✅ Active/Inactive status toggle

## Display Rules

1. **No Domain Selected**: Shows a message to select a domain from the sidebar
2. **Domain Selected**: 
   - Header shows domain name and description
   - Tabs become active
   - Each tab displays only items belonging to that domain
3. **Empty State**: If no items exist in a tab, shows a helpful message with "Add" button

## Database Schema

### Tables Created
- `domains` - Organizations/Schools/Colleges
- `sub_domains` - Academic levels (Primary/High School/UG/PG/PhD)
- `departments` - Departments or grade levels
- `semesters` - Academic terms/semesters

### Relationships
- All sub-domains, departments, and semesters are linked to a domain
- Semesters can optionally be linked to specific departments
- Cascade delete: Deleting a domain removes all its children

## API Endpoints

### Domains
- `GET /api/domains` - Get all domains
- `POST /api/domains/create` - Create new domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain

### Sub-Domains
- `GET /api/subdomains?domainId=xxx` - Get sub-domains (filtered by domain)
- `POST /api/subdomains/create` - Create new sub-domain
- `PUT /api/subdomains/:id` - Update sub-domain
- `DELETE /api/subdomains/:id` - Delete sub-domain

### Departments
- `GET /api/departments?domainId=xxx` - Get departments (filtered by domain)
- `POST /api/departments/create` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Semesters
- `GET /api/semesters?domainId=xxx&departmentId=xxx` - Get semesters (filtered)
- `POST /api/semesters/create` - Create new semester
- `PUT /api/semesters/:id` - Update semester
- `DELETE /api/semesters/:id` - Delete semester

## Usage Example

### Setting Up a University

1. **Create Domain**: "MIT University"
2. **Add Sub-Domains**:
   - Undergraduate (UG)
   - Postgraduate (PG)
   - PhD
3. **Add Departments**:
   - Computer Science
   - Mechanical Engineering
   - Commerce
4. **Add Semesters**:
   - Semester 1 (for Computer Science)
   - Semester 2 (for Computer Science)
   - Fall 2025 (for all departments)
   - Spring 2026 (for all departments)

### Setting Up a School

1. **Create Domain**: "ABC High School"
2. **Add Sub-Domains**:
   - Primary School
   - High School
3. **Add Departments**:
   - 1st Grade
   - 2nd Grade
   - 3rd Grade
   - ...
   - 10th Grade
4. **Add Semesters**:
   - Term 1
   - Term 2
   - Term 3

## Benefits

✅ **Clear Hierarchy**: Follows actual academic structure
✅ **Better Organization**: Sub-sidebar keeps domains easily accessible
✅ **Data Isolation**: Each domain's data is completely separate
✅ **Scalability**: Unlimited items at each level
✅ **Flexibility**: Adapts to schools, colleges, universities, and other institutions
✅ **Search**: Quick domain filtering with search bar
✅ **User-Friendly**: Intuitive interface with clear labels and empty states
