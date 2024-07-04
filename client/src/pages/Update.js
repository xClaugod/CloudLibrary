import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const Update = () => {
  const[book,setBook] = useState({
    id: null,
    title:"",
    description:"",
    price: null,
  });

  const[cover,setCover] = useState(null);
  const[check,setCheck] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const bookId = location.pathname.split('/').pop()

  console.log(location)

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
    console.log("location.state",location.state)
    setBook({
      id:bookId,
      title:location.state.bookData.title,
      description:location.state.bookData.description,
      price:location.state.bookData.price,
    })
  },[])

  const handleChange = (e) => {
    setBook((prev)=>({
      ...prev,
      [e.target.name]: e.target.value

    }));
  };

  const handleClick = e => {
    e.preventDefault(); 
    if(check){
      const formData = new FormData();
      formData.append('title', book.title);
      formData.append('description', book.description);
      formData.append('price', book.price);
      formData.append('cover', cover);
  
      fetch(`/api/booksWithImage/${bookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${location.state.bookData.token}`,
        },
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          navigate('/books')
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }else{
      fetch(`/api/books/${bookId}`, {
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

  }

  const handleFileUpload = (event) => {
    setCheck(true)
    const file = event.target.files[0];
    setCover(file);
  };

  return (
    <form>
      <h1>Update the book</h1>
        <input type="text" placeholder='title' value={book?.title} name="title" onChange={handleChange}/>
        <input type="text" placeholder='description' value={book.description} name="description" onChange={handleChange}/>
        <input type="text" placeholder='price' value={book.price} name="price" onChange={handleChange}/>
        <input type="file" name='cover'  onChange={handleFileUpload} />
        <button onClick={handleClick} className='formButton'>Update</button>
    </form>
  )
}

export default Update