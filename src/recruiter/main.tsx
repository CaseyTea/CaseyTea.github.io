import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RecruiterPage } from './RecruiterPage'
import '../styles/recruiter.css'

createRoot(document.getElementById('root')!).render(<StrictMode><RecruiterPage /></StrictMode>)
