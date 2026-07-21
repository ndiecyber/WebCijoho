import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect to respective pages
        const session = JSON.parse(localStorage.getItem('staffSession'));
        if (session) {
            if (session.role === 'admin') {
                navigate('/admin');
            } else if (session.role === 'kasir') {
                navigate('/kasir');
            }
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email dan password wajib diisi.');
            return;
        }

        setIsLoading(true);

        // Simulate network latency
        setTimeout(() => {
            if (email === 'admin@cijoho.com' && password === 'admin123') {
                const sessionData = {
                    email: 'admin@cijoho.com',
                    role: 'admin',
                    name: 'Admin Utama',
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('staffSession', JSON.stringify(sessionData));
                setIsLoading(false);
                navigate('/admin');
            } else if (email === 'kasir@cijoho.com' && password === 'kasir123') {
                const sessionData = {
                    email: 'kasir@cijoho.com',
                    role: 'kasir',
                    name: 'Petugas Kasir 1',
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('staffSession', JSON.stringify(sessionData));
                setIsLoading(false);
                navigate('/kasir');
            } else {
                setIsLoading(false);
                setError('Email atau password salah. Silakan coba lagi.');
            }
        }, 800);
    };

    // Quick-fill credentials for demo purposes
    const quickFill = (role) => {
        if (role === 'admin') {
            setEmail('admin@cijoho.com');
            setPassword('admin123');
        } else {
            setEmail('kasir@cijoho.com');
            setPassword('kasir123');
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-backdrop-decor">
                <div className="decor-circle circle-1"></div>
                <div className="decor-circle circle-2"></div>
            </div>
            
            <div className="login-glass-card fade-in">
                <div className="login-header">
                    <img src="assets/logo.png" alt="Waterboom Logo" className="login-logo-img" />
                    <h2>PORTAL STAF</h2>
                    <p>Waterboom Cijoho Indah</p>
                </div>

                {error && (
                    <div className="login-error-alert animate-bounce-subtle">
                        <i className="fa-solid fa-triangle-exclamation"></i> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group-field">
                        <label htmlFor="email">Email Staf</label>
                        <div className="input-with-icon">
                            <i className="fa-regular fa-envelope"></i>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="nama@cijoho.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="input-group-field">
                        <label htmlFor="password">Kata Sandi</label>
                        <div className="input-with-icon">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                placeholder="Masukkan password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-login-submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="login-spinner"></span> Memproses...
                            </>
                        ) : (
                            <>
                                Masuk Aplikasi <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="quick-login-divider">
                    <span>Demo Akses Cepat</span>
                </div>

                <div className="quick-login-buttons">
                    <button type="button" className="btn-quick-fill admin" onClick={() => quickFill('admin')}>
                        <i className="fa-solid fa-user-shield"></i> Admin
                    </button>
                    <button type="button" className="btn-quick-fill kasir" onClick={() => quickFill('kasir')}>
                        <i className="fa-solid fa-cash-register"></i> Kasir
                    </button>
                </div>

                <div className="login-footer-links">
                    <a href="#/" className="back-to-home-link">
                        <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda Pengunjung
                    </a>
                </div>
            </div>
        </div>
    );
}
