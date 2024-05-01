// index.js
const express = require('express');
const path = require('path');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
// Dynamic CORS setup allowing specific origins
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:8080',
        'http://localhost:8080',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

const users = []; // Store users in memory for this example

const ACCESS_TOKEN_SECRET = 'yourAccessTokenSecret';
const REFRESH_TOKEN_SECRET = 'yourAccessTokenSecret';
let refreshTokens = []; // Store refresh tokens in memory

// Serve index.html at http://localhost:3000/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = { username, password: hashedPassword };
  users.push(user);

  res.status(201).send('User registered successfully');
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).send('User not found');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).send('Incorrect password');

  const accessToken = jwt.sign(
    { username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '5s' }
  );
  const refreshToken = jwt.sign(
    { username: user.username },
    REFRESH_TOKEN_SECRET
  );

  refreshTokens.push(refreshToken); // Store the refresh token

  // JWT Token
  // res.json({ accessToken, refreshToken });

  console.log(`Setting cookies for user ${user.username}`);

  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

  res.send('Logged in successfully');
});

// Refresh token endpoint
app.post('/token', (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.status(401).send('Refresh token is required');
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).send('Token is invalid');

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Token verification failed');

    const accessToken = jwt.sign(
      { username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '5s' }
    );

    console.log('token refreshed successfully');

    // JWT Token
    // res.json({ accessToken });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });

    res.send('Access token refreshed successfully');
  });
});

// Middleware to authenticate access tokens
const authenticateToken = (req, res, next) => {
  const { accessToken } = req.cookies;
  console.log('accessToken', accessToken);

  if (!accessToken) return res.status(401).send('Access token is required');

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Token verification failed');

    req.user = user;
    next();
  });
};

// Protected endpoint
app.get('/protected', authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.username} to the protected route.`);
});

// Logout endpoint
app.post('/logout', authenticateToken, (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).send('Token is invalid');
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.send('Logged out successfully');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
