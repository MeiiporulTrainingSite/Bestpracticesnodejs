const express = require('express');
const app = express();
const { connectToDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const bedRoutes = require('./bed/bedRoutes');
const admitRoutes = require('./admit/admitRoutes');
const transferRoutes=require('./transfer/transferRoutes');
const dischargeRoutes=require('./discharge/dischargeRoutes');
const waitingRoutes=require('./waiting/waitingRoutes')
const dashRoutes=require('./dashboard/dashroutes')
const loginRoutes = require('./login/loginRoutes')
const signupRoutes=require('./signup/signupRoutes')

// Swagger documentation setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('./swagger/swaggerOptions');
require('dotenv').config(); // Load environment variables

// Connect to the database
connectToDatabase();

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies

const cors = require('cors');
// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

// Routes
app.use('/', bedRoutes); // Bed routes
app.use('/', admitRoutes); // Admit routes
app.use('/tp', transferRoutes); //  routes
app.use('/',dischargeRoutes);
app.use('/',waitingRoutes);
app.use('/',dashRoutes);
app.use('/',loginRoutes)

app.use('/',signupRoutes)



// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);
// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
