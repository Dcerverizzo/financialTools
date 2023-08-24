const mongoose = require('mongoose');

const MONGO_URI = '';

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
  process.exit(1);
});

exports.connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};

exports.disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('Successfully disconnected from database');
  } catch (error) {
    console.error('Error disconnecting from database');
    console.error(error);
    process.exit(1);
  }
};
