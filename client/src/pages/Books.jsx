import React, { useEffect,useState } from 'react'
import { Link } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([])

  useEffect(() => {
        fetch('http://localhost:8800/books')
        .then(res => res.json())
        .then(books => setBooks(books))
        .catch(error => console.error('Errore durante la fetch:', error));
  },[])

  useEffect(() => {
    console.log(books)
  },[books])

  const handleDelete = (id) => {
    console.log("kd",id)
    fetch(`http://localhost:8800/books/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setBooks(books.filter(book => book.idBook !== id))
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  return (
    <div className='books'>{
        books.map((book, index) => (
            <div key={index} className='book'>
                <h3>{book.title}</h3>
                {book.cover && <img src={book.cover} alt={book.title} />}
                <p>{book.description}</p>
                <p>{book.price}</p>
                <button className='delete' onClick={()=>handleDelete(book.idBook)}>Delete</button>
                <button className='update'>Update</button>
            </div>
        ))
    }
    <button><Link to={"/add"}> Add new book</Link> </button>
    </div>
  )
}

export default Books