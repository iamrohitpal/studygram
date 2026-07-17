import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 smooth-transition">
      {/* Visual branding side panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex-col justify-between p-12">
        <div>
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <h1 className="text-4xl font-extrabold tracking-tight font-heading">StudyGram</h1>
          </Link>
          <p className="mt-2 text-indigo-100 max-w-sm">
            The ultimate user portal for students, educators, and lifelong learners to collaborate, share notes, and grow together.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
            <p className="text-lg italic font-medium">
              "StudyGram transformed my preparation for competitive exams. The curated notes and active peer discussions kept me motivated."
            </p>
            <span className="block mt-2 text-sm text-indigo-200">— Rohit P., UPSC Aspirant</span>
          </div>
          <p className="text-xs text-indigo-200">© 2026 StudyGram Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Auth Content forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-100 dark:shadow-none">
          <div className="flex flex-col items-center mb-8 md:hidden">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent font-heading">
                StudyGram
              </h1>
            </Link>
          </div>
          <Outlet />
        </div>
        
        {/* Footer Links */}
        <div className="absolute bottom-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 w-full px-6 text-center">
          <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition">About</a>
          <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition">Help Center</a>
          <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition">Terms</a>
          <span className="w-full mt-1">© 2026 StudyGram Inc.</span>
        </div>
      </div>
    </div>
  );
};
