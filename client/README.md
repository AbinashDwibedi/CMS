# Campus Management System - Client (Frontend)

This is the frontend client for the **Campus Management System**, a web application designed to manage university life, focusing on students, clubs, events, and administrative functionalities.

This project is bootstrapped with [React](https://react.dev/) and [Vite](https://vitejs.dev/), providing a fast and modern development experience.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router (`react-router-dom`)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API (`AuthContext`)
- **API Communication**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Data Visualization**: Plotly (`react-plotly.js`)
- **Data Export**: ExcelJS

## Project Structure

The source code is located in the `src` directory with the following structure:

- `api/` - Axios interceptors and API configuration for communicating with the backend.
- `assets/` - Static assets like images and global styles (`index.css`).
- `components/` - Reusable UI components (e.g., `Navbar`, `EventModal`, `CreateEventModal`, `ProtectedRoute`).
- `context/` - Application-wide state contexts, specifically handling authentication (`AuthContext`).
- `pages/` - React components representing individual routes/views:
  - **Authentication & Setup**: `LoginPage`, `RegisterPage`, `SelectRolePage`, `CreateStudentProfilePage`
  - **Student Views**: `HomePage`, `ProfilePage`, `ClubsPage`, `ClubDetailPage`
  - **Admin Views**: `AdminHomePage`, `AdminClubsPage`, `AdminClubDetailPage`, `AdminEventsPage`, `AdminStudentsPage`

## Available Scripts

In the project directory, you can run the following commands:

### `npm run dev`
Starts the development server using Vite with Hot Module Replacement (HMR).

### `npm run build`
Builds the application for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`
Bootstraps a local static web server that serves the files from `dist`, allowing you to preview the production build locally before deploying.

### `npm run lint`
Runs ESLint to check the codebase for errors, warnings, and best practices.

## Environment Setup

1. **Install dependencies**: Make sure you have Node.js installed, then run `npm install`.
2. **Start the backend server**: Ensure the Spring Boot backend server is running (typically on port 8080 or 8081).
3. **Run the app**: Execute `npm run dev` to start the frontend application. It will typically be available at `http://localhost:5173`.

## Features Overview

- **Secure Authentication**: JWT-based authentication combined with protected routing ensures secure access based on user roles (Student vs. Admin).
- **Interactive UI**: Utilizing Tailwind CSS for responsive and modern aesthetics.
- **Club Management**: Discover clubs, view details, manage memberships, and participate.
- **Event Tracking**: View and manage upcoming campus events.
- **Admin Dashboard**: Specialized views for administrators to oversee students, clubs, and events, including data visualizations (Plotly) and reporting (Excel export).
- **Real-time Feedback**: Toast notifications to keep the user informed of actions and potential errors.
