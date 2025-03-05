import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CharacterLearning from './pages/CharacterLearning'
import PinyinConverter from './pages/PinyinConverter'
import CharacterDictionary from './pages/CharacterDictionary'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character" element={<CharacterLearning />} />
        <Route path="/pinyin" element={<PinyinConverter />} />
        <Route path="/dictionary" element={<CharacterDictionary />} />
      </Routes>
    </Router>
  )
}

export default App
