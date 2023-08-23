const express = require('express');
const parseXML = require('./parseXML');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = process.env.PORT || 3000;

async function startApp() {
  try {
    // Parse XML to JSON before starting the app
    //await parseXML();

    // Set up your API routes
    app.use('/api', apiRoutes);

    // Start the app
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

startApp();