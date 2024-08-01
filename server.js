
const app      = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 3000;


// Database connection URL with password replacement
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


// Handle unhandleRecjection
process.on('uncaughtException', err => {
  console.log(err.name, err.message)
  console.log('UNCAUGHT EXCEPTION! Shutting down');
    process.exit(1);
})


// connect ot mongoose db
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con => {
  // console.log(con.connections)
  console.log('DB connection successfully')
});

console.log(process.argv)

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});


// Handle unhanleRecjection
process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('UNHANDLE REJECTION! Shutting down');
  server.close(() => {
    process.exit(1);
  })
})


