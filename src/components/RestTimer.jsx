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
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem 1.5rem 1.5rem' }}>
                <div style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    {mode === 'stopwatch' ? 'Resting' : 'Countdown'}
                </div>
                <div style={{ fontSize: '5rem', fontWeight: '800', fontFamily: 'monospace', color: isActive && mode === 'timer' ? 'var(--accent)' : 'white' }}>
                    {formatTime(time)}
                </div>

                <div className="flex-row" style={{ marginTop: '1.5rem' }}>
                    {!isActive ? (
                        <button className="btn" onClick={() => setIsActive(true)}>Start</button>
                    ) : (
                        <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setIsActive(false)}>Pause</button>
                    )}
                    <button className="btn btn-ghost" onClick={reset}>Reset</button>
                </div>

                <div style={{ marginTop: '2.4rem', borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1.2rem' }}>
                        Alert Settings
                    </div>
                    <div className="flex-row" style={{ justifyContent: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Sound Alert</span>
                            <button
                                className={`btn btn-outline ${soundEnabled ? '' : 'inactive'}`}
                                style={{
                                    width: '100px',
                                    height: '45px',
                                    fontSize: '0.9rem',
                                    background: soundEnabled ? 'var(--accent)' : 'transparent',
                                    color: soundEnabled ? 'black' : 'var(--text-dim)',
                                    border: soundEnabled ? 'none' : '1px solid var(--border)',
                                    fontWeight: '800'
                                }}
                                onClick={() => setSoundEnabled(!soundEnabled)}
                            >
                                {soundEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
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

            <div className="input-label">Quick Presets</div>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => startTimer(60)}>1:00</button>
                <button className="btn btn-outline" onClick={() => startTimer(90)}>1:30</button>
                <button className="btn btn-outline" onClick={() => startTimer(120)}>2:00</button>
                <button className="btn btn-outline" onClick={() => startTimer(180)}>3:00</button>
            </div>
        </div>
    );
};

export default RestTimer;
