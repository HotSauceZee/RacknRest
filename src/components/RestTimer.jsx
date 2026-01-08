import React, { useState, useEffect, useRef } from 'react';

const RestTimer = () => {
    // Load settings from localStorage
    const savedSound = localStorage.getItem('timer-sound') !== 'false'; // Default to true

    const [time, setTime] = useState(0); // in seconds
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'timer'
    const [soundEnabled, setSoundEnabled] = useState(savedSound);
    const [recentTimes, setRecentTimes] = useState(() => {
        const saved = localStorage.getItem('timer-recents');
        return saved ? JSON.parse(saved) : [];
    });
    const timerRef = useRef(null);

    const [customMins, setCustomMins] = useState('');
    const [customSecs, setCustomSecs] = useState('');

    useEffect(() => {
        localStorage.setItem('timer-sound', soundEnabled);
    }, [soundEnabled]);


    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTime((t) => {
                    if (mode === 'timer') {
                        if (t <= 1) {
                            handleFinish();
                            return 0;
                        }
                        return t - 1;
                    }
                    return t + 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, mode]);

    const handleFinish = () => {
        setIsActive(false);

        if (soundEnabled) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
                console.log('Audio not supported', e);
            }
        }
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = (seconds) => {
        setMode('timer');
        setTime(seconds);
        setIsActive(true);
    };

    const handleCustomSet = () => {
        const totalSeconds = (Number(customMins) * 60) + Number(customSecs);
        if (totalSeconds > 0) {
            startTimer(totalSeconds);

            // Update Recent Times
            setRecentTimes(prev => {
                const newRecents = [totalSeconds, ...prev.filter(t => t !== totalSeconds)].slice(0, 3);
                localStorage.setItem('timer-recents', JSON.stringify(newRecents));
                return newRecents;
            });

            setCustomMins('');
            setCustomSecs('');
        }
    };

    const reset = () => {
        setIsActive(false);
        setTime(0);
        setMode('stopwatch');
    };

    return (
        <div className="fade-in">
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
                {/* Compact Sound Toggle */}
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: soundEnabled ? 'var(--accent)' : 'var(--text-dim)',
                        transition: '0.2s',
                        zIndex: 10
                    }}
                    title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
                >
                    {soundEnabled ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <path d="M11 5L6 9H2V15H6L11 19V5Z"></path>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    )}
                </button>

                <div style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {mode === 'stopwatch' ? 'Resting' : 'Countdown'}
                </div>
                <div style={{ fontSize: '4.5rem', fontWeight: '800', fontFamily: 'monospace', color: isActive && mode === 'timer' ? 'var(--accent)' : 'white', lineHeight: '1' }}>
                    {formatTime(time)}
                </div>

                <div className="flex-row" style={{ marginTop: '1rem' }}>
                    {!isActive ? (
                        <button className="btn" style={{ padding: '0.6rem 2rem' }} onClick={() => setIsActive(true)}>Start</button>
                    ) : (
                        <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.6rem 2rem' }} onClick={() => setIsActive(false)}>Pause</button>
                    )}
                    <button className="btn btn-ghost" onClick={reset}>Reset</button>
                </div>
            </div>

            <div className="card">
                <div className="input-label">Custom Timer</div>
                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <input
                            type="number"
                            placeholder="Min"
                            value={customMins}
                            onChange={(e) => setCustomMins(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <input
                            type="number"
                            placeholder="Sec"
                            value={customSecs}
                            onChange={(e) => setCustomSecs(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                    </div>
                </div>
                <button className="btn btn-outline" onClick={handleCustomSet}>Set Custom duration</button>

                {recentTimes.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.8rem', letterSpacing: '1px' }}>
                            Recent
                        </div>
                        <div className="flex-row" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                            {recentTimes.map((t, i) => (
                                <button
                                    key={i}
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.8rem', background: '#111', border: '1px solid #222' }}
                                    onClick={() => startTimer(t)}
                                >
                                    {formatTime(t)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="input-label" style={{ marginTop: '1rem' }}>Quick Presets</div>
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(60)}>1:00</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(90)}>1:30</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(120)}>2:00</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(180)}>3:00</button>
            </div>
        </div>
    );
};

export default RestTimer;
