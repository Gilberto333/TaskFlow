import Sidebar from './SideBar';
import { Outlet } from 'react-router-dom';
function LayoutSideBar(){
return(
    <>
<Sidebar/>
<Outlet/>
</>
)
}
export default LayoutSideBar;