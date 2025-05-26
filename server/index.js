const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
const stripeRoutes = require('./routes/stripe');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 