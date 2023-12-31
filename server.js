const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


const app = express();
const port = process.env.PORT || 3000;
const secretKey = 'your-secret-key';


// MongoDB connection URL
const mongoURL =
  'mongodb+srv://yatvms:Rafiah62@yatvms.863dyr5.mongodb.net/?retryWrites=true&w=majority';

 /*const credentials = 'C:/Users/user/Desktop/yat_vms/X509-cert-3169563892115926320.pem';
 const client = new MongoClient('mongodb+srv://lymhyt.akxroc9.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});*/

  


// MongoDB database and collections names
const dbName = 'yatvms';
const staffCollection = 'staff';
const securityCollection = 'security';
const appointmentCollection = 'appointments';


// Middleware for parsing JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

    // Middleware for authentication and authorization
    function authenticateToken (req, res, next)  {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
     
        if (!token) {
          return res.status(401).send('Missing token');
        }
     
        jwt.verify(token, secretKey, (err, user) => {
          if (err) {
            return res.status(403).send('Invalid or expired token');
          }
          req.user = user;
          next();
        });
      };




const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Welcome to Visitor Management System',
            version: '1.0.0',
        },
        /*components:{
            securitySchemes:{
                jwt:{
                    type: 'http',
                    scheme: 'bearer',
                    in: "header",
                    bearerFormat: 'JWT'
                }
            },
            security:[{
                "jwt": []
            }]    
        }*/
        },
    apis: ['./server.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Assuming securityDB is your database variable
//const securityDB = db.collection(securityCollection);
/*const securityDB = {
  findOne: async function (filter) {
    // Simulating finding a user in the database
    return Promise.resolve(null); // Replace this with your actual DB query
  },
  insertOne: async function (security) {
    // Simulating inserting a user into the database
    // Ensure your actual insertion process handles errors and interacts with the database correctly
    return Promise.reject(new Error('Simulated DB Insertion Error'));
  },
};*/

  // Security DB object with actual MongoDB operations
  /*const securityDB = {
    findOne: async function (filter) {
      return await securityCollection.findOne(filter);
    },
    insertOne: async function (security) {
      return await securityCollection.insertOne(security);
    },
  };*/

// MongoDB connection
   mongodb.MongoClient.connect(mongoURL/*, { useUnifiedTopology: true }*/)
    .then((client) => {
      const db = client.db(dbName);
      const staffDB = db.collection(staffCollection);
      const securityDB = db.collection(securityCollection);
      const appointmentDB = db.collection(appointmentCollection);
/*client.connect()
  .then(() => {
    const db = client.db(dbName);
    const staffDB = db.collection(staffCollection);
    const securityDB = db.collection(securityCollection);
    const appointmentDB = db.collection(appointmentCollection);*/

    // Start the server
    /*app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });*/

        // Start the server
       /* app.listen(port, () => {
          console.log(`Server is running on port ${port}`);
        });
      })
      .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
      });*/





/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /register-staff:
 *   post:
 *     summary: Register a staff member
 *     tags:
 *       - Staff
 *     description: Register a new staff member with a username and password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Staff username
 *               password:
 *                 type: string
 *                 description: Staff password
 *                 format: password
 *     responses:
 *       200:
 *         description: Staff registered successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *       403:
 *         description: Invalid or unauthorized token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       409:
 *         description: Username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */


app.post('/register-staff',authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (role!=='security'){
    return req.status(403).send('Invalid or uthorixed token');
  }

  const { username, password } = req.body;
  /*try {}
    const { username, password } = req.body;

    if (!password || password.trim() === '') {
      return res.status(400).send('Password is required');
    }*/

    const existingStaff = await staffDB.findOne({ username });
    if (existingStaff) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = {
      username,
      password: hashedPassword,
    };

    /*const newStaff = await staffDB.insertOne({
      username,
      password: hashedPassword,
    });*/

    staffDB
    .insertOne(staff)
    .then(() => {
      res.status(200).send('Staff registered sucessfully');
    })
    .catch((error) => {
      res.status(500).send('Error registered staff');
    });
  
    /*const token = jwt.sign({ username, role: 'staff' }, secretKey);

    const updateResult = await staffDB.updateOne({ username }, { $set: { token } });
    if (updateResult.modifiedCount === 0) {
      throw new Error('Token update failed');
    }

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during staff registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }*/
});

const saltRounds = 10;


/**
 * @swagger
 * /register-security:
 *   post:
 *     summary: Register a new security user
 *     tags:
 *       - Security
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Security registered successfully
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Error registering security
 */

app.post('/register-security', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingSecurity = await securityDB.findOne({ username });
    if (existingSecurity) {
      return res.status(409).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const security = {
      username,
      password: hashedPassword,
    };

    await securityDB.insertOne(security);

    res.status(200).send('Security registered successfully');
  } catch (error) {
    console.error('Error registering security:', error);
    res.status(500).send('Error registering security');
  }
});





       


    // Staff login


/**
 * @swagger
 * /login-staff:
 *   post:
 *     summary: Login for staff members.
 *     description: Authenticate staff member based on username and password.
 *     tags:
 *       - Staff
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */


app.post('/login-staff', async (req, res) => {
  const { username, password } = req.body;

  const staff = await staffDB.findOne({ username });

  if (!staff) {
    return res.status(401).send('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, staff.password);

  if (!passwordMatch) {
    return res.status(401).send('Invalid credentials');
  }

  res.status(200).send('Login successful');
});


    // Security login
/**
 * @swagger
 * /login-security:
 *   post:
 *     summary: Login for security members
 *     tags:
 *       - Security
 *     description: Login with username and password to get a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error storing token
 */


    app.post('/login-security', async (req, res) => {
      const { username, password } = req.body;


      const security = await securityDB.findOne({ username });


      if (!security) {
        return res.status(401).send('Invalid credentials');
      }


      const passwordMatch = await bcrypt.compare(password, security.password);


      if (!passwordMatch) {
        return res.status(401).send('Invalid credentials');
      }


      const token = security.token || jwt.sign({ username, role: 'security' }, secretKey);
      securityDB
        .updateOne({ username }, { $set: { token } })
        .then(() => {
          res.status(200).json({ token });
        })
        .catch(() => {
          res.status(500).send('Error storing token');
        });
    });


   


    // Create appointment


/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create an appointment
 *     description: Create a new appointment with details
 *     tags:
 *       - Visitor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               company:
 *                 type: string
 *               purpose:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               verification:
 *                 type: boolean
 *               staff:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *     responses:
 *       200:
 *         description: Appointment created successfully
 *       500:
 *         description: Error creating appointment
 */



    app.post('/appointments', async (req, res) => {
      const {
        name,
        company,
        purpose,
        phoneNo,
        date,
        time,
        verification,
        staff: { username },
      } = req.body;


      const appointment = {
        name,
        company,
        purpose,
        phoneNo,
        date,
        time,
        verification,
        staff: { username },
      };


      appointmentDB
        .insertOne(appointment)
        .then(() => {
          res.status(200).send('Appointment created successfully');
        })
        .catch((error) => {
          res.status(500).send('Error creating appointment');
        });
    });


    // Get staff's appointments
/**
 * @swagger
 * /staff-appointments/{username}:
 *   get:
 *     summary: Get appointments for a specific staff member.
 *     description: Retrieve appointments associated with a staff member.
 *     tags:
 *       - Staff Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the staff member to retrieve appointments for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of appointments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Error retrieving appointments.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

// Assuming 'app' is your Express app
app.get('/staff-appointments/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const appointments = await appointmentDB.find({ 'staff.username': username }).toArray();
    res.json(appointments);
  } catch (error) {
    res.status(500).send('Error retrieving appointments');
  }
});

// Update appointment verification by visitor name


/**
 * @swagger
 * /appointments/{name}:
 *   put:
 *     summary: Update appointment verification (public access).
 *     tags:
 *       - Staff Appointments
 *     description: Update the verification status of an appointment.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Name of the appointment.
 *         schema:
 *           type: string
 *       - in: body
 *         name: verification
 *         description: Verification status.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             verification:
 *               type: string
 *               description: Verification status of the appointment.
 *     responses:
 *       200:
 *         description: Appointment verification updated successfully.
 *       500:
 *         description: Error updating appointment verification.
 */

app.put('/appointments/:name', async (req, res) => {
  const { name } = req.params;
  const { verification } = req.body;

  try {
    await appointmentDB.updateOne({ name }, { $set: { verification } });
    res.status(200).send('Appointment verification updated successfully');
  } catch (error) {
    res.status(500).send('Error updating appointment verification');
  }
});


    // Delete appointment
/**
 * @swagger
 * /appointments/{name}:
 *   delete:
 *     summary: Delete an appointment (public access).
 *     tags:
 *       - Staff Appointments
 *     description: Delete an appointment based on its name.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Name of the appointment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully.
 *       500:
 *         description: Error deleting appointment.
 */

app.delete('/appointments/:name', async (req, res) => {
  const { name } = req.params;

  try {
    await appointmentDB.deleteOne({ name });
    res.status(200).send('Appointment deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting appointment');
  }
});

    // Get all appointments (for security)


/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get appointments based on name (public access).
 *     description: Retrieve appointments based on a name query parameter.
 *     tags:
 *       - Visitor
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         description: Filter appointments by name (case-insensitive).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of appointments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Error retrieving appointments.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */

app.get('/appointments', async (req, res) => {
  const { name } = req.query;

  const filter = name ? { name: { $regex: name, $options: 'i' } } : {};

  try {
    const appointments = await appointmentDB.find(filter).toArray();
    res.json(appointments);
  } catch (error) {
    res.status(500).send('Error retrieving appointments');
  }
});



// Logout


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout endpoint (public access).
 *     description: Clear token for the user to log out.
 *     tags:
 *       - Staff
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *       500:
 *         description: Error logging out.
 */

app.post('/logout', async (req, res) => {
  // Assuming you're using username as a parameter to identify the user
  const { username } = req.body;

  // Depending on the user role, update the corresponding collection (staffDB or securityDB)
  // For demonstration purposes, I'm assuming staffDB, modify as needed
  try {
    await staffDB.updateOne({ username }, { $unset: { token: 1 } });
    res.status(200).send('Logged out successfully');
  } catch (error) {
    res.status(500).send('Error logging out');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
})
.catch((error) => {
console.log('Error connecting to MongoDB:', error);
})


/////////////////////// TESTING /////////////////////

const testingMongoURL = 'mongodb+srv://yatvms:Rafiah62@yatvms.863dyr5.mongodb.net/?retryWrites=true&w=majority';

// Assuming you have the connection to the testing MongoDB setup
const testingClient = new mongodb.MongoClient(testingMongoURL, { useUnifiedTopology: true });

// Connect to the testing database
testingClient.connect()
  .then((testClient) => {
    const testingDB = testClient.db('testing_database_name');
    const testingStaffDB = testingDB.collection('testing_staff_collection');

/**
 * @swagger
 * /register-staff-no-auth:
 *   post:
 *     summary: Register a staff member without requiring authentication (for testing purposes).
 *     description: Register a new staff member in the testing database without needing an authentication token.
 *     tags:
 *       - Testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the staff member
 *               password:
 *                 type: string
 *                 description: Password for the staff member
 *     responses:
 *       200:
 *         description: Staff registered successfully in the testing database
 *       409:
 *         description: Username already exists in the testing database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *       500:
 *         description: Error registering staff in the testing database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Details of the error
 *       503:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Details of the error
 */


    // API endpoint for registering staff without requiring a token for testing purposes
    app.post('/register-staff-no-auth', async (req, res) => {
      try {
        const { username, password } = req.body;

        const existingStaff = await testingStaffDB.findOne({ username });
        if (existingStaff) {
          return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = {
          username,
          password: hashedPassword,
        };

        testingStaffDB
          .insertOne(staff)
          .then(() => {
            res.status(200).send('Staff registered successfully in the testing database');
          })
          .catch(() => {
            res.status(500).send('Error registering staff in the testing database');
          });

      } catch (error) {
        console.error('Error during staff registration in the testing database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    
  })
  .catch((error) => {
    console.log('Error connecting to the testing MongoDB:', error);
  });
