import { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { ClaimForm } from './components/ClaimForm/ClaimForm';
import { AnalysisCard } from './components/Analysis/AnalysisCard';
import { AIInvestigation } from './components/AIInvestigation/AIInvestigation';
import { DashboardPage } from './components/Pages/DashboardPage';
import { ClaimHistoryPage } from './components/Pages/ClaimHistoryPage';
import { AnalyticsPage } from './components/Pages/AnalyticsPage';
import { ProvidersPage } from './components/Pages/ProvidersPage';
import { ReportsPage } from './components/Pages/ReportsPage';
import { fetchWithTimeout, formatUserErrorMessage } from './api/config';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    if (isAnalyzing) return; // Prevent duplicate submissions

    setIsAnalyzing(true);
    setEvaluationResult(null);
    setInvestigationResult(null);
    setCurrentClaimPayload(payload);
    setErrorMessage(null);

    // Launch ML prediction and AI investigation concurrently
    // 1. Prediction Task (Fast ML evaluation)
    const predictionPromise = fetchWithTimeout('/api/predict/manual', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 45000)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Prediction service returned HTTP ${res.status}`);
        const data = await res.json();
        setEvaluationResult(data);
        return data;
      })
      .catch((err) => {
        console.warn('[App] Prediction error:', err);
        throw err;
      });

    // 2. Full AI Investigation Task (RAG + Multi-LLM Router)
    const investigationPromise = fetchWithTimeout('/api/ai/investigate', {
      method: 'POST',
      body: JSON.stringify({ claim: payload })
    }, 60000)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Investigation service returned HTTP ${res.status}`);
        const data = await res.json();
        if (!data || !data.ai_analysis || !data.ml_prediction) {
          throw new Error('Malformed AI investigation response received.');
        }
        setInvestigationResult(data);
        return data;
      })
      .catch((err) => {
        console.warn('[App] AI Investigation error:', err);
        throw err;
      });

    try {
      const results = await Promise.allSettled([predictionPromise, investigationPromise]);
      const predRes = results[0];
      const invRes = results[1];

      if (predRes.status === 'rejected' && invRes.status === 'rejected') {
        const userErr = formatUserErrorMessage(predRes.reason || invRes.reason);
        setErrorMessage(userErr.message);
      } else if (invRes.status === 'rejected') {
        const userErr = formatUserErrorMessage(invRes.reason);
        setErrorMessage(`AI Investigation notice: ${userErr.message}`);
      }
    } catch (err: any) {
      console.error('[App] Unexpected error during claim analysis:', err);
      const userErr = formatUserErrorMessage(err);
      setErrorMessage(userErr.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryInvestigation = () => {
    if (currentClaimPayload && !isAnalyzing) {
      handleAnalyzeClaim(currentClaimPayload);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#EEF3FA] text-[#172554] font-sans selection:bg-[#FACC15] selection:text-[#172554]">
      {/* Left Sidebar (Desktop & Tablet) */}
      <div className="hidden md:block shrink-0">
        <Sidebar 
          activeTab={currentTab} 
          onSelectTab={setCurrentTab} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
        <TopBar />

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 border-b border-slate-200 bg-white/60">
          {(['dashboard', 'new-claim', 'history', 'analytics', 'providers', 'reports'] as NavTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                currentTab === tab 
                  ? 'bg-[#172554] text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard' :
               tab === 'new-claim' ? 'New Claim' :
               tab === 'history' ? 'History' :
               tab === 'analytics' ? 'Analytics' :
               tab === 'providers' ? 'Providers' : 'Reports'}
            </button>
          ))}
        </div>

        {/* Dynamic Page Views */}
        <div className="flex-1 px-4 sm:px-8 py-4">
          {/* 1. Dashboard Page */}
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigate={setCurrentTab} />
          )}

          {/* 2. New Claim Page (Preserved Full ML + RAG + Multi-LLM Workflow) */}
          {currentTab === 'new-claim' && (
            <div className="space-y-8 animate-fadeIn pb-12">
              {/* Hero Section */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-[#F59E0B] tracking-widest uppercase mb-2">
                    AI-Powered Claim Verification & Investigation
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172554] tracking-tight mb-2">
                    Analyze. Verify. Ensure <span className="text-[#F59E0B]">Fairness.</span>
                  </h1>
                  <p className="text-[#64748B] text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
                    Integrated Healthcare Insurance Claim Fraud Detection System with Random Forest Predictive Scoring + RAG Multi-LLM Clinical Review.
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
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="text-amber-600 shrink-0" size={18} />
                    <span>{errorMessage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentClaimPayload && !isAnalyzing && (
                      <button
                        onClick={handleRetryInvestigation}
                        className="flex items-center gap-1 bg-amber-200 hover:bg-amber-300 text-amber-900 px-2.5 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    )}
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 rounded cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Prediction Result Banner with Quick Jump to History */}
              {evaluationResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <span className="font-semibold">
                    Claim evaluated successfully. Prediction status and risk probability calculated.
                  </span>
                  <button
                    onClick={() => setCurrentTab('history')}
                    className="flex items-center gap-1 font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                  >
                    <span>View in Claim History</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Main Analysis Form & Result Grid */}
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
          )}

          {/* 3. Claim History Page */}
          {currentTab === 'history' && (
            <ClaimHistoryPage onNavigate={setCurrentTab} />
          )}

          {/* 4. Analytics Page */}
          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {/* 5. Providers Page */}
          {currentTab === 'providers' && (
            <ProvidersPage onNavigate={setCurrentTab} />
          )}

          {/* 6. Reports Page */}
          {currentTab === 'reports' && (
            <ReportsPage />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
