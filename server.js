const express = require('express');
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
  'mongodb+srv://b022110148:Rafiah62@lymhyt.zvhvhpe.mongodb.net/?retryWrites=true&w=majority';

// MongoDB database and collections names
const dbName = 'company appointment';
const staffCollection = 'staff';
const securityCollection = 'security';
const appointmentCollection = 'appointments';

// Middleware for parsing JSON data
app.use(express.json());

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Welcome to Visitor Management System',
            version: '1.0.0',
        },
    },
    apis: ['./server.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection
mongodb.MongoClient.connect(mongoURL, { useUnifiedTopology: true })
  .then((client) => {
    const db = client.db(dbName);
    const staffDB = db.collection(staffCollection);
    const securityDB = db.collection(securityCollection);
    const appointmentDB = db.collection(appointmentCollection);

/**
 * @swagger
 * /register-staff:
 *   post:
 *     description: Register staff
 *     parameters:
 *       - name: username
 *         description: Staff username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: Staff password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Staff registered successfully
 *       403:
 *         description: Invalid or unauthorized token
 *       409:
 *         description: Username already exists
 */

app.post('/register-staff', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username already exists
      const existingStaff = await staffDB.findOne({ username });
      if (existingStaff) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new staff member
      const newStaff = await staffDB.create({
        username,
        password: hashedPassword,
      });
  
      // Generate JWT token
      const token = jwt.sign({ username, role: 'staff' }, secretKey);
  
      // Update the staff member with the token
      await staffDB.updateOne({ username }, { $set: { token } });
  
      res.status(201).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    
        

    // Staff login

/**
 * @swagger
 * /login-staff:
 *   post:
 *     description: Staff login
 *     parameters:
 *       - name: username
 *         description: Staff username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: Staff password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful login, returns token
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error storing token
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

  const token = jwt.sign({ username, role: 'staff' }, secretKey);
  staffDB
    .updateOne({ username }, { $set: { token } })
    .then(() => {
      res.status(200).json({ token });
    })
    .catch(() => {
      res.status(500).send('Error storing token');
    });
});


    // Security login
/**
 * @swagger
 * /login-security:
 *   post:
 *     description: Security login
 *     parameters:
 *       - name: username
 *         description: Security username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: Security password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful login, returns token
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
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

    // Middleware for authentication and authorization
    const authenticateToken = (req, res, next) => {
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
    

    // Create appointment

/**
 * @swagger
 * /appointments:
 *   post:
 *     description: Create appointment
 *     parameters:
 *       - name: name
 *         description: Visitor's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: company
 *         description: Visitor's company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: purpose
 *         description: Purpose of the visit
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phoneNo
 *         description: Visitor's phone number
 *         in: formData
 *         required: true
 *         type: string
 *       - name: date
 *         description: Date of the appointment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: time
 *         description: Time of the appointment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: verification
 *         description: Verification status of the appointment
 *         in: formData
 *         required: true
 *         type: boolean
 *       - name: staff.username
 *         description: Username of the staff member creating the appointment
 *         in: formData
 *         required: true
 *         type: string
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
 *     description: Get staff's appointments
 *     parameters:
 *       - name: username
 *         description: Staff username
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: Bearer token to authenticate the request
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Returns appointments for the specified staff member
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Appointment'
 *       403:
 *         description: Invalid or unauthorized token
 *       500:
 *         description: Error retrieving appointments
 */


    app.get('/staff-appointments/:username', authenticateToken, async (req, res) => {
      const { username } = req.params;
      const { role } = req.user;
    
      if (role !== 'staff') {
        return res.status(403).send('Invalid or unauthorized token');
      }
    
      appointmentDB
        .find({ 'staff.username': username })
        .toArray()
        .then((appointments) => {
          res.json(appointments);
        })
        .catch((error) => {
          res.status(500).send('Error retrieving appointments');
        });
    });

// Update appointment verification by visitor name

/**
 * @swagger
 * /appointments/{name}:
 *   put:
 *     description: Update appointment verification by visitor name
 *     parameters:
 *       - name: name
 *         description: Visitor's name
 *         in: path
 *         required: true
 *         type: string
 *       - name: verification
 *         description: Updated verification status of the appointment
 *         in: formData
 *         required: true
 *         type: boolean
 *       - name: Authorization
 *         description: Bearer token to authenticate the request
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Appointment verification updated successfully
 *       403:
 *         description: Invalid or unauthorized token
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Error updating appointment verification
 */



app.put('/appointments/:name', authenticateToken, async (req, res) => {
  const { name } = req.params;
  const { verification } = req.body;
  const { role } = req.user;

  if (role !== 'staff') {
    return res.status(403).send('Invalid or unauthorized token');
  }

  appointmentDB
    .updateOne({ name }, { $set: { verification } })
    .then(() => {
      res.status(200).send('Appointment verification updated successfully');
    })
    .catch((error) => {
      res.status(500).send('Error updating appointment verification');
    });
});

    // Delete appointment
/**
 * @swagger
 * /appointments/{name}:
 *   delete:
 *     description: Delete appointment
 *     parameters:
 *       - name: name
 *         description: Visitor's name
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: Bearer token to authenticate the request
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       403:
 *         description: Invalid or unauthorized token
 *       500:
 *         description: Error deleting appointment
 */


    app.delete('/appointments/:name', authenticateToken, async (req, res) => {
      const { name } = req.params;
      const { role } = req.user;
    
      if (role !== 'staff') {
        return res.status(403).send('Invalid or unauthorized token');
      }
    
      appointmentDB
        .deleteOne({ name })
        .then(() => {
          res.status(200).send('Appointment deleted successfully');
        })
        .catch((error) => {
          res.status(500).send('Error deleting appointment');
        });
    });

    // Get all appointments (for security)

/**
 * @swagger
 * /appointments:
 *   get:
 *     description: Get all appointments (for security)
 *     parameters:
 *       - name: name
 *         description: Filter appointments by visitor name
 *         in: query
 *         required: false
 *         type: string
 *       - name: Authorization
 *         description: Bearer token to authenticate the request
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Returns all appointments (filtered if name is provided)
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Appointment'
 *       403:
 *         description: Invalid or unauthorized token
 *       500:
 *         description: Error retrieving appointments
 */


    app.get('/appointments', authenticateToken, async (req, res) => {
      const { name } = req.query;
      const { role } = req.user;
    
      if (role !== 'security') {
        return res.status(403).send('Invalid or unauthorized token');
      }
    
      const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
    
      appointmentDB
        .find(filter)
        .toArray()
        .then((appointments) => {
          res.json(appointments);
        })
        .catch((error) => {
          res.status(500).send('Error retrieving appointments');
        });
    });


// Logout

/**
 * @swagger
 * /logout:
 *   post:
 *     description: Logout endpoint for staff or security
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token to authenticate the request
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       403:
 *         description: Invalid role or unauthorized token
 *       500:
 *         description: Error logging out
 */


app.post('/logout', authenticateToken, async (req, res) => {
    const { role } = req.user;
  
    // Depending on the role (staff or security), update the corresponding collection (staffDB or securityDB)
    if (role === 'staff') {
      staffDB
        .updateOne({ username: req.user.username }, { $unset: { token: 1 } })
        .then(() => {
          res.status(200).send('Logged out successfully');
        })
        .catch(() => {
          res.status(500).send('Error logging out');
        });
    } else if (role === 'security') {
      securityDB
        .updateOne({ username: req.user.username }, { $unset: { token: 1 } })
        .then(() => {
          res.status(200).send('Logged out successfully');
        })
        .catch(() => {
          res.status(500).send('Error logging out');
        });
    } else {
      res.status(500).send('Invalid role');
    }
  });
  
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });