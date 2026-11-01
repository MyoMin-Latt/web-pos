import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ItemsPage from '../features/items/ItemsPage';
import CustomersPage from '../features/customers/CustomersPage';
import PosPage from '../features/invoices/PosPage';
import InvoiceListPage from '../features/invoices/InvoiceListPage';
export default function Router() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<ProtectedRoute><Layout><PosPage /></Layout></ProtectedRoute>} />
    <Route path="/items" element={<ProtectedRoute><Layout><ItemsPage /></Layout></ProtectedRoute>} />
    <Route path="/customers" element={<ProtectedRoute><Layout><CustomersPage /></Layout></ProtectedRoute>} />
    <Route path="/invoices" element={<ProtectedRoute><Layout><InvoiceListPage /></Layout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
