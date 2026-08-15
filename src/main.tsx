import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { asset, routerBasename } from './asset.ts'
import Home from './App.tsx'
import Signup from './Signup.tsx'
import SignIn from './SignIn.tsx'
import Admin from './Admin.tsx'
import DashboardLayout from './DashboardLayout.tsx'
import DashboardHome from './DashboardHome.tsx'
import JobsHome from './Jobs.tsx'
import Applications from './Applications.tsx'
import Team from './Team.tsx'
import About from './About.tsx'
import Account from './Account.tsx'
import Help from './Help.tsx'

document.documentElement.style.setProperty(
  '--dash-bg-image',
  `url('${asset('images/dash-bg.jpg')}')`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/jobs" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="positions" element={<JobsHome />} />
          <Route path="applications" element={<Applications />} />
          <Route path="team" element={<Team />} />
          <Route path="about" element={<About />} />
          <Route path="account" element={<Account />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
