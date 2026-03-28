import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSvg from '../assets/logo-blue 1.svg';
import './Login.css';

const EyeIcon = ({ show }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {show ? (
            <>
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
            </>
        )}
    </svg>
);

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Token + Password
    const [resetToken, setResetToken] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            if (isForgotPassword) {
                if (resetStep === 1) {
                    const res = await import('../services/api').then(module => module.forgotPassword(email));
                    setSuccessMessage(res.message);
                    if (res.token) {
                        // In a real app we wouldn't show the token, but for this demo/local app we might need it
                        console.log("Reset Token:", res.token);
                    }
                    setResetStep(2);
                } else {
                    await import('../services/api').then(module => module.resetPassword(resetToken, password));
                    setSuccessMessage('Password reset successfully! You can now sign in.');
                    setIsForgotPassword(false);
                    setResetStep(1);
                    setPassword('');
                }
            } else if (isSignUp) {
                await import('../services/api').then(module => module.signup(name, email, password));
                navigate('/weather');
            } else {
                await import('../services/api').then(module => module.login(email, password));
                navigate('/weather');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className='login-container'>
            <div className="login-visual animate-fade-in">
                <div className="visual-circle circle-1"></div>
                <div className="visual-circle circle-2"></div>
                <div className="visual-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                        <img src={logoSvg} alt="SkySense Logo" style={{ width: '80px', height: '80px' }} />
                        <h1 style={{ margin: 0 }}>SkySense</h1>
                    </div>
                    <p>Real-time weather insights with premium precision.</p>
                </div>
            </div>

            <div className="login-form-side animate-fade-in">
                <div className="glass-card login-card">
                    <h2>{isForgotPassword ? "Reset Password" : (isSignUp ? "Create Account" : "Sign In")}</h2>
                    <p className="subtitle">
                        {isForgotPassword
                            ? (resetStep === 1 ? "Enter your email to receive a reset token" : "Enter the token and your new password")
                            : (isSignUp ? "Join our global weather network" : "Continue your weather journey")
                        }
                    </p>
                    {error && <p className="error-msg" style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                    {successMessage && <p className="success-msg" style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</p>}

                    <form onSubmit={handleSubmit}>
                        {isForgotPassword ? (
                            resetStep === 1 ? (
                                <div className="input-group">
                                    <label>Email</label>
                                    <input
                                        id="reset-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="input-group">
                                        <label>Reset Token</label>
                                        <input
                                            id="reset-token"
                                            name="token"
                                            type="text"
                                            required
                                            value={resetToken}
                                            onChange={(e) => setResetToken(e.target.value)}
                                            placeholder="Enter token from console"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>New Password</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                id="new-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                <EyeIcon show={showPassword} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )
                        ) : (
                            <>
                                {isSignUp && (
                                    <div className="input-group">
                                        <label>Name</label>
                                        <input
                                            id="login-name"
                                            name="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                )}
                                <div className="input-group">
                                    <label>Email</label>
                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeIcon show={showPassword} />
                                        </button>
                                    </div>
                                </div>
                                {!isSignUp && (
                                    <p className="forgot-password" onClick={() => { setIsForgotPassword(true); setResetStep(1); setError(''); setSuccessMessage(''); }}>
                                        Forgot Password?
                                    </p>
                                )}
                            </>
                        )}

                        <button type="submit" className="submit-btn">
                            {isForgotPassword ? (resetStep === 1 ? "Get Token" : "Reset Password") : (isSignUp ? "Get Started" : "Sign In")}
                        </button>

                        {isForgotPassword && (
                            <button type="button" className="text-btn" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '1rem', width: '100%', fontSize: '0.9rem' }} onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMessage(''); }}>
                                Back to Login
                            </button>
                        )}
                    </form>

                    <p className="toggle-text">
                        {isSignUp ? "Already a member? " : "New to SkySense? "}
                        <span onClick={() => setIsSignUp(!isSignUp)}>
                            {isSignUp ? "Sign In" : "Create Account"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
