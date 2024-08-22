const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import the cors package

const app = express();
const port = 3000;
const crypto = require('crypto');

app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());

const algorithm = 'aes-256-cbc'; // AES encryption algorithm
const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16); // Initialization vector

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
//     // Handle preflight, OPTIONS
//     if (req.method === 'OPTIONS') {
//       return res.status(200).end();
//     }
  
//     next();
//   });
  

app.post('/submit', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log('INNNNNNNNNNNNNN  submission api.....................');

  const encryptedPassword = encrypt(password);
  console.log('Encrypted:', encryptedPassword);

  // Format the data
  const data = `Username: ${username}\nEmail: ${email}\nPassword: ${encryptedPassword}\nConfirm Password: ${confirmPassword}\n\n`;
  console.log(JSON.stringify(data));
  // Write data to file
  fs.appendFile(path.join(__dirname, 'formData.txt'), data, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to write to file' });
    }
    res.status(200).json({ message: 'Data written successfully' });
  });
});

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    console.log(encrypted);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
