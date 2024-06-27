import express from "express"
import mysql from "mysql2"
import dotenv from "dotenv"
import cors from "cors"
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

app.post("/books",(req,res)=>{
    console.log("Request body: ",req.body)
    const title = req.body.title
    const description = req.body.description
    const cover = req.body.cover
    const price = req.body.price
    const sqlInsert = "INSERT INTO books (title, description, cover, price) VALUES (?,?,?,?)"
    db.query(sqlInsert,[title,description,cover,price],(err,result)=>{
        if(err) return res.json(err)
        return res.json("Book added!")
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

app.listen(8800, ()=>{
    console.log("Backend server is running!")
})