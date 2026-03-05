# Artist CRM - Backend Requirements

## Overview

This document outlines all required database models and API endpoints for the Artist CRM application backend. The app is a Customer Relationship Management system for beauty/salon professionals (hairstylists, estheticians, etc.) to manage clients, track service visits, and maintain team.

---

## Database Models

### 1. User Model

**Purpose**: Represents the artist/salon owner/manager account

```
User
├── id (UUID, Primary Key)
├── email (String, Unique, Required)
├── password (String, Hashed, Required)
├── firstName (String)
├── lastName (String)
├── phone (String)
├── website (String, Optional)
├── profileImage (String, URL/File Path, Optional)
├── companyName (String, Optional)
├── isVerified (Boolean, Default: false)
├── rememberMe (Boolean, Default: false)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── accountStatus (Enum: 'active' | 'inactive' | 'suspended')
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Notes**:

- Email must be unique across the system
- Phone field for contact purposes
- Website field to store business website URL
- Profile image should support file uploads
- Company name for the business/salon
- Account status tracking for admin controls

---

### 2. Customer Model

**Purpose**: Represents a client/customer of the artist

```
Customer
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Required)
├── name (String, Required)
├── phone (String, Required)
├── email (String, Optional)
├── description (String, Optional) [Notes about customer]
├── profileImage (String, URL/File Path, Optional)
├── lastVisitDate (DateTime, Optional)
├── totalVisits (Integer, Default: 0)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Indexes**:

- userId + phone (for quick lookup by user and phone)
- userId + name (for search by name)
- userId + lastVisitDate (for recent customers)

**Constraints**:

- One user can have many customers
- Phone number should be unique per user (optional: allow duplicates for same customer)

---

### 3. Visit Model

**Purpose**: Records every service appointment/visit with a customer

```
Visit
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Required)
├── customerId (UUID, Foreign Key → Customer, Required)
├── visitDate (DateTime, Required)
├── visitTime (String, Required) [e.g., "10:30 AM"]
├── notes (String, Optional) [Detailed notes about the visit]
├── tagsIds (Array of UUIDs, Foreign Key → Tag)
├── serviceIds (Array of UUIDs, Foreign Key → Service)
├── totalAmount (Decimal, Optional) [Cost/price of services]
├── paymentStatus (Enum: 'pending' | 'paid' | 'partial', Default: 'pending')
├── status (Enum: 'completed' | 'pending' | 'cancelled', Default: 'completed')
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Indexes**:

- userId + visitDate (for timeline/history view)
- customerId + visitDate (for customer visit history)
- userId + status (for status filtering)

**Relationships**:

- One visit belongs to one user
- One visit belongs to one customer
- One visit can have many services (Many-to-Many via VisitService)
- One visit can have many tags (Many-to-Many via VisitTag)
- One visit can have many photos (One-to-Many via VisitPhoto)

---

### 4. Service Model

**Purpose**: Defines available services that can be provided

```
Service
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Required)
├── name (String, Required) [e.g., "Haircut", "Coloring", "Facial"]
├── description (String, Optional)
├── price (Decimal, Optional)
├── duration (Integer, Optional) [Duration in minutes]
├── isActive (Boolean, Default: true)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Notes**:

- Each user can have their own list of custom services
- Services can include: Haircut, Coloring, Styling, Facial, Treatment, Shaving, Massage, Steam, etc.
- Price is optional as it might be determined per visit
- Duration helps with scheduling

---

### 5. Tag Model

**Purpose**: Labels/categories for visits and customers

```
Tag
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Required)
├── name (String, Required) [e.g., "Premium", "VIP", "Regular", "New", "Color"]
├── color (String, Optional) [Hex color code for UI display]
├── description (String, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

**Notes**:

- User-defined tags for categorization
- Used for visit classification and filtering
- Color field for better UI representation

---

### 6. VisitService Model (Junction Table)

**Purpose**: Many-to-Many relationship between Visit and Service

```
VisitService
├── id (UUID, Primary Key)
├── visitId (UUID, Foreign Key → Visit, Required)
├── serviceId (UUID, Foreign Key → Service, Required)
├── quantity (Integer, Default: 1)
├── price (Decimal, Optional) [Price for this service on this visit]
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

**Constraints**:

- Unique constraint on (visitId, serviceId)
- One visit can have multiple services
- One service can be used in multiple visits

---

### 7. VisitTag Model (Junction Table)

**Purpose**: Many-to-Many relationship between Visit and Tag

```
VisitTag
├── id (UUID, Primary Key)
├── visitId (UUID, Foreign Key → Visit, Required)
├── tagId (UUID, Foreign Key → Tag, Required)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

**Constraints**:

- Unique constraint on (visitId, tagId)
- One visit can have multiple tags
- One tag can be applied to multiple visits

---

### 8. VisitPhoto Model

**Purpose**: Stores photos taken during a visit

```
VisitPhoto
├── id (UUID, Primary Key)
├── visitId (UUID, Foreign Key → Visit, Required)
├── photoUrl (String, Required) [S3 URL or file path]
├── thumbnailUrl (String, Optional) [Compressed thumbnail URL]
├── caption (String, Optional)
├── uploadedAt (DateTime)
├── fileSize (Integer, Optional) [In bytes]
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Notes**:

- Support multiple photos per visit
- Should store photos in cloud storage (S3, Cloudinary, etc.)
- Include thumbnail generation for performance

---

### 9. TeamMember Model

**Purpose**: Represents staff/team members

```
TeamMember
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Required)
├── name (String, Required)
├── email (String, Required)
├── password (String, Hashed, Required)
├── phone (String, Optional)
├── role (Enum: 'admin' | 'team_member' | 'viewer', Default: 'team_member')
├── profileImage (String, URL/File Path, Optional)
├── description (String, Optional) [Job title/designation]
├── isActive (Boolean, Default: true)
├── joinDate (DateTime)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── deletedAt (DateTime, Soft Delete, Optional)
```

**Relationships**:

- One main user can have many team members
- Team members can be invited to manage customers and visits
- Role-based access control (RBAC)

---

### 10. AuditLog Model (Recommended)

**Purpose**: Track all significant actions for compliance and debugging

```
AuditLog
├── id (UUID, Primary Key)
├── userId (UUID, Foreign Key → User, Optional)
├── action (String, Required) [e.g., 'customer_created', 'visit_updated']
├── entityType (String, Required) [e.g., 'Customer', 'Visit']
├── entityId (UUID, Required)
├── oldValues (JSON, Optional) [Previous data]
├── newValues (JSON, Optional) [New data]
├── ipAddress (String, Optional)
├── userAgent (String, Optional)
├── createdAt (DateTime)
└── deletedAt (DateTime, Soft Delete, Optional)
```

---

## API Endpoints

### Authentication Endpoints

#### 1. POST `/api/auth/signup`

**Request**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "token": "jwt_token",
  "createdAt": "2026-03-05T10:30:00Z"
}
```

**Validations**:

- Email format validation
- Password minimum 8 characters
- Unique email check
- Email verification (send OTP/link)

---

#### 2. POST `/api/auth/login`

**Request**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response** (200):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "token": "jwt_token",
  "expiresIn": 86400,
  "refreshToken": "refresh_token"
}
```

---

#### 3. POST `/api/auth/logout`

**Request**: Authorization header required
**Response** (200):

```json
{
  "message": "Successfully logged out",
  "timestamp": "2026-03-05T10:30:00Z"
}
```

---

#### 4. POST `/api/auth/refresh-token`

**Request**:

```json
{
  "refreshToken": "refresh_token"
}
```

**Response** (200):

```json
{
  "token": "new_jwt_token",
  "expiresIn": 86400
}
```

---

#### 5. POST `/api/auth/verify-email`

**Request**:

```json
{
  "token": "verification_token_from_email"
}
```

**Response** (200):

```json
{
  "message": "Email verified successfully",
  "isVerified": true
}
```

---

#### 6. POST `/api/auth/forgot-password`

**Request**:

```json
{
  "email": "user@example.com"
}
```

**Response** (200):

```json
{
  "message": "Password reset link sent to email"
}
```

---

#### 7. POST `/api/auth/reset-password`

**Request**:

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response** (200):

```json
{
  "message": "Password reset successfully"
}
```

---

### User/Profile Endpoints

#### 8. GET `/api/users/profile`

**Authorization**: Required
**Response** (200):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "website": "www.example.com",
  "profileImage": "https://cdn.example.com/image.jpg",
  "companyName": "John's Salon",
  "isVerified": true,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

#### 9. PUT `/api/users/profile`

**Authorization**: Required
**Request**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "website": "www.example.com",
  "companyName": "John's Salon"
}
```

**Response** (200): Updated user object

---

#### 10. POST `/api/users/profile/upload-image`

**Authorization**: Required
**Request**: Multipart form-data with image file
**Response** (200):

```json
{
  "profileImage": "https://cdn.example.com/profile-image.jpg",
  "message": "Profile image uploaded successfully"
}
```

---

#### 11. PUT `/api/users/change-password`

**Authorization**: Required
**Request**:

```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

**Response** (200):

```json
{
  "message": "Password changed successfully"
}
```

---

### Customer Endpoints

#### 12. POST `/api/customers`

**Authorization**: Required
**Request**:

```json
{
  "name": "Ahmad Ali",
  "phone": "0300-1234567",
  "email": "ahmad@example.com",
  "description": "Prefers shorter sides with sharp fade",
  "profileImage": "base64_string_or_url"
}
```

**Response** (201):

```json
{
  "id": "uuid",
  "userId": "user_uuid",
  "name": "Ahmad Ali",
  "phone": "0300-1234567",
  "email": "ahmad@example.com",
  "description": "Prefers shorter sides with sharp fade",
  "profileImage": "https://cdn.example.com/customer-image.jpg",
  "totalVisits": 0,
  "createdAt": "2026-03-05T10:30:00Z"
}
```

---

#### 13. GET `/api/customers`

**Authorization**: Required
**Query Parameters**:

- `page` (Integer, Default: 1)
- `limit` (Integer, Default: 20)
- `search` (String, Optional) - Search by name or phone
- `sortBy` (String, Default: 'createdAt')
- `sort` (Enum: 'asc' | 'desc', Default: 'desc')

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ahmad Ali",
      "phone": "0300-1234567",
      "email": "ahmad@example.com",
      "description": "Prefers shorter sides with sharp fade",
      "profileImage": "https://cdn.example.com/image.jpg",
      "totalVisits": 5,
      "lastVisitDate": "2026-02-20T14:30:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

#### 14. GET `/api/customers/:customerId`

**Authorization**: Required
**Response** (200): Single customer object with all details

---

#### 15. PUT `/api/customers/:customerId`

**Authorization**: Required
**Request**: Same as POST `/api/customers`
**Response** (200): Updated customer object

---

#### 16. DELETE `/api/customers/:customerId`

**Authorization**: Required
**Response** (200):

```json
{
  "message": "Customer deleted successfully",
  "id": "uuid"
}
```

**Note**: Soft delete with option for permanent deletion with confirmation

---

#### 17. GET `/api/customers/search`

**Authorization**: Required
**Query Parameters**:

- `q` (String, Required) - Search query
- `type` (Enum: 'name' | 'phone' | 'all', Default: 'all')

**Response** (200):

```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Ahmad Ali",
      "phone": "0300-1234567",
      "profileImage": "https://cdn.example.com/image.jpg"
    }
  ]
}
```

---

### Visit/Appointment Endpoints

#### 18. POST `/api/visits`

**Authorization**: Required
**Request**:

```json
{
  "customerId": "uuid",
  "visitDate": "2026-03-05",
  "visitTime": "10:30 AM",
  "serviceIds": ["service_uuid_1", "service_uuid_2"],
  "tagIds": ["tag_uuid_1", "tag_uuid_2"],
  "notes": "Client prefers bob cut with layers",
  "totalAmount": 150.0,
  "paymentStatus": "paid"
}
```

**Response** (201):

```json
{
  "id": "uuid",
  "userId": "user_uuid",
  "customerId": "customer_uuid",
  "visitDate": "2026-03-05",
  "visitTime": "10:30 AM",
  "services": [
    {
      "id": "uuid",
      "name": "Haircut",
      "price": 50.0
    }
  ],
  "tags": [
    {
      "id": "uuid",
      "name": "Premium"
    }
  ],
  "notes": "Client prefers bob cut with layers",
  "photos": [],
  "totalAmount": 150.0,
  "paymentStatus": "paid",
  "status": "completed",
  "createdAt": "2026-03-05T10:30:00Z"
}
```

---

#### 19. GET `/api/visits`

**Authorization**: Required
**Query Parameters**:

- `page` (Integer, Default: 1)
- `limit` (Integer, Default: 20)
- `customerId` (UUID, Optional)
- `startDate` (Date, Optional)
- `endDate` (Date, Optional)
- `status` (Enum: 'completed' | 'pending' | 'cancelled', Optional)
- `sortBy` (String, Default: 'visitDate')
- `sort` (Enum: 'asc' | 'desc', Default: 'desc')

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "customerName": "Ahmad Ali",
      "customerId": "customer_uuid",
      "visitDate": "2026-02-20",
      "visitTime": "10:30 AM",
      "services": ["Haircut", "Shaving"],
      "tags": ["Regular"],
      "notes": "Prefer shorter sides, sharp fade.",
      "photoCount": 3,
      "totalAmount": 75.0,
      "paymentStatus": "paid",
      "status": "completed",
      "createdAt": "2026-02-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### 20. GET `/api/visits/:visitId`

**Authorization**: Required
**Response** (200): Single visit object with all details including services, tags, and photos

---

#### 21. PUT `/api/visits/:visitId`

**Authorization**: Required
**Request**: Same as POST `/api/visits`
**Response** (200): Updated visit object

---

#### 22. DELETE `/api/visits/:visitId`

**Authorization**: Required
**Response** (200):

```json
{
  "message": "Visit deleted successfully",
  "id": "uuid"
}
```

---

#### 23. GET `/api/visits/customer/:customerId`

**Authorization**: Required
**Query Parameters** (Same as GET `/api/visits`)
**Response** (200): List of visits for specific customer with pagination

---

#### 24. GET `/api/visits/timeline`

**Authorization**: Required
**Query Parameters**:

- `year` (Integer, Optional)
- `month` (Integer, 1-12, Optional)
- `groupBy` (Enum: 'day' | 'week' | 'month', Default: 'month')

**Response** (200):

```json
{
  "timeline": [
    {
      "date": "2026-03-05",
      "visitCount": 5,
      "visits": [
        /* visit objects */
      ]
    }
  ]
}
```

---

### Service Endpoints

#### 25. POST `/api/services`

**Authorization**: Required
**Request**:

```json
{
  "name": "Haircut",
  "description": "Professional haircut service",
  "price": 50.0,
  "duration": 30
}
```

**Response** (201): Created service object

---

#### 26. GET `/api/services`

**Authorization**: Required
**Query Parameters**:

- `isActive` (Boolean, Optional)
- `sortBy` (String, Default: 'name')

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Haircut",
      "description": "Professional haircut",
      "price": 50.0,
      "duration": 30,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 27. GET `/api/services/:serviceId`

**Authorization**: Required
**Response** (200): Single service object

---

#### 28. PUT `/api/services/:serviceId`

**Authorization**: Required
**Request**: Same as POST `/api/services`
**Response** (200): Updated service object

---

#### 29. DELETE `/api/services/:serviceId`

**Authorization**: Required
**Response** (200):

```json
{
  "message": "Service deleted successfully",
  "id": "uuid"
}
```

---

#### 30. GET `/api/services/popular`

**Authorization**: Required
**Query Parameters**:

- `limit` (Integer, Default: 10)

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Haircut",
      "usageCount": 45
    }
  ]
}
```

---

### Tag Endpoints

#### 31. POST `/api/tags`

**Authorization**: Required
**Request**:

```json
{
  "name": "Premium",
  "color": "#FF5733",
  "description": "Premium service clients"
}
```

**Response** (201): Created tag object

---

#### 32. GET `/api/tags`

**Authorization**: Required
**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium",
      "color": "#FF5733",
      "description": "Premium service clients",
      "usageCount": 25,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 33. GET `/api/tags/:tagId`

**Authorization**: Required
**Response** (200): Single tag object

---

#### 34. PUT `/api/tags/:tagId`

**Authorization**: Required
**Request**: Same as POST `/api/tags`
**Response** (200): Updated tag object

---

#### 35. DELETE `/api/tags/:tagId`

**Authorization**: Required
**Response** (200):

```json
{
  "message": "Tag deleted successfully",
  "id": "uuid"
}
```

---

### Photo/File Upload Endpoints

#### 36. POST `/api/visits/:visitId/photos`

**Authorization**: Required
**Request**: Multipart form-data with image file(s)
**Query Parameters**:

- `caption` (String, Optional)

**Response** (201):

```json
{
  "photos": [
    {
      "id": "uuid",
      "photoUrl": "https://cdn.example.com/photo.jpg",
      "thumbnailUrl": "https://cdn.example.com/photo-thumb.jpg",
      "caption": "Before treatment",
      "uploadedAt": "2026-03-05T10:30:00Z"
    }
  ],
  "message": "Photos uploaded successfully"
}
```

---

#### 37. DELETE `/api/visits/:visitId/photos/:photoId`

**Authorization**: Required
**Response** (200):

```json
{
  "message": "Photo deleted successfully",
  "id": "uuid"
}
```

---

#### 38. GET `/api/visits/:visitId/photos`

**Authorization**: Required
**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "photoUrl": "https://cdn.example.com/photo.jpg",
      "thumbnailUrl": "https://cdn.example.com/photo-thumb.jpg",
      "caption": "Before treatment",
      "uploadedAt": "2026-03-05T10:30:00Z"
    }
  ]
}
```

---

### Team Member Endpoints

#### 39. POST `/api/team-members`

**Authorization**: Required (Owner/Admin)
**Request**:

```json
{
  "email": "team@example.com",
  "name": "Sara Khan",
  "role": "team_member",
  "description": "Senior Stylist",
  "phone": "0312-7654321"
}
```

**Response** (201):

```json
{
  "id": "uuid",
  "email": "team@example.com",
  "name": "Sara Khan",
  "role": "team_member",
  "description": "Senior Stylist",
  "phone": "0312-7654321",
  "profileImage": null,
  "isActive": true,
  "joinDate": "2026-03-05T10:30:00Z",
  "invitationLink": "https://example.com/invite/invitation_token"
}
```

**Note**: System should send invitation email to team member

---

#### 40. GET `/api/team-members`

**Authorization**: Required (Owner/Admin)
**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "team@example.com",
      "name": "Sara Khan",
      "role": "team_member",
      "description": "Senior Stylist",
      "profileImage": "https://cdn.example.com/profile.jpg",
      "isActive": true,
      "joinDate": "2026-03-05T10:30:00Z"
    }
  ]
}
```

---

#### 41. GET `/api/team-members/:memberId`

**Authorization**: Required
**Response** (200): Single team member object

---

#### 42. PUT `/api/team-members/:memberId`

**Authorization**: Required (Owner or self)
**Request**:

```json
{
  "name": "Sara Khan",
  "phone": "0312-7654321",
  "description": "Senior Stylist - Active",
  "role": "team_member"
}
```

**Response** (200): Updated team member object

---

#### 43. DELETE `/api/team-members/:memberId`

**Authorization**: Required (Owner/Admin)
**Response** (200):

```json
{
  "message": "Team member removed successfully",
  "id": "uuid"
}
```

---

#### 44. PUT `/api/team-members/:memberId/activate`

**Authorization**: Required (Owner)
**Response** (200):

```json
{
  "message": "Team member activated",
  "isActive": true
}
```

---

#### 45. PUT `/api/team-members/:memberId/deactivate`

**Authorization**: Required (Owner)
**Response** (200):

```json
{
  "message": "Team member deactivated",
  "isActive": false
}
```

---

### Dashboard/Statistics Endpoints

#### 46. GET `/api/dashboard/overview`

**Authorization**: Required
**Response** (200):

```json
{
  "totalCustomers": 45,
  "totalVisits": 150,
  "totalRevenue": 7500.0,
  "thisMonthVisits": 32,
  "thisMonthRevenue": 1600.0,
  "todaysVisits": 5,
  "activeTeamMembers": 3,
  "newCustomersThisMonth": 8
}
```

---

#### 47. GET `/api/dashboard/recent-visits`

**Authorization**: Required
**Query Parameters**:

- `limit` (Integer, Default: 10)

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "customerName": "Ahmad Ali",
      "visitDate": "2026-03-05",
      "visitTime": "10:30 AM",
      "services": ["Haircut"],
      "totalAmount": 50.0
    }
  ]
}
```

---

#### 48. GET `/api/dashboard/top-customers`

**Authorization**: Required
**Query Parameters**:

- `limit` (Integer, Default: 10)

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ahmad Ali",
      "visitCount": 25,
      "totalSpent": 1250.0,
      "lastVisitDate": "2026-03-05"
    }
  ]
}
```

---

#### 49. GET `/api/dashboard/revenue-summary`

**Authorization**: Required
**Query Parameters**:

- `period` (Enum: 'daily' | 'weekly' | 'monthly' | 'yearly', Default: 'monthly')
- `months` (Integer, Default: 6) - Number of periods to return

**Response** (200):

```json
{
  "data": [
    {
      "period": "2026-02",
      "revenue": 2500.0,
      "visitCount": 50
    },
    {
      "period": "2026-03",
      "revenue": 1600.0,
      "visitCount": 32
    }
  ]
}
```

---

### Search & Filter Endpoints

#### 50. GET `/api/search/global`

**Authorization**: Required
**Query Parameters**:

- `q` (String, Required) - Search query
- `type` (Enum: 'customers' | 'visits' | 'services' | 'all', Default: 'all')
- `limit` (Integer, Default: 20)

**Response** (200):

```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Ahmad Ali",
      "phone": "0300-1234567"
    }
  ],
  "visits": [
    {
      "id": "uuid",
      "customerName": "Ahmad Ali",
      "visitDate": "2026-03-05"
    }
  ]
}
```

---

#### 51. GET `/api/filter/visits`

**Authorization**: Required
**Query Parameters**:

- `customerId` (UUID, Optional)
- `serviceId` (UUID, Optional)
- `tagId` (UUID, Optional)
- `status` (Enum: 'completed' | 'pending' | 'cancelled', Optional)
- `paymentStatus` (Enum: 'paid' | 'pending' | 'partial', Optional)
- `startDate` (Date, Optional) - YYYY-MM-DD
- `endDate` (Date, Optional) - YYYY-MM-DD
- `minAmount` (Decimal, Optional)
- `maxAmount` (Decimal, Optional)
- `page` (Integer, Default: 1)
- `limit` (Integer, Default: 20)

**Response** (200): Filtered visits with pagination

---

### Export/Report Endpoints

#### 52. GET `/api/reports/visits-export`

**Authorization**: Required
**Query Parameters**:

- `format` (Enum: 'csv' | 'pdf' | 'xlsx', Default: 'csv')
- `startDate` (Date, Optional)
- `endDate` (Date, Optional)
- `customerId` (UUID, Optional)

**Response** (200): File download

---

#### 53. GET `/api/reports/customer-summary`

**Authorization**: Required
**Query Parameters**:

- `customerId` (UUID, Required)
- `format` (Enum: 'json' | 'pdf', Default: 'json')

**Response** (200):

```json
{
  "customerName": "Ahmad Ali",
  "totalVisits": 25,
  "totalSpent": 1250.0,
  "averageSpent": 50.0,
  "lastVisitDate": "2026-03-05",
  "preferredServices": ["Haircut", "Shaving"],
  "visits": [
    /* visit details */
  ]
}
```

---

## Error Response Format

All APIs should return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Customer not found",
    "details": "Customer with ID 'xyz' does not exist",
    "timestamp": "2026-03-05T10:30:00Z"
  }
}
```

### Common Error Codes:

- `INVALID_REQUEST` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - User lacks permission
- `RESOURCE_NOT_FOUND` (404) - Resource does not exist
- `CONFLICT` (409) - Resource already exists (e.g., duplicate email)
- `VALIDATION_ERROR` (422) - Validation failed
- `INTERNAL_SERVER_ERROR` (500) - Server error

---

## Authentication & Security

### JWT Token Structure

- **Header**: Standard JWT header
- **Payload**:
  - `sub` (user ID)
  - `email` (user email)
  - `iat` (issued at)
  - `exp` (expires at, ~24 hours)
  - `role` (user role)
- **Signature**: HS256 or RS256

### Refresh Token

- Longer expiration (~7 days)
- Stored securely in HTTP-only cookies or secure storage
- Used to obtain new access tokens

### Security Headers

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Authentication endpoints**: 5 requests per minute per IP
- **File upload**: 10 requests per minute per user
- **Search endpoints**: 30 requests per minute per user

---

## Pagination Standards

All list endpoints should support:

- `page` (Default: 1)
- `limit` (Default: 20, Max: 100)

Response format:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Sorting Standards

- `sortBy`: Field to sort by
- `sort`: Order (asc/desc)

Example: `?sortBy=createdAt&sort=desc`

---

## Data Validation Rules

### User/Team Member

- Email: Valid email format, unique
- Password: Min 8 chars, at least 1 uppercase, 1 number
- Phone: Valid phone format (consider international)

### Customer

- Name: Required, 2-100 characters
- Phone: Required, valid format
- Email: Valid email format (optional)

### Visit

- Customer ID: Required, must exist
- Visit Date: Required, cannot be in future (unless scheduling)
- Services: At least 1 required
- Time: Valid time format (HH:MM AM/PM)

### Service

- Name: Required, unique per user, 2-100 characters
- Price: Positive decimal or null
- Duration: Positive integer (in minutes)

### Tag

- Name: Required, unique per user, 2-50 characters
- Color: Valid hex color code (optional)

---

## File Upload Specifications

### Image Upload

- **Allowed formats**: JPEG, PNG, WebP
- **Max file size**: 5MB
- **Profile images**: Recommended 400x400px minimum
- **Visit photos**: Recommended 1200px width minimum
- **Storage**: Cloud storage (AWS S3, Cloudinary, etc.)
- **CDN**: Optional for image optimization

### Document Export

- **CSV**: Standard comma-separated format
- **PDF**: Professional report format with header/footer
- **XLSX**: Excel spreadsheet format with styling

---

## Caching Strategy

- **User profile**: Cache for 1 hour
- **Services/Tags**: Cache for 4 hours
- **Customers list**: Cache for 30 minutes
- **Visits timeline**: Cache for 1 hour
- **Dashboard overview**: Cache for 15 minutes
- **Authentication cache**: No caching for security

---

## Data Retention & Soft Delete

- **Soft deletes**: All deletions are soft (marked as deleted, not removed)
- **Permanent deletion**: Optional admin-only action after 30-90 days
- **Data backup**: Automatic daily backups recommended
- **GDPR compliance**: Implement data export and deletion endpoints

---

## Webhook Events (Optional)

Consider implementing webhooks for:

- `visit.created`
- `visit.updated`
- `visit.completed`
- `customer.created`
- `customer.updated`
- `payment.received`
- `team_member.invited`
- `team_member.joined`

---

## Database Considerations

### Indexing Strategy

```sql
-- User
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_created_at ON users(createdAt);

-- Customer
CREATE INDEX idx_customer_user_id ON customers(userId);
CREATE INDEX idx_customer_phone ON customers(userId, phone);
CREATE INDEX idx_customer_name ON customers(userId, name);

-- Visit
CREATE INDEX idx_visit_user_customer ON visits(userId, customerId);
CREATE INDEX idx_visit_date ON visits(userId, visitDate);
CREATE INDEX idx_visit_status ON visits(userId, status);

-- Service/Tag
CREATE INDEX idx_service_user_id ON services(userId);
CREATE INDEX idx_tag_user_id ON tags(userId);
```

### Connection Pooling

- Connection pool size: 20-50 depending on server load
- Connection timeout: 30 seconds
- Idle timeout: 5 minutes

---

## Deployment Checklist

- [ ] Environment variables configured (.env)
- [ ] Database migrations applied
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database backups scheduled
- [ ] Error logging configured
- [ ] API documentation deployed
- [ ] Monitoring/alerting setup

---

## Testing Requirements

### Unit Tests

- All service/business logic functions
- Validation functions
- Utility functions

### Integration Tests

- All API endpoints
- Database operations
- Authentication flow
- Authorization checks

### Performance Tests

- Bulk uploads (100+ files)
- Large result sets (1000+ records)
- Concurrent user scenarios
- Database query optimization

---

## API Documentation

Use OpenAPI/Swagger for interactive documentation:

- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Error scenarios
- Rate limits
- Deprecation notices

---

## Future Enhancements

1. **Scheduling/Appointments**: Calendar integration and automated reminders
2. **Invoicing**: Generate and send invoices
3. **SMS/Email Notifications**: Appointment reminders and updates
4. **Analytics**: Advanced reporting and insights
5. **Multi-location**: Support for multiple salons/locations
6. **Staff scheduling**: Time slot management
7. **Customer feedback**: Rating and review system
8. **Inventory management**: Product/supply tracking
9. **Package/membership**: Subscription-based services
10. **Mobile payment integration**: In-app payment processing

---

## Notes for Backend Developer

1. **Always validate and sanitize** user inputs
2. **Use parameterized queries** to prevent SQL injection
3. **Hash passwords** with bcrypt or similar (not plaintext)
4. **Log all actions** for audit trail
5. **Implement proper error handling** with meaningful messages
6. **Use transactions** for multi-step operations
7. **Optimize database queries** with proper indexing
8. **Implement soft deletes** for data safety
9. **Version your API** (e.g., /api/v1/...)
10. **Document every endpoint** with examples
11. **Test all edge cases** (empty data, large uploads, concurrent requests)
12. **Monitor performance** and set up alerts

---

**Document Version**: 1.0  
**Last Updated**: March 5, 2026  
**Status**: Ready for Development
