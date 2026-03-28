
import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const SettingsPage = ({ onLogout, userName, userProfile, openProfile, settings, setSettings, initialSection = 'units' }) => {
    // State is now managed by Dashboard parent component

    // Fallback if accessed directly (though unlikely in this architecture)
    if (!settings || !setSettings) {
        return <div style={{ padding: '20px' }}>Loading settings...</div>;
    }

    const [activeSection, setActiveSection] = useState(initialSection);

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const updateNestedSetting = (category, parentKey, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [parentKey]: {
                    ...prev[category][parentKey],
                    [key]: value
                }
            }
        }));
    };

    // Security State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [is2FA, setIs2FA] = useState(false); // Ideally loaded from userProfile

    const handlePasswordChange = (field, value) => {
        setPasswords(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdatePassword = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            alert("Please fill in all password fields.");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match!");
            return;
        }
        if (passwords.new.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        try {
            await api.changePassword(passwords.current, passwords.new);
            alert("Password updated successfully!");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
            alert("Failed to update password. Please check your current password.");
        }
    };

    const handleToggle2FA = async () => {
        const newState = !is2FA;
        setIs2FA(newState); // Optimistic update
        try {
            await api.toggle2FA(newState);
            alert(newState ? "2FA Enabled!" : "2FA Disabled!");
        } catch (error) {
            setIs2FA(!newState); // Revert on failure
            console.error(error);
            alert("Failed to update 2FA settings.");
        }
    };

    const handleBackup = () => {
        const data = {
            userProfile,
            settings,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skysense-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const Section = ({ title, id, icon }) => (
        <button
            onClick={() => setActiveSection(id)}
            style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                background: activeSection === id ? 'var(--glass-hover)' : 'transparent',
                border: 'none',
                borderLeft: activeSection === id ? '4px solid var(--accent-primary)' : '4px solid transparent',
                color: activeSection === id ? 'white' : 'var(--text-secondary)',
                fontWeight: activeSection === id ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            {title}
        </button>
    );

    const Select = ({ value, onChange, options, id, name }) => (
        <select
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                background: 'var(--bg-tertiary)',
                color: 'white',
                border: '1px solid var(--glass-border)',
                padding: '8px 12px',
                borderRadius: '8px',
                outline: 'none',
                minWidth: '120px'
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );

    const Toggle = ({ active, onToggle }) => (
        <div
            onClick={onToggle}
            style={{
                width: '46px',
                height: '24px',
                background: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderRadius: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.3s',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: active ? '24px' : '2px',
                transition: '0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
        </div>
    );

    const SettingRow = ({ label, description, control }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ paddingRight: '1rem' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{label}</div>
                {description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{description}</div>}
            </div>
            {control}
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', gap: '2rem' }}>
            <div className="glass-card" style={{ width: '250px', flexShrink: 0, padding: '1rem 0', height: 'fit-content' }}>
                <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Section title="Units" id="units" icon="📏" />
                    <Section title="Notifications" id="notifications" icon="🔔" />
                    <Section title="Data & Source" id="data" icon="📡" />
                    <Section title="Appearance" id="appearance" icon="🎨" />
                    <Section title="Privacy" id="privacy" icon="🛡️" />
                    <Section title="Lifestyle" id="health" icon="❤️" />
                    <Section title="Account" id="account" icon="👤" />
                </div>
            </div>

            <div className="glass-card" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeSection === 'units' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Unit Customization</h3>
                        <SettingRow
                            label="Temperature"
                            control={<Select
                                id="unit-temp"
                                name="unit-temp"
                                value={settings.units.temp}
                                onChange={(v) => updateSetting('units', 'temp', v)}
                                options={[
                                    { value: 'c', label: 'Celsius (°C)' },
                                    { value: 'f', label: 'Fahrenheit (°F)' },
                                    { value: 'k', label: 'Kelvin (K)' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Wind Speed"
                            control={<Select
                                id="unit-wind"
                                name="unit-wind"
                                value={settings.units.wind}
                                onChange={(v) => updateSetting('units', 'wind', v)}
                                options={[
                                    { value: 'mph', label: 'Miles per hour (mph)' },
                                    { value: 'kmh', label: 'Kilometers per hour (km/h)' },
                                    { value: 'ms', label: 'Meters per second (m/s)' },
                                    { value: 'knots', label: 'Knots' },
                                    { value: 'beaufort', label: 'Beaufort Scale' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Precipitation"
                            control={<Select
                                id="unit-precip"
                                name="unit-precip"
                                value={settings.units.precip}
                                onChange={(v) => updateSetting('units', 'precip', v)}
                                options={[
                                    { value: 'mm', label: 'Millimeters (mm)' },
                                    { value: 'in', label: 'Inches (in)' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Pressure"
                            control={<Select
                                id="unit-pressure"
                                name="unit-pressure"
                                value={settings.units.pressure}
                                onChange={(v) => updateSetting('units', 'pressure', v)}
                                options={[
                                    { value: 'hpa', label: 'Hectopascals (hPa)' },
                                    { value: 'mbar', label: 'Millibars (mbar)' },
                                    { value: 'inhg', label: 'Inches of Mercury (inHg)' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Distance / Visibility"
                            control={<Select
                                id="unit-dist"
                                name="unit-dist"
                                value={settings.units.distance}
                                onChange={(v) => updateSetting('units', 'distance', v)}
                                options={[
                                    { value: 'km', label: 'Kilometers (km)' },
                                    { value: 'mi', label: 'Miles (mi)' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Time Format"
                            control={<Select
                                id="unit-time"
                                name="unit-time"
                                value={settings.units.time}
                                onChange={(v) => updateSetting('units', 'time', v)}
                                options={[
                                    { value: '12h', label: '12-hour (AM/PM)' },
                                    { value: '24h', label: '24-hour' }
                                ]}
                            />}
                        />
                    </>
                )}

                {activeSection === 'notifications' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Notification Control</h3>
                        <SettingRow
                            label="Severe Weather Alerts"
                            description="Government issued warnings for tornadoes, floods, etc."
                            control={<Toggle active={settings.notifications.severe} onToggle={() => updateSetting('notifications', 'severe', !settings.notifications.severe)} />}
                        />
                        <SettingRow
                            label="Precipitation Nowcasts"
                            description="Alerts when rain is starting in next 60 mins."
                            control={<Toggle active={settings.notifications.nowcast} onToggle={() => updateSetting('notifications', 'nowcast', !settings.notifications.nowcast)} />}
                        />
                        <SettingRow
                            label="Daily Summaries"
                            control={<Select
                                id="notif-summary"
                                name="notif-summary"
                                value={settings.notifications.summary}
                                onChange={(v) => updateSetting('notifications', 'summary', v)}
                                options={[
                                    { value: 'off', label: 'Off' },
                                    { value: 'morning', label: 'Morning Only' },
                                    { value: 'evening', label: 'Evening Only' },
                                    { value: 'both', label: 'Morning & Evening' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Do Not Disturb"
                            description="Silence non-emergency alerts during sleep hours."
                            control={<Toggle active={settings.notifications.dnd} onToggle={() => updateSetting('notifications', 'dnd', !settings.notifications.dnd)} />}
                        />
                    </>
                )}

                {activeSection === 'data' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Data & Source</h3>
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Note: Some providers may require a premium subscription.
                        </div>
                        <SettingRow
                            label="Forecast Provider"
                            control={<Select
                                id="data-provider"
                                name="data-provider"
                                value={settings.data.provider}
                                onChange={(v) => updateSetting('data', 'provider', v)}
                                options={[
                                    { value: 'open-meteo', label: 'Open-Meteo (Default)' },
                                    { value: 'apple', label: 'Apple Weather' },
                                    { value: 'accuweather', label: 'AccuWeather' },
                                    { value: 'noaa', label: 'NOAA (US Only)' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Background Refresh"
                            description="Update data periodically while app is closed."
                            control={<Toggle active={settings.data.bgRefresh} onToggle={() => updateSetting('data', 'bgRefresh', !settings.data.bgRefresh)} />}
                        />
                        <SettingRow
                            label="Update Frequency"
                            control={<Select
                                id="data-freq"
                                name="data-freq"
                                value={settings.data.updateFreq}
                                onChange={(v) => updateSetting('data', 'updateFreq', v)}
                                options={[
                                    { value: 'manual', label: 'Manual Only' },
                                    { value: '15min', label: 'Every 15 min' },
                                    { value: 'hourly', label: 'Every Hour' }
                                ]}
                            />}
                        />
                    </>
                )}

                {activeSection === 'appearance' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Appearance</h3>
                        <SettingRow
                            label="Theme"
                            control={<Select
                                id="app-theme"
                                name="app-theme"
                                value={settings.appearance.theme}
                                onChange={(v) => updateSetting('appearance', 'theme', v)}
                                options={[
                                    { value: 'dark', label: 'Dark Mode' },
                                    { value: 'light', label: 'Light Mode' },
                                    { value: 'system', label: 'System Default' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Dynamic Backgrounds"
                            description="Background changes based on current weather."
                            control={<Toggle active={settings.appearance.dynamicBg} onToggle={() => updateSetting('appearance', 'dynamicBg', !settings.appearance.dynamicBg)} />}
                        />
                        <SettingRow
                            label="App Icon"
                            control={<div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: settings.appearance.iconParams === 'default' ? '2px solid white' : 'none', cursor: 'pointer' }} onClick={() => updateSetting('appearance', 'iconParams', 'default')}></div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1e293b', border: settings.appearance.iconParams === 'dark' ? '2px solid white' : 'none', cursor: 'pointer' }} onClick={() => updateSetting('appearance', 'iconParams', 'dark')}></div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #f97316, #ef4444)', border: settings.appearance.iconParams === 'sunset' ? '2px solid white' : 'none', cursor: 'pointer' }} onClick={() => updateSetting('appearance', 'iconParams', 'sunset')}></div>
                            </div>}
                        />
                    </>
                )}

                {activeSection === 'privacy' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Privacy & Location</h3>
                        <SettingRow
                            label="Location Access"
                            control={<Select
                                id="priv-loc"
                                name="priv-loc"
                                value={settings.privacy.locationAccess}
                                onChange={(v) => updateSetting('privacy', 'locationAccess', v)}
                                options={[
                                    { value: 'always', label: 'Always' },
                                    { value: 'while-using', label: 'While Using App' },
                                    { value: 'fixed', label: 'Fixed City Only' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Precise Location"
                            description="Use exact coordinates for hyperlocal accuracy."
                            control={<Toggle active={settings.privacy.preciseLocation} onToggle={() => updateSetting('privacy', 'preciseLocation', !settings.privacy.preciseLocation)} />}
                        />
                        <SettingRow
                            label="Share Diagnostics"
                            description="Help us improve by sharing anonymized data."
                            control={<Toggle active={settings.privacy.shareData} onToggle={() => updateSetting('privacy', 'shareData', !settings.privacy.shareData)} />}
                        />
                    </>
                )}

                {activeSection === 'health' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Lifestyle & Health</h3>
                        <SettingRow
                            label="Activity Profile"
                            description="Highlight metrics relevant to your hobbies."
                            control={<Select
                                id="life-activity"
                                name="life-activity"
                                value={settings.health.activity}
                                onChange={(v) => updateSetting('health', 'activity', v)}
                                options={[
                                    { value: 'default', label: 'Default' },
                                    { value: 'running', label: 'Running' },
                                    { value: 'basketball', label: 'Basketball' },
                                    { value: 'cycling', label: 'Cycling' },
                                    { value: 'boating', label: 'Boating' },
                                    { value: 'gardening', label: 'Gardening' },
                                    { value: 'hiking', label: 'Hiking' },
                                    { value: 'fishing', label: 'Fishing' },
                                    { value: 'yoga', label: 'Yoga' },
                                    { value: 'stargazing', label: 'Stargazing' }
                                ]}
                            />}
                        />
                        <SettingRow
                            label="Haptic Feedback"
                            description="Vibrate on user interactions and alerts."
                            control={<Toggle active={settings.health.haptic} onToggle={() => updateSetting('health', 'haptic', !settings.health.haptic)} />}
                        />

                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Pollen Tracking</div>
                            <SettingRow
                                label="Tree Pollen"
                                control={<Toggle active={settings.health.pollen.tree} onToggle={() => updateNestedSetting('health', 'pollen', 'tree', !settings.health.pollen.tree)} />}
                            />
                            <SettingRow
                                label="Grass Pollen"
                                control={<Toggle active={settings.health.pollen.grass} onToggle={() => updateNestedSetting('health', 'pollen', 'grass', !settings.health.pollen.grass)} />}
                            />
                            <SettingRow
                                label="Ragweed Pollen"
                                control={<Toggle active={settings.health.pollen.ragweed} onToggle={() => updateNestedSetting('health', 'pollen', 'ragweed', !settings.health.pollen.ragweed)} />}
                            />
                        </div>
                    </>
                )}

                {activeSection === 'account' && (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>Account</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                            <div
                                onClick={() => openProfile(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}
                            >
                                <div className="profile-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>{userName.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{userName}</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{userProfile?.username || '@username'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => openProfile(true)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', background: 'var(--glass-hover)',
                                    color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer'
                                }}
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setActiveSection('subscription')}
                                className="btn-secondary"
                                style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>💎</span>
                                <span style={{ fontWeight: 600 }}>Manage Plan</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('security')}
                                className="btn-secondary"
                                style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                                <span style={{ fontWeight: 600 }}>Security</span>
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleBackup} className="btn-secondary" style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>Backup Data</button>
                            <button className="btn-primary" onClick={onLogout} style={{ flex: 1, backgroundColor: '#ef4444', padding: '12px' }}>Sign Out</button>
                        </div>
                    </>
                )}

                {activeSection === 'subscription' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button onClick={() => setActiveSection('account')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                            <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>Subscription Plan</h3>
                        </div>
                        <div style={{ padding: '2rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Pro Plan Active</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your next billing date is January 24, 2026</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button className="btn-primary" style={{ padding: '8px 24px' }}>Change Plan</button>
                                <button className="btn-secondary" style={{ padding: '8px 24px', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                            </div>
                        </div>
                    </>
                )}

                {activeSection === 'security' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button onClick={() => setActiveSection('account')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                            <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>Security Settings</h3>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={passwords.current}
                                    onChange={(e) => handlePasswordChange('current', e.target.value)}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={passwords.new}
                                    onChange={(e) => handlePasswordChange('new', e.target.value)}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={passwords.confirm}
                                    onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                />
                                <button onClick={handleUpdatePassword} className="btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Two-Factor Authentication</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Enable 2FA</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Secure your account with an extra layer of protection.</div>
                                </div>
                                <Toggle active={is2FA} onToggle={handleToggle2FA} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
