import React, { useEffect,useState } from 'react'
import { Link } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([])

  useEffect(() => {
        fetch('http://localhost:8800/books')
        .then(res => res.json())
        .then(books => setBooks(books))
        .catch(error => console.error('Errore durante la fetch:', error));

  } 
    , [])

  useEffect(() => {
    console.log(books)
  } 
    , [books])
  return (
    <div className='books'>{
        books.map((book, index) => (
            <div key={index} className='book'>
                <h3>{book.title}</h3>
                {book.cover && <img src={book.cover} alt={book.title} />}
                <p>{book.description}</p>
                <p>{book.price}</p>
            </div>
        ))
    }
    <button><Link to={"/add"}> Add new book</Link> </button>
    </div>
  )
}

export default Books