import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WSProvider } from './context/WSContext';
import { NotifProvider } from './context/NotifContext';
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import DocumentsPage from './pages/DocumentsPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <WSProvider>
      <NotifProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </NotifProvider>
    </WSProvider>
  );
}
