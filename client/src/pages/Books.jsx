import React, { useEffect,useState } from 'react'

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
    <div>Books</div>
  )
}

export default Books