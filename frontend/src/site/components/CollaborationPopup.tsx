import React from 'react';
import { createPortal } from 'react-dom';

export const CollaborationPopup: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  if (!isOpen) {
    return createPortal(
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open collaboration message"
        className="fixed z-[70] right-4 bottom-6 md:right-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 rounded-full md:rounded-none md:rounded-l-md border border-umd-red bg-umd-red px-4 py-2.5 md:px-2 md:py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-red-700 transition-colors md:[writing-mode:vertical-rl] md:[text-orientation:mixed]"
      >
        Collaborate
      </button>,
      document.body
    );
  }

  return createPortal(
    <aside className="fixed z-[70] right-4 bottom-6 md:right-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 w-[320px] max-w-[90vw] border border-gray-200 md:border-r-0 bg-white shadow-xl rounded-lg md:rounded-none md:rounded-l-lg">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Collaboration</p>
          <h3 className="text-sm font-semibold text-gray-900">Work With Us</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Minimize collaboration message"
          className="mt-0.5 text-xl leading-none text-gray-500 hover:text-umd-red transition-colors"
        >
          −
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-gray-700">
          We are always looking forward to new collaborations. Please reach out to us at{' '}
          <a href="mailto:mop@rhsmith.umd.edu" className="font-medium text-umd-red hover:underline">
            mop@rhsmith.umd.edu
          </a>{' '}
          to work with us.
        </p>
      </div>
    </aside>,
    document.body
  );
};
