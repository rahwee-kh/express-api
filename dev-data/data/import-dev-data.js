

const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const Tour     = require('../../models/tourModel')

const port = process.env.PORT || 3000;

// Database connection URL with password replacement
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);


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


// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

// IMPORT DATA IN DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data is deleted')
    process.exit();
  } catch (err) {
    console.log('==='+err);
  }
};

if(process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv);

