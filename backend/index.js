import express from "express"
import mysql from "mysql2"
import dotenv from "dotenv"
import cors from "cors"
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken"
import Cookies from "js-cookie"
import multer from "multer"

dotenv.config();

const app = express()
app.use(cors())

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

app.use(express.json())

app.get("/",(req,res)=>{
    res.json("Welcome to the books library backend!")
})

app.get("/books",(req,res)=>{
    const sqlSelect = "SELECT * FROM books"
    db.query(sqlSelect,(err,result)=>{
        if(err) return res.json(err)
        return res.json(result)
    })
})

app.delete("/books/:id",(req,res)=>{
    const id = req.params.id
    const sqlDelete = "DELETE FROM books WHERE idBook = ?"
    db.query(sqlDelete,[id],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book deleted!")
    })
})

app.put("/books/:id",(req,res)=>{
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

app.post("/login",(req,res)=>{
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

app.post("/register",(req,res)=>{
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

app.post("/logout",(req,res)=>{
    Cookies.remove('access_token');
    return res.json("Logged out!")
})


app.post("/getUserInfo",(req,res)=>{
    const accessToken = req.headers.authorization.split(' ')[1];
    jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Unauthorized")
            return res.status(401).json("Unauthorized")
        }
        const sqlSelect = "SELECT idUser,username,books.* FROM users inner join books on idUser = fkUser where idUser = ?;"
        db.query(sqlSelect,[user.idUser],(err,result)=>{
            if(err) return res.json(err)
            return res.json(result)
        })
    });
})


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage });
  
  app.post('/upload', upload.single('cover'), (req, res) => {
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json("Unauthorized");
    }
    jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Unauthorized")
            return res.status(401).json("Unauthorized")
        }
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const filePath = req.file.path;
        const sqlInsert = "INSERT INTO books (title, description, cover, price, fkUser) VALUES (?,?,?,?,?)"
        db.query(sqlInsert,[title,description,filePath,price,user.idUser],(err,result)=>{
            if(err) return res.json(err)
            return res.json("Book added!")
        })
    });
  });


app.listen(8800, ()=>{
    console.log("Backend server is running!")
})