const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs'); 
const mysql = require('mysql');
const session = require('express-session');
const path = require('path'); // Import the 'path' module


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');

/////////////////////////////// mysql connection  ////////////////////////////////////
// Create a MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1', // MySQL host
  user: 'root', // MySQL username
  password: '', // MySQL password
  database: 'root' // MySQL database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
//////////////////////////////////////////////////////////////////////////////////////

// Set up session middleware
app.use(
  session({
    secret: 'aastmt',
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (req, res) => {
  // Use the 'path' module to construct the correct file path
  const filePath = path.join(__dirname,'views' ,'home.html');
  res.sendFile(filePath);
});



// Render the login form
app.get('/login', (req, res) => {
    res.render('login'); // Assuming 'login.ejs' is your login form
  });
  
  // Handle login form submission
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM reserver where username = ? AND password = ? ", [username, password], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/user'); 
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
      
    });
});
app.get('/user', (req, res) => {

    if (!req.session.loggedin) {
      res.redirect('/');
      return;
    }
  
    connection.query('SELECT * FROM reservation', (err, results) => {
        if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Error fetching users' });
          return;
        }
        res.status(200).render('user', { users: results, username: req.session.username });
      });
    
    });
  // Server-side handling
app.post('/api/addReservation', (req, res) => {
    const { username, CourtNumber, StartTime, EndTime } = req.body;
  
    // Process the reservation data (e.g., insert into database)
    // Your code here to handle reservation addition
    connection.query("INSERT INTO reservation (username, courtNumber, startTime, endTime) VALUES (?, ?, ?, ?)", [username, CourtNumber, StartTime, EndTime], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
    });
  
    // For demonstration purposes, log the received data

    console.log('Received reservation data:');
    console.log('Username:', username);
    console.log('Court Number:', CourtNumber);
    console.log('Start Time:', StartTime);
    console.log('End Time:', EndTime);
  
    // Send a success response
    res.status(200).send('Reservation added successfully!');
  });
// Render the signup form
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle signup form submission
app.post('/api/signup', (req, res) => {
    const { username, password, email } = req.body;

    // Process the signup data (e.g., insert into database)
    // Your code here to handle user signup
    connection.query("INSERT INTO reserver (username, password) VALUES (?, ?)", [username, password], (err, results) => {
        if (err) {
            console.error('Error adding user:', err);
            res.status(500).json({ success: false, message: 'Error adding user' });
            return;
        }
        res.redirect('/user');
        //res.status(200).send('User added successfully!');
    });

    // For demonstration purposes, log the received data
    console.log('Received signup data:');
    console.log('Username:', username);
    console.log('Password:', password);
});

// get data from table reservation to add it to .courts

app.post('/api/signout', (req, res) => {
    req.session.loggedin = null;
    req.session.username = null;
  
    res.status(200).json({ success: true, message: 'Success' });
  
  });
    //connect to courts.ejs
    app.get('/courts', (req, res) => {
      connection.query('SELECT * FROM reservation', (err, results) => {
        if (err) {
          console.error('Error fetching data from database:', err);
          res.status(500).send('Error fetching data from database');
          return;
        }
    
        // Render the 'courts' template and pass the data to it
        res.render('courts', { courts: results });
        console.log(results);
      });
    });
    
    

  
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("http://localhost:3000");
});