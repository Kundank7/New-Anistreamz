import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Anistreamz and its architecture.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute -left-4 sm:-left-8 top-0 w-1 h-full bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter text-foreground mb-4">
            About <span className="text-secondary">Anistreamz</span>
          </h1>
          <p className="text-foreground/60 font-bold max-w-2xl text-lg">
            A high-fidelity media platform designed for a premium streaming experience.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-12">
          
          <section className="bg-card/50 border border-secondary/20 p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-secondary mr-3 skew-x-[-15deg]" />
              The Project
            </h2>
            <div className="space-y-4 text-foreground/80 font-medium leading-relaxed">
              <p>
                Anistreamz was built to redefine how users interact with anime streaming interfaces. 
                By discarding the traditional, cluttered, ad-heavy layouts typical of third-party streaming sites, 
                we've engineered a clean, ad-free, and hyper-responsive platform.
              </p>
              <p>
                Our philosophy is simple: <strong className="text-secondary">Zero Friction.</strong> There is no authentication required, 
                no tracking, and no unnecessary bloat. Your watch history is stored entirely locally on your own machine.
              </p>
            </div>
          </section>

          <section className="bg-card/50 border border-secondary/20 p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-secondary mr-3 skew-x-[-15deg]" />
              Technology
            </h2>
            <div className="space-y-4 text-foreground/80 font-medium leading-relaxed">
              <p>
                Anistreamz utilizes modern web technologies, including Next.js and Tailwind CSS, to deliver a fast and responsive frontend. 
                Our interface is designed to provide a cohesive visual identity without sacrificing performance or usability.
              </p>
            </div>
          </section>

          {/* Credits Section */}
          <section className="mt-16 pt-12 border-t border-secondary/20">
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground mb-6 flex items-center">
              <span className="w-2 h-2 bg-secondary mr-3 skew-x-[-15deg]" />
              Credits & Infrastructure
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-card/40 border border-secondary/20 border-l-4 border-l-secondary p-5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Developed By</span>
                <span className="text-lg font-black tracking-tighter text-foreground uppercase">na-ive</span>
              </div>

              <div className="bg-card/40 border border-secondary/20 border-l-4 border-l-secondary p-5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Content Provider</span>
                <span className="text-lg font-black tracking-tighter text-foreground uppercase">Sanka API</span>
              </div>

              <div className="bg-card/40 border border-secondary/20 border-l-4 border-l-secondary p-5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Metadata Source</span>
                <span className="text-lg font-black tracking-tighter text-foreground uppercase">Local Database</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
