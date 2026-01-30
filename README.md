# Fullstack Developer Assessment - Product Catalog

A full-stack web application demonstrating proficiency in **Java 17 (Spring Boot)** backend development and **React (TypeScript)** frontend development.

## Assessment Requirements

### I. Backend - Java 17 ✅

| Requirement | Implementation |
|-------------|----------------|
| RESTful API with CRUD | Spring Boot REST controllers with GET, POST, PUT, DELETE endpoints |
| Data Validation | Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@DecimalMin`) |
| Error Handling | Global exception handler with custom exceptions |
| Basic Authentication | Spring Security with HTTP Basic Auth |

### II. Frontend - React ✅

| Requirement | Implementation |
|-------------|----------------|
| Single-Page Application | React 19 with Vite, React Router for client-side routing |
| User Authentication | Login form with Basic Auth, protected routes, Auth Context |
| Data Fetching | Axios with request interceptors for automatic auth |
| Dynamic Rendering | Conditional rendering, list mapping, loading states, pagination |

---

## Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2**
- **Spring Data JPA** with H2 in-memory database
- **Spring Security** for Basic Authentication
- **Spring Validation** for input validation
- **SpringDoc OpenAPI** for API documentation
- **JUnit 5 & Mockito** for testing

### Frontend
- **React 19** with **TypeScript**
- **Vite** for build tooling
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **TailwindCSS** for styling

---

## Project Structure

```
├── backend/
│   └── src/main/java/com/example/demo/
│       ├── controller/ProductController.java    # REST endpoints
│       ├── service/ProductService.java          # Business logic
│       ├── repository/ProductRepository.java   # Data access
│       ├── model/Product.java                   # Entity with validation
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java     # Centralized error handling
│       │   └── ProductNotFoundException.java   # Custom exception
│       └── config/SecurityConfig.java          # Auth configuration
│
└── frontend/src/
    ├── components/
    │   ├── Login.tsx              # Authentication form
    │   ├── ProductList.tsx        # Product table with CRUD
    │   ├── ProductModal.tsx       # Create/Edit form
    │   └── ProtectedRoute.tsx     # Route guard
    ├── context/AuthContext.tsx    # Global auth state
    ├── services/api.ts            # Axios configuration
    └── types/index.ts             # TypeScript interfaces
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (paginated) | Yes |
| GET | `/api/products/{id}` | Get product by ID | Yes |
| POST | `/api/products` | Create new product | Yes |
| PUT | `/api/products/{id}` | Update product | Yes |
| DELETE | `/api/products/{id}` | Delete product | Yes |

**API Documentation**: http://localhost:8080/swagger-ui.html

---

## Getting Started

### Prerequisites
- Java 17+
- Maven
- Node.js 18+ & npm

### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Default Credentials
- **Username**: `admin`
- **Password**: `password`

---

## Running Tests

### Backend Tests
```bash
cd backend
mvn test
```

---

## Key Features Demonstrated

### Backend

1. **RESTful API Design**
   - Proper HTTP methods and status codes (201 Created, 204 No Content, 404 Not Found)
   - Location header on resource creation
   - Paginated responses for list endpoints

2. **Data Validation**
   ```java
   @NotBlank(message = "Name is required")
   private String name;

   @NotNull(message = "Price is required")
   @DecimalMin(value = "0.01", message = "Price must be greater than 0")
   private BigDecimal price;
   ```

3. **Error Handling**
   - Global exception handler with `@ControllerAdvice`
   - Custom `ProductNotFoundException` for 404 responses
   - Validation errors return field-level messages

4. **Security**
   - HTTP Basic Authentication
   - BCrypt password encoding
   - CORS configuration for frontend integration

### Frontend

1. **Authentication**
   - Login form with credential validation
   - Auth state persisted in localStorage
   - Protected routes redirect to login

2. **State Management**
   - React Context API for global auth state
   - Custom `useAuth()` hook for easy access
   - Local state for component-specific data

3. **User Experience**
   - Loading states on all async operations
   - Error messages displayed to users
   - Form validation with inline errors
   - Confirmation dialogs for destructive actions

4. **Type Safety**
   - Full TypeScript implementation
   - Interfaces for API responses
   - Type-safe component props

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| H2 Database | Simple setup for demonstration; easily swappable for production DB |
| Basic Auth | Meets assessment requirements; production would use JWT/OAuth2 |
| React Context | Sufficient for auth state; Redux unnecessary for this scope |
| Vite | Fast development builds, native TypeScript support |
| TailwindCSS | Rapid UI development without custom CSS |

---

## Future Improvements

- [ ] JWT authentication for stateless sessions
- [ ] Product categories and filtering
- [ ] Image upload for products
- [ ] User registration
- [ ] Role-based access control
- [ ] E2E tests with Cypress/Playwright
