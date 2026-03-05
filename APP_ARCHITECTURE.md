# Artist CRM - App Architecture & Behavior Guide

## Executive Summary

**Artist CRM** is a Customer Relationship Management (CRM) system designed for beauty and salon professionals (hairstylists, barbers, estheticians, makeup artists, etc.) to efficiently manage their client base, track service appointments, document visit history with photos, and manage their team members. The application is a React Native cross-platform mobile app (iOS, Android, Web) built with Expo Router.

The system allows artists to:

- Register and maintain their business profile
- Add and manage unlimited customers with detailed profiles
- Record every visit/appointment with services provided
- Tag visits for categorization and filtering
- Store before/after photos and service notes
- Track payment status for each visit
- Generate revenue reports and customer insights
- Invite and manage team members
- Access real-time dashboard with business metrics

---

## App Overview

### What is Artist CRM?

Artist CRM is a comprehensive business management tool tailored for independent and team-based beauty/salon professionals. It bridges the gap between simple booking systems and complex salon management software, focusing on the artist's core needs:

1. **Client Management** - Maintain detailed customer profiles
2. **Visit Tracking** - Document every service appointment with details
3. **Photography** - Store before/after photos for reference
4. **Team Collaboration** - Invite team members and assign access
5. **Business Insights** - Track revenue and customer metrics
6. **History & Notes** - Complete service history with professional notes

### Target Users

- **Independent Artists**: Solo hairstylists, makeup artists, estheticians
- **Salon Owners**: Managing their own salon with multiple team members
- **Freelance Professionals**: Artists working from home or multiple locations
- **Beauty Teams**: Collaborative teams sharing customer databases

---

## App Architecture Overview

### Technology Stack

**Frontend**:

- React Native with Expo
- Expo Router (file-based routing)
- AsyncStorage (local data persistence)
- Dark/Light theme system
- Image picker & file upload capabilities

**Backend (To Be Developed)**:

- RESTful API with JWT authentication
- PostgreSQL/MongoDB database
- Cloud storage for images (S3/Cloudinary)
- Email service for notifications

**Key Screens/Modules**:

1. **Authentication** - Login/Signup with company setup
2. **Dashboard** - Home screen with recent activity
3. **Customers** - Customer list with search and CRUD
4. **Add Clients** - New customer registration
5. **New Visit** - Record appointment details
6. **History** - Timeline of all service records
7. **View History** - Detailed view of customer's visit history
8. **Profile** - User profile and team management
9. **Help** - FAQ and support

---

## User Journey & Workflows

### Workflow 1: Initial Setup (Registration & Company Info)

```
1. User Opens App
   ↓
2. Sees Splash Screen (Logo & Company Name)
   ↓
3. Redirects to Login Screen
   ↓
4. User Chooses: Login OR Signup
   ├─ SIGNUP FLOW:
   │  ├─ Enter Email & Password
   │  ├─ Confirm Password
   │  ├─ Agree to Terms
   │  ├─ Create Account (API: POST /auth/signup)
   │  ├─ Email Verification (API: POST /auth/verify-email)
   │  ├─ Redirect to Company Name Screen
   │  ├─ Enter Company/Business Name
   │  ├─ Save to Profile (API: PUT /users/profile)
   │  └─ Redirect to Dashboard
   │
   └─ LOGIN FLOW:
      ├─ Enter Email & Password
      ├─ Enable "Remember Me" (Optional)
      ├─ Submit (API: POST /auth/login)
      ├─ Validate Credentials
      ├─ Return JWT Token
      └─ Redirect to Dashboard
```

### Workflow 2: Adding a New Customer

```
Dashboard Screen
   ↓
Click "Add Client" Button or Tab
   ↓
Navigate to Add Clients Screen
   ↓
Enter Customer Details:
   ├─ Name (Required)
   ├─ Phone (Required)
   ├─ Email (Optional)
   ├─ Description/Notes (Optional)
   └─ Profile Image (Optional) [Via Image Picker]
   ↓
Submit Form
   ↓
API Call: POST /api/customers
   ├─ Request: { name, phone, email, description, profileImage }
   ├─ Response: Created customer object with ID
   └─ Save locally (AsyncStorage) and server
   ↓
Show Success Animation
   ↓
Reset Form
   ↓
Return to Dashboard or Customer List
```

### Workflow 3: Recording a Visit/Service

```
Dashboard Screen
   ↓
Click "New Visit" Button or Tab
   ↓
Navigate to New Visit Screen
   ↓
STEP 1: Select Customer
   ├─ Search or Select from List
   ├─ API Call: GET /api/customers (search functionality)
   └─ Set selectedCustomer state
   ↓
STEP 2: Select Services
   ├─ Choose from Available Services
   ├─ Search for specific services
   ├─ Add custom services on the fly
   ├─ API Call: GET /api/services (list)
   └─ Multiple selections allowed
   ↓
STEP 3: Add Tags
   ├─ Assign categorization tags (Premium, VIP, Regular, etc.)
   ├─ Create new tags if needed
   ├─ API Call: GET /api/tags
   └─ Multiple selections allowed
   ↓
STEP 4: Add Details
   ├─ Add professional notes (formula used, client feedback, etc.)
   ├─ Capture before/after photos
   │  ├─ Multiple photos allowed
   │  ├─ Image compression
   │  └─ Local storage before upload
   └─ Set visit date & time
   ↓
STEP 5: Payment Info (Optional)
   ├─ Enter total amount (auto-calculated or manual)
   └─ Set payment status (Paid/Pending/Partial)
   ↓
Submit Visit
   ↓
API Call: POST /api/visits
   ├─ Request: {
   │    customerId,
   │    visitDate,
   │    visitTime,
   │    serviceIds[],
   │    tagIds[],
   │    notes,
   │    totalAmount,
   │    paymentStatus
   │  }
   ├─ Response: Created visit with ID
   └─ Then upload photos: POST /api/visits/:visitId/photos
   ↓
Show Success Message
   ↓
Reset All Fields
   ↓
Return to Dashboard or History
```

### Workflow 4: Viewing Customer History

```
Dashboard or Customers List
   ↓
Select a Customer
   ↓
Navigate to ViewHistory Screen
   ├─ Display customer name
   ├─ Show all visits in chronological order (newest first)
   └─ First visit card expanded by default, others collapsed
   ↓
View Visit Details:
   ├─ Service name & category
   ├─ Date & Time
   ├─ Services performed
   ├─ Tags applied
   ├─ Professional notes
   ├─ Before/after photos (scrollable)
   ├─ Amount charged
   └─ Payment status
   ↓
Actions on Visit:
   ├─ View full details (tap to expand)
   ├─ Edit visit (API: PUT /api/visits/:visitId)
   ├─ Delete visit (API: DELETE /api/visits/:visitId)
   └─ Share/Export (Future: PDF generation)
   ↓
Navigate Back to Customer or Dashboard
```

### Workflow 5: Team Management

```
Profile Screen
   ↓
Switch to "Teams" Tab
   ↓
View Current Team Members
   ├─ List of all invited team members
   ├─ Show role (Admin, Team Member, Viewer)
   ├─ Show join date & status
   └─ Show profile images
   ↓
Add New Team Member:
   ├─ Click "Invite" Button
   ├─ Modal Opens
   ├─ Enter team member email
   ├─ Select role (Team Member, Admin)
   ├─ Add description (e.g., "Senior Stylist")
   └─ Submit
   ↓
API Call: POST /api/team-members
   ├─ Request: { email, name, role, description }
   ├─ Backend sends invitation email
   └─ Response: Team member created (pending acceptance)
   ↓
Team member receives email with:
   ├─ Accept/Decline link
   ├─ Business details
   └─ Link to app download
   ↓
Team Member Onboarding:
   ├─ Accept invitation
   ├─ Create password
   ├─ Access owner's customer database
   └─ Can create visits (based on role)
   ↓
Owner Can:
   ├─ Edit team member info
   ├─ Change role
   ├─ Suspend/Activate access
   ├─ Remove team member
   └─ All via API: PUT/DELETE /api/team-members/:id
```

### Workflow 6: Dashboard & Analytics

```
User Opens Dashboard
   ↓
API Call: GET /api/dashboard/overview
   ├─ Returns: {
   │    totalCustomers,
   │    totalVisits,
   │    totalRevenue,
   │    thisMonthVisits,
   │    thisMonthRevenue,
   │    todaysVisits,
   │    activeTeamMembers,
   │    newCustomersThisMonth
   │  }
   └─ Display Key Metrics
   ↓
View Recent Visits:
   ├─ API Call: GET /api/dashboard/recent-visits
   ├─ Shows last 10 visits
   └─ Quick access to customer details
   ↓
View Top Customers:
   ├─ API Call: GET /api/dashboard/top-customers
   ├─ Ranked by visit frequency
   └─ Shows total revenue per customer
   ↓
View Revenue Summary:
   ├─ API Call: GET /api/dashboard/revenue-summary
   ├─ Monthly or weekly breakdown
   └─ Trend visualization
   ↓
Quick Actions:
   ├─ "New Visit" button
   ├─ "Add Client" button
   ├─ "View History" button
   ├─ "Profile" button
   └─ "Help" button
```

---

## Model Relationships & Data Flow

### Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER (Owner)                         │
│  ├─ id, email, password, firstName, lastName                │
│  ├─ phone, website, profileImage, companyName               │
│  └─ accountStatus, createdAt, updatedAt                     │
└───────────────────────────┬─────────────────────────────────┘
        │
        ├── (1-to-Many) ←──────────────────┐
        │                                   │
        │    ┌──────────────────────────────┴──────────────┐
        │    │                               │              │
        ▼    ▼                               ▼              ▼
    ┌──────────────┐    ┌──────────────┐  ┌────────────┐  ┌──────────────┐
    │  CUSTOMER    │    │   SERVICE    │  │    TAG     │  │ TEAM MEMBER  │
    ├─────────────┤    ├─────────────┤  ├───────────┤  ├─────────────┤
    │ id (PK)     │    │ id (PK)     │  │ id (PK)   │  │ id (PK)     │
    │ userId (FK) │    │ userId (FK) │  │ userId(FK)│  │ userId (FK) │
    │ name        │    │ name        │  │ name      │  │ email       │
    │ phone       │    │ price       │  │ color     │  │ name        │
    │ email       │    │ duration    │  │ createdAt │  │ role        │
    │ description │    │ isActive    │  │ updatedAt │  │ joinDate    │
    │ profileImage│    │ createdAt   │  │           │  │ isActive    │
    │ lastVisitDate   │ updatedAt   │  │           │  │ profileImage │
    │ totalVisits │    │ deletedAt   │  │           │  │ description │
    │ createdAt   │    └──────────────┘  └───────────┘  └─────────────┘
    │ updatedAt   │
    │ deletedAt   │
    └──────┬───────┘
           │
           ├── (1-to-Many) ──────────────────────────┐
           │                                         │
           ▼                                         ▼
    ┌──────────────────────────────┐     ┌──────────────────────┐
    │        VISIT                 │     │   AUDIT LOG          │
    ├──────────────────────────────┤     ├──────────────────────┤
    │ id (PK)                      │     │ id (PK)              │
    │ userId (FK)                  │     │ userId (FK)          │
    │ customerId (FK)              │     │ action               │
    │ visitDate                    │     │ entityType           │
    │ visitTime                    │     │ entityId             │
    │ notes                        │     │ oldValues (JSON)     │
    │ totalAmount                  │     │ newValues (JSON)     │
    │ paymentStatus                │     │ ipAddress            │
    │ status                       │     │ userAgent            │
    │ createdAt, updatedAt         │     │ createdAt            │
    │ deletedAt                    │     └──────────────────────┘
    └──────┬──────────────┬────────┘
           │              │
       │   │   Many-to-Many Relationships   │
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│ VISIT_SERVICE   │ │ VISIT_TAG    │ │ VISIT_PHOTO  │
├─────────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)         │ │ id (PK)      │ │ id (PK)      │
│ visitId (FK)    │ │ visitId (FK) │ │ visitId (FK) │
│ serviceId (FK)  │ │ tagId (FK)   │ │ photoUrl     │
│ quantity        │ │ createdAt    │ │ thumbnailUrl │
│ price           │ │ updatedAt    │ │ caption      │
└─────────────────┘ └──────────────┘ │ uploadedAt   │
                                     │ fileSize     │
                                     │ deletedAt    │
                                     └──────────────┘
```

### How Models Work Together

#### 1. **User → Customer Relationship**

- **Relationship**: One User has Many Customers
- **Behavior**:
  - When user signs up, User record is created
  - User can add unlimited customers
  - Each customer belongs to exactly one user (their business)
  - Deleting a user should cascade or soft-delete related customers
  - Each customer is private to their user
- **API Calls**:
  - `POST /api/customers` - Create customer for authenticated user
  - `GET /api/customers` - List all customers of authenticated user
  - Customer ownership is enforced via `userId` field

#### 2. **User → Visit Relationship**

- **Relationship**: One User has Many Visits
- **Behavior**:
  - Visits belong to the user who created them (artist/salon owner)
  - Visits are associated with a customer from user's customer list
  - Team members can create visits on behalf of owner (role-based)
  - All visits are queryable per user for their dashboard
- **API Calls**:
  - `POST /api/visits` - Create visit for user's customer
  - `GET /api/visits` - Get all visits (filtered by userId)
  - `GET /api/visits/timeline` - Timeline view of visits

#### 3. **User → TeamMember Relationship**

- **Relationship**: One User (Owner) has Many Team Members
- **Behavior**:
  - Owner invites team members via email
  - Team members get their own account but linked to owner
  - Team members can have different roles (Admin, Team Member, Viewer)
  - Each team member can create visits tied to owner's account
  - Owner can manage/remove team members
- **API Calls**:
  - `POST /api/team-members` - Invite team member
  - `GET /api/team-members` - List owner's team
  - `DELETE /api/team-members/:memberId` - Remove team member

#### 4. **User → Service Relationship**

- **Relationship**: One User has Many Services
- **Behavior**:
  - Each user has their own list of services
  - Services are templates available for booking visits
  - Services can be custom-created on-the-fly during visit creation
  - Services have optional pricing and duration
- **API Calls**:
  - `POST /api/services` - Create custom service
  - `GET /api/services` - List user's available services
  - `GET /api/services/popular` - Get frequently used services

#### 5. **User → Tag Relationship**

- **Relationship**: One User has Many Tags
- **Behavior**:
  - Each user defines their own tags for categorization
  - Tags help classify visits (Premium, VIP, Regular, Color, etc.)
  - Tags are reusable across multiple visits
  - User can create/modify tags anytime
- **API Calls**:
  - `POST /api/tags` - Create tag
  - `GET /api/tags` - List all tags
  - Tags filter visits in History and Dashboard

#### 6. **Customer → Visit Relationship** (Core Data Flow)

- **Relationship**: One Customer has Many Visits
- **Behavior**:
  - Every visit is tied to exactly one customer
  - Visits represent service records/appointments
  - Customer's visit history shows all services provided
  - Helps track customer preferences and service history
  - Automatically updates `totalVisits` and `lastVisitDate` on customer
- **Data Flow**:
  ```
  Customer Created
     ↓
  (User adds services to customer in future visits)
     ↓
  New Visit Created
     ├─ customerId linked
     ├─ Services selected
     ├─ Tags applied
     ├─ Photos uploaded
     └─ Notes added
     ↓
  Visit stored with all details
     ↓
  Customer's visit history updated
     ↓
  Dashboard metrics updated
  ```

#### 7. **Visit → Service Relationship** (Many-to-Many via VisitService)

- **Relationship**: One Visit has Many Services, One Service in Many Visits
- **Behavior**:
  - When creating a visit, user selects multiple services
  - VisitService junction table tracks which services were done
  - Allows quantity/pricing per service per visit
  - Can query all visits for a specific service
- **Example**:

  ```
  Visit #1: Customer "Ahmad Ali" on 2026-03-05
    ├─ VisitService: Haircut (qty: 1, price: $50)
    └─ VisitService: Shaving (qty: 1, price: $20)

  Service "Haircut" appears in:
    ├─ Visit #1 (Ahmad Ali)
    ├─ Visit #5 (Sara Khan)
    └─ Visit #12 (Hamza Sheikh)
  ```

#### 8. **Visit → Tag Relationship** (Many-to-Many via VisitTag)

- **Relationship**: One Visit can have Many Tags
- **Behavior**:
  - Visits can be categorized with multiple tags
  - Tags help filter/search visits
  - User can quickly find all "Premium" or "VIP" visits
  - Tags are metadata for organization
- **Example**:

  ```
  Visit #1 Tagged as:
    ├─ VisitTag: Premium
    ├─ VisitTag: VIP
    └─ VisitTag: Color

  Filter by Tag "VIP":
    ├─ Visit #1 (Ahmad Ali)
    ├─ Visit #5 (Bilal Khan)
    └─ Visit #8 (Zain Malik)
  ```

#### 9. **Visit → Photo Relationship** (One-to-Many)

- **Relationship**: One Visit has Many Photos
- **Behavior**:
  - Each visit can have multiple before/after photos
  - Photos stored in cloud storage (S3/Cloudinary)
  - Thumbnail URLs for performance
  - Photos tied to visit ID
- **Example**:
  ```
  Visit #1:
    ├─ VisitPhoto #1: Before photo (photoUrl + thumbnailUrl)
    ├─ VisitPhoto #2: During photo
    └─ VisitPhoto #3: After photo
  ```

#### 10. **User → AuditLog Relationship** (Optional but recommended)

- **Relationship**: One User has Many Audit Logs
- **Behavior**:
  - Every significant action logged against user
  - Tracks who did what and when
  - Useful for compliance and debugging
  - Can track data changes (oldValues vs newValues)
- **Events Logged**:
  - Customer created/updated/deleted
  - Visit created/updated/deleted
  - Team member added/removed
  - Payment recorded
  - Photos uploaded

---

## Data Flow Examples

### Example 1: Complete New Visit Flow

```
Frontend (React Native App):
  User navigates to "New Visit"
  ├─ SELECT CUSTOMER:
  │  ├─ API: GET /api/customers (search for "Ahmad")
  │  ├─ Backend queries: SELECT * FROM customers WHERE userId = ? AND name LIKE ?
  │  ├─ Returns: Customer object with id: "cust_123"
  │  └─ Frontend: selectedCustomer = { id: "cust_123", name: "Ahmad Ali", ... }
  │
  ├─ SELECT SERVICES:
  │  ├─ User selects: ["Haircut", "Shaving"]
  │  ├─ Frontend stores: selectedServices = ["Haircut", "Shaving"]
  │  └─ No API call yet (services are client-side)
  │
  ├─ SELECT TAGS:
  │  ├─ User selects: ["Regular", "Premium"]
  │  ├─ Frontend stores: selectedTags = ["Regular", "Premium"]
  │  └─ No API call yet
  │
  ├─ ADD DETAILS:
  │  ├─ Visit date: "2026-03-05"
  │  ├─ Visit time: "10:30 AM"
  │  ├─ Notes: "Prefer shorter sides, sharp fade."
  │  ├─ Total amount: $70
  │  ├─ Payment status: "paid"
  │  └─ Photos: 2 images selected
  │
  └─ SUBMIT VISIT:
     ├─ API: POST /api/visits
     ├─ Request body:
     │  {
     │    "customerId": "cust_123",
     │    "visitDate": "2026-03-05",
     │    "visitTime": "10:30 AM",
     │    "serviceIds": ["service_haircut", "service_shaving"],
     │    "tagIds": ["tag_regular", "tag_premium"],
     │    "notes": "Prefer shorter sides, sharp fade.",
     │    "totalAmount": 70,
     │    "paymentStatus": "paid"
     │  }
     │
     └─ Backend Processing:
        ├─ 1. CREATE VISIT RECORD:
        │  ├─ INSERT INTO visits (userId, customerId, visitDate, visitTime, ...)
        │  ├─ VALUES ("user_456", "cust_123", "2026-03-05", "10:30 AM", ...)
        │  ├─ RETURNING id: "visit_789"
        │  └─ Response: { id: "visit_789", customerId: "cust_123", ... }
        │
        ├─ 2. CREATE VISIT-SERVICE RELATIONSHIPS:
        │  ├─ INSERT INTO visit_service (visitId, serviceId)
        │  │  VALUES ("visit_789", "service_haircut")
        │  └─ INSERT INTO visit_service (visitId, serviceId)
        │     VALUES ("visit_789", "service_shaving")
        │
        ├─ 3. CREATE VISIT-TAG RELATIONSHIPS:
        │  ├─ INSERT INTO visit_tag (visitId, tagId)
        │  │  VALUES ("visit_789", "tag_regular")
        │  └─ INSERT INTO visit_tag (visitId, tagId)
        │     VALUES ("visit_789", "tag_premium")
        │
        ├─ 4. UPDATE CUSTOMER METRICS:
        │  ├─ UPDATE customers
        │  │  SET totalVisits = totalVisits + 1,
        │  │      lastVisitDate = "2026-03-05"
        │  │  WHERE id = "cust_123"
        │  └─ Customer now shows 6 total visits
        │
        ├─ 5. UPLOAD PHOTOS (separate API calls):
        │  ├─ API: POST /api/visits/visit_789/photos
        │  ├─ Upload image 1 to S3
        │  ├─ INSERT INTO visit_photo (visitId, photoUrl, thumbnailUrl)
        │  ├─ Upload image 2 to S3
        │  └─ INSERT INTO visit_photo (visitId, photoUrl, thumbnailUrl)
        │
        └─ 6. CREATE AUDIT LOG (optional):
           └─ INSERT INTO audit_log
              (userId, action, entityType, entityId, newValues)
              VALUES ("user_456", "visit_created", "Visit", "visit_789", {...})

Frontend Response:
  ├─ Show success animation
  ├─ Display "Visit recorded successfully"
  ├─ Reset form fields
  ├─ Navigate back to Dashboard
  └─ Dashboard refetches data
     ├─ API: GET /api/dashboard/overview (shows updated visit count)
     ├─ API: GET /api/dashboard/recent-visits (includes new visit)
     └─ UI updates with latest metrics
```

### Example 2: Customer Lookup & History View

```
Frontend (React Native App):
  User views "Customers" screen
  ├─ Show list of all customers with pagination
  ├─ API: GET /api/customers?page=1&limit=20
  │
  └─ User searches for "Ahmad"
     ├─ API: GET /api/customers/search?q=Ahmad
     │
     └─ User taps on "Ahmad Ali" customer card
        ├─ Navigate to ViewHistory screen
        ├─ Params: { customerId: "cust_123" }
        │
        └─ Backend Processing:
           ├─ 1. FETCH CUSTOMER DETAILS:
           │  ├─ SELECT * FROM customers WHERE id = "cust_123"
           │  └─ Returns: Name, phone, email, description, lastVisitDate
           │
           ├─ 2. FETCH ALL VISITS FOR CUSTOMER:
           │  ├─ SELECT v.* FROM visits v
           │  │  WHERE v.customerId = "cust_123"
           │  │  ORDER BY v.visitDate DESC
           │  └─ Returns: Array of 15 visits (most recent first)
           │
           ├─ 3. FOR EACH VISIT, FETCH SERVICES:
           │  ├─ SELECT s.* FROM services s
           │  │  WHERE s.id IN (
           │  │    SELECT serviceId FROM visit_service
           │  │    WHERE visitId = ?
           │  │  )
           │  └─ Example for Visit #1: ["Haircut", "Shaving"]
           │
           ├─ 4. FOR EACH VISIT, FETCH TAGS:
           │  ├─ SELECT t.* FROM tags t
           │  │  WHERE t.id IN (
           │  │    SELECT tagId FROM visit_tag
           │  │    WHERE visitId = ?
           │  │  )
           │  └─ Example for Visit #1: ["Regular", "Premium"]
           │
           └─ 5. FOR EACH VISIT, FETCH PHOTOS:
              ├─ SELECT * FROM visit_photo
              │  WHERE visitId = ?
              │  ORDER BY uploadedAt DESC
              └─ Example for Visit #1: [photo1_url, photo2_url, photo3_url]

Frontend Display:
  └─ ViewHistory Screen shows:
     ├─ FIRST VISIT (Expanded by default):
     │  ├─ Service: "Full Hair Color"
     │  ├─ Tags: [Premium, Color]
     │  ├─ Date: "25 Jan 2026"
     │  ├─ Time: "10:30 AM"
     │  ├─ Notes: "Formula: 6.1 + 20vol. Client loved the shine."
     │  ├─ Photos: 4 images scrollable
     │  └─ User can edit/delete
     │
     ├─ DIVIDER: "See More"
     │
     ├─ SECOND VISIT (Collapsible):
     │  ├─ Service: "Beard Grooming"
     │  ├─ Tags: [Regular]
     │  ├─ Date: "10 Jan 2026"
     │  └─ Tap to expand all details
     │
     └─ ... more visits
```

### Example 3: Dashboard Analytics Update

```
Frontend (React Native App):
  User opens Dashboard
  ├─ Show loading skeleton/spinner
  ├─ API: GET /api/dashboard/overview
  │
  └─ Backend Processing:
     ├─ 1. COUNT TOTAL CUSTOMERS:
     │  └─ SELECT COUNT(*) FROM customers WHERE userId = ? AND deletedAt IS NULL
     │     → Result: 45
     │
     ├─ 2. COUNT TOTAL VISITS:
     │  └─ SELECT COUNT(*) FROM visits WHERE userId = ? AND deletedAt IS NULL
     │     → Result: 150
     │
     ├─ 3. SUM TOTAL REVENUE:
     │  └─ SELECT SUM(totalAmount) FROM visits
     │     WHERE userId = ? AND status = 'completed' AND deletedAt IS NULL
     │     → Result: $7,500
     │
     ├─ 4. COUNT THIS MONTH'S VISITS:
     │  └─ SELECT COUNT(*) FROM visits
     │     WHERE userId = ? AND MONTH(visitDate) = MONTH(NOW())
     │     AND YEAR(visitDate) = YEAR(NOW())
     │     → Result: 32
     │
     ├─ 5. SUM THIS MONTH'S REVENUE:
     │  └─ SELECT SUM(totalAmount) FROM visits
     │     WHERE userId = ? AND MONTH(visitDate) = MONTH(NOW())
     │     AND YEAR(visitDate) = YEAR(NOW()) AND deletedAt IS NULL
     │     → Result: $1,600
     │
     ├─ 6. COUNT TODAY'S VISITS:
     │  └─ SELECT COUNT(*) FROM visits
     │     WHERE userId = ? AND DATE(visitDate) = CURDATE()
     │     → Result: 5
     │
     ├─ 7. COUNT ACTIVE TEAM MEMBERS:
     │  └─ SELECT COUNT(*) FROM team_members
     │     WHERE userId = ? AND isActive = true AND deletedAt IS NULL
     │     → Result: 3
     │
     └─ 8. COUNT NEW CUSTOMERS THIS MONTH:
        └─ SELECT COUNT(*) FROM customers
           WHERE userId = ? AND MONTH(createdAt) = MONTH(NOW())
           AND YEAR(createdAt) = YEAR(NOW())
           → Result: 8

Response (API):
  {
    "totalCustomers": 45,
    "totalVisits": 150,
    "totalRevenue": 7500.00,
    "thisMonthVisits": 32,
    "thisMonthRevenue": 1600.00,
    "todaysVisits": 5,
    "activeTeamMembers": 3,
    "newCustomersThisMonth": 8
  }

Frontend Display:
  ├─ Dashboard Card 1: "45 Total Customers"
  ├─ Dashboard Card 2: "150 Total Visits"
  ├─ Dashboard Card 3: "$7,500 Total Revenue"
  ├─ Dashboard Card 4: "32 Visits This Month"
  ├─ Dashboard Card 5: "5 Visits Today"
  └─ Recent Visits Widget
     ├─ API: GET /api/dashboard/recent-visits?limit=10
     └─ Shows 10 most recent visits with customer names
```

---

## App Behavior & Features

### Feature 1: Local Data Persistence (AsyncStorage)

**How it works**:

- App stores customer list locally using AsyncStorage
- Key: `permanently_saved_customers`
- Allows offline viewing of customers
- Syncs with backend on creation/update/delete

**Example**:

```javascript
// Add customer locally
const addCustomer = async (customer) => {
  const saved = await AsyncStorage.getItem('permanently_saved_customers');
  const customers = saved ? JSON.parse(saved) : [];
  customers.push(customer);
  await AsyncStorage.setItem(
    'permanently_saved_customers',
    JSON.stringify(customers),
  );
};

// Fetch local customers
const getCustomers = async () => {
  const saved = await AsyncStorage.getItem('permanently_saved_customers');
  return saved ? JSON.parse(saved) : [];
};
```

### Feature 2: Image Handling

**Capture & Upload**:

- Image picker for profile photos and visit photos
- Base64 encoding for small images (local storage)
- Cloud upload for large images (S3/Cloudinary)
- Thumbnail generation for performance
- Compression to reduce data usage

### Feature 3: Search & Filter\*\*

**Real-time Search**:

- Search customers by name or phone
- Filter visits by date range, tags, services
- Global search across customers, visits, services
- Search suggestions from popular items

**Example Queries**:

```
Search Table: Customers
├─ Query: "Ahmad"
├─ Check: name.toLowerCase().includes(query) || phone.includes(query)
└─ Return: Matching customers

Filter Table: Visits
├─ Filters: { customerId, startDate, endDate, tagId, serviceId, status }
├─ Build WHERE clause dynamically
└─ Return: Filtered visits
```

### Feature 4: Search & Filter

**Real-time Search**:

- Search customers by name or phone
- Filter visits by date range, tags, services
- Global search across customers, visits, services
- Search suggestions from popular items

### Feature 5: Theme System (Dark/Light Mode)

**Implementation**:

- Context-based theme management
- User preference saved to AsyncStorage
- Persistent across sessions
- Dynamic color application to all components

**Theme Colors**:

- Light Mode: White backgrounds, dark text
- Dark Mode: Dark gray backgrounds (#1e293b), light text
- Primary Color: Purple (#5152B3)
- Accent: Gradients and shadows

### Feature 6: Team Collaboration

**Workflow**:

1. Owner invites team member via email
2. System sends invitation with unique link
3. Team member creates account by accepting invite
4. Team member gets access to owner's data (based on role)
5. Both can create/update visits
6. All visits tied to owner's account

**Roles**:

- **Admin**: Full access, can manage team
- **Team Member**: Can create/edit visits
- **Viewer**: Read-only access to history

### Feature 7: Validation & Error Handling

**Input Validation**:

- Email format validation
- Phone number format validation
- Required field checks
- Duplicate prevention (email uniqueness)

**Error Messages**:

- User-friendly error displays
- API error responses with codes
- Form validation feedback
- Loading states during operations

### Feature 8: Success Animations

**Visual Feedback**:

- Toast-like success messages
- Slide-down animations on success
- Automatic dismissal after delay
- Form reset after successful submission

---

## Data States & Lifecycle

### Customer Lifecycle

```
User Adds Customer
  ↓
Customer Created in Backend (API: POST /api/customers)
  ├─ Id assigned
  ├─ createdAt timestamp
  ├─ totalVisits = 0
  └─ lastVisitDate = null
  ↓
Customer Stored Locally (AsyncStorage)
  └─ Synced with backend
  ↓
User Records Visits
  ├─ Each visit increments totalVisits
  ├─ Updates lastVisitDate
  └─ Accumulates service history
  ↓
User Views Customer History
  ├─ Shows all visits
  ├─ Shows total visit count
  └─ Shows last visit date
  ↓
User Edits Customer
  ├─ Updates phone, email, description, image
  ├─ API: PUT /api/customers/:customerId
  └─ updatedAt timestamp changes
  ↓
User Deletes Customer (Soft Delete)
  ├─ API: DELETE /api/customers/:customerId
  ├─ deletedAt timestamp set
  ├─ Still visible if explicitly requested
  └─ Hidden from normal queries
```

### Visit Lifecycle

```
User Creates Visit
  ├─ Selects customer, services, tags
  ├─ Adds notes and photos
  └─ API: POST /api/visits
  ↓
Visit Stored with Status: "completed"
  ├─ Visit ID assigned
  ├─ createdAt timestamp
  ├─ Associate with customer
  ├─ Link services (VisitService)
  ├─ Link tags (VisitTag)
  └─ Upload photos (VisitPhoto)
  ↓
Visit Appears in:
  ├─ Customer's Visit History
  ├─ Dashboard Recent Visits
  ├─ Timeline View
  └─ Revenue Reports
  ↓
User Can Edit Visit
  ├─ Change services, tags, notes, amount
  ├─ Update or add photos
  ├─ API: PUT /api/visits/:visitId
  └─ updatedAt timestamp changes
  ↓
User Can Mark Payment Received
  ├─ Update paymentStatus: "paid"
  ├─ API: PUT /api/visits/:visitId
  └─ Affects revenue calculations
  ↓
User Marks Visit as Cancelled (if needed)
  ├─ Change status: "cancelled"
  ├─ May exclude from revenue reports
  └─ Still visible in history
  ↓
User Deletes Visit (Soft Delete)
  ├─ API: DELETE /api/visits/:visitId
  ├─ deletedAt timestamp set
  ├─ Updates customer totalVisits down
  └─ Removed from normal queries
```

### Service & Tag Lifecycle

```
Services:
├─ User can define custom services (Haircut, Coloring, etc.)
├─ Services are templates for reuse
├─ Can be marked inactive (inactive != deleted)
├─ Can track which services are most used
└─ Popular services can be suggested to user

Tags:
├─ User creates custom tags (Premium, VIP, Regular, etc.)
├─ Tags are reusable across multiple visits
├─ Help organize and filter visit history
├─ Can have custom colors for UI
└─ Can track which tags are most frequently used
```

---

## Performance Considerations

### Data Query Optimization

1. **Pagination**: All list endpoints use pagination (limit, offset)
   - Reduces data transfer
   - Improves initial load time
   - Prevents UI lag with large datasets

2. **Filtering**: Server-side filtering before data returns
   - Only relevant data sent to client
   - Reduces network bandwidth
   - Faster UI rendering

3. **Caching Strategy**:
   - User profile: Cache 1 hour
   - Services/Tags: Cache 4 hours
   - Customer list: Cache 30 minutes
   - Dashboard: Cache 15 minutes

4. **Image Optimization**:
   - Thumbnails for lists (faster loading)
   - Full images only when needed
   - Compression during upload
   - CDN distribution (if available)

### Storage Management

1. **Local AsyncStorage**:
   - Limited to ~5-10MB per app
   - Should store essential data only
   - Implement cleanup for old data

2. **Cloud Storage**:
   - All photos go to S3/Cloudinary
   - Database stores only URLs/metadata
   - Automatic backup and redundancy

---

## Security & Data Privacy

### Authentication

- JWT tokens with 24-hour expiration
- Refresh tokens for extended sessions
- Secure password hashing (bcrypt)
- Email verification for new accounts

### Authorization

- User data isolation (users can't see each other's data)
- Team member role-based access (RBAC)
- Delete operations require confirmation
- Audit logging for compliance

### Data Protection

- HTTPS for all API calls
- Encrypted passwords in database
- Soft deletes for data recovery
- Regular automated backups

---

## Integration Points

### What the Backend Must Provide to App

1. **Authentication Endpoints**: Login, signup, token refresh
2. **Customer CRUD**: Create, read, update, delete customers
3. **Visit Management**: Create, read, update, delete visits
4. **Photo Upload**: File upload to cloud storage
5. **Search & Filter**: Query customers, visits with filters
6. **Dashboard Stats**: Overview, recent visits, top customers
7. **Team Management**: Invite, manage team members
8. **Service/Tag CRUD**: Manage custom services and tags
9. **Error Handling**: Consistent error responses
10. **Rate Limiting**: Protect against abuse

### Expected Request/Response Flow

1. **Request** (Mobile App):

   ```json
   {
     "method": "POST",
     "url": "/api/customers",
     "headers": {
       "Authorization": "Bearer jwt_token",
       "Content-Type": "application/json"
     },
     "body": {
       "name": "Ahmad Ali",
       "phone": "0300-1234567",
       "email": "ahmad@example.com",
       "description": "Prefers shorter sides"
     }
   }
   ```

2. **Response** (Backend):
   ```json
   {
     "success": true,
     "data": {
       "id": "uuid",
       "userId": "user_uuid",
       "name": "Ahmad Ali",
       "phone": "0300-1234567",
       "email": "ahmad@example.com",
       "description": "Prefers shorter sides",
       "profileImage": null,
       "totalVisits": 0,
       "lastVisitDate": null,
       "createdAt": "2026-03-05T10:30:00Z"
     }
   }
   ```

---

## Summary

Artist CRM is a comprehensive mobile CRM application designed for beauty and salon professionals. It enables users to:

- **Manage** a customer database with detailed profiles
- **Record** every service visit with photos and notes
- **Track** revenue and business metrics in real-time
- **Collaborate** with team members (if applicable)
- **Analyze** customer data and service trends

The app uses a client-server architecture where the React Native frontend handles UI and local caching, while the backend provides persistent storage, authentication, and business logic. Data flows seamlessly between the app and backend through RESTful APIs, with local AsyncStorage providing offline access to frequently accessed data.

The core data model revolves around Users managing Customers, with Visits being the central record linking customers to services. Supporting models like Services, Tags, and TeamMembers extend functionality, while audit logs and soft deletes ensure data integrity and compliance.

For the backend developer, this document provides a complete understanding of how the app works, what data it needs, and how to structure APIs to support all the features and workflows outlined above.

---

**Document Version**: 1.0  
**Created**: March 5, 2026  
**Purpose**: Backend Developer Reference Guide  
**Status**: Ready for Implementation
