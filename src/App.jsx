import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FactoryMap from './components/FactoryMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <FactoryMap></FactoryMap>
    </>
  )
}

export default App
