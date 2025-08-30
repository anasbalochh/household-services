const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config(); // Load .env file

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const seedData = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = new User({ email: 'admin@example.com', password: hashedPassword, role: 'admin' });
  await user.save();
  console.log('User seeded');
  mongoose.connection.close();
};

seedData().catch(console.error);