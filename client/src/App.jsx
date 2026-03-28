import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
    return (
        <div className='app'>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/weather" element={<Dashboard />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
