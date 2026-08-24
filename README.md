# 🎓 Campus Management System

A full-stack web application for managing a campus ecosystem — clubs, events, student registrations, memberships, and an admin dashboard.

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7 |
| **Backend** | Spring Boot 3.5, Java 21, Spring Security 6, JWT |
| **Database** | PostgreSQL 15 |
| **Container** | Docker & Docker Compose |

---

## 📁 Project Structure

```
Campus management System/
├── client/               # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   ├── Dockerfile        # Multi-stage: Node build → Nginx serve
│   └── package.json
│
├── server/               # Spring Boot backend
│   ├── src/
│   ├── Dockerfile        # Multi-stage: Maven build → JRE run
│   ├── pom.xml
│   └── README.md         # Detailed backend architecture docs
│
└── docker-compose.yaml   # Orchestrates all 3 services together
```

---

## 🐳 Running with Docker Compose (Recommended)

This is the easiest way to run the entire project — no local Java, Node, or PostgreSQL installation needed.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed (included with Docker Desktop)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/AbinashDwibedi/Campus-Event-Management-System.git
cd "Campus management System"

# 2. Start all services (database + backend + frontend)
docker compose up --build
```

Docker Compose will start 3 containers in order:

| Container | Service | Port |
|---|---|---|
| `postgres-db` | PostgreSQL 15 database | `5433` (host) → `5432` (container) |
| `backend` | Spring Boot API | `8080` |
| `frontend` | React app via Nginx | `80` |

Once running, open **`http://localhost`** in your browser.

> The backend API is available at **`http://localhost:8080/api`**

### Stop the application

```bash
# Stop containers (keeps database data)
docker compose down

# Stop AND delete all data (fresh start)
docker compose down -v
```

---

## 💻 Running Locally (Without Docker)

Use this method for development with hot-reload.

### Prerequisites

- **Java 21+**
- **Maven 3.8+** (or use the `./mvnw` wrapper in `/server`)
- **Node.js 20+** and **npm**
- **PostgreSQL** running locally on port `5432`

---

### Step 1 — Set up the Database

```bash
psql -U postgres -c "CREATE DATABASE campus_db;"
```

---

### Step 2 — Run the Backend

```bash
cd server

# Update credentials in src/main/resources/application.properties:
#   spring.datasource.url=jdbc:postgresql://localhost:5432/campus_db
#   spring.datasource.username=postgres
#   spring.datasource.password=your_password

./mvnw spring-boot:run
```

Backend starts at: **`http://localhost:8080/api`**

Hibernate will auto-create all database tables on the first run (`ddl-auto=update`).

---

### Step 3 — Run the Frontend

Open a new terminal:

```bash
cd client

npm install

npm run dev
```

Frontend starts at: **`http://localhost:5173`**

> The Vite dev server proxies API requests to `http://localhost:8080` automatically.

---

## ⚙️ Environment Variables (Docker Compose)

The `docker-compose.yaml` passes these environment variables to the backend container:

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres-db:5432/campus_db` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` |
| `JWT_SECRET_KEY` | Change this in production |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `SERVER_SERVLET_CONTEXT_PATH` | `/api` |

> ⚠️ **For production**, replace the JWT secret key and database password with strong, secure values.

---

## 🔨 How the Docker Build Works

### Backend (`server/Dockerfile`) — Multi-stage build

```
Stage 1 (builder): maven:3.9.6-eclipse-temurin-21
  → Copies pom.xml, downloads dependencies offline
  → Copies src/, runs: mvn clean package -DskipTests
  → Produces: target/app.jar

Stage 2 (runtime): eclipse-temurin:21-jre-alpine
  → Copies only app.jar from Stage 1 (small image)
  → EXPOSE 8080
  → ENTRYPOINT: java -jar app.jar
```

### Frontend (`client/Dockerfile`) — Multi-stage build

```
Stage 1 (builder): node:20-alpine
  → Installs npm dependencies
  → Runs: npm run build
  → Produces: dist/ (static files)

Stage 2 (serve): nginx:alpine
  → Copies dist/ → /usr/share/nginx/html
  → EXPOSE 80
  → Serves via Nginx
```

---

## 👨‍💻 Author

**Abinash Dwibedi**
GitHub: [@AbinashDwibedi](https://github.com/AbinashDwibedi)

---

> For detailed backend architecture, API endpoints, database schema, and server-side flow documentation, see [`server/README.md`](./server/README.md).
