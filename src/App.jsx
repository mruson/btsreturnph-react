import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Streaming from './pages/Streaming'
import Donations from './pages/Donations'
import Donors from './pages/Donors'
import Voting from './pages/Voting'
import Concert from './pages/Concert'
import Communities from './pages/Communities'
import Bangtandahan from './pages/Bangtandahan'
import Fanchant from './pages/Fanchant'
import Shop from './pages/Shop'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/streaming" element={<Streaming />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/concert" element={<Concert />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/bangtandahan" element={<Bangtandahan />} />
        <Route path="/fanchant" element={<Fanchant />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
