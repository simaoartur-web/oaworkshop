import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Placeholder empty pages for routing structure
const Projects = () => <div className="min-h-screen pt-24"><div className="container-custom"><h2>Projects Working</h2></div></div>;
const Admin = () => <div className="min-h-screen pt-24"><div className="container-custom"><h2>Admin Panel Working</h2></div></div>;

function App() {
    return (
        <div className="flex flex-col min-h-screen bg-black-900 text-white">
            <Header />

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<Projects />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App
