import React, { useState, useEffect } from 'react';

const CalendarPage = ({ weatherData, getIcon, units }) => {
    // --- Event State Management ---
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('calendarEvents');
        return saved ? JSON.parse(saved) : {};
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEventText, setNewEventText] = useState("");

    // Save to LocalStorage whenever events change
    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }, [events]);

    const handleAddClick = (dateStr) => {
        setSelectedDate(dateStr);
        setNewEventText("");
        setModalOpen(true);
    };

    const saveEvent = (e) => {
        e.preventDefault();
        if (!newEventText.trim()) return;

        setEvents(prev => {
            const currentEvents = prev[selectedDate] || [];
            return {
                ...prev,
                [selectedDate]: [...currentEvents, newEventText.trim()]
            };
        });
        setModalOpen(false);
    };

    const deleteEvent = (dateStr, index) => {
        if (!window.confirm("Delete this event?")) return;
        setEvents(prev => {
            const currentEvents = prev[dateStr] || [];
            const updated = currentEvents.filter((_, i) => i !== index);
            if (updated.length === 0) {
                const { [dateStr]: deleted, ...rest } = prev;
                return rest;
            }
            return { ...prev, [dateStr]: updated };
        });
    };

    if (!weatherData || !weatherData.daily) {
        return <div className="glass-card" style={{ padding: '2rem' }}>No forecast data available.</div>;
    }

    const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = weatherData.daily;

    const getCondition = (code) => {
        if (code === 0) return "Clear";
        if (code <= 3) return "Cloudy";
        if (code >= 95) return "Storm";
        if (code >= 71) return "Snow";
        if (code >= 51) return "Rain";
        return "Foggy";
    };

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>7-Day Forecast & Events</h2>
            <div className="glass-card" style={{ padding: '10px 20px' }}>
                {time.map((t, i) => {
                    const date = new Date(t);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const dateNum = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const dateKey = date.toDateString(); // consistent key
                    const isToday = new Date().toDateString() === date.toDateString();

                    const dayEvents = events[dateKey] || [];

                    // Simple "isDay" assumption for daily forecast icons (usually day)
                    const iconSrc = getIcon ? getIcon(weather_code[i], 1) : null;

                    return (
                        <div key={i} className="forecast-row" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.2rem 0',
                            borderBottom: i === time.length - 1 ? 'none' : '1px solid var(--glass-border)',
                            opacity: isToday ? 1 : 0.9
                        }}>
                            <div style={{ width: '120px' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                                    {isToday ? 'Today' : dayName}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {dateNum}
                                    <span title="Moon Phase">{['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][i % 8]}</span>
                                </div>
                            </div>

                            {/* Event Section */}
                            <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {dayEvents.length > 0 ? (
                                    dayEvents.map((evt, idx) => (
                                        <div key={idx}
                                            style={{
                                                fontSize: '0.85rem',
                                                background: 'var(--bg-tertiary)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '6px',
                                                marginBottom: '2px'
                                            }}
                                        >
                                            <span style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                flex: 1
                                            }}>
                                                {evt}
                                            </span>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteEvent(dateKey, idx);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    lineHeight: '0.8',
                                                    padding: '2px'
                                                }}
                                                title="Delete"
                                                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                            >
                                                ×
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.5 }}>No events</span>
                                )}
                                <button
                                    onClick={() => handleAddClick(dateKey)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px dashed var(--glass-border)',
                                        borderRadius: '4px',
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        width: 'fit-content',
                                        padding: '2px 6px'
                                    }}
                                >
                                    + Add Event
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, justifyContent: 'center' }}>
                                {iconSrc ? (
                                    <img src={iconSrc} alt="weather" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem' }}>☀️</span>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{getCondition(weather_code[i])}</span>
                                    {precipitation_probability_max && (
                                        <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                                            💧 {precipitation_probability_max[i]}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', width: '120px', justifyContent: 'flex-end', fontWeight: 600 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{Math.round(temperature_2m_min[i])}{units?.temp || '°'}</span>
                                <div style={{
                                    width: '60px',
                                    height: '6px',
                                    background: 'var(--glass-border)',
                                    borderRadius: '10px',
                                    position: 'relative',
                                    marginTop: '8px'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '0',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #3b82f6, #f97316)',
                                        borderRadius: '10px',
                                        opacity: 0.5
                                    }}></div>
                                </div>
                                <span>{Math.round(temperature_2m_max[i])}{units?.temp || '°'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Simple Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '300px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ margin: 0 }}>Add Event</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedDate}</div>
                        <form onSubmit={saveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                                id="eventInput"
                                name="eventInput"
                                aria-label="Event Name"
                                autoFocus
                                type="text"
                                placeholder="Meeting, Birthday etc..."
                                value={newEventText}
                                onChange={(e) => setNewEventText(e.target.value)}
                                style={{
                                    background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                                    color: 'white', padding: '8px', borderRadius: '6px', outline: 'none'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{
                                    background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    background: 'var(--accent-primary)', border: 'none', color: 'white',
                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                                }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
