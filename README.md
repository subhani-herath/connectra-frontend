# Connectra - Virtual Classroom Platform

A modern virtual classroom application built for Uva Wellassa University, enabling lecturers and students to conduct and attend online meetings with real-time video conferencing, quizzes, and attendance tracking.

![Uva Wellassa University](/connectra-frontend/public/hero-bg.png)

## Features

### For Lecturers
- 📅 **Meeting Management** - Create, schedule, and manage virtual classroom sessions
- 🎥 **Video Conferencing** - Real-time video/audio with Agora SDK
- 📺 **Screen Sharing** - Share your screen during lectures
- 📝 **Live Quizzes** - Create and launch quizzes during meetings
- 📊 **Attendance Reports** - Automatic attendance tracking and reporting
- 🎯 **Target Audience** - Schedule meetings for specific degree programs and batches

### For Students
- 📺 **Join Meetings** - Join scheduled lectures with one click
- 🎥 **Video/Audio Controls** - Toggle camera and microphone
- 📝 **Answer Quizzes** - Participate in live quizzes
- 📊 **View Attendance** - Check personal attendance history

### For Administrators
- 👥 **Lecturer Management** - Add, edit, and manage lecturer accounts
- 📈 **System Overview** - Dashboard with platform statistics

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop App**: Electron
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Video SDK**: Agora RTC SDK
- **HTTP Client**: Axios
- **Forms**: React Hook Form

### Backend
- **Framework**: Spring Boot 3.5
- **Language**: Java 24
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **API Docs**: Swagger/OpenAPI
- **Video Tokens**: Agora Token Builder


## Getting Started

### Prerequisites
- Node.js 18+
- Java 24+
- PostgreSQL 15+
- Agora Account (for video SDK)

### Environment Variables

#### Backend (`connectra-backend/src/main/resources/application-dev.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/connectra
    username: your_db_user
    password: your_db_password

agora:
  app-id: your_agora_app_id
  app-certificate: your_agora_app_certificate

jwt:
  secret: your_jwt_secret_key
```

#### Frontend (`connectra-frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Installation

#### Backend
```bash
cd connectra-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend
```bash
cd connectra-frontend
npm install
npm run dev
```

The Electron app will launch automatically. For browser testing, open `http://localhost:5173`.




When the backend is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## User Roles

| Role | Email Format | Example |
|------|--------------|---------|
| Admin | admin@uwu.ac.lk | admin@uwu.ac.lk |
| Lecturer | name@uwu.ac.lk | john@uwu.ac.lk |
| Student | degreeXXXXX@std.uwu.ac.lk | ict22099@std.uwu.ac.lk |



- Faculty of Science & Technology
- Department of Computing and Information Systems
