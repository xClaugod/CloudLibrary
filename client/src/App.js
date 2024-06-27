import Add from './pages/Add';
import Books from './pages/Books';
import Update from './pages/Update';
import style from './style.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Books />} />
          <Route path="/add" element={<Add />} />
          <Route path="/update/:idBook" element={<Update />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
