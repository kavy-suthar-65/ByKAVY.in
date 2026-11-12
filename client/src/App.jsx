import { useEffect } from 'react';
import { useRoutes, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import routes from './router';

export default function App() {
  const routeElements = useRoutes(routes);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/kavy-admin-x7');

  // Ensure body scroll is always unlocked and window resets on route change
  useEffect(() => {
    document.body.classList.remove('scroll-locked');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {isAdmin ? (
              <>
                {routeElements}
                <WhatsAppButton />
              </>
            ) : (
              <div className="page">
                <Header />
                <main className="page__content">
                  {routeElements}
                </main>
                <Footer />
                <CartDrawer />
                <WhatsAppButton />
              </div>
            )}
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
