import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const Update = () => {
  const[book,setBook] = useState({
    title:"",
    description:"",
    price: null,
    cover:""
  });

  const[isLoading,setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const bookId = location.pathname.split('/').pop()

  useEffect(() => {
    fetch(`http://localhost:8800/books/${bookId}`)
    .then(res => res.json())
    .then(book => setBook(book))
    .catch(error => console.error('Error during fetch:', error));
  },[])

  const handleChange = (e) => {
    setBook((prev)=>({
      ...prev,
      [e.target.name]: e.target.value

    }));
    setIsLoading(false);
  };

  const handleClick = e => {
    e.preventDefault(); 
    fetch(`http://localhost:8800/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        navigate('/books')
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <div className='form'>
      <h1>Update the book</h1>
      {
        !isLoading? 
        <>
          <input type="text" placeholder='title' value={book?.title} name="title" onChange={handleChange}/>
          <input type="text" placeholder='description' value={book.description} name="description" onChange={handleChange}/>
          <input type="text" placeholder='price' value={book.price} name="price" onChange={handleChange}/>
          <input type="text" placeholder='cover' value={book.cover} name="cover" onChange={handleChange}/>
        </>
        :
        <p>Loading...</p>
      }
      <button onClick={handleClick} className='formButton'>Update</button>
    </div>
  )
}

export default Update