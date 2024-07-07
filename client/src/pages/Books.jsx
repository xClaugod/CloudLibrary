import React, { useEffect,useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Books = () => {
  const [books, setBooks] = useState([])
  const [username, setUsername] = useState('')
  const [booksCount,setBooksCount] = useState(0)
  const [totalPrice,setTotalPrice] = useState(0)

  const navigate = useNavigate();
  const accessToken = Cookies.get('access_token');
 
  useEffect(() => {
    if (!accessToken) {
      console.error("Login first!")
      navigate('/');
      return;
    }
    fetch('/api/getUserInfo', {
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
            setTotalPrice(data[0].total_price)
            setBooksCount(data[0].book_count)
        })
        .catch(error =>console.error('Error during fetch:', error));
}, []);

  const handleDelete = (id) => {
    console.log("kd",id)
    fetch(`/api/books/${id}`, {
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

  const handleUpdate = (id,title,description,price,cover) => {
    const bookData = {
      title: title,
      description: description,
      price: price,
      cover: cover,
      token: accessToken
    }
    navigate(`/update/${id}`, { state: { bookData } });
  }

  function logout() {
    Cookies.remove('access_token');
    fetch('/api/logout', {
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
    <div className='container'>
      <div className='menu'>
        <div>
          <h2>Welcome back  </h2>
          <h3>{username}</h3>
          <h3>Book counter: {booksCount}</h3>
          <h3>Money spent: €{totalPrice}</h3>
        </div>

        <button className='btnMenu'><Link to={"/add"} className='menuLink'> Add new book</Link> </button>
        <button className='btnMenu' onClick={()=>logout()}>Logout</button>
      </div>
      <div className='books'>{books.map((book, index) => (
        <div key={index} className='book'>
          <h2>{book.title}</h2>
          {book.cover && <img src={book.cover}
 alt={`../../../backend/${book.cover}`} />}
          <p>{book.description}</p>
          <p className='price'>€{book.price}</p>
          <div className='actions'>
          <button className='delete' onClick={() => handleDelete(book.idBook)}>Delete</button>
          <button className='update' onClick={() => handleUpdate(book.idBook,book.title,book.description,book.price,book.cover)}>Update</button>
          </div>
        </div>
        
      ))}
      </div>


    </div>
  )
}

export default Books