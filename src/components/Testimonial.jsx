import React from 'react';

export default function Testimonial() {
    return (
        <section id="testimonial" className="testimonial-section">
            <div className="container testimonial-container">
                <div className="testimonial-content">
                    <span className="quote-mark">“</span>
                    <blockquote className="testimonial-text">
                        Tempatnya bersih, wahananya seru, karyawan ramah, suasana tropis, dan momen tak terlupakan.
                    </blockquote>
                    <cite className="testimonial-author">- Pengunjung Waterboom Cijoho Indah</cite>
                </div>
                <div className="testimonial-img-wrapper">
                    <div className="testimonial-img-slice" style={{ backgroundImage: "url('assets/1.png?v=1.1')" }}></div>
                </div>
            </div>
        </section>
    );
}
