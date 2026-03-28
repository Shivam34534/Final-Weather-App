import React, { useState, useEffect } from 'react';

const ProfilePage = ({ userProfile, onSaveProfile, startEditing = false, onBack }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        phone: '',
        address: '',
        location: '',
        password: ''
    });

    const [isEditing, setIsEditing] = useState(startEditing);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setFormData({ ...formData, ...userProfile });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveProfile(formData);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px',
                            borderRadius: '50%', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>My Profile</h2>
                </div>
                {!isEditing && (
                    <button
                        className="btn-primary"
                        onClick={() => setIsEditing(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div style={{
                    padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7',
                    borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', fontWeight: 700, color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{formData.fullName || 'User Name'}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{formData.username || '@username'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email / Location</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="e.g. New York, USA"
                            value={formData.location || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="********"
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px',
                                color: 'white', opacity: isEditing ? 1 : 0.7
                            }}
                        />
                    </div>

                    {isEditing && (
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    flex: 1, padding: '12px', background: 'var(--accent-primary)',
                                    color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setFormData(userProfile || {}); }}
                                style={{
                                    flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)',
                                    color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
