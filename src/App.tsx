import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CharacterLearning from './pages/CharacterLearning'
import PinyinConverter from './pages/PinyinConverter'
import CharacterDictionary from './pages/CharacterDictionary'
import Chat from './pages/Chat'
import ChineseIdiomGame from './pages/ChineseIdiomGame'
import ChineseIdiomPuzzle from './pages/ChineseIdiomPuzzle'

const router = {
  future: {
    v7_startTransition: true,
  },
};

function App() {
  return (
    <Router {...router}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character" element={<CharacterLearning />} />
        <Route path="/pinyin" element={<PinyinConverter />} />
        <Route path="/dictionary" element={<CharacterDictionary />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/game" element={<ChineseIdiomGame />} />
        <Route path="/idiom-puzzle" element={<ChineseIdiomPuzzle />} />
      </Routes>
    </Router>
  )
}

export default App
