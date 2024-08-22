require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import the cors package
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');

app.use(cors({
  origin: 'http://localhost:4200', // your Angular app's URL
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());



// app.use(session({
//   secret: process.env.SESSION_KEY, // Replace with a secure secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { httpOnly: true, secure: false , maxAge: 100000 } // Set secure to true if using HTTPS
// }));

const algorithm = 'aes-256-cbc'; // AES encryption algorithm

app.post('/submit', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const filePath = path.join(__dirname, 'formData.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read file' });
    }

    const accounts = data.split('\n\n');
    for (const account of accounts) {
      const lines = account.split('\n');
      for (const line of lines) {
        if (line.startsWith('Email:')) {
          const storedEmail = line.split('Email: ')[1].trim();
          if (storedEmail === email) {
            return res.status(400).json({ message: 'An account already exists with this email.' });
          }
        }
      }
    }

    // Proceed with account creation
    const key = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16); // Initialization vector (16 bytes for AES)
    
    // const userID = uuidv4();

    try {
      const emailCook = req.cookies['email']; // Get the userID from the existing cookie
      if (!emailCook) {
        console.log('CREATING USER ID COOKIE..................\n');
        res.cookie('email', email, { httpOnly: false, secure: false, maxAge: 24 * 60 * 60 * 1000,path: '/', domain: 'localhost'  }); // 1 day expiration

        
        // res.cookie('email', email, {maxAge: 900000, path: '/', httpOnly: false, sameSite: 'Lax' });
        console.log('GETTING THE NON EXISTANT COOKIE........  ',req.cookies['email']);
        console.log('Set-Cookie:', res.getHeaders()['set-cookie']); // Verify the Set-Cookie header
      }

    } catch (error) {
      console.log('error....    ',error);
    }


    // Convert buffers to hex strings for storage
    const ivHex = iv.toString('hex');
    const keyHex = key.toString('hex');
    const encryptedPassword = encrypt(password, keyHex, ivHex);
    const userId = generateGUID();

    // Format the data to be saved
    const dataToSave = `UserID: ${userId}\nUsername: ${username}\nEmail: ${email}\nPassword: ${encryptedPassword}\nIV: ${ivHex}\nKey: ${keyHex}\n\n`;

    // Write data to file
    fs.appendFile(filePath, dataToSave, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to write to file' });
      }
      res.status(200).json({ message: 'Account created successfully' });
    });
  });

});

// POST route to compare passwords
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  findPasswordMatch(email, password, (err, match) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (match) {
      try {
        const emailCook = req.cookies['email']; // Get the userID from the existing cookie
        if (!emailCook) {
          // console.log('CREATING USER ID COOKIE..................\n');
          res.cookie('email', email, { httpOnly: false, secure: false, maxAge: 24 * 60 * 60 * 1000,path: '/', domain: 'localhost'  }); // 1 day expiration
  
          
          // res.cookie('email', email, {maxAge: 900000, path: '/', httpOnly: false, sameSite: 'Lax' });
          // console.log('GETTING THE NON EXISTANT COOKIE........  ',req.cookies['email']);
          // console.log('Set-Cookie:', res.getHeaders()['set-cookie']); // Verify the Set-Cookie header
        }
  
      } catch (error) {
        console.log('error....    ',error);
      }
  
      // console.log('Session cookie Login:', req.headers.cookie);
      // console.log('REQUEST headers.......  \n',req.headers);

      return res.status(200).json({ message: 'Login successful',login:true });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Forgot Password route
app.post('/forgot-password', (req, res) => {
  console.log('FORGOT PASSWORD................   \n',req.body);
  const { email, newPassword } = req.body;  
  const filePath = path.join(__dirname, 'formData.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    if (!data.includes(`Email: ${email}`)) {
      return res.status(200).json({ message: 'If the email is registered, you will receive a password reset link.' });
    }
    else 
    {
      console.log('UPDATING PASSWORD......   \n');
      updatePassword(filePath, email, newPassword);
    }
    // Here, you'd typically send an email with the reset link or token.
    // For simplicity, we're just responding with a message.
    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  });
});

app.post('/addbike', (req, res) => {
  const {userId,  Id, src, href, description, year, make, model, price, isForSale, isSold } = req.body;
try {
  console.log('Cookies:', req.cookies); 
  console.log('Session cookie:', req.headers.cookie);
console.log('REQUEST headers.......  \n',req.headers);

  const bikeData = `
  userEmail: 'clayhugehs1113$gmail.com'
  ImageID: ${Id}
  Source: ${src}
  Href: ${href}
  Description: ${description}
  Year: ${year}
  Make: ${make}
  Model: ${model}
  Price: ${price}
  isForSale: ${isForSale}
  IsSold: ${isSold}
  `;
console.log('new bike \n',bikeData);
  const filePath = path.join(__dirname, 'bikeData.txt');

  // Write bike details to a file
  fs.appendFile(filePath, bikeData + '\n\n', (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to write bike details to file' });
    }
    res.status(200).json({ message: 'Bike details added successfully' });
  });

} catch (error) {
  console.log('an error has occurred in the api\n',error);
}
});

app.post('/updatemybike', (req, res) => {
  const { userEmail, ImageID, Year, Make, Model, Description, Price, isForSale, IsSold, Source } = req.body;
  const filePath = path.join(__dirname, 'bikeData.txt');
  let updatedBike;
  let bikeArray = [];
  try {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading file' });
      }

      const bikeEntries = data.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
      try {
        const ind = -1;
        for(var attributename in JSON.parse(bikeEntries)){
          const item = JSON.parse(bikeEntries)[attributename];
          console.log(item.ImageID);

          if(item.ImageID === ImageID)
          {
            updatedBike = updateBikeDetails(req.body, item);            // matchItems.push(item);
            bikeArray.push(updatedBike);
          }
          else {
            bikeArray.push(item);
          }

          console.log(bikeArray);
        }
        writeUpdateBike(filePath,bikeArray);

      } catch (error) {
          console.log('an error occurred \n',error);
      }
    });
  } catch (error) {
    console.log('Error updating the bike details........  ',error);
  }
});

app.get('/getBikeDetails', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'bikeData.txt');
    const emailCookie = req.headers.cookie;
    const matchItems = [];

    if (!emailCookie) {
      return res.status(400).json({ error: 'Email cookie not found' });
    }

    const email = decodeURIComponent(emailCookie.split('=')[1]).trim();
console.log(email);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading file' });
      }

      const bikeEntries = data.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
      try {
        for(var attributename in JSON.parse(bikeEntries)){
          const item = JSON.parse(bikeEntries)[attributename];
          // console.log(item.userEmail);

          if(item.userEmail === email)
          {
            // console.log('THERE HAS BEEN A MATCH  .    ',item.userEmail,'\n');
            matchItems.push(item);
          }
          else {
            console.log('NO MATCH FOUND.......  \n');
          }
        }
     } catch (error) {
        console.log('an error occurred \n',error);
     }

      // console.log('MATCH ITEMS ARRAY  \n',matchItems);
      res.json(JSON.parse(JSON.stringify(matchItems)));
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/getBikeImages', (req, res) => {
  const filePath = path.join(__dirname, 'bikeData.txt');
console.log('getting bike and images \n');
  // Read the file and parse it
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Server error');
    }

    let bikeArray;
    try {
      bikeArray = JSON.parse(data);
      console.log('bike array  \n',bikeArray);
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      return res.status(500).send('Server error');
    }

    // Send the parsed bike data as JSON response
    res.json(bikeArray);
  });
});

function writeUpdateBike(filePath,item,bikeFound){
  try {
    fs.writeFile(filePath, JSON.stringify(item, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
      } else {
        console.log('Bike details successfully updated in the file.');
      }
    });
  } catch (error) {
    console.log('Error writing the new data    ',error);
  }
}

function updateBikeDetails(reqBody, bikeObject) {
  const keys = [
    "userEmail",
    "ImageID",
    "Year",
    "Make",
    "Model",
    "Description",
    "Price",
    "isForSale",
    "IsSold",
    "Source",
  ];

  keys.forEach((key) => {
    if (reqBody[key] !== bikeObject[key]) {
      console.log(`Updating ${key} from ${bikeObject[key]} to ${reqBody[key]}`);
      bikeObject[key] = reqBody[key];
    }
  });

  return bikeObject;
}

function parseBikeData(data) {
  const bikes = [];
  let currentBike = {};

  data.split('\n').forEach(line => {
      const trimmedLine = line.trim();

      // Ignore empty lines
      if (trimmedLine.length === 0) return;

      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > -1) {
          const key = trimmedLine.substring(0, colonIndex).trim().replace(/['"]+/g, '');
          const value = trimmedLine.substring(colonIndex + 1).trim().replace(/['"]+/g, '');

          // Check if this line contains a userEmail key
          if (key.toLowerCase() === 'useremail') {
              if (Object.keys(currentBike).length > 0) {
                  // Push the current bike to the array if it has data
                  bikes.push(currentBike);
              }
              // Start a new bike object
              currentBike = {};
          }
          currentBike[key] = value;
          console.log('CURRENT BIKE \n',currentBike);
      }
  });

  // Push the last bike object if it exists
  if (Object.keys(currentBike).length > 0) {
      bikes.push(currentBike);
  }

  return bikes;
}

function decrypt(encryptedPassword, iv, key) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function findPasswordMatch(email, password, callback) {
  const filePath = path.join(__dirname, 'formData.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err, false);
    }

    const accounts = data.split('\n\n');
    for (const account of accounts) {
      const lines = account.split('\n');
      let storedEmail, encryptedPassword, iv, key;

      for (const line of lines) {
        if (line.startsWith('Email:')) {
          storedEmail = line.split('Email: ')[1].trim();
        } else if (line.startsWith('Password:')) {
          encryptedPassword = line.split('Password: ')[1].trim();
        } else if (line.startsWith('IV:')) {
          iv = line.split('IV: ')[1].trim();
        } else if (line.startsWith('Key:')) {
          key = line.split('Key: ')[1].trim();
        }
      }

      if (storedEmail === email && encryptedPassword && iv && key) {
        const decryptedPassword = decrypt(encryptedPassword, iv, key);
        if (decryptedPassword === password) {
          return callback(null, true);
        }
      }
    }

    callback(null, false);
  });
}

function encrypt(text, keyHex, ivHex) {
  const keyBuffer = Buffer.from(keyHex, 'hex'); // Convert hex to buffer
  const ivBuffer = Buffer.from(ivHex, 'hex');   // Convert hex to buffer

  if (keyBuffer.length !== 32) {
    throw new Error('Invalid key length. Key must be 32 bytes.');
  }

  if (ivBuffer.length !== 16) {
    throw new Error('Invalid IV length. IV must be 16 bytes.');
  }

  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Error during encryption:', error.message);
    throw error; // Re-throw error for handling
  }
}

// Function to update the password in the file
function updatePassword(filePath, email, newPassword) {
  console.log('NEW PASSWORD:', newPassword);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Split the content into sections based on double newline
    const sections = data.split('\n\n');
    let emailFound = false;

    const updatedSections = sections.map(section => {
      const lines = section.split('\n');
      const emailLine = lines.find(line => line.startsWith('Email: '));
      const emailValue = emailLine ? emailLine.split(': ')[1] : '';

      if (emailValue === email) {
        emailFound = true;

        // Generate new key and IV
        const { key, iv } = generateKeyAndIV();

        try {
          // Encrypt the new password
          const encryptedPassword = encrypt(newPassword, key, iv);

          // Replace the old key, IV, and password
          return lines.map(line => {
            if (line.startsWith('Password: ')) {
              return `Password: ${encryptedPassword}`;
            } else if (line.startsWith('Key: ')) {
              return `Key: ${key}`;
            } else if (line.startsWith('IV: ')) {
              return `IV: ${iv}`;
            }
            return line;
          }).join('\n');
        } catch (error) {
          console.error('Error during encryption:', error.message);
          return section; // Return the original section if encryption fails
        }
      }

      return section;
    });

    if (!emailFound) {
      console.log('Email not found.');
      return;
    }

    // Join the updated sections back into a string
    const updatedContent = updatedSections.join('\n\n');

    // Write the updated content back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', err => {
      if (err) {
        console.error('Error writing to the file:', err);
      } else {
        console.log('Password updated successfully.');
      }
    });
  });
}

// Function to generate a random 32-byte key and 16-byte IV
function generateKeyAndIV() {
  const key = crypto.randomBytes(32).toString('hex'); // 32 bytes for AES-256
  const iv = crypto.randomBytes(16).toString('hex');  // 16 bytes for AES-CBC
  return { key, iv };
}

function generateGUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  );
}

function parseBikeData(line) {
  const bike = {};
  const pairs = line.split(';');
  pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
          bike[key.trim()] = value ? value.trim() : '';
      }
  });
  return bike;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
