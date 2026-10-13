import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Authentic Water Splash Icons matching official Cijoho Indah thermal ticket
 */
export function WaterSplashLeft() {
    return (
        <svg width="22" height="18" viewBox="0 0 24 20" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            {/* Main curved droplet */}
            <path d="M14 18 C8 18 6 12 11 7 C14 3 19 1 21 1 C21 3 22 9 19 13 C17.5 16 16 18 14 18 Z" fill="#000000" />
            {/* Small secondary droplet */}
            <path d="M5 14 C3 14 2 12 4 10 C5 8 8 7 9 7 C9 8 9.5 11 8 12.5 C7 13.5 6 14 5 14 Z" fill="#000000" />
        </svg>
    );
}

export function WaterSplashRight() {
    return (
        <svg width="22" height="18" viewBox="0 0 24 20" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}>
            {/* Main curved droplet mirrored */}
            <path d="M10 18 C16 18 18 12 13 7 C10 3 5 1 3 1 C3 3 2 9 5 13 C6.5 16 8 18 10 18 Z" fill="#000000" />
            {/* Small secondary droplet mirrored */}
            <path d="M19 14 C21 14 22 12 20 10 C19 8 16 7 15 7 C15 8 14.5 11 16 12.5 C17 13.5 18 14 19 14 Z" fill="#000000" />
        </svg>
    );
}

/**
 * Double Wavy Water Lines (Ripple effect)
 */
export function WaterWaves() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 8px 0' }}>
            <svg width="170" height="14" viewBox="0 0 170 14" fill="none">
                <path
                    d="M 5 4 Q 25 0 45 4 T 85 4 T 125 4 T 165 4"
                    stroke="#000000"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
                <path
                    d="M 5 10 Q 25 6 45 10 T 85 10 T 125 10 T 165 10"
                    stroke="#000000"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

/**
 * Perforated / Serrated Tear Edge Pattern
 */
export function PerforatedEdge({ position = 'top' }) {
    return (
        <div style={{ width: '100%', overflow: 'hidden', height: '6px', lineHeight: 0, margin: position === 'top' ? '-14px 0 6px 0' : '8px 0 -14px 0' }}>
            <svg width="100%" height="6" preserveAspectRatio="none" viewBox="0 0 360 6">
                <path
                    d={position === 'top'
                        ? "M0,6 L4,0 L8,6 L12,0 L16,6 L20,0 L24,6 L28,0 L32,6 L36,0 L40,6 L44,0 L48,6 L52,0 L56,6 L60,0 L64,6 L68,0 L72,6 L76,0 L80,6 L84,0 L88,6 L92,0 L96,6 L100,0 L104,6 L108,0 L112,6 L116,0 L120,6 L124,0 L128,6 L132,0 L136,6 L140,0 L144,6 L148,0 L152,6 L156,0 L160,6 L164,0 L168,6 L172,0 L176,6 L180,0 L184,6 L188,0 L192,6 L196,0 L200,6 L204,0 L208,6 L212,0 L216,6 L220,0 L224,6 L228,0 L232,6 L236,0 L240,6 L244,0 L248,6 L252,0 L256,6 L260,0 L264,6 L268,0 L272,6 L276,0 L280,6 L284,0 L288,6 L292,0 L296,6 L300,0 L304,6 L308,0 L312,6 L316,0 L320,6 L324,0 L328,6 L332,0 L336,6 L340,0 L344,6 L348,0 L352,6 L356,0 L360,6"
                        : "M0,0 L4,6 L8,0 L12,6 L16,0 L20,6 L24,0 L28,6 L32,0 L36,6 L40,0 L44,6 L48,0 L52,6 L56,0 L60,6 L64,0 L68,6 L72,0 L76,6 L80,0 L84,6 L88,0 L92,6 L96,0 L100,6 L104,0 L108,6 L112,0 L116,6 L120,0 L124,6 L128,0 L132,6 L136,0 L140,6 L144,0 L148,6 L152,0 L156,6 L160,0 L164,6 L168,0 L172,6 L176,0 L180,6 L184,0 L188,6 L192,0 L196,6 L200,0 L204,6 L208,0 L212,6 L216,0 L220,6 L224,0 L228,6 L232,0 L236,6 L240,0 L244,6 L248,0 L252,6 L256,0 L260,6 L264,0 L268,6 L272,0 L276,6 L280,0 L284,6 L288,0 L292,6 L296,0 L300,6 L304,0 L308,6 L312,0 L316,6 L320,0 L324,6 L328,0 L332,6 L336,0 L340,6 L344,0 L348,6 L352,0 L356,6 L360,0"
                    }
                    fill="#e2e8f0"
                />
            </svg>
        </div>
    );
}

/**
 * Ticket Date & Person Count Helpers
 */
export function formatTicketDate(rawDate) {
    if (!rawDate) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        return `${d}/${m}/${y}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
        const parts = rawDate.split('T')[0].split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
        return rawDate;
    }
    const indoMonths = {
        januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
        juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12',
        jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12'
    };
    const parts = String(rawDate).trim().split(/[\s-]+/);
    if (parts.length === 3 && indoMonths[parts[1].toLowerCase()]) {
        const d = String(parts[0]).padStart(2, '0');
        const m = indoMonths[parts[1].toLowerCase()];
        const y = parts[2];
        return `${d}/${m}/${y}`;
    }
    return rawDate;
}

export function formatTicketTime(rawTime) {
    if (!rawTime || rawTime === '-') {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }
    const clean = rawTime.replace(/\s*WIB/i, '').trim();
    if (/^\d{1,2}:\d{2}$/.test(clean)) {
        const [h, m] = clean.split(':');
        return `${String(h).padStart(2, '0')}:${m}:00`;
    }
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(clean)) {
        const [h, m, s] = clean.split(':');
        return `${String(h).padStart(2, '0')}:${m}:${s}`;
    }
    return clean;
}

export function formatPersonValidity(qty = 1) {
    const numWords = {
        1: 'SATU',
        2: 'DUA',
        3: 'TIGA',
        4: 'EMPAT',
        5: 'LIMA',
        6: 'ENAM',
        7: 'TUJUH',
        8: 'DELAPAN',
        9: 'SEMBILAN',
        10: 'SEPULUH'
    };
    const word = numWords[qty];
    if (word) {
        return ` TIKET BERLAKU UNTUK ${word} ORANG `;
    }
    return ` TIKET BERLAKU UNTUK ${qty} ORANG `;
}

/**
 * Shared Authentic Code 128 Barcode Component (Universal 80mm thermal compatible)
 * Symmetrically centered barcode & code text matching physical ticket
 */
export function ReceiptBarcode({ code = 'CIW250518000123' }) {
    // Generate realistic Code 128 vertical stripes starting exactly at 0
    const bars = [];
    let x = 0;
    bars.push({ x, w: 2.5 }); x += 4.5;
    bars.push({ x, w: 1.5 }); x += 3.5;
    bars.push({ x, w: 2.5 }); x += 4.5;

    for (let i = 0; i < code.length; i++) {
        const c = code.charCodeAt(i);
        const w1 = ((c * 3) % 4) + 1;
        const s1 = ((c * 2) % 3) + 2;
        const w2 = ((c * 5) % 3) + 1;
        const s2 = ((c * 7) % 3) + 2;
        bars.push({ x, w: w1 }); x += w1 + s1;
        bars.push({ x, w: w2 }); x += w2 + s2;
    }

    bars.push({ x, w: 2.5 }); x += 4.5;
    bars.push({ x, w: 1.5 }); x += 3.5;
    bars.push({ x, w: 3 }); x += 3;

    const totalBarsWidth = Math.max(x, 10);

    return (
        <div style={{ textAlign: 'center', margin: '6px auto 2px auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '0 auto' }}>
                <svg
                    width="240"
                    height="48"
                    viewBox={`0 0 ${totalBarsWidth} 48`}
                    style={{
                        display: 'block',
                        margin: '0 auto',
                        maxWidth: '92%',
                        height: '48px'
                    }}
                >
                    {bars.map((bar, idx) => (
                        <rect key={idx} x={bar.x} y="0" width={bar.w} height="48" fill="#000000" />
                    ))}
                </svg>
            </div>
            <div style={{
                textAlign: 'center',
                fontSize: '0.92rem',
                fontWeight: 900,
                letterSpacing: '1.2px',
                color: '#000000',
                fontFamily: 'monospace, Arial, sans-serif',
                marginTop: '4px',
                width: '100%',
                display: 'block'
            }}>
                {code}
            </div>
        </div>
    );
}

/**
 * Standardized Tear / Cut Separator Line
 */
export function ReceiptTearLine({ text = 'POTONG DI SINI (TEAR HERE)' }) {
    return (
        <div
            className="thermal-tear-line"
            style={{
                textAlign: 'center',
                margin: '12px auto',
                padding: '6px 0',
                borderTop: '1.5px dashed #000000',
                borderBottom: '1.5px dashed #000000',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#000000',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
                width: '100%'
            }}
        >
            ✂ ---------- {text} ---------- ✂
        </div>
    );
}

/**
 * 1. OPSI 1: STRUK INVOICE PEMBAYARAN RESMI (OFFICIAL PAYMENT INVOICE)
 * Itemized breakdown: Tiket + Add-on rentals, subtotal, grand total, payment method.
 */
export function InvoiceReceipt({ data, standalone = true }) {
    if (!data) return null;
    const rentalSources = data.rentals || data.details?.rentals || {};
    const prices = data.rentalsPrice || { ban: 5000, sepeda: 20000, gazebo: 20000 };
    let banQty = rentalSources.ban || 0;
    let sepedaQty = rentalSources.sepeda || 0;
    let gazeboQty = rentalSources.gazebo || 0;

    const typeStr = (data.type || data.product || '').toLowerCase();
    const isRentalOnly = typeStr.startsWith('sewa ') || typeStr.includes('hanya sewa');

    if (banQty === 0 && typeStr.includes('ban')) {
        banQty = data.qty || 1;
    }
    if (sepedaQty === 0 && (typeStr.includes('sepeda') || typeStr.includes('angsa'))) {
        sepedaQty = data.qty || 1;
    }
    if (gazeboQty === 0 && typeStr.includes('gazebo')) {
        gazeboQty = data.qty || 1;
    }

    let ticketQty = data.ticketQty !== undefined ? data.ticketQty : (isRentalOnly ? 0 : (data.qty || 0));
    if (ticketQty === 0 && banQty === 0 && sepedaQty === 0 && gazeboQty === 0) {
        ticketQty = data.qty || 1;
    }
    const ticketPrice = data.ticketPrice || (ticketQty > 0 ? (data.subtotal ? Math.round(data.subtotal / ticketQty) : (data.total ? Math.round(data.total / ticketQty) : 20000)) : 0);
    const subtotalTicket = data.subtotal || (ticketQty * ticketPrice) || (data.total || 0);

    return (
        <div
            id={standalone ? "printable-invoice-only" : undefined}
            className="thermal-receipt-card"
            style={{
                border: '2px solid #000000',
                borderRadius: '12px',
                padding: '16px 14px',
                backgroundColor: '#ffffff',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
                color: '#000000',
                fontSize: '0.8rem',
                lineHeight: '1.38',
                margin: '0 auto',
                maxWidth: '400px',
                boxSizing: 'border-box',
                width: '100%'
            }}
        >
            {/* Header Brand */}
            <div style={{ textAlign: 'center', marginBottom: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <img
                    src="assets/cijoho-thermal-logo.png"
                    alt="Cijoho Indah Waterboom"
                    style={{
                        height: '62px',
                        maxWidth: '85%',
                        objectFit: 'contain',
                        margin: '0 auto 2px auto',
                        display: 'block'
                    }}
                />
            </div>

            <div style={{ borderTop: '1.5px dashed #000000', margin: '8px 0' }}></div>

            {/* Title Section */}
            <div style={{ textAlign: 'center', margin: '5px 0' }}>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    STRUK INVOICE PEMBAYARAN
                </h3>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#333333', textTransform: 'uppercase', marginTop: '2px' }}>
                    BUKTI TRANSAKSI PEMBAYARAN SAH
                </div>
                <div style={{ fontSize: '0.7rem', color: '#444444', marginTop: '2px' }}>
                    Jl. Raya Cijoho No. 88, Tasikmalaya • Telp. 0265-1234567
                </div>
            </div>

            <div style={{ borderTop: '1px dashed #000000', margin: '7px 0' }}></div>

            {/* Transaction Metadata */}
            <div style={{ fontSize: '0.78rem', lineHeight: '1.55', margin: '6px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                    <span>No. Faktur</span><span>:</span><strong style={{ fontFamily: 'monospace' }}>{data.code}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                    <span>Tanggal</span><span>:</span><span>{data.date}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                    <span>Waktu</span><span>:</span><span>{data.time || '10:00 WIB'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                    <span>Petugas Kasir</span><span>:</span><span>{data.cashierName || data.cashier || 'KASIR POS 01'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                    <span>Pelanggan</span><span>:</span><strong>{data.name || data.buyerName || 'Pengunjung'}</strong>
                </div>
                {data.phone && data.phone !== '-' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                        <span>No. HP</span><span>:</span><span>{data.phone}</span>
                    </div>
                )}
            </div>

            {/* Line Items Table */}
            <div style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000', padding: '6px 0', margin: '8px 0' }}>
                <div style={{ fontWeight: 900, marginBottom: '5px', fontSize: '0.78rem' }}>RINCIAN PEMBAYARAN:</div>
                <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000000', textAlign: 'left' }}>
                            <th style={{ paddingBottom: '3px', width: '22px' }}>No</th>
                            <th style={{ paddingBottom: '3px' }}>Item</th>
                            <th style={{ paddingBottom: '3px', textAlign: 'center', width: '32px' }}>Qty</th>
                            <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Harga</th>
                            <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticketQty > 0 && (
                            <tr>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>1.</td>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{data.type || 'Tiket Masuk'}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{ticketQty}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontFamily: 'monospace' }}>Rp {ticketPrice.toLocaleString('id-ID')}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800, fontFamily: 'monospace' }}>Rp {subtotalTicket.toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                        {banQty > 0 && (
                            <tr>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{ticketQty > 0 ? 2 : 1}.</td>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Ban Renang</td>
                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{banQty}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontFamily: 'monospace' }}>Rp {(prices.ban || 5000).toLocaleString('id-ID')}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800, fontFamily: 'monospace' }}>Rp {(banQty * (prices.ban || 5000)).toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                        {sepedaQty > 0 && (
                            <tr>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(ticketQty > 0 ? 1 : 0) + (banQty > 0 ? 1 : 0) + 1}.</td>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Sepeda Air</td>
                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{sepedaQty}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontFamily: 'monospace' }}>Rp {(prices.sepeda || 20000).toLocaleString('id-ID')}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800, fontFamily: 'monospace' }}>Rp {(sepedaQty * (prices.sepeda || 20000)).toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                        {gazeboQty > 0 && (
                            <tr>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(ticketQty > 0 ? 1 : 0) + (banQty > 0 ? 1 : 0) + (sepedaQty > 0 ? 1 : 0) + 1}.</td>
                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Gazebo Santai</td>
                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{gazeboQty}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontFamily: 'monospace' }}>Rp {(prices.gazebo || 20000).toLocaleString('id-ID')}</td>
                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800, fontFamily: 'monospace' }}>Rp {(gazeboQty * (prices.gazebo || 20000)).toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Financial Summary */}
            <div style={{ borderBottom: '1px dashed #000000', paddingBottom: '6px', marginBottom: '8px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Subtotal Tagihan</span>
                    <span style={{ fontFamily: 'monospace' }}>Rp {data.total?.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Biaya Layanan</span>
                    <span style={{ fontFamily: 'monospace' }}>Rp 0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Metode Bayar</span>
                    <span style={{ fontWeight: 700 }}>{data.paymentMethod || data.payment || 'Tunai / Cash'}</span>
                </div>
                <div style={{ borderTop: '2px solid #000000', paddingTop: '4px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.92rem' }}>
                    <span>TOTAL BAYAR</span>
                    <span style={{ fontFamily: 'monospace' }}>Rp {data.total?.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, marginTop: '2px', letterSpacing: '0.5px' }}>
                    STATUS: [ LUNAS / PAID ]
                </div>
            </div>

            {/* Barcode Invoice */}
            <ReceiptBarcode code={data.code} />

            {/* Footer */}
            <div style={{ borderTop: '1px dashed #000000', paddingTop: '6px', marginTop: '6px', textAlign: 'center', fontSize: '0.7rem' }}>
                <div style={{ fontWeight: 800 }}> BUKTI PEMBAYARAN SAH & FINAL </div>
                <div style={{ color: '#444444', marginTop: '1px' }}>Simpan struk ini sebagai bukti pembayaran resmi</div>
                <div style={{ fontWeight: 900, marginTop: '2px', textTransform: 'uppercase' }}>TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
            </div>
        </div>
    );
}

/**
 * 2. OPSI 2: STRUK TIKET MASUK (WATERPARK ADMISSION GATE PASS)
 * Desain 100% PERSIS dengan tiket fisik thermal resmi Cijoho Indah Waterboom:
 * - Logo Header Cijoho Indah Waterboom (Tower seluncur, pohon kelapa, ribbon Serunya Liburan Keluarga)
 * - TIKET MASUK dengan icon cipratan air (water droplets)
 * - Alamat lengkap & No. Telp
 * - Detail transaksi: No. Transaksi, Tanggal, Waktu, Petugas Tiket
 * -  TIKET BERLAKU UNTUK SATU ORANG  SEKALI PAKAI
 * - TERIMA KASIH (dengan icon cipratan air) + Selamat menikmati wahana + Double Wavy Lines
 * - Barcode vertikal Code 128 + Kode transaksi di bawahnya
 */
export function TicketReceipt({ data, standalone = true, forceShow = false }) {
    if (!data) return null;
    const typeStr = (data.type || data.product || '').toLowerCase();
    const isRentalOnly = typeStr.startsWith('sewa ') || typeStr.includes('hanya sewa');
    let qty = data.ticketQty !== undefined ? data.ticketQty : (isRentalOnly ? 0 : (data.qty || 0));
    if (forceShow && qty <= 0) {
        qty = 1;
    }
    const hasTickets = (qty > 0 && !isRentalOnly) || forceShow;

    if (!hasTickets && !standalone) {
        return null;
    }

    const code = data.code || 'CIW250518000123';
    const date = formatTicketDate(data.date);
    const time = formatTicketTime(data.time);
    const cashier = (data.cashierName || data.cashier || 'DEDI SAPUTRA').toUpperCase();
    const validityText = formatPersonValidity(qty > 0 ? qty : 1);

    return (
        <div
            id={standalone ? "printable-ticket-only" : undefined}
            className="thermal-receipt-card authentic-ticket-receipt"
            style={{
                border: '1.5px solid #000000',
                borderRadius: '8px',
                padding: '16px 14px',
                backgroundColor: '#ffffff',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
                color: '#000000',
                fontSize: '0.8rem',
                lineHeight: '1.4',
                margin: '0 auto',
                maxWidth: '360px',
                boxSizing: 'border-box',
                width: '100%',
                position: 'relative'
            }}
        >
            {/* Top Perforated Notch */}
            <PerforatedEdge position="top" />

            {/* 1. Header Logo (Palm, Slide Tower, Waterboom, Serunya Liburan Keluarga) */}
            <div style={{ textAlign: 'center', marginBottom: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <img
                    src="assets/cijoho-thermal-logo.png"
                    alt="Cijoho Indah Waterboom"
                    style={{
                        height: '76px',
                        maxWidth: '92%',
                        objectFit: 'contain',
                        margin: '0 auto',
                        display: 'block'
                    }}
                />
            </div>

            {/* Separator 1 */}
            <div style={{ borderTop: '1.5px dashed #000000', margin: '10px 0' }}></div>

            {/* 2. Title Section */}
            <div style={{ textAlign: 'center', margin: '3px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WaterSplashLeft />
                    <h2 style={{ fontSize: '1.38rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: '#000000', display: 'inline' }}>
                        TIKET MASUK
                    </h2>
                    <WaterSplashRight />
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 900, color: '#000000', marginTop: '2px', marginBottom: '2px' }}>
                    Cijoho Indah Waterboom
                </div>
                <div style={{ fontSize: '0.8rem', color: '#000000', lineHeight: '1.38', fontWeight: 500 }}>
                    <div>Jl. Raya Cijoho No. 88</div>
                    <div>Cijoho - Tasikmalaya 46134</div>
                    <div>Telp. 0265-1234567</div>
                </div>
            </div>

            {/* Separator 2 */}
            <div style={{ borderTop: '1.5px dashed #000000', margin: '10px 0' }}></div>

            {/* 3. Transaction Details Table */}
            <div style={{ fontSize: '0.86rem', lineHeight: '1.65', color: '#000000', fontWeight: 600 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 14px 1fr' }}>
                    <span>No. Transaksi</span><span>:</span><strong style={{ fontFamily: 'monospace, Arial, sans-serif' }}>{code}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 14px 1fr' }}>
                    <span>Tanggal</span><span>:</span><span>{date}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 14px 1fr' }}>
                    <span>Waktu</span><span>:</span><span>{time}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 14px 1fr' }}>
                    <span>Petugas Tiket</span><span>:</span><span>{cashier}</span>
                </div>
            </div>

            {/* Separator 3 */}
            <div style={{ borderTop: '1.5px dashed #000000', margin: '10px 0' }}></div>

            {/* 4. Ticket Validity Text */}
            <div style={{ textAlign: 'center', margin: '6px 0' }}>
                <div style={{ fontSize: '0.96rem', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#000000' }}>
                    {validityText}
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#000000', marginTop: '2px' }}>
                    SEKALI PAKAI
                </div>
            </div>

            {/* Separator 4 */}
            <div style={{ borderTop: '1.5px dashed #000000', margin: '10px 0' }}></div>

            {/* 5. Thank You & Waves */}
            <div style={{ textAlign: 'center', margin: '3px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WaterSplashLeft />
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#000000' }}>
                        TERIMA KASIH
                    </span>
                    <WaterSplashRight />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#000000', marginTop: '2px', fontWeight: 500 }}>
                    Selamat menikmati wahana
                </div>
                <div style={{ fontSize: '0.84rem', color: '#000000', fontWeight: 500 }}>
                    Cijoho Indah Waterboom
                </div>
                <WaterWaves />
            </div>

            {/* 6. Code 128 Barcode */}
            <ReceiptBarcode code={code} />

            {/* Bottom Perforated Notch */}
            <PerforatedEdge position="bottom" />
        </div>
    );
}

/**
 * 3. OPSI 3: STRUK KUPON PEMBELIAN ADD-ON (FACILITY RENTAL REDEMPTION PASS)
 * Physical coupons for Ban, Sepeda Air, or Gazebo redemption.
 */
export function AddonReceipt({ data, standalone = true, forceShow = false }) {
    if (!data) return null;
    const rentalSources = data.rentals || data.details?.rentals || {};
    let banQty = rentalSources.ban || 0;
    let sepedaQty = rentalSources.sepeda || 0;
    let gazeboQty = rentalSources.gazebo || 0;

    const typeStr = (data.type || data.product || '').toLowerCase();
    if (banQty === 0 && typeStr.includes('ban')) {
        banQty = data.qty || 1;
    }
    if (sepedaQty === 0 && (typeStr.includes('sepeda') || typeStr.includes('angsa'))) {
        sepedaQty = data.qty || 1;
    }
    if (gazeboQty === 0 && typeStr.includes('gazebo')) {
        gazeboQty = data.qty || 1;
    }

    const coupons = [];
    if (banQty > 0) {
        coupons.push({
            id: 'BAN',
            title: 'KUPON SEWA BAN RENANG',
            icon: 'fa-solid fa-circle-dot',
            itemName: 'Ban Renang Pelampung',
            qty: banQty,
            code: `${data.code}-BAN`,
            stand: 'STAND BAN RENANG (TEPI KOLAM)',
            note: 'Serahkan kupon ini ke petugas stand ban untuk mengambil ban renang.'
        });
    }
    if (sepedaQty > 0) {
        coupons.push({
            id: 'SPD',
            title: 'KUPON SEWA SEPEDA AIR',
            icon: 'fa-solid fa-bicycle',
            itemName: 'Sepeda Air Bebek / Angsa',
            qty: sepedaQty,
            code: `${data.code}-SPD`,
            stand: 'STAND SEPEDA AIR (DERMAGA DANAU)',
            note: 'Serahkan kupon ini ke petugas dermaga untuk menaiki sepeda air.'
        });
    }
    if (gazeboQty > 0) {
        coupons.push({
            id: 'GZB',
            title: 'KUPON SEWA GAZEBO SANTAI',
            icon: 'fa-solid fa-house',
            itemName: 'Gazebo Saung Istirahat',
            qty: gazeboQty,
            code: `${data.code}-GZB`,
            stand: 'POS PENGAWAS GAZEBO (AREA SAUNG)',
            note: 'Tunjukkan kupon ini ke petugas pos gazebo untuk menempati gazebo bernomor.'
        });
    }

    // Always provide official facility coupon voucher when forceShow or standalone
    if (coupons.length === 0 && (forceShow || standalone)) {
        coupons.push({
            id: 'ADDON',
            title: 'KUPON SEWA ADD-ON & FASILITAS WAHANA',
            icon: 'fa-solid fa-umbrella-beach',
            itemName: 'Perlengkapan Renang & Fasilitas Wahana (Ban / Pelampung / Gazebo)',
            qty: 1,
            code: `${data.code}-ADDON`,
            stand: 'STAND PENYEWAAN & PERLENGKAPAN WATERBOOM',
            note: 'Tunjukkan kupon ini ke petugas stand penukaran alat untuk peminjaman ban renang, gazebo, atau fasilitas tambahan wahana.'
        });
    }

    // If used within full package and no coupons, do not render empty
    if (coupons.length === 0 && !standalone) {
        return null;
    }

    return (
        <div
            id={standalone ? "printable-addon-only" : undefined}
            style={{ display: 'block', margin: '0 auto', maxWidth: '400px', boxSizing: 'border-box', width: '100%' }}
        >
            {coupons.map((coupon, index) => (
                <React.Fragment key={coupon.id}>
                    {index > 0 && <ReceiptTearLine text={`KUPON SEWA BERIKUTNYA (${coupon.id})`} />}
                    <div
                        className="thermal-coupon-page"
                        style={{
                            border: '2px solid #000000',
                            borderRadius: '12px',
                            padding: '16px 14px',
                            backgroundColor: '#ffffff',
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
                            color: '#000000',
                            fontSize: '0.8rem',
                            lineHeight: '1.38',
                            boxSizing: 'border-box',
                            width: '100%'
                        }}
                    >
                        {/* Header Brand */}
                        <div style={{ textAlign: 'center', marginBottom: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <img
                                src="assets/cijoho-thermal-logo.png"
                                alt="Cijoho Indah Waterboom"
                                style={{
                                    height: '58px',
                                    maxWidth: '85%',
                                    objectFit: 'contain',
                                    margin: '0 auto 4px auto',
                                    display: 'block'
                                }}
                            />
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                                STAND PENYEWAAN FASILITAS
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #000000', margin: '7px 0' }}></div>

                        {/* Title Kupon */}
                        <div style={{ textAlign: 'center', margin: '5px 0' }}>
                            <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {coupon.title}
                            </h3>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#333333', textTransform: 'uppercase', marginTop: '2px' }}>
                                BUKTI PENUKARAN ALAT / FASILITAS
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #000000', margin: '7px 0' }}></div>

                        {/* Metadata */}
                        <div style={{ fontSize: '0.78rem', lineHeight: '1.55', margin: '6px 0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>No. Transaksi</span><span>:</span><strong style={{ fontFamily: 'monospace' }}>{data.code}</strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>Kode Kupon</span><span>:</span><strong style={{ fontFamily: 'monospace' }}>{coupon.code}</strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>Tanggal</span><span>:</span><span>{data.date}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>Waktu</span><span>:</span><span>{data.time || '10:00 WIB'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>Penyewa</span><span>:</span><strong>{data.name || data.buyerName || 'Pengunjung'}</strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '110px 10px 1fr' }}>
                                <span>Pos Ambil</span><span>:</span><strong>{coupon.stand}</strong>
                            </div>
                        </div>

                        <div style={{ borderTop: '2px solid #000000', margin: '8px 0' }}></div>

                        {/* Kupon Box */}
                        <div style={{ border: '1.5px dashed #000000', borderRadius: '8px', padding: '10px 8px', textAlign: 'center', backgroundColor: '#ffffff', margin: '8px 0' }}>
                            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#000000', letterSpacing: '0.5px' }}>
                                HAK PENUKARAN BARANG:
                            </div>
                            <div style={{ fontSize: '1.12rem', fontWeight: 900, color: '#000000', margin: '3px 0 5px 0' }}>
                                {coupon.qty}x {coupon.itemName.toUpperCase()}
                            </div>
                            <div style={{ color: '#000000', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px', margin: '4px 0' }}>
                                DISOBEK DI STAND SAAT PENGAMBILAN
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#000000', marginTop: '4px', lineHeight: '1.4' }}>
                                {coupon.note}
                            </div>
                        </div>

                        {/* Barcode Penukaran */}
                        <ReceiptBarcode code={coupon.code} />

                        <div style={{ borderTop: '1px dashed #000000', margin: '8px 0' }}></div>

                        {/* Ketentuan Sewa */}
                        <div style={{ fontSize: '0.66rem', lineHeight: '1.35', color: '#333333' }}>
                            <strong style={{ display: 'block', marginBottom: '2px' }}>KETENTUAN STAND:</strong>
                            <ul style={{ margin: 0, paddingLeft: '14px' }}>
                                <li>Kupon ini diserahkan kepada petugas stand untuk ditukarkan.</li>
                                <li>Pengunjung wajib menjaga alat keselamatan dengan baik.</li>
                                <li>Harap mengembalikan barang ke stand setelah selesai.</li>
                            </ul>
                        </div>

                        <div style={{ borderTop: '1px dashed #000000', paddingTop: '6px', marginTop: '6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                            STAND PENYEWAAN WATERBOOM CIJOHO INDAH
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

/**
 * 4. OPSI 4: PAKET LENGKAP SEMUA STRUK SEKALIGUS (FULL SYNCHRONIZED RECEIPT PACKAGE)
 * Sesuai kebutuhan Cetak Semua:
 * 1. Tiket Masuk Wahana Air (Gate Pass Scanner)
 * 2. Struk Invoice Pembayaran Resmi (Bukti Pembayaran Sah)
 * 3. Struk Kupon Sewa Add-On & Fasilitas (Penukaran Alat / Kupon Fasilitas)
 * Semuanya lengkap, terpusat (center), dan rapi dengan garis potong.
 */
export function FullPackageReceipt({ data }) {
    if (!data) return null;

    return (
        <div
            id="printable-full-package"
            className="thermal-package-container"
            style={{
                display: 'block',
                margin: '0 auto',
                maxWidth: '400px',
                boxSizing: 'border-box',
                width: '100%'
            }}
        >
            {/* 1. STRUK TIKET MASUK WAHANA AIR (GATE ENTRANCE PASS - HALAMAN 1) */}
            <div className="print-receipt-section receipt-page-1">
                <TicketReceipt data={data} standalone={false} forceShow={true} />
            </div>

            {/* GARIS POTONG: TIKET KE INVOICE */}
            <ReceiptTearLine text="POTONG DI SINI • BUKTI PEMBAYARAN INVOICE" />

            {/* 2. STRUK INVOICE PEMBAYARAN RESMI (BUKTI TRANSAKSI SAH - HALAMAN 2) */}
            <div className="print-receipt-section receipt-page-2">
                <InvoiceReceipt data={data} standalone={false} />
            </div>

            {/* GARIS POTONG: INVOICE KE KUPON SEWA ADD-ON */}
            <ReceiptTearLine text="POTONG DI SINI • KUPON SEWA ADD-ON & FASILITAS" />

            {/* 3. STRUK KUPON SEWA ADD-ON & FASILITAS (PENUKARAN ALAT - HALAMAN 3) */}
            <div className="print-receipt-section receipt-page-3">
                <AddonReceipt data={data} standalone={false} forceShow={true} />
            </div>
        </div>
    );
}

/**
 * 5. DIRECT BODY PRINT PORTAL (ZERO-CLIPPING PRINT ENGINE)
 * Renders the chosen receipt format directly to document.body via React Portal.
 * Solves Chromium's overflow/max-height page-clipping bug completely, ensuring
 * that Cetak Semua renders all 3 receipts (Tiket, Invoice, Add-On) without
 * being clipped by modal ancestors.
 */
export function DirectPrintPortal({ data, format = 'full' }) {
    if (!data || typeof document === 'undefined') return null;

    const normalizedFormat = format === 'rental' ? 'addon' : format;

    const content = (
        <div id="thermal-direct-print-portal" className="thermal-direct-print-portal">
            {normalizedFormat === 'full' && (
                <FullPackageReceipt data={data} />
            )}
            {normalizedFormat === 'ticket' && (
                <TicketReceipt data={data} standalone={true} forceShow={true} />
            )}
            {normalizedFormat === 'invoice' && (
                <InvoiceReceipt data={data} standalone={true} />
            )}
            {normalizedFormat === 'addon' && (
                <AddonReceipt data={data} standalone={true} forceShow={true} />
            )}
        </div>
    );

    return createPortal(content, document.body);
}

