import React, { useEffect } from 'react';
import EmotionDetector from '@/components/EmotionDetector';

const EmotionScanner: React.FC = () => {
  useEffect(() => {
    document.title = 'Camera Emotion Scanner | Real-time Face Emotions';

    // Meta description
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Open your camera and get real-time emotion detection from your face. No login required.';

    // Canonical tag
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  return (
    <div>
      <header className="sr-only">
        <h1>Camera Emotion Scanner</h1>
      </header>
      <main className="container mx-auto max-w-4xl p-4">
        <section aria-label="Emotion scanner">
          <EmotionDetector />
        </section>
      </main>
    </div>
  );
};

export default EmotionScanner;
