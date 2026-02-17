import React from 'react'
import { Route, Routes} from'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages'
import RemoveBg from './pages/RemoveBg'
import RemoveObject from './pages/RemoveObject'
import Community from './pages/Community'
import ReviewResume from './pages/PdfSummary'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import {Toaster} from 'react-hot-toast'
import PdfSummary from './pages/PdfSummary'
const App = () => {

  return (
    <div>
      <Toaster/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/ai' element={<Layout/>}>
        <Route index element={<Dashboard/>} />
        <Route path='write-artical' element={<WriteArticle/>} />
        <Route path='blog-titles' element={<BlogTitles/>} />
        <Route path='generate-images' element={<GenerateImages/>} />
        <Route path='remove-background' element={<RemoveBg/>} />
        <Route path='remove-object' element={<RemoveObject/>} />
        <Route path='pdf-summary' element={<PdfSummary/>} />
        <Route path="community" element={<Community/>} />
        </Route>
        </Routes>
    </div>
  )
}

export default App