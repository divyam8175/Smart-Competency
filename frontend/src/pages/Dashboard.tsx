// @ts-nocheck
import { type ReactElement, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import {
  LayoutDashboard, User, TrendingUp, Brain, LogOut, Settings,
  Bell, Search, Menu as MenuIcon, Sparkles, Zap, Target,
  Award, Activity, BarChart3, PieChart, Users, FileText
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
  JobFitPrediction, RankedCandidate, SkillGapAnalysis as SkillGapType
} from '../types';

type TabType = 'dashboard' | 'profile' | 'analytics' | 'ai';

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
  const [scores, setScores] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [roleMatches, setRoleMatches] = useState<any[]>([]);

  // AI state
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapType | null>(null);
  const [jobFitPrediction, setJobFitPrediction] = useState<JobFitPrediction | null>(null);
  const [rankings, setRankings] = useState<RankedCandidate[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();
      setProfile(profileData);
      setHasProfile(true);

      if (user?.role === 'candidate' && user?.id) {
        const [scoreData, historyData] = await Promise.all([
          fetchCandidateScore(user.id).catch(() => null),
          fetchScoreHistory(user.id).catch(() => [])
        ]);
        setScores(scoreData);
        setHistory(historyData);
      } else if (user?.role === 'recruiter') {
        const matchesData = await fetchRoleMatches().catch(() => []);
        setRoleMatches(matchesData);
      }
    } catch {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! 👋');
  };

  const tabConfig = [
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
                  <DashboardOverview
                    profile={profile}
                    scores={scores}
                    insights={insights}
                    roleMatches={roleMatches}
                  />
                )}
                {activeTab === 'profile' && (
                  <ProfileTab
                    profile={profile}
                    hasProfile={hasProfile}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    onProfileUpdate={loadDashboardData}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    scores={scores}
                    history={history}
                    insights={insights}
                  />
                )}
                {activeTab === 'ai' && (
                  <AIInsightsTab
                    skillGapAnalysis={skillGapAnalysis}
                    jobFitPrediction={jobFitPrediction}
                    rankings={rankings}
                    onAnalysisComplete={(data) => setSkillGapAnalysis(data)}
                    onPredictionComplete={(data) => setJobFitPrediction(data)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </>
  );
}

// Dashboard Overview Component
function DashboardOverview({ profile, scores, insights, roleMatches }: any) {
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
            <p className="text-cyan-300">Here's your competency overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Overall Score"
            value={scores?.overallScore ? `${scores.overallScore}%` : 'N/A'}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Award}
            label="Skills Assessed"
            value={profile?.skills?.length || 0}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Activity}
            label="Role Matches"
            value={roleMatches?.length || 0}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Growth Rate"
            value="+12%"
            color="from-orange-500 to-red-500"
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon={User}
          title="Update Profile"
          description="Keep your information current"
          color="from-purple-500 to-pink-600"
        />
        <QuickActionCard
          icon={Brain}
          title="AI Analysis"
          description="Get personalized insights"
          color="from-blue-500 to-cyan-600"
        />
        <QuickActionCard
          icon={FileText}
          title="Generate Report"
          description="Download your competency report"
          color="from-green-500 to-emerald-600"
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

// Quick Action Card
function QuickActionCard({ icon: Icon, title, description, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer group"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  );
}

// Profile Tab
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
            onSuccess={(data) => {
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

// Analytics Tab
function AnalyticsTab({ scores, history, insights }: any) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-green-400" />
          Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scores && <ScoreBreakdownCard scores={scores} />}
          {history?.length > 0 && <ScoreTrendLineChart data={history} />}
        </div>

        {insights && <InsightCards insights={insights} />}
      </div>
    </div>
  );
}

// AI Insights Tab
function AIInsightsTab({ skillGapAnalysis, jobFitPrediction, rankings, onAnalysisComplete, onPredictionComplete }: any) {
  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-cyan-400" />
          AI-Powered Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUploadCard onParsed={() => toast.success('Resume analyzed! 🎯')} />
          <ReportDownloadCard />
        </div>

        <div className="mt-6 space-y-6">
          {skillGapAnalysis && <SkillGapPanel analysis={skillGapAnalysis} />}
          {jobFitPrediction && <JobFitPredictor prediction={jobFitPrediction} />}
        </div>
      </div>
    </div>
  );
}
