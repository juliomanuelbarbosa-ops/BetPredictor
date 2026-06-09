import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';

// Components
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Stores
import { useUserStore } from './stores/userStore';
import { useUIStore } from './stores/uiStore';

// Lazy loaded modes
const OracleMode = React.lazy(() => import('./components/OracleMode').then(m => ({ default: m.OracleMode })));
const UpcomingMode = React.lazy(() => import('./components/UpcomingMode').then(m => ({ default: m.UpcomingMode })));
const BettingMode = React.lazy(() => import('./components/BettingMode').then(m => ({ default: m.BettingMode })));
const MarketTrendsMode = React.lazy(() => import('./components/MarketTrendsMode').then(m => ({ default: m.MarketTrendsMode })));
const AccumulatorBuilder = React.lazy(() => import('./components/AccumulatorBuilder').then(m => ({ default: m.AccumulatorBuilder })));
const PerformanceMode = React.lazy(() => import('./components/PerformanceMode').then(m => ({ default: m.PerformanceMode })));
const CalculatorsMode = React.lazy(() => import('./components/CalculatorsMode').then(m => ({ default: m.CalculatorsMode })));
const LocalAgentMode = React.lazy(() => import('./components/LocalAgentMode').then(m => ({ default: m.LocalAgentMode })));
const SettingsMode = React.lazy(() => import('./components/SettingsMode').then(m => ({ default: m.SettingsMode })));
const WorldCupMode = React.lazy(() => import('./components/WorldCupMode').then(m => ({ default: m.WorldCupMode })));

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

const AppRoutes = () => {
    const location = useLocation();
    
    return (
        <Layout>
            <AnimatePresence mode="wait">
                <React.Suspense fallback={<LoadingScreen step="Loading Module..." />}>
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Navigate to="/oracle" replace />} />
                        <Route path="/oracle" element={<PageWrapper><OracleMode /></PageWrapper>} />
                        <Route path="/upcoming" element={<PageWrapper><UpcomingMode /></PageWrapper>} />
                        <Route path="/betting" element={<PageWrapper><BettingMode /></PageWrapper>} />
                        <Route path="/trends" element={<PageWrapper><MarketTrendsMode /></PageWrapper>} />
                        <Route path="/accumulator" element={<PageWrapper><AccumulatorBuilder /></PageWrapper>} />
                        <Route path="/performance" element={<PageWrapper><PerformanceMode /></PageWrapper>} />
                        <Route path="/calculators" element={<PageWrapper><CalculatorsMode /></PageWrapper>} />
                        <Route path="/agent" element={<PageWrapper><LocalAgentMode /></PageWrapper>} />
                        <Route path="/settings" element={<PageWrapper><SettingsMode /></PageWrapper>} />
                        <Route path="/worldcup" element={<PageWrapper><WorldCupMode /></PageWrapper>} />
                        <Route path="*" element={<Navigate to="/oracle" replace />} />
                    </Routes>
                </React.Suspense>
            </AnimatePresence>
        </Layout>
    );
};

export default function App() {
    const { user, loading: userLoading, theme, setUser, setAuthReady } = useUserStore();
    const { isLoading, toast } = useUIStore();

    useEffect(() => {
        setUser({ uid: 'local-user', displayName: 'Local User', email: 'user@local.local', photoURL: '' } as any);
        setAuthReady(true);
    }, [setUser, setAuthReady]);

    useEffect(() => {
        if (theme === 'amoled') {
            document.body.classList.add('amoled');
        } else {
            document.body.classList.remove('amoled');
        }
    }, [theme]);

    if (userLoading) {
        return <LoadingScreen step="Initializing SPARTA..." />;
    }

    if (!user) {
        return (
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <Login />
                    {toast && <Toast message={toast.message} type={toast.type} />}
                </QueryClientProvider>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AppRoutes />
                    {isLoading && <LoadingScreen step="Processing..." />}
                    {toast && <Toast message={toast.message} type={toast.type} />}
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
