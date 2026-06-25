import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and Data Handling Protocol for Anistreamz.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute -left-4 sm:-left-8 top-0 w-1 h-full bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter text-foreground mb-4">
            Privacy <span className="text-secondary">Policy</span>
          </h1>
          <p className="text-foreground/60 font-bold max-w-2xl text-lg uppercase tracking-widest">
            Data Handling Practices
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          
          <section className="bg-card/50 border-l-4 border-l-secondary border-y border-r border-secondary/20 p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">
              01. Data Collection
            </h2>
            <div className="space-y-4 text-foreground/80 font-medium leading-relaxed">
              <p>
                Anistreamz operates on a strict zero-data-collection philosophy. We do not require account creation, 
                we do not ask for personal information, and we do not use tracking cookies to monitor your behavior. 
              </p>
            </div>
          </section>

          <section className="bg-card/50 border-l-4 border-l-secondary border-y border-r border-secondary/20 p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">
              02. Local Storage
            </h2>
            <div className="space-y-4 text-foreground/80 font-medium leading-relaxed">
              <p>
                To provide a seamless user experience, including resuming episodes and saving your watchlist, 
                Anistreamz utilizes your browser's local storage.
              </p>
              <p>
                This means all your viewing history, preferences, and saved items remain strictly on your physical device. 
                This data is never transmitted to our servers, and you maintain complete control over it at all times.
              </p>
            </div>
          </section>

          <section className="bg-card/50 border-l-4 border-l-secondary border-y border-r border-secondary/20 p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">
              03. Third-Party APIs
            </h2>
            <div className="space-y-4 text-foreground/80 font-medium leading-relaxed">
              <p>
                Media content and metadata displayed on Anistreamz are retrieved via third-party APIs (such as Sanka API). 
                When your browser requests this data, standard network information (like your IP address) is inevitably exposed to these third-party providers. 
                We encourage you to review their respective privacy policies if you have concerns regarding metadata requests.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
