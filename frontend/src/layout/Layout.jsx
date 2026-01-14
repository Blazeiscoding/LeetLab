import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

const Layout = () => {
  return (
    <div>
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  )
}

export default Layout