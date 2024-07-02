const app = require('./app');
require('dotenv').config();
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

// Database connection URL with password replacement
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// connect ot mongoose db
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con => {
  // console.log(con.connections)
  console.log('DB connection successfully')
});




app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
