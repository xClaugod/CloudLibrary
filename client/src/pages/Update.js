import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const Update = () => {
  const[book,setBook] = useState({
    title:"",
    description:"",
    price: null,
    cover:""
  });


  const navigate = useNavigate();
  const location = useLocation();
  const bookId = location.pathname.split('/').pop()

  console.log(location)

  useEffect(() => {
    setBook({
      title:location.state.bookData.title,
      description:location.state.bookData.description,
      price:location.state.bookData.price,
      cover:location.state.bookData.cover
    })
  },[])

  useEffect(() => {
    console.log(book)
  }
  ,[book])

  const handleChange = (e) => {
    setBook((prev)=>({
      ...prev,
      [e.target.name]: e.target.value

    }));
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
    <form>
      <h1>Update the book</h1>
        <input type="text" placeholder='title' value={book?.title} name="title" onChange={handleChange}/>
        <input type="text" placeholder='description' value={book.description} name="description" onChange={handleChange}/>
        <input type="text" placeholder='price' value={book.price} name="price" onChange={handleChange}/>
        <input type="text" placeholder='cover' value={book.cover} name="cover" onChange={handleChange}/>      
    <button onClick={handleClick} className='formButton'>Update</button>
    </form>
  )
}

export default Update