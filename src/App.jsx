import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import CarDetailsPage from './pages/CarDetailsPage'
import ContactsPage from './pages/ContactsPage'
import AdminPage from './pages/AdminPage'
import PartsCatalogPage from './pages/PartsCatalogPage'
import PartDetailsPage from './pages/PartDetailsPage'
import DeliveryPriceListPage from './pages/DeliveryPriceListPage'
import DamagedStockTabs from './components/catalog/DamagedStockTabs.jsx'
import { CAR_SECTION_CONFIG } from './lib/catalogSections.js'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/delivery-price-list" element={<Layout><DeliveryPriceListPage /></Layout>} />
        <Route path="/catalog" element={<Layout><CatalogPage section={CAR_SECTION_CONFIG.main} /></Layout>} />
        <Route path="/catalog/:id" element={<Layout><CarDetailsPage section={CAR_SECTION_CONFIG.main} /></Layout>} />
        <Route path="/urgent-sale" element={<Layout><CatalogPage section={CAR_SECTION_CONFIG.urgent} /></Layout>} />
        <Route path="/urgent-sale/:id" element={<Layout><CarDetailsPage section={CAR_SECTION_CONFIG.urgent} /></Layout>} />
        <Route
          path="/damaged-stock"
          element={<Layout><CatalogPage section={CAR_SECTION_CONFIG.damaged} introContent={<DamagedStockTabs active="cars" />} /></Layout>}
        />
        <Route
          path="/damaged-stock/:id"
          element={<Layout><CarDetailsPage section={CAR_SECTION_CONFIG.damaged} /></Layout>}
        />
        <Route
          path="/damaged-stock/parts"
          element={<Layout><PartsCatalogPage introContent={<DamagedStockTabs active="parts" />} /></Layout>}
        />
        <Route
          path="/damaged-stock/parts/:id"
          element={<Layout><PartDetailsPage introContent={<DamagedStockTabs active="parts" />} /></Layout>}
        />
        <Route path="/contacts" element={<Layout><ContactsPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
