# JWT Authentication With Refresh Token as HTTP-only Cookie using NodeJS

A simple Node.js app that implements JWT-based authentication, including handling both access and refresh tokens via HttpOnly cookies. The project serves a static HTML file and manages secure backend routes.

## Usage
Download repo, install dependency `npm i` and run `node app.js`

## Access the App
Open a browser and navigate to `http://localhost:3000`

## Project Structure
```
│
├── app.js # Node.js server file
├── index.html # HTML file for frontend operations
```

## Functionality:

### Backend:
- Static File Serving: Serves static files (HTML, JS, CSS) from the public directory.
- API Routes:
  - Register: Allows users to register with a username and password.
  - Login: Validates credentials and issues access and refresh tokens, stored as HttpOnly cookies.
  - Token Refresh: Generates a new access token if the current one expires, using the refresh token.
  - Logout: Clears tokens and removes them from in-memory storage.
- Middleware:
  - Token Verification: Checks for a valid access token, and attempts to renew it using the refresh token if it fails.

### Frontend:
- HTML Interface: Provides forms for registration, login, accessing protected routes, and logging out.
- JavaScript Logic: Handles communication with the backend via fetch requests, including:
  - Handling Credentials: Uses credentials: 'include' to include cookies in requests.
  - Error Handling: Alerts users for unsuccessful actions and renews tokens if needed.

