import React, { useEffect,useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Books = () => {
  const [books, setBooks] = useState([])
  const [username, setUsername] = useState('')

  const navigate = useNavigate();
  const accessToken = Cookies.get('access_token');
 
  useEffect(() => {

    fetch('http://localhost:8800/getUserInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    })
        .then(response => response.json())
        .then(data => {
            setUsername(data[0].username);
            data[0].idBook &&
            setBooks(data.map(item => ({
                idBook: item.idBook,
                title: item.title,
                description: item.description,
                price: item.price,
                cover: item.cover
            })));
        })
        .catch(error => console.error('Error during fetch:', error));
}, []);


  useEffect(() => {
    //console.log(books)
  },[books])

  useEffect(() => {
    console.log(username)
  },[username])

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

  function logout() {
    fetch('http://localhost:8800/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    })
        .then(response =>  console.log(response.json()))
        .then(navigate('/'))
        .catch(error => console.error('Error during fetch:', error));
  }
  
  return (
    <div>
      <p>Welcome {username} </p>
      <div className='books'>{books.map((book, index) => (
        <div key={index} className='book'>
          <h3>{book.title}</h3>
          {book.cover && <img src={`../../../backend/${book.cover}`} alt={`../../../backend/${book.cover}`} />}
          <p>{book.description}</p>
          <p>{book.price}</p>
          <button className='delete' onClick={() => handleDelete(book.idBook)}>Delete</button>
          <button className='update'><Link to={`/update/${book.idBook}`}>Update</Link></button>
        </div>
      ))}
      </div>
      <button><Link to={"/add"}> Add new book</Link> </button>
      <button onClick={()=>logout()}>Logout</button>

    </div>
  )
}

export default Books