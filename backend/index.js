const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const Cookies = require("js-cookie");
const multer = require("multer");
const aws = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');
const fs = require ('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SignatureV4 } = require('@smithy/signature-v4');
const { Sha256 } = require('@aws-crypto/sha256-js');
const { createPresignedURL } = require('@aws-sdk/util-create-request');

dotenv.config();


const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
}));

const connectWithRetry = () => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port : process.env.DB_PORT
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            setTimeout(connectWithRetry, 5000); // Ritenta la connessione dopo 5 secondi
        } else console.log('Connected to the database');
    });
    return connection;
}

const db = connectWithRetry();


app.use(express.json())
/*
const s3 = new S3({
    region: process.env.AWS_REGION,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    credentials: new aws.Credentials({
      accessKeyId: '',
      secretAccessKey: ''
    })
  });
  
  s3.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    endpoint: `https://acp-123456789012.s3-accesspoint.us-east-1.amazonaws.com`,
    httpOptions: {
        agent: new require('https').Agent({
          rejectUnauthorized: false
        })
    }
  });*/

/*
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: new aws.Credentials({
      accessKeyId: '',
      secretAccessKey: '',
    }),
    endpoint: `http://acp-123456789012.s3-accesspoint.us-east-1.amazonaws.com`,
    httpOptions: {
        agent: new require('https').Agent({
          rejectUnauthorized: false
        })
    }
  });
*/
app.get("/",(req,res)=>{
    res.json("Welcome to the books library backend!")
})

app.get("/api/books",(req,res)=>{
    const sqlSelect = "SELECT * FROM books"
    db.query(sqlSelect,(err,result)=>{
        if(err) return res.json(err)
        return res.json(result)
    })
})

app.get("/api/books/:id",(req,res)=>{
    const id = req.params.id
    const sqlSelect = "SELECT * FROM books where idBook = ?"
    db.query(sqlSelect,[id],(err,result)=>{
        if(err) return res.json(err)
        return res.json(result)
    })
})

app.delete("/api/books/:id",(req,res)=>{
    const id = req.params.id
    const sqlDelete = "DELETE FROM books WHERE idBook = ?"
    db.query(sqlDelete,[id],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book deleted!")
    })
})

app.put("/api/books/:id",(req,res)=>{
    const id = req.params.id
    const title = req.body.title
    const description = req.body.description
    const cover = req.body.cover
    const price = req.body.price
    const sqlUpdate = "UPDATE books SET title = ?, description = ?, cover = ?, price = ? WHERE idBook = ?"
    db.query(sqlUpdate,[title,description,cover,price,id],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book updated!")
    })
})

app.post("/api/login",(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const sqlSelect = "SELECT * FROM users WHERE username = ?"
    db.query(sqlSelect,[username,password],(err,result)=>{
        if(err) return res.json(err)
        if(result.length > 0){
            if(bcrypt.compareSync(password, result[0].password)){
                const token = jsonwebtoken.sign({ idUser: result[0].idUser }, process.env.ACCESS_TOKEN_SECRET)
                Cookies.set('access_token', token, { expires: 1 });
                console.log("Token set",token)
                return res.json({token: token, username: username})
            }
        }
        return res.json("Invalid credentials!")
    })
})

app.post("/api/register",(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const sqlSelect = "SELECT * FROM users WHERE username = ?"
    db.query(sqlSelect,[username],(err,result)=>{
        if(err) return res.json(err)
        if(result.length > 0){
            return res.json("Username already taken!")
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const sqlInsert = "INSERT INTO users (username, password) VALUES (?,?)"
        db.query(sqlInsert,[username,hashedPassword],(err,result)=>{
            if(err) return res.json(err)
            return res.json("User registered!")
        })    
    })
})

app.post("/api/logout",(req,res)=>{
    Cookies.remove('access_token');
    return res.json("Logged out!")
})


app.post("/api/getUserInfo",(req,res)=>{
    const accessToken = req.headers.authorization.split(' ')[1];
    jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Unauthorized")
            return res.status(401).json("Unauthorized")
        }
        const sqlSelect = "SELECT idUser,username,books.* FROM users left join books on idUser = fkUser where idUser = ?;"
        db.query(sqlSelect,[user.idUser],(err,result)=>{
            if(err) return res.json(err)
            return res.json(result)
        })
    });
})

async function uploadImageToS3(file) {
    const fileStream = fs.createReadStream(file.path);
    const fileName = file.originalname;
  
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
    };
  
    try {
     // await s3.send(new PutObjectCommand(params));
     await s3.upload(params).promise();

      return { Location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}` };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
/*
    function getBlobFromImage(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data); // Ritorna il contenuto del file come blob
                }
            });
        });
    }*/
  // Configurazione Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage });

app.post('/api/upload', upload.single('cover'), (req, res) => {
  const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!accessToken) {
    return res.status(401).json("Unauthorized");
  }

  jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("Unauthorized");
      return res.status(401).json("Unauthorized");
    }

    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const file = req.file;

    const sqlInsert = "INSERT INTO books (title, description, cover, price, fkUser) VALUES (?,?,?,?,?)";
    db.query(sqlInsert, [title, description, file.path, price, user.idUser], (err, result) => {
      if (err) {
        console.log("Error inserting into database");
        return res.json(err);
      }
      return res.json("Book added!");
    });
/*
    uploadImageToS3(file)
      .then(data => {
        const sqlInsert = "INSERT INTO books (title, description, cover, price, fkUser) VALUES (?,?,?,?,?)";
        db.query(sqlInsert, [title, description, data.Location, price, user.idUser], (err, result) => {
          if (err) {
            console.log("Error inserting into database");
            return res.json(err);
          }
          return res.json("Book added!");
        });
      })
      .catch(err => {
        console.error('Error uploading file to S3:', err);
        res.status(500).json("Error uploading file");
      });*/
  });
});




app.listen(8800, '0.0.0.0',()=>{
    console.log("Backend server is running!")
})