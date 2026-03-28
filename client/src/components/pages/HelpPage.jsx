import React, { useState } from 'react';

const HelpPage = () => {
    const [activeSection, setActiveSection] = useState('faq');

    const faqData = [
        { q: "Why is my location slightly off?", a: "We use your device's approximate location to save battery. For enabling precise location, go to Settings > Privacy > Precise Location." },
        { q: "What does 'PoP' mean?", a: "PoP stands for 'Probability of Precipitation'. It indicates the chance of rain or snow occurring in your area." },
        { q: "How do I change units?", a: "Go to Settings > Units to customize Temperature (C/F), Wind Speed, and other metrics." },
        { q: "What is AQI?", a: "AQI (Air Quality Index) measures how polluted the air is. Lower numbers (0-50) are good; higher numbers (>100) can be unhealthy." },
        { q: "Is the data real-time?", a: "Yes, we fetch data from top-tier providers like Open-Meteo. You can adjust the refresh frequency in Settings." }
    ];

    const glossaryData = [
        { term: "Dew Point", def: "The temperature to which air must be cooled to become saturated with water vapor." },
        { term: "UV Index", def: "A measure of the strength of sunburn-producing ultraviolet radiation from the Sun." },
        { term: "Visibility", def: "The distance at which an object or light can be clearly discerned." },
        { term: "Wind Gust", def: "A sudden, brief increase in speed of the wind." },
        { term: "Pressure", def: "Atmospheric pressure. Falling pressure often suggests a storm is coming." }
    ];

    return (
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', gap: '2rem' }}>
            {/* Sidebar Navigation */}
            <div className="glass-card" style={{ width: '250px', flexShrink: 0, padding: '1.5rem 0', height: 'fit-content' }}>
                <div style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Help Center</h2>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                        { id: 'faq', label: 'FAQ', icon: '❓' },
                        { id: 'glossary', label: 'Glossary', icon: '📖' },
                        { id: 'contact', label: 'Contact Support', icon: '✉️' },
                        { id: 'about', label: 'About & Attribution', icon: 'ℹ️' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            style={{
                                textAlign: 'left',
                                padding: '12px 24px',
                                background: activeSection === item.id ? 'var(--glass-hover)' : 'transparent',
                                borderLeft: activeSection === item.id ? '4px solid var(--accent-primary)' : '4px solid transparent',
                                color: activeSection === item.id ? 'var(--text-primary)' : '#cbd5e1',
                                fontWeight: activeSection === item.id ? 600 : 400,
                                display: 'flex', gap: '12px', alignItems: 'center'
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="glass-card" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeSection === 'faq' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Frequently Asked Questions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {faqData.map((item, i) => (
                                <div key={i} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>{item.q}</div>
                                    <div style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{item.a}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'glossary' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Weather Glossary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {glossaryData.map((item, i) => (
                                <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#60a5fa' }}>{item.term}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.def}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'contact' && (
                    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Contact Support</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Have a bug to report or a feature request? We'd love to hear from you.</p>

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="contact-subject" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Subject</label>
                                <select id="contact-subject" name="subject" style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}>
                                    <option>Report a Bug</option>
                                    <option>Feature Request</option>
                                    <option>Account Issue</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contact-message" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Message</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows="5"
                                    placeholder="Describe your issue..."
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontFamily: 'inherit' }}
                                ></textarea>
                            </div>
                            <button className="btn-primary" type="button" onClick={() => alert("Feedback sent! Thank you.")}>
                                Send Message
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === 'about' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>About SkySense</h3>
                        <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '700px' }}>
                            <p style={{ marginBottom: '1rem' }}>
                                SkySense V2 is designed to provide the most accurate, hyper-local weather data with a premium, user-centric interface.
                                Built for weather enthusiasts and professionals alike.
                            </p>

                            <h4 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>Data Sources</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                                <li><strong>Open-Meteo API</strong>: Primary source for hourly and daily forecasts.</li>
                                <li><strong>OpenWeatherMap</strong>: Provider for high-fidelity condition icons.</li>
                                <li><strong>US EPA</strong>: Air Quality Index (AQI) data standards.</li>
                            </ul>

                            <h4 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>Version</h4>
                            <p>v2.1.0 (Pro Build)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpPage;
