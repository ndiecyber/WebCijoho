import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import Tickets from '../components/Tickets';
import Testimonial from '../components/Testimonial';
import Gallery from '../components/Gallery';

export default function Home({ onOpenBooking }) {
    return (
        <>
            <Hero onOpenBooking={onOpenBooking} />
            <Features />
            <About onOpenBooking={onOpenBooking} />
            <Tickets onOpenBooking={onOpenBooking} />
            <Testimonial />
            <Gallery />
        </>
    );
}
