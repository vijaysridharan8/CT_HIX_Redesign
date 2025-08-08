# Health Care Portal

A modern web application for managing health documents and patient information. This application provides a user-friendly interface for uploading health documents, managing personal information, and interacting with document content through a chatbot interface.

## Technology Stack

### Frontend
- **React**: Core frontend library
- **Vite**: Build tool and development server
- **React Bootstrap**: UI component library for responsive design
- **React Router DOM**: For handling navigation
- **TypeScript**: For type safety (configured but optional)

### Backend
- **Java 17**
- **Spring Boot 3.5.4**: Backend framework
- **Apache Tika**: For document parsing
- **JSON Library**: For JSON processing
- **JUnit**: For testing

## Features

1. **Document Upload**
   - Support for multiple file formats (.pdf, .doc, .docx, .jpg, .png)
   - Real-time upload status
   - Document processing feedback

2. **Information Management**
   - Personal Information
   - Spouse Information
   - Dependents Management
   - Address Information
   - Income & Deductions

3. **Interactive Chatbot**
   - Document-based Q&A
   - Session management
   - Real-time chat interface

## Project Structure

```
health-app/
├── src/                      # Frontend source files
│   ├── components/          # React components
│   ├── assets/             # Static assets
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
│
├── backend/                 # Backend source files
│   ├── src/main/java/
│   │   └── com/healthapp/backend/
│   │       ├── BackendApplication.java    # Main Spring Boot application
│   │       ├── DocumentController.java    # REST controller
│   │       └── WebConfig.java            # CORS configuration
│   │
│   └── src/test/           # Backend tests
│
├── public/                 # Public assets
└── package.json           # Frontend dependencies and scripts
```

## Prerequisites

- Node.js (v16 or higher)
- Java Development Kit (JDK) 17
- Gradle
- Git

## Setup Instructions

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd health-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```powershell
   gradlew.bat build
   ```

3. Run the application:
   ```powershell
   gradlew.bat bootRun
   ```
   The backend API will be available at `http://localhost:8080`

## Development

### Frontend Development
- The frontend uses Vite for fast development and hot module replacement
- React Bootstrap components are used for UI elements
- State management is handled through React hooks
- Form handling and validation is built into components

### Backend Development
- RESTful API endpoints in `DocumentController.java`
- CORS configuration in `WebConfig.java`
- Document processing using Apache Tika
- Unit tests using JUnit

## Available Scripts

Frontend:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

Backend:
- `gradlew.bat build`: Build the project
- `gradlew.bat test`: Run tests
- `gradlew.bat bootRun`: Run the application

## API Endpoints

- `POST /api/upload`: Upload and process documents
- `POST /api/chat`: Interact with the document chatbot

## Configuration

### Frontend
- Environment variables can be set in `.env` files
- Vite configuration in `vite.config.ts`

### Backend
- Application properties in `src/main/resources/application.properties`
- CORS configuration in `WebConfig.java`

## Testing

### Frontend
- Component testing setup available
- Run tests with `npm test`

### Backend
- JUnit tests in `src/test/`
- Run tests with `./gradlew test`

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Build the backend:
   ```powershell
   gradlew.bat build
   ```

3. Deploy the generated artifacts to your hosting environment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
