import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Login from './Login.jsx';
import LinkedInSearch from './LinkedinSearch.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/linkedin-search",
    element: <LinkedInSearch />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
