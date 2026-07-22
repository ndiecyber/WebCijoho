import React from 'react';
import MobileAppView from './MobileAppView';

export default function BookingModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div 
            className="v-modal-backdrop active" 
            onClick={() => onClose()}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(12, 41, 74, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
        >
            <div 
                className="v-modal-card fade-in" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                    maxWidth: '460px', 
                    width: '100%', 
                    maxHeight: '92vh', 
                    overflowY: 'auto',
                    backgroundColor: '#f8fafc',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid #cbd5e1',
                    position: 'relative'
                }}
            >
                {/* Modal Header */}
                <div 
                    style={{ 
                        backgroundColor: '#0c294a', 
                        color: 'white', 
                        padding: '14px 20px', 
                        borderRadius: '24px 24px 0 0',
                        display: 'flex', 
                        justify: 'space-between', 
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 20
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="assets/logo.png" alt="Logo" style={{ height: '32px' }} />
                        <div>
                            <h4 style={{ color: 'white', margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>PESAN TIKET ONLINE</h4>
                            <small style={{ color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700 }}>Waterboom Cijoho Indah</small>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'rgba(255,255,255,0.15)', 
                            border: 'none', 
                            color: 'white', 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            fontSize: '1.2rem', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Interactive MobileAppView Component */}
                <div style={{ padding: '0' }}>
                    <MobileAppView isCashierMode={false} onOpenBooking={() => {}} />
                </div>
            </div>
        </div>
    );
}
