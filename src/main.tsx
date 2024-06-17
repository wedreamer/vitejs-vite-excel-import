import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import DemoImport from './Demo.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import './index.css'
import { PageContainer } from '@ant-design/pro-components'

const router = createBrowserRouter([
  {
    path: '/import-demo/:hash',
    element: (
      <PageContainer>
        <DemoImport />
      </PageContainer>
    ),
  },
  {
    path: '/',
    element: <App />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


