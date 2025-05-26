const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');

const app = express();

app.use(cors());
app.use(express.json());

// Email routes
app.use('/api', emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 