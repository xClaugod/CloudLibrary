import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Add = () => {
  const[book,setBook] = useState({
    title:"",
    description:"",
    price: null,
  });

  const[cover,setCover] = useState(null);

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      navigate('/');
    }
  }, []);

  useEffect(()=>{
    console.log("change book",book)
  },[book])

  useEffect(()=>{
    console.log("change cover",cover)
  },[cover])

  useEffect(() => {
      if(!book || !cover) document.getElementById("btnUpload").disabled = true;
      else document.getElementById("btnUpload").disabled = false;
  }, [book, cover]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    console.log("camhiato")
    setBook((prev)=>({
      ...prev,
      [e.target.name]: e.target.value

    }));
  };

  const handleClick = e => {
    console.log("click")
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      return;
    }
    e.preventDefault(); 
    const formData = new FormData();
    formData.append('title', book.title);
    formData.append('description', book.description);
    formData.append('price', book.price);
    formData.append('cover', cover);

    fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setCover(file);
  };
  

  return (
    <form>
      <h1>Add new book</h1>
      <input type="text" placeholder='title' required name="title" onChange={handleChange}/>
      <input type="text" placeholder='description' required name="description" onChange={handleChange}/>
      <input type="text" placeholder='price' required name="price" onChange={handleChange}/>
      <input type="file" name='cover' required onChange={handleFileUpload} />
      <button onClick={handleClick} id="btnUpload" className='formButton'>Add</button>
    </form>
  )
}

export default Add