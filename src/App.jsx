import { useState } from 'react'
import './App.css'

import Synth from './pages/Synth'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
     <Synth/>
    </div>
  )
}

export default App
