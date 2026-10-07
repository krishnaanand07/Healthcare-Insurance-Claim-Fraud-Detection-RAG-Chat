import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { ClaimForm } from './components/ClaimForm/ClaimForm';
import { AnalysisCard } from './components/Analysis/AnalysisCard';
import { AIInvestigation } from './components/AIInvestigation/AIInvestigation';
import { fetchWithTimeout, formatUserErrorMessage } from './api/config';
import { AlertCircle } from 'lucide-react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [investigationResult, setInvestigationResult] = useState<any>(null);
  const [currentClaimPayload, setCurrentClaimPayload] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Proactive background ping to wake up Render container on page load
    fetchWithTimeout('/health', {}, 15000, 0).catch(() => {});
  }, []);

  const handleAnalyzeClaim = async (payload: any) => {
    setIsAnalyzing(true);
    setEvaluationResult(null);
    setInvestigationResult(null);
    setCurrentClaimPayload(payload);
    setErrorMessage(null);

    try {
      // 1. Call ML Prediction API
      const predResponse = await fetchWithTimeout('/api/predict/manual', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, 45000);

      if (predResponse.ok) {
        const predData = await predResponse.json();
        setEvaluationResult(predData);
      } else {
        throw new Error(`Prediction API responded with status: ${predResponse.status}`);
      }

      // 2. Call RAG + Multi-LLM AI Investigation API
      const aiResponse = await fetchWithTimeout('/api/ai/investigate', {
        method: 'POST',
        body: JSON.stringify({ claim: payload })
      }, 45000);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setInvestigationResult(aiData);
      } else {
        console.warn('AI Investigation API error status:', aiResponse.status);
      }
    } catch (err: any) {
      console.error('Error during claim analysis:', err);
      const userErr = formatUserErrorMessage(err);
      setErrorMessage(userErr.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#EEF3FA] text-[#172554] font-sans selection:bg-[#FACC15] selection:text-[#172554]">
      {/* Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
        <TopBar />

        {/* Hero Section */}
        <div className="px-8 py-6 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#F59E0B] tracking-widest uppercase mb-2">AI-Powered Claim Verification & Investigation</p>
              <h1 className="text-4xl font-extrabold text-[#172554] tracking-tight mb-3">
                Analyze. Verify. Ensure <span className="text-[#F59E0B]">Fairness.</span>
              </h1>
              <p className="text-[#64748B] text-sm max-w-2xl font-medium leading-relaxed">
                Integrated Healthcare Insurance Claim Fraud Detection System with RAG + Multi-LLM Decision Support.
              </p>
            </div>
            <div className="hidden lg:block bg-white/40 border border-white/60 p-4 rounded-xl shadow-sm backdrop-blur-sm">
              <p className="text-sm italic font-medium text-[#52658F]">
                "Fair claims build stronger communities."
              </p>
            </div>
          </div>

          {/* User-friendly Error Alert Banner */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 rounded"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="flex-1 px-8 pb-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form Column */}
            <div className="w-full relative z-10">
              <ClaimForm onSubmit={handleAnalyzeClaim} isAnalyzing={isAnalyzing} />
            </div>

            {/* Analysis Column */}
            <div className="w-full relative z-10">
              <AnalysisCard result={evaluationResult} isLoading={isAnalyzing} />
            </div>
          </div>

          {/* AI Investigation Section (RAG + Multi-LLM Report & Chat) */}
          {(investigationResult || isAnalyzing) && (
            <div className="w-full relative z-10">
              <AIInvestigation
                data={investigationResult}
                claimPayload={currentClaimPayload}
                isLoading={isAnalyzing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
