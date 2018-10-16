const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');
const posts = require('./routes/api/posts');
const passport = require('passport');
const server = require('http').createServer(app);
//body parse middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//db config
const db = require('./config/keys').mongoURI;

//connect to db
mongoose
  .connect(db)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.log(err);
  });

//Passport middleware
app.use(passport.initialize());
//Passport config
require('./config/passport')(passport);

//Use Routes
app.use('/api/users', users);
app.use('/api/profile', profiles);
app.use('/api/posts', posts);

//port and server listen
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
