import React from 'react';

export const CollaborationPopup: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open collaboration message"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 border border-gray-200 border-r-0 bg-white px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700 hover:text-umd-red hover:border-umd-red transition-colors"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        Help
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-[320px] max-w-[90vw] border border-gray-200 border-r-0 bg-white shadow-xl">
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
    </aside>
  );
};
