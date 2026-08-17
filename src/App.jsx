
import {Routes, Route, } from 'react-router-dom';
import Login from './pages/login'
import Sobre from "./pages/sobre"
import LayoutSideBar from './components/LayoutSideBar';
import Kanban from './Kanban';
import RotaPrivada from './components/RotaPrivada';
import Modal from "./components/modal"

function App() {
  
  return (
    <>
    
    <Routes>
      <Route path="/" element={<Login />} />
   <Route element={<LayoutSideBar/>}>
   <Route element={<RotaPrivada/>}>
      <Route path="/Dashboard" element={
        <Kanban />} />
        </Route>
      <Route path="/Sobre" element={<Sobre />} />
     </Route>
    </Routes>
    </>
  )
}

export default App;