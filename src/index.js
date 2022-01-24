import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import 'antd/dist/antd.css';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import TokeIdComponent from './TokeIdComponent';
ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode >
      <Routes>
        <Route path='/' element={<App />} />
        <Route path=':tokenId' element={<TokeIdComponent />} />
      </Routes>

      {/* <App /> */}
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root')
)
