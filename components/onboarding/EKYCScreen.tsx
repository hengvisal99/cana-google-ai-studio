'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, ScanFace, UploadCloud, AlertTriangle, ArrowRight, Save, UserCheck, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'capture-id' | 'capture-face' | 'verify-data' | 'success';

export function EKYCScreen() {
  const [step, setStep] = useState<Step>('capture-id');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation for scanning operations
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setLoading(false);
            if (step === 'capture-id') setStep('capture-face');
            else if (step === 'capture-face') setStep('verify-data');
            return 0;
          }
          return p + 25;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading, step]);

  const handleSimulateScan = () => {
    setLoading(true);
    setProgress(0);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center py-8 px-4 bg-slate-50">
      
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200 mb-4">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Digital e-KYC Onboarding</h1>
          <p className="text-slate-500 mt-2">Simulated tablet experience for branch officers and self-service.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {['ID Capture', 'Liveness Check', 'Verification'].map((label, idx) => {
            const isActive = (step === 'capture-id' && idx === 0) || 
                             (step === 'capture-face' && idx === 1) || 
                             ((step === 'verify-data' || step === 'success') && idx === 2);
            const isDone = (step !== 'capture-id' && idx === 0) || 
                           (step !== 'capture-face' && step !== 'capture-id' && idx === 1);
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center relative z-10">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300", 
                    isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110" : 
                    isDone ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  )}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={cn("absolute -bottom-6 text-xs font-semibold whitespace-nowrap", isActive ? "text-indigo-900" : "text-slate-400")}>{label}</span>
                </div>
                {idx < 2 && (
                  <div className={cn("w-24 h-1 -mx-2 z-0", isDone ? "bg-emerald-500" : "bg-slate-200")} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[400px] flex flex-col relative overflow-hidden">
          
          {step === 'capture-id' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-64 h-40 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 flex items-center justify-center mb-8 relative">
                {loading ? (
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl overflow-hidden flex flex-col justify-end">
                    <div className="w-full bg-indigo-500 transition-all duration-300 ease-out opacity-20" style={{ height: `${progress}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ScanFace className="w-12 h-12 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <UploadCloud className="w-12 h-12 text-indigo-300" />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Scan National ID</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-8">Place the ID card within the frame. Ensure the lighting is good and all text is legible.</p>
              
              <button 
                onClick={handleSimulateScan}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all"
              >
                <Camera className="w-5 h-5" />
                {loading ? 'Scanning ID...' : 'Capture ID'}
              </button>
            </div>
          )}

          {step === 'capture-face' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-48 h-48 rounded-full border-4 border-dashed border-emerald-200 bg-emerald-50/50 flex items-center justify-center mb-8 relative">
                {loading ? (
                  <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col justify-end">
                    <div className="w-full bg-emerald-500 transition-all duration-300 ease-out opacity-20" style={{ height: `${progress}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ScanFace className="w-16 h-16 text-emerald-600 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <UserCheck className="w-16 h-16 text-emerald-300" />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Liveness Check</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-8">Look directly at the camera and blink slowly.</p>
              
              <button 
                onClick={handleSimulateScan}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all"
              >
                <ScanFace className="w-5 h-5" />
                {loading ? 'Matching Face...' : 'Start Liveness Check'}
              </button>
            </div>
          )}

          {step === 'verify-data' && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Verify Extracted Data</h2>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 98% Face Match
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name (English)</label>
                    <input type="text" defaultValue="Sokha Meng" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name (Khmer)</label>
                    <input type="text" defaultValue="សុខា ម៉េង" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Date of Birth</label>
                    <input type="date" defaultValue="1990-05-15" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">ID Number (National ID)</label>
                    <input type="text" defaultValue="010123456" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Expiry Date</label>
                    <input type="date" defaultValue="2030-05-15" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Address (Extracted)</label>
                    <textarea defaultValue="Phnom Penh, Cambodia" rows={2} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors text-slate-900 font-medium resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setStep('capture-id')}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Rescan
                </button>
                <button 
                  onClick={() => setStep('success')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 transition-all"
                >
                  <Save className="w-4 h-4" /> Save & Continue
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">e-KYC Complete</h2>
              <p className="text-slate-500 mb-8 max-w-sm">The customer&apos;s identity has been successfully verified. A new prospect profile has been created.</p>
              
              <button 
                onClick={() => setStep('capture-id')}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg transition-all"
              >
                Start New Onboarding <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
