const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3500
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '12mb' }));
app.use(bodyParser.urlencoded({ limit: '12mb', extended: true }));
app.use(express.json());


//Routes
app.use(require('./routes/certificados'));
// Route
app.get('/', (req, res) => {
  res.send('POS API!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));