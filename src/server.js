require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import the cors package
const app = express();
const port = 3000;
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const sharp = require('sharp');
const url = require('url');

const cookieParser = require('cookie-parser');
const multer = require('multer');

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const emailCook = req.cookies['email'];

    const emailPrefix = emailCook.substring(0, emailCook.indexOf('@'));

    // Generate a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Combine email prefix with the unique suffix and file extension
    const newFilename = `${emailPrefix}${uniqueSuffix}${path.extname(file.originalname)}`.replace('-', '_');
    console.log('BEFORE SAVING FILE NAME ',newFilename)
    
    cb(null, newFilename);
    // Use a unique filename to prevent overwriting
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });
const siteUrl = 'http://localhost:4200/assets';

// const inputImagePath = path.join(__dirname, 'input-image.jpg'); // Change the file name as needed
// const outputImagePath = inputImagePath.replace(path.extname(inputImagePath), '.webp');
// convertToWebP(inputImagePath, outputImagePath);

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
          res.cookie('email', email, { httpOnly: false, secure: false, maxAge: 24 * 60 * 60 * 1000,path: '/', domain: 'localhost'  }); // 1 day expiration
        }
      } catch (error) {
        console.log('error....    ',error);
      }
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

// POST route to handle bike addition
app.post('/addbike', upload.single('image'), (req, res) => {
  // Access the file and form fields
  //req.file;
  const { description, year, make, model, isForSale, isSold } = req.body;
  const emailCook = req.cookies['email'];
  const fileEmailPrefix =  emailCook.split('@')[0];
  const file = req.file ? `/uploads/${req.file.filename}` : '';

  const fileName = file.replace('-', '_');
  const filePath = path.join(__dirname, 'bikeData.txt');
  
  // Validate required fields
  if (!file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  // Initialize href with the site URL and file path
  const href = `${siteUrl}${fileName}`;
  console.log('file path  \n',href);

  if (!href || !description || !year || !make || !model) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Parse boolean fields (they come as strings)
  const isForSaleBool = isForSale === 'true';
  const isSoldBool = isSold === 'true';

  // Parse numerical fields
  const yearNum = parseInt(year, 10);
  const priceNum = parseFloat(req.body.price) || 0; // Assuming price is optional or defaults to 0

  getMaxIdFromFile(filePath)
    .then(maxId => {
      console.log('Max ID found:', maxId);
      const IdVal = maxId + 1; // Increment ID for new entry

      const newBike = {
        userEmail: emailCook,
        Id: IdVal,
        src: href,// Assuming file.path is available from file upload middleware
        href,
        description,
        year: yearNum,
        make,
        model,
        price: priceNum,
        isForSale: isForSaleBool,
        isSold: isSoldBool,
      };

      // addBikeToFile(filePath,bikeJSON)
      addBikeToFile(filePath,newBike)
    })
    .catch(err => {
      console.error('Failed to get max ID:', err);
      res.status(500).json({ success: false, error: 'Failed to process request' });
    });

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

async function convertImageToWebP(req, res) {
  const { imageSrc } = req.body;
  console.log('IMAGE URL   ',imageSrc);

  const fileName = path.basename(imageSrc); // Extract the file name from the URL/path
  const localFilePath = path.join(__dirname, 'assets', 'uploads', fileName); // Define the local file path
  console.log('file name    ',fileName);

  const outputWebPPath = path.join(__dirname, 'assets', '360image', fileName.replace(path.extname(fileName), '.webp'));
  console.log('Output path     ', outputWebPPath);

  const webpFileName = path.basename(outputWebPPath);
  console.log('new file path  ',webpFileName);

  sharp(localFilePath)
  .webp({ quality: 80 })
  .toFile(outputWebPPath)
  .then(() => {
    const webpSrc = `${siteUrl}/360image/${webpFileName}`;
    console.log('WebP Source URL:', webpSrc);
    res.json({ webpSrc: webpSrc });
  })
  .catch(err => {
    console.error('Error converting image to WebP:', err);
    res.status(500).json({ error: 'Failed to convert image to WebP' });
  });
}

// Express route handler to convert an image to WebP
app.post('/convert-to-webp', convertImageToWebP);

app.get('/getBikeDetails', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'bikeData.txt');
    const emailCookie = req.cookies['email'];
    const matchItems = [];
    const imageFilePath = path.join(__dirname, 'motorcycle_images.json');
console.log('COOKIE   ',emailCookie);

    if (emailCookie === ''  || emailCookie === undefined) {
      return res.status(400).json({ error: 'Email cookie not found' });
    }

    const email = decodeURIComponent(emailCookie.split('=')[1]).trim();
    console.log('EMAIL FROM COOKIE OBJECT   ',email);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading file' });
      }

      const bikeEntries = data.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
      try {
        for(var attributename in JSON.parse(bikeEntries)){
          const item = JSON.parse(bikeEntries)[attributename];

          if(item.userEmail === emailCookie)
          {
            matchItems.push(item);
          }
        }
     } catch (error) {
        console.log('an error occurred \n',error);
     }

         // Read the motorcycle images file
    fs.readFile(imageFilePath, 'utf8', (err, imageData) => {
      if (err) {
        console.error('Error reading image file:', err);
        return res.status(500).send('Server error');
      }

      // Parse the image data
      let imageArray;
      try {
        imageArray = JSON.parse(imageData);
      } catch (parseError) {
        console.error('Error parsing image JSON data:', parseError);
        return res.status(500).send('Server error');
      }

      // Filter images based on the user email
      const userImages = imageArray.filter(image => image.userEmail === email);

      // Attach the imageList to each bike object where the email matches
      const userBikeData = matchItems.map(bike => {
        if (bike.userEmail === email) {
          bike.imageList = userImages.map(img => img.src);
        }
        return bike;
      });

      // console.log('user bie daa \n',userBikeData);

      res.json(JSON.parse(JSON.stringify(userBikeData)));

      // Send the updated bike data with imageList as JSON response
      // res.json(userBikeData);
    });

      // res.json(JSON.parse(JSON.stringify(matchItems)));
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/getBikeImages', (req, res) => {
  const filePath = path.join(__dirname, 'bikeData.txt');
  const imageFilePath = path.join(__dirname, 'motorcycle_images.json');
  const emailCookie = req.cookies['email'];
  let bikeArray;

  console.log('email cookie     ',emailCookie);
  // Read the file and parse it
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Server error');
    }

    // let bikeArray;
    try {
      bikeArray = JSON.parse(data);
      // console.log('bike array  \n',bikeArray);
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      return res.status(500).send('Server error');
    }

    fs.readFile(imageFilePath, 'utf8', (err, imageData) => {

      if (err) {
        console.error('Error reading motorcycle images file:', err);
        return res.status(500).send('Server error');
      }

      let imageArray;
      try {
        imageArray = JSON.parse(imageData);
        // console.log('INITIALIZING IMAGE ARRAY OBJECT ............\n',imageArray);

        // Ensure it's an array of objects
        if (!Array.isArray(imageArray) && typeof imageArray === 'object') {
          imageArray = [imageArray]; // Wrap it in an array if it's a single object
        }

      } catch (parseError) {
        console.error('Error parsing images JSON:', parseError);
        return res.status(500).send('Server error');
      }

      // if (err) {
      //   console.error('Error reading motorcycle images file:', err);
      //   return res.status(500).send('Server error');
      // }

      // let imageArray;
      // try {
      //   imageArray = JSON.parse(imageData);
      // } catch (parseError) {
      //   console.error('Error parsing images JSON:', parseError);
      //   return res.status(500).send('Server error');
      // }

      // console.log('BIKE BEFORE COMBNE  \n',bikeArray)
      // Combine the image data with the bike data
      const combinedBikeData = bikeArray.map(bike => {
        // Find matching image data for the bike
        const imagesForBike = imageArray.filter(image => image.userEmail === bike.userEmail); // Assuming 'bikeId' in image data matches 'Id' in bike data
        // console.log('IMAGE FOR BIKE  \n',imagesForBike);

        let imageList = [];

        if (imagesForBike.length > 0) {
          console.log('Motorcycles array found:', imagesForBike[0].motorcycles);
      
          if (imagesForBike[0].motorcycles && imagesForBike[0].motorcycles.length > 0) {
            // Map over the motorcycles array to get all image URLs
            imageList = imagesForBike[0].motorcycles.map(motorcycle => {
              console.log('Processing motorcycle:', motorcycle);
              return motorcycle.imageUrl || null;
            });
      
            console.log('Populated imageList:', imageList);
          } else {
            console.log('No valid motorcycles array found for the bike.');
          }
        } else {
          console.log('No matching images found for this bike.');
        }

        return {
          ...bike,
          imageList: imageList // Assign the imageList array
        };

        // Check if imagesForBike is not empty and contains valid motorcycles array
        // if (imagesForBike.length > 0 && imagesForBike[0].motorcycles && imagesForBike[0].motorcycles.length > 0) {
        //   // Flatten the motorcycles array and map to get all image sources
        //   imageList = imagesForBike[0].motorcycles.map(motorcycle => motorcycle.imageUrl);
        // }
        // console.log('IMAGE LIST \n',imageList);

        
        // return {
        //   ...bike,
        //   imageList: imagesForBike.map(image => image.src) // Assuming 'src' is the property containing the image URL
        // };
      });
      console.log('combined array  \n',combinedBikeData);

      // Send the parsed bike data as JSON response
      // res.json(bikeArray);
  
      res.json(combinedBikeData);
  

    });
    // console.log('combined array  \n',combinedBikeData);

    // Send the parsed bike data as JSON response
    // res.json(bikeArray);

    // res.json(combinedBikeData);

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

function getMaxIdFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
        const bikes = JSON.parse(data);
        const maxId = bikes.reduce((max, bike) => Math.max(max, bike.Id), 0);
        resolve(maxId);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

function addBikeToFile(filePath, newBike) {
  // Read the existing data from the file
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return err;
    }
    let bikes = [];

    try {
      // Parse the data
      if (data.trim()) {
        bikes = JSON.parse(data);
      }
    } catch (parseError) {
      return parseError;
    }

    // Add the new bike to the array
    bikes.push(newBike);

    // Convert the updated array to a JSON string
    const updatedData = JSON.stringify(bikes, null, 2);

    // Write the updated array back to the file
    fs.writeFile(filePath, updatedData, 'utf-8', (writeError) => {
      if (writeError) {
        return writeError;
      }
      return 'Bike added successfully!';
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
