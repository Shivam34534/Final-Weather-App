import React, { useRef, useState } from 'react';
import logoSvg from '../assets/logo-blue 1.svg';

const Header = ({ userName, onSearch, openProfile, onLogout, onLocationClick }) => {
    const inputRef = useRef();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSearch(inputRef.current.value);
            inputRef.current.value = "";
        }
    };

    return (
        <header className="header animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
                <img src={logoSvg} alt="SkySense Logo" style={{ width: '40px', height: '40px' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>SkySense</span>
            </div>

            <div className="search-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                    id="header-search-input"
                    name="search"
                    ref={inputRef}
                    type="text"
                    placeholder="Search for cities..."
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="header-actions">
                <button className="location-btn" onClick={onLocationClick} title="Use My Location">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </button>

                <div className="profile-container" style={{ position: 'relative' }}>
                    <div className="profile-section" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <div className="profile-avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="profile-name">{userName}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', opacity: 0.6 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>

                    {isDropdownOpen && (
                        <div className="glass-card dropdown-menu">
                            <button className="dropdown-item logout" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); onLogout(); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Logout
                            </button>
                            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); openProfile(); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    width: 180px;
                    padding: 8px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    animation: fadeIn 0.2s ease-out;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    width: 100%;
                    text-align: left;
                }
                .dropdown-item:hover {
                    background: var(--glass-hover);
                }
                .dropdown-item.logout {
                    color: #ef4444;
                }
                .dropdown-item.logout:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
            `}} />
        </header>
    );
};

export default Header;
