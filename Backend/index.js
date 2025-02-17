const express = require('express');
const chatRoutes = require('./routes/chat.route.js'); // Import chat routes

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON

app.get('/', (req, res) => {
    res.send('Welcome to Kalp powered by Helmer!');
});

app.use('/chat', chatRoutes); // Use chat routes

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});