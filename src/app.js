const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routers = require('./routes/index.routes.js');
const db = require('./models/index.js');
require('dotenv').config();

const { sequelize } = db;
const app = express();

/* Cors middleware */
app.use(cors());

/* Morgan logger middleware */
app.use(morgan('dev'));

/* Express middleware for body requests */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set API routes
app.use('/api', routers);

// For undefined routes
app.get('/*', (req, res) => {
  res.status(404).send("Endpoint not found");
});

/* Error handler */
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send({
    status: "error",
    message: "Server error",
    error: err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database Connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});