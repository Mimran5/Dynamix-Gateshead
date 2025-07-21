const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
const stripeRoutes = require('./routes/stripe');
const hallHireRoutes = require('./routes/hallHire');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/hall-hire', hallHireRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 