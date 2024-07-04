const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const Cookies = require("js-cookie");
const multer = require("multer");
const aws = require('aws-sdk');
const fs = require ('fs');

dotenv.config();

const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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
            setTimeout(connectWithRetry, 5000); 
        } else console.log('Connected to the database');
    });
    return connection;
}

const db = connectWithRetry();


app.use(express.json())
const s3 = new aws.S3({
  endpoint: new aws.Endpoint('https://fra1.digitaloceanspaces.com'),
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
});

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
    const price = req.body.price
    const sqlUpdate = "UPDATE books SET title = ?, description = ?, price = ? WHERE idBook = ?"
    db.query(sqlUpdate,[title,description,price,id],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book updated!")
    })
})

app.put("/api/booksWithImage/:id", upload.single('cover'), (req, res) => {
  const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!accessToken) {
    return res.status(401).json("Unauthorized");
  }

  jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("Unauthorized");
      return res.status(401).json("Unauthorized");
    }
    const id = req.params.id
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const file = req.file;

    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: 'books-images-storage',
      Key: file.filename,
      Body: fileContent,
      ACL: 'public-read'
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error uploading to DigitalOcean Spaces");
        return res.status(500).json(err);
      }
      const imageUrl = data.Location;
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting file from local storage:", err);
        }
        console.log("Temporary file deleted");
      });
      const sqlUpdate = "UPDATE books SET title = ?, description = ?, cover = ?, price = ? WHERE idBook = ?"
      db.query(sqlUpdate, [title, description,imageUrl, price,id], (err, result) => {
      if (err) {
        console.log("Error updating book ");
        return res.json(err);
      }
      return res.json("Book updated!")
    });
  });    

  });
});

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

    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: 'books-images-storage',
      Key: file.filename,
      Body: fileContent,
      ACL: 'public-read'
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error uploading to DigitalOcean Spaces");
        return res.status(500).json(err);
      }
      const imageUrl = data.Location;
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting file from local storage:", err);
        }
        console.log("Temporary file deleted");
      });
    const sqlInsert = "INSERT INTO books (title, description, cover, price, fkUser) VALUES (?,?,?,?,?)";
    db.query(sqlInsert, [title, description,imageUrl, price, user.idUser], (err, result) => {
      if (err) {
        console.log("Error inserting into database");
        return res.json(err);
      }
      return res.json("Book added!");
    });
  });    

  });
});




app.listen(8800, '0.0.0.0',()=>{
    console.log("Backend server is running!")
})