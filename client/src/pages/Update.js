import React, { useState } from 'react'
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
        navigate('/')
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  console.log(book)
  return (
    <div className='form'>
      <h1>Update the book</h1>
      <input type="text" placeholder='title' name="title" onChange={handleChange}/>
      <input type="text" placeholder='description' name="description" onChange={handleChange}/>
      <input type="text" placeholder='price' name="price" onChange={handleChange}/>
      <input type="text" placeholder='cover' name="cover" onChange={handleChange}/>  
      <button onClick={handleClick} className='formButton'>Update</button>
    </div>
  )
}

export default Update