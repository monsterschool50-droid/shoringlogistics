import Header from './Header'
import Footer from './Footer'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function Layout({ children }) {
  useScrollReveal()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
