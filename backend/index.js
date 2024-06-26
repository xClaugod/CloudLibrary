import express from "express"
import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config();

const app = express()


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

app.post("/books",(req,res)=>{
    console.log("Request body: ",req.body)
    const title = req.body.title
    const description = req.body.description
    const cover = req.body.cover
    const sqlInsert = "INSERT INTO books (title, description, cover) VALUES (?,?,?)"
    db.query(sqlInsert,[title,description,cover],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book added!")
    })
})

app.listen(8800, ()=>{
    console.log("Backend server is running!")
})