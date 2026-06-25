import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Notice',
  description: 'Digital Millennium Copyright Act (DMCA) Notice for Anistreamz.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute -left-4 sm:-left-8 top-0 w-1 h-full bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter text-foreground mb-4">
            DMCA <span className="text-secondary">Notice</span>
          </h1>
          <p className="text-foreground/60 font-bold max-w-2xl text-lg uppercase tracking-widest">
            Legal Compliance & Takedown Policy
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          
          <div className="bg-card/50 border border-secondary/20 p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="space-y-6 text-foreground/80 font-medium leading-relaxed mt-4">
              <p>
                <strong className="text-secondary">Disclaimer:</strong> Anistreamz operates entirely as a client-side interface and data proxy. 
                We do not host, upload, or manage any of the media content (video files, images, streams) displayed on this platform.
              </p>
              
              <p>
                All media content is indexed automatically and provided by independent third-party APIs and servers 
                (e.g., Otakudesu and Samehadaku via the Sanka API). Anistreamz functions similarly to a search engine or a web browser, 
                simply rendering the data returned by these external sources.
              </p>

              <h3 className="text-lg font-black uppercase text-foreground mt-8 mb-2">Copyright Infringement & Takedown Requests</h3>
              <p>
                Because Anistreamz does not store any copyrighted material on its servers, we cannot remove content from the internet. 
                If you hold the copyright to material that is being indexed and displayed through our interface, 
                you must direct your DMCA takedown notices to the actual third-party file hosts and API providers hosting the content.
              </p>
              <p>
                Once the content is removed from the source API or file host, it will automatically cease to appear on Anistreamz.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
