# 🎓 Campus Management System — Backend

A secure, production-ready RESTful API built with **Spring Boot 3** and **Java 21** for managing a campus ecosystem — clubs, events, student registrations, memberships, and administrative dashboards.

---

## 🚀 Tech Stack

| Technology                  | Version | Purpose                        |
| :-------------------------- | :------ | :----------------------------- |
| Java                        | 21      | Core language                  |
| Spring Boot                 | 3.5.14  | Application framework          |
| Spring Security             | 6.x     | Authentication & authorization |
| Spring Data JPA + Hibernate | —       | ORM & DB access                |
| PostgreSQL                  | —       | Relational database            |
| JJWT                        | 0.12.5  | JWT generation & parsing       |
| ModelMapper                 | 3.2.4   | DTO ↔ Entity mapping           |
| Lombok                      | —       | Boilerplate reduction          |
| Maven                       | —       | Build & dependency management  |

---

## 🏗️ Architecture Overview

The server follows a classic **N-Tier Layered Architecture** with a stateless security model.

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (React)                    │
│              sends HTTP requests + cookie           │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              SECURITY FILTER CHAIN                  │
│  [CORS] → [JwtAuthFilter] → [SecurityFilterChain]  │
│  Reads `jwt` cookie → validates → sets Auth context │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            PRESENTATION LAYER (Controllers)         │
│  Receives request, validates DTOs via @Valid,       │
│  delegates to Service layer, returns ResponseEntity │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            BUSINESS LOGIC LAYER (Services)          │
│  Core rules: permission checks, capacity limits,    │
│  entity building, ModelMapper, JPA calls            │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│           DATA ACCESS LAYER (Repositories)          │
│  JpaRepository interfaces, custom JPQL queries,    │
│  Pageable & sorted results from PostgreSQL          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              PostgreSQL Database                    │
│  users / students / clubs / events /                │
│  club_memberships / event_registrations             │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Authentication Flow

The system uses **stateless JWT authentication** with tokens stored in `HttpOnly` cookies to prevent XSS attacks.

### Full Login & Request Flow

```
1. POST /api/auth/login
   ├── Controller receives { name, password }
   ├── AuthenticationManager.authenticate() verifies credentials via DaoAuthenticationProvider
   │       └── BCryptPasswordEncoder compares hashed password
   ├── On success → JwtService.generateToken(username) creates a signed JWT (10-day expiry)
   ├── JWT is set as HttpOnly cookie: Set-Cookie: jwt=<token>; HttpOnly; Path=/
   └── Returns: { name, role, isProfileComplete }

2. Subsequent Requests (GET /api/events, etc.)
   ├── JwtAuthFilter (OncePerRequestFilter) runs on EVERY request
   ├── Reads `jwt` cookie from incoming HttpServletRequest
   ├── JwtService.getUserName(jwt) extracts the username from the token claims
   ├── Loads UserDetails from DB via MyUserDetailsService
   ├── JwtService.isValidToken() checks username match + expiry
   ├── Sets SecurityContextHolder with UsernamePasswordAuthenticationToken
   └── Request proceeds to Controller (Authentication object is now available)

3. Token Expiry / Invalid Token
   ├── JwtAuthFilter catches JwtException or UsernameNotFoundException
   ├── Clears the jwt cookie (MaxAge = 0)
   └── Request continues without authentication (secured endpoints return 401/403)

4. Logout: POST /api/auth/logout
   └── Server overwrites the jwt cookie with MaxAge=0, effectively deleting it from the browser
```

### Security Rules (SecurityConfig.java)

- **CSRF** → Disabled (stateless API, not browser-form-based)
- **Sessions** → `STATELESS` (no server-side sessions)
- **Public routes** → `OPTIONS /**` (preflight) and `/auth/**`
- **All other routes** → require a valid JWT
- **CORS** → Configured to allow: `localhost:5173`, `localhost`, `localhost:80`, `127.0.0.1`
- **Method-level security** → `@EnableMethodSecurity` enabled for `@PreAuthorize` support

---

## 📦 Package Structure

```
src/main/java/com/abinash/campus_management/
│
├── CampusManagementSystem.java       # @SpringBootApplication entry point
│
├── config/
│   └── BasicCofig.java               # @Bean for ModelMapper
│
├── controller/
│   ├── UserAuth.java                 # /auth/** - register, login, logout, delete
│   ├── StudentController.java        # /students/** - profile CRUD
│   ├── ClubController.java           # /clubs/** - club CRUD + members
│   ├── EventController.java          # /events/** - event CRUD + registration
│   ├── MembershipController.java     # /memberships/** - join/leave/promote
│   ├── DashboardController.java      # /dashboard - admin stats
│   └── EventRegistrationsController.java # /event-registrations - view registrations
│
├── dto/                              # Data Transfer Objects (Request & Response POJOs)
│   ├── MyUserDto.java                # Register request (with @Valid constraints)
│   ├── MyUserLoginDto.java           # Login request
│   ├── LoginResponse.java            # Login response (name, role, isProfileComplete)
│   ├── SuccessResponse.java          # Generic success wrapper
│   ├── StudentRegistrationRequest.java
│   ├── StudentUpdateRequest.java
│   ├── StudentProfileResponse.java
│   ├── ClubCreationRequest.java
│   ├── ClubResponse.java
│   ├── ClubMembers.java
│   ├── EventCreateRequest.java
│   ├── EventResponse.java
│   ├── EventStatusRequest.java
│   ├── RegistrationResponse.java
│   ├── MembershipStatusResponse.java
│   └── AdminDashboardResponse.java
│
├── entity/                           # JPA Entities (mapped to DB tables)
│   ├── MyUser.java                   # → `users` table
│   ├── Students.java                 # → `students` table
│   ├── Clubs.java                    # → `clubs` table
│   ├── Events.java                   # → `events` table (indexed)
│   ├── ClubMemberships.java          # → `club_memberships` table (indexed)
│   └── EventRegistrations.java       # → `event_registrations` table
│
├── enums/
│   ├── Authorities.java              # ROLE_STUDENT | ROLE_CLUB_LEADER | ROLE_ADMIN
│   ├── Category.java                 # TECHNICAL | CULTURAL | SPORTS
│   ├── ClubRoles.java                # MEMBER | LEADER
│   └── Status.java                   # UPCOMING | ONGOING | COMPLETED | CANCELLED
│
├── exception/
│   ├── ApiException.java             # Custom RuntimeException with HttpStatus
│   ├── ErrorResponse.java            # Structured error response body
│   └── GlobalExceptionHandler.java   # @ControllerAdvice — catches ApiException & all others
│
├── repository/                       # Spring Data JPA interfaces
│   ├── MyUserRepository.java
│   ├── StudentRepository.java
│   ├── ClubRepository.java
│   ├── EventRepository.java
│   ├── ClubMembershipRepository.java
│   └── EventRegistrationRepository.java
│
├── security/
│   ├── JwtAuthFilter.java            # OncePerRequestFilter — JWT cookie extraction & validation
│   └── SecurityConfig.java           # SecurityFilterChain, CORS, BCrypt, AuthProvider
│
└── services/
    ├── JwtService.java               # generateToken, getUserName, isValidToken
    ├── MyUserDetailsService.java     # UserDetailsService → loads user from DB for Spring Security
    ├── MyUserService.java            # registerUser, deleteUser, findByName, isProfileComplete
    ├── StudentService.java           # createProfile, updateProfile, getAllStudents, etc.
    ├── ClubService.java              # findAllClubs, createClub, updateClub, deleteClub, members
    ├── EventService.java             # getVisibleEvents, createEvent, deleteEvent, changeStatus
    ├── EventRegistrationService.java # register, cancelRegistration, findAllByEventId
    ├── ClubMembershipService.java    # createNewMembership, deleteMembership, toggleLeadership
    └── DashboardService.java         # getAdminDashboardData (counts + registration trends)
```

---

## 🗄️ Database Schema & Relationships

### Entity Relationship Summary

```
MyUser (users)
  │── 1:1 ──▶ Students (students)         [user_id FK, UNIQUE]
  │── 1:N ──▶ ClubMemberships             [user_id FK]
  │
Students
  │── 1:N ──▶ EventRegistrations          [student_id FK]
  │
Clubs (clubs)
  │── 1:N ──▶ Events                      [club_id FK]
  │── 1:N ──▶ ClubMemberships             [club_id FK]
  │
Events (events)
  │── 1:N ──▶ EventRegistrations          [event_id FK]
```

### Table Details

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK, auto-generated |
| name | VARCHAR(30) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | BCrypt hashed |
| authorities | VARCHAR(255) | Enum: ROLE_STUDENT / ROLE_CLUB_LEADER / ROLE_ADMIN |
| profile_completed | BOOLEAN | Set to true when student profile is created |
| created_at | TIMESTAMP | Auto-set on insert |

**`students`**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users, UNIQUE (1:1) |
| roll_number | VARCHAR | UNIQUE, NOT NULL, immutable |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | UNIQUE, NOT NULL |
| department | VARCHAR | NOT NULL |
| joining_year | INTEGER | NOT NULL, immutable |

**`clubs`**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| club_code | VARCHAR(6) | UNIQUE, NOT NULL |
| name | VARCHAR | UNIQUE, NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR | TECHNICAL / CULTURAL / SPORTS |
| contact_email | VARCHAR | UNIQUE, NOT NULL |
| is_active | BOOLEAN | Defaults to true |

**`events`** _(indexed on `club_id`, `status + start_time`)_
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| title | VARCHAR | NOT NULL |
| description | TEXT | NOT NULL |
| start_time | TIMESTAMP | NOT NULL |
| venue | VARCHAR | NOT NULL |
| max_capacity | INTEGER | NOT NULL |
| status | VARCHAR | UPCOMING / ONGOING / COMPLETED / CANCELLED |
| club_id | BIGINT | FK → clubs |

**`club_memberships`** _(UNIQUE on club_id + user_id, indexed on both)_
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| club_id | BIGINT | FK → clubs |
| user_id | BIGINT | FK → users |
| role | VARCHAR | MEMBER / LEADER (default: MEMBER) |
| has_edit_access | BOOLEAN | Defaults to false; true for LEADER |
| joined_at | TIMESTAMP | Auto-set on insert |

**`event_registrations`** _(UNIQUE on event_id + student_id)_
| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| event_id | BIGINT | FK → events |
| student_id | BIGINT | FK → students |
| registered_at | TIMESTAMP | Auto-set on insert |

---

## 🔄 Key Server-Side Flows

### 1. Registration Flow

```
POST /api/auth/register { name, password }
  → @Valid checks: name 3-20 chars, password has upper+lower+digit+special
  → MyUserService.registerUser()
      → ModelMapper maps DTO → MyUser entity
      → BCryptPasswordEncoder hashes password
      → Saves to DB with default role ROLE_STUDENT
      → Returns DTO (password field nulled out)
```

### 2. Student Profile Creation Flow

```
POST /api/students  (authenticated)
  → StudentService.createProfile()
      → Checks if student profile already exists for this user → 409 CONFLICT if yes
      → Builds Students entity linked to the MyUser
      → Saves student → Sets user.profileCompleted = true → Saves user
      → Returns StudentProfileResponse via ModelMapper
```

### 3. Event Registration Flow (with permission checks)

```
POST /api/events/{eventId}/register  (authenticated)
  → EventRegistrationService.register()
      → Finds student by logged-in username
      → Finds event by eventId → throws 404 if not found
      → Checks event.status == UPCOMING || ONGOING → throws 400 if closed
      → Checks if already registered → throws 409 CONFLICT if yes
      → Checks event.registrations.size() >= event.maxCapacity → throws 409 if full
      → Saves EventRegistration entity
      → Returns RegistrationResponse with all details
```

### 4. Event Creation Flow (role-gated)

```
POST /api/events  (authenticated)
  → EventService.createEvent()
      → Finds user + club from request
      → Finds ClubMembership for this user in this club → 403 if not a member
      → Checks membership.hasEditAccess == true AND role == LEADER → 403 if not
      → Builds and saves Events entity with status = UPCOMING
      → Returns EventResponse
```

### 5. Club Leadership Toggle Flow

```
PATCH /api/memberships/{clubId}/{userId}  (Admin only)
  → ClubMembershipService.toggleLeadership()
      → Finds membership by clubId + userId
      → If current role == LEADER → sets to MEMBER, hasEditAccess = false
      → If current role == MEMBER → sets to LEADER, hasEditAccess = true
      → JPA dirty-checking auto-saves (no explicit .save() needed via @Transactional)
```

### 6. Exception Handling Flow

```
Any thrown ApiException (e.g., 404 Not Found, 403 Forbidden, 409 Conflict)
  → GlobalExceptionHandler catches it
  → Returns: { statusCode, message, timestamp } as JSON with the correct HTTP status

Any unhandled Exception
  → Returns 500 Internal Server Error with the exception message
```

---

## 📡 API Reference

All endpoints are under the base path `/api`.

### 🔑 Auth (`/auth`)

| Method   | Endpoint         | Auth     | Description                        |
| -------- | ---------------- | -------- | ---------------------------------- |
| `POST`   | `/auth/register` | Public   | Register a new account             |
| `POST`   | `/auth/login`    | Public   | Login → sets `jwt` HttpOnly cookie |
| `POST`   | `/auth/logout`   | Public   | Clears `jwt` cookie                |
| `DELETE` | `/auth/delete`   | Required | Delete own account                 |
| `GET`    | `/auth/test`     | Required | Verify token is working            |

### 🎓 Students (`/students`)

| Method   | Endpoint             | Auth     | Description                               |
| -------- | -------------------- | -------- | ----------------------------------------- |
| `GET`    | `/students`          | Required | Get all students (paginated, filterable)  |
| `POST`   | `/students`          | Required | Create student profile for logged-in user |
| `GET`    | `/students/me`       | Required | Get own student profile                   |
| `POST`   | `/students/me`       | Required | Update own student profile                |
| `GET`    | `/students/{roll}`   | Required | Find student by roll number               |
| `DELETE` | `/students/{userId}` | Required | Delete a student record                   |

### 🏛️ Clubs (`/clubs`)

| Method   | Endpoint                  | Auth     | Description                            |
| -------- | ------------------------- | -------- | -------------------------------------- |
| `GET`    | `/clubs`                  | Required | List all clubs                         |
| `POST`   | `/clubs`                  | Required | Create a club (Admin)                  |
| `GET`    | `/clubs/{id}`             | Required | Get club details + joined status       |
| `PUT`    | `/clubs/{clubId}`         | Required | Update club info (Admin)               |
| `DELETE` | `/clubs/{clubId}`         | Required | Delete a club (Admin)                  |
| `GET`    | `/clubs/events`           | Required | Get all events for a club (paginated)  |
| `GET`    | `/clubs/{clubId}/members` | Required | Get paginated + searchable member list |

### 📅 Events (`/events`)

| Method   | Endpoint                     | Auth     | Description                                                    |
| -------- | ---------------------------- | -------- | -------------------------------------------------------------- |
| `GET`    | `/events`                    | Required | Get visible events (UPCOMING + ONGOING, paginated, searchable) |
| `POST`   | `/events`                    | Required | Create event (Club Leader only)                                |
| `DELETE` | `/events/{eventId}`          | Required | Delete event (Leader or Admin)                                 |
| `PATCH`  | `/events/{eventId}/status`   | Required | Change event status (Leader or Admin)                          |
| `POST`   | `/events/{eventId}/register` | Required | Register for an event                                          |
| `DELETE` | `/events/{eventId}/register` | Required | Cancel registration (UPCOMING only)                            |

### 🤝 Memberships (`/memberships`)

| Method   | Endpoint                         | Auth     | Description                          |
| -------- | -------------------------------- | -------- | ------------------------------------ |
| `GET`    | `/memberships`                   | Required | Get own membership status for a club |
| `POST`   | `/memberships/{club_id}`         | Required | Join a club                          |
| `DELETE` | `/memberships/{club_id}`         | Required | Leave a club                         |
| `PATCH`  | `/memberships/{clubId}/{userId}` | Required | Toggle member ↔ leader (Admin)       |

### 📊 Dashboard (`/dashboard`)

| Method | Endpoint     | Auth     | Description                                         |
| ------ | ------------ | -------- | --------------------------------------------------- |
| `GET`  | `/dashboard` | Required | Total clubs, events, students + registration trends |

### 📋 Event Registrations (`/event-registrations`)

| Method | Endpoint               | Auth     | Description                        |
| ------ | ---------------------- | -------- | ---------------------------------- |
| `GET`  | `/event-registrations` | Required | Get all registrations for an event |

---

## ⚙️ Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.application.name=campus-management-system

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/test
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# Server context path
server.servlet.context-path=/api

# File upload limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

> ⚠️ **Warning:** `ddl-auto=update` is safe for development. In production use `validate` to avoid accidental schema changes.

---

## 🏃 Running the Application

### Prerequisites

- Java 21+
- PostgreSQL running on port `5432`
- Maven 3.8+ (or use included `mvnw` wrapper)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/AbinashDwibedi/Campus-Event-Management-System.git
cd Campus-Event-Management-System/server

# 2. Create the database
psql -U postgres -c "CREATE DATABASE test;"

# 3. Update credentials in application.properties

# 4. Run
./mvnw spring-boot:run
```

Server starts at: **`http://localhost:8080/api`**

### Docker

A `Dockerfile` is included for containerized deployment:

```bash
./mvnw clean package -DskipTests
docker build -t campus-management-server .
docker run -p 8080:8080 campus-management-server
```

---

## 🔮 Future Enhancements

- [ ] Refresh token support
- [ ] Email notifications on event registration
- [ ] Pagination on more endpoints
- [ ] Swagger / OpenAPI documentation

---

## 👨‍💻 Author

**Abinash Dwibedi**
GitHub: [@AbinashDwibedi](https://github.com/AbinashDwibedi)
