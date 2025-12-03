// @ts-nocheck
import { type ReactElement, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, TrendingUp, Brain, LogOut, Settings,
  Bell, Menu as MenuIcon, Sparkles, Zap, Target,
  Award, Activity, BarChart3, Users, FileText, ShieldCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getProfile, createProfile, updateProfile,
  fetchCandidateScore, fetchScoreHistory, fetchRoleMatches,
  runSkillGapAnalysis, requestJobFitPrediction,
  fetchSmartRanking, compareCandidates, downloadCandidateReport
} from '../api/client';
import ProfileForm from '../components/ProfileForm';
import ProfilePreview from '../components/ProfilePreview';
import ScoreBreakdownCard from '../components/ScoreBreakdownCard';
import ScoreInputForm from '../components/ScoreInputForm';
import RadarCompetencyChart from '../components/analytics/RadarCompetencyChart';
import CompetencyBarChart from '../components/analytics/CompetencyBarChart';
import ScoreTrendLineChart from '../components/analytics/ScoreTrendLineChart';
import StrengthHeatmap from '../components/analytics/StrengthHeatmap';
import SkillGapAnalysis from '../components/analytics/SkillGapAnalysis';
import InsightCards from '../components/analytics/InsightCards';
import ResumeUploadCard from '../components/ai/ResumeUploadCard';
import SkillGapPanel from '../components/ai/SkillGapPanel';
import JobFitPredictor from '../components/ai/JobFitPredictor';
import ReportDownloadCard from '../components/ai/ReportDownloadCard';
import SmartRankingTable from '../components/ai/SmartRankingTable';
import ComparisonTable from '../components/ai/ComparisonTable';
import JobMatchBoard from '../components/ai/JobMatchBoard';
import {
  CandidateProfile, CandidateProfileRequest, InsightSummary,
  JobFitPrediction, RankedCandidate, ScoreBreakdown,
  ScoreHistoryEntry, SkillGapAnalysis as SkillGapType,
  ResumeSnapshot, ResumeParseResponse
} from '../types';

type TabType = 'dashboard' | 'profile' | 'analytics' | 'ai';
const DEFAULT_ROLE_QUERY = 'AI Engineer';

export default function Dashboard(): ReactElement {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [hasProfile, setHasProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Analytics state
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [roleMatches, setRoleMatches] = useState<RankedCandidate[]>([]);
  const [resumeSnapshot, setResumeSnapshot] = useState<ResumeSnapshot | null>(null);

  // AI state
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapType | null>(null);
  const [jobFitPrediction, setJobFitPrediction] = useState<JobFitPrediction | null>(null);
  const [rankings, setRankings] = useState<RankedCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<RankedCandidate[]>([]);
  const [rankingRole, setRankingRole] = useState(DEFAULT_ROLE_QUERY);

  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [jobFitLoading, setJobFitLoading] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const isCandidate = user?.role === 'candidate';
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isCandidate && user?.id) {
        await loadCandidateSurface(user.id);
      } else {
        setProfile(null);
        setHasProfile(false);
      }

      if ((isRecruiter || isAdmin)) {
        await loadRecruiterSurface();
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateSurface = async (candidateId: string) => {
    const [profileData, scoreData, historyData] = await Promise.all([
      getProfile().catch(() => null),
      fetchCandidateScore(candidateId).catch(() => ({ scores: null, insights: null })),
      fetchScoreHistory(candidateId).catch(() => []),
    ]);

    if (profileData) {
      setProfile(profileData);
      setHasProfile(true);
      setResumeSnapshot(profileData.resumeSnapshot ?? null);
    } else {
      setProfile(null);
      setHasProfile(false);
    }

    setScoreBreakdown(scoreData?.scores ?? null);
    setInsights(scoreData?.insights ?? null);
    setHistory(historyData ?? []);
  };

  const loadRecruiterSurface = async () => {
    const [rankingData, matchesData] = await Promise.all([
      fetchSmartRanking().catch(() => []),
      fetchRoleMatches().catch(() => []),
    ]);
    setRankings(rankingData ?? []);
    setRoleMatches(matchesData ?? []);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! 👋');
  };

  const handleResumeParsed = (data: ResumeParseResponse) => {
    setResumeSnapshot(data.snapshot ?? null);
    if (data.profile) {
      setProfile(data.profile);
      setHasProfile(true);
    }
    toast.success('Resume analyzed successfully 🎯');
  };

  const handleSkillGapAnalyze = async (roleFocus?: string) => {
    if (!user?.id) return;
    setSkillGapLoading(true);
    try {
      const response = await runSkillGapAnalysis({ roleFocus, candidateId: user.id });
      setSkillGapAnalysis(response.analysis);
      toast.success('Skill gap insights refreshed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze skill gaps');
    } finally {
      setSkillGapLoading(false);
    }
  };

  const handleJobFitPredict = async (role: string) => {
    if (!user?.id) return;
    setJobFitLoading(true);
    try {
      const response = await requestJobFitPrediction({ role, candidateId: user.id });
      setJobFitPrediction(response.prediction);
      toast.success('Job fit prediction ready');
    } catch (error) {
      console.error(error);
      toast.error('Failed to predict job fit');
    } finally {
      setJobFitLoading(false);
    }
  };

  const handleReportDownload = async () => {
    if (!user?.id) throw new Error('Candidate ID missing');
    const blob = await downloadCandidateReport(user.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-competency-${user.name ?? 'report'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleRankingQuery = async (roleQuery: string, limit: number) => {
    setRankingLoading(true);
    try {
      const data = await fetchSmartRanking({ role: roleQuery, limit });
      setRankings(data);
      setRankingRole(roleQuery);
      await handleRoleMatchQuery(roleQuery, Math.min(limit, 5));
    } catch (error) {
      console.error(error);
      toast.error('Unable to refresh smart ranking');
    } finally {
      setRankingLoading(false);
    }
  };

  const handleRoleMatchQuery = async (roleQuery: string, limit = 5) => {
    setMatchesLoading(true);
    try {
      const data = await fetchRoleMatches({ role: roleQuery, limit });
      setRoleMatches(data);
    } catch (error) {
      console.error(error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      const exists = prev.includes(candidateId);
      const updated = exists ? prev.filter((id) => id !== candidateId) : [...prev, candidateId];
      if (updated.length >= 2) {
        triggerComparison(updated);
      } else {
        setComparisonData([]);
      }
      return updated;
    });
  };

  const triggerComparison = async (candidateIds: string[]) => {
    setComparisonLoading(true);
    try {
      const comparison = await compareCandidates(candidateIds);
      setComparisonData(comparison);
    } catch (error) {
      console.error(error);
      toast.error('Comparison failed');
    } finally {
      setComparisonLoading(false);
    }
  };

  const tabConfig = isRecruiter || isAdmin
    ? [
        { id: 'dashboard' as TabType, label: isAdmin ? 'Org Pulse' : 'Pipeline', icon: LayoutDashboard },
        { id: 'profile' as TabType, label: 'Talent Pool', icon: Users },
        { id: 'analytics' as TabType, label: 'Comparisons', icon: TrendingUp },
        { id: 'ai' as TabType, label: isAdmin ? 'Operations' : 'Scoring Ops', icon: Settings },
      ]
    : [
        { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'analytics' as TabType, label: 'Analytics', icon: TrendingUp },
        { id: 'ai' as TabType, label: 'AI Insights', icon: Brain },
      ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                y: [null, -100, null],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 glass backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Smart Competency</h1>
                  <p className="text-xs text-cyan-300">AI-Powered Diagnostics</p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-cyan-300 capitalize">{user?.role}</p>
                  </div>
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold cursor-pointer ring-2 ring-white/20"
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>

                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {showMobileMenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden py-4 space-y-2"
                >
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && (
                  isRecruiter || isAdmin ? (
                    <RecruiterOverview
                      rankings={rankings}
                      roleMatches={roleMatches}
                      selectedIds={selectedCandidateIds}
                    />
                  ) : (
                    <CandidateOverview
                      profile={profile}
                      scores={scoreBreakdown}
                      insights={insights}
                      roleMatches={roleMatches}
                    />
                  )
                )}
                {activeTab === 'profile' && (
                  isRecruiter || isAdmin ? (
                    <TalentPoolTab
                      rankings={rankings}
                      rankingLoading={rankingLoading}
                      onQuery={handleRankingQuery}
                      selectedIds={selectedCandidateIds}
                      onToggleSelect={toggleCandidateSelection}
                      roleMatches={roleMatches}
                      matchesLoading={matchesLoading}
                      activeRole={rankingRole}
                    />
                  ) : (
                    <ProfileTab
                      profile={profile}
                      hasProfile={hasProfile}
                      editMode={editMode}
                      setEditMode={setEditMode}
                      onProfileUpdate={loadDashboardData}
                    />
                  )
                )}
                {activeTab === 'analytics' && (
                  isRecruiter || isAdmin ? (
                    <RecruiterComparisonTab
                      comparison={comparisonData}
                      loading={comparisonLoading}
                    />
                  ) : (
                    <AnalyticsTab
                      scores={scoreBreakdown}
                      history={history}
                      insights={insights}
                    />
                  )
                )}
                {activeTab === 'ai' && (
                  isRecruiter || isAdmin ? (
                    <OperationsTab reviewer={user} />
                  ) : (
                    <AIInsightsTab
                      resumeSnapshot={resumeSnapshot}
                      onResumeParsed={handleResumeParsed}
                      onReportDownload={handleReportDownload}
                      skillGapAnalysis={skillGapAnalysis}
                      skillGapLoading={skillGapLoading}
                      onSkillGapAnalyze={handleSkillGapAnalyze}
                      jobFitPrediction={jobFitPrediction}
                      jobFitLoading={jobFitLoading}
                      onJobFitPredict={handleJobFitPredict}
                    />
                  )
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </>
  );
}

// Candidate Overview Component
function CandidateOverview({ profile, scores, roleMatches }: { profile: CandidateProfile | null; scores: ScoreBreakdown | null; roleMatches: RankedCandidate[] }) {
  const stats = [
    { icon: Target, label: 'Overall Score', value: scores ? `${scores.overall.toFixed(1)}%` : 'N/A', color: 'from-blue-500 to-cyan-500' },
    { icon: Award, label: 'Skills Logged', value: profile?.skills?.length ?? 0, color: 'from-purple-500 to-pink-500' },
    { icon: Activity, label: 'Role Matches', value: roleMatches?.length ?? 0, color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, label: 'Growth Momentum', value: scores ? `${Math.max(0, scores.overall - 70).toFixed(0)} pts` : 'N/A', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Welcome back!</h2>
            <p className="text-cyan-300">Your competency snapshot is ready.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard icon={User} title="Update Profile" description="Keep your achievements synced" color="from-purple-500 to-pink-600" />
        <QuickActionCard icon={Brain} title="AI Analysis" description="Trigger smart diagnostics" color="from-blue-500 to-cyan-600" />
        <QuickActionCard icon={FileText} title="Download Report" description="Share a PDF with recruiters" color="from-green-500 to-emerald-600" />
      </div>
    </div>
  );
}

function RecruiterOverview({ rankings, roleMatches, selectedIds }: { rankings: RankedCandidate[]; roleMatches: RankedCandidate[]; selectedIds: string[] }) {
  const topSuitability = rankings[0]?.jobFit?.suitability ?? 0;
  const stats = [
    { icon: Users, label: 'Active Candidates', value: rankings.length, color: 'from-blue-500 to-indigo-500' },
    { icon: Brain, label: 'Ready for Shortlist', value: roleMatches.length, color: 'from-emerald-500 to-green-600' },
    { icon: BarChart3, label: 'Comparisons Running', value: selectedIds.length, color: 'from-orange-500 to-amber-500' },
    { icon: ShieldCheck, label: 'Top Suitability', value: `${topSuitability}%`, color: 'from-fuchsia-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Talent Pipeline</h2>
            <p className="text-cyan-300">Live signal across every candidate.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function QuickActionCard({ icon: Icon, title, description, color }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  );
}

function ProfileTab({ profile, hasProfile, editMode, setEditMode, onProfileUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-8 h-8 text-cyan-400" />
            Your Profile
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>

        {editMode || !hasProfile ? (
          <ProfileForm
            initialData={profile || undefined}
            onSuccess={() => {
              setEditMode(false);
              onProfileUpdate();
              toast.success('Profile updated! ✨');
            }}
          />
        ) : (
          <ProfilePreview profile={profile} />
        )}
      </div>
    </div>
  );
}

function AnalyticsTab({ scores, history, insights }: { scores: ScoreBreakdown | null; history: ScoreHistoryEntry[]; insights: InsightSummary | null }) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-400" />
          Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreBreakdownCard scores={scores} />
          <ScoreTrendLineChart history={history} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RadarCompetencyChart scores={scores} />
          <CompetencyBarChart scores={scores} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StrengthHeatmap scores={scores} />
          <SkillGapAnalysis scores={scores} />
        </div>

        <InsightCards insights={insights} />
      </div>
    </div>
  );
}

function TalentPoolTab({
  rankings,
  rankingLoading,
  onQuery,
  selectedIds,
  onToggleSelect,
  roleMatches,
  matchesLoading,
  activeRole,
}: {
  rankings: RankedCandidate[];
  rankingLoading: boolean;
  onQuery: (role: string, limit: number) => Promise<void>;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  roleMatches: RankedCandidate[];
  matchesLoading: boolean;
  activeRole: string;
}) {
  return (
    <div className="space-y-6">
      <SmartRankingTable
        results={rankings}
        loading={rankingLoading}
        onQuery={onQuery}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        initialRole={activeRole}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Match Radar</h3>
          {matchesLoading && <span className="text-sm text-cyan-300">Scanning...</span>}
        </div>
        <JobMatchBoard role={activeRole} matches={roleMatches} />
      </div>
    </div>
  );
}

function RecruiterComparisonTab({ comparison, loading }: { comparison: RankedCandidate[]; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          Comparative Intelligence
        </h2>
        <ComparisonTable data={comparison} loading={loading} />
        <p className="text-white/60 text-sm mt-4">Select at least two candidates in the Talent Pool to populate this view.</p>
      </div>
    </div>
  );
}

function OperationsTab({ reviewer }: { reviewer: any }) {
  if (!reviewer) return null;
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          Manual Scoring & Overrides
        </h2>
        <p className="text-white/70 mb-6">Push updated competency scores from panel reviews or external assessments. Changes instantly refresh recruiter dashboards.</p>
        <ScoreInputForm reviewer={reviewer} />
      </div>
    </div>
  );
}

function AIInsightsTab({
  resumeSnapshot,
  onResumeParsed,
  onReportDownload,
  skillGapAnalysis,
  skillGapLoading,
  onSkillGapAnalyze,
  jobFitPrediction,
  jobFitLoading,
  onJobFitPredict,
}: {
  resumeSnapshot: ResumeSnapshot | null;
  onResumeParsed: (data: ResumeParseResponse) => void;
  onReportDownload: () => Promise<void>;
  skillGapAnalysis: SkillGapType | null;
  skillGapLoading: boolean;
  onSkillGapAnalyze: (roleFocus?: string) => Promise<void>;
  jobFitPrediction: JobFitPrediction | null;
  jobFitLoading: boolean;
  onJobFitPredict: (role: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          AI-Powered Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUploadCard latestSnapshot={resumeSnapshot} onParsed={onResumeParsed} />
          <ReportDownloadCard onDownload={onReportDownload} />
        </div>

        <SkillGapPanel analysis={skillGapAnalysis} loading={skillGapLoading} onAnalyze={onSkillGapAnalyze} />
        <JobFitPredictor prediction={jobFitPrediction} loading={jobFitLoading} onPredict={onJobFitPredict} />
      </div>
    </div>
  );
}
