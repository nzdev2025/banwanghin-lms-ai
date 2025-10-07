// The main application component renders different views based on
// authentication state and wraps the UI in an error boundary.  It
// subscribes to Firebase authentication and subject metadata
// collections, shows a loading spinner while auth is loading,
// presents a login form for unauthenticated users, and otherwise
// displays the dashboard and modals for managing different pieces of
// functionality.  This version includes minor refactoring to improve
// readability and adds an ErrorBoundary around the entire tree to
// gracefully handle runtime errors.

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth, onAuthStateChanged, handleLogout } from './firebase/firebase';

// Views and shared UI
import ErrorBoundary from './components/ErrorBoundary';
import LoginView from './views/LoginView';
import Icon from './icons/Icon';
import OverallAnalytics from './components/analytics/OverallAnalytics';
import DashboardWidgets from './components/dashboard/DashboardWidgets';
import SavingsCard from './components/shared/SavingsCard';
import AssignmentSystemCard from './components/shared/AssignmentSystemCard';
import ClassroomToolkitCard from './components/shared/ClassroomToolkitCard';
import AIWorksheetFactoryCard from './components/shared/AIWorksheetFactoryCard';
import AttendanceCard from './components/shared/AttendanceCard';
import HealthCard from './components/shared/HealthCard';
import DevelopmentalAssessmentCard from './components/shared/DevelopmentalAssessmentCard';
import Pp5Card from './components/shared/Pp5Card';

// Modals
import SubjectSelectionView from './components/modals/SubjectSelectionView';
import GradeSelectionModal from './components/modals/GradeSelectionModal';
import ClassDetailView from './components/modals/ClassDetailView';
import SubjectManagementModal from './components/modals/SubjectManagementModal';
import RosterManagementModal from './components/modals/RosterManagementModal';
import StudentProfileModal from './components/modals/StudentProfileModal';
import SavingsManagementModal from './components/modals/SavingsManagementModal';
import ClassroomToolkitModal from './components/modals/ClassroomToolkitModal';
import AIWorksheetGeneratorModal from './components/modals/AIWorksheetGeneratorModal';
import LineNotifySettingsModal from './components/modals/LineNotifySettingsModal';
import AttendanceModal from './components/modals/AttendanceModal';
import HealthRecordModal from './components/modals/HealthRecordModal';
import DevelopmentalAssessmentModal from './components/modals/DevelopmentalAssessmentModal';
import Pp5GeneratorModal from './components/modals/Pp5GeneratorModal';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [view, setView] = useState('dashboard');
  const [appId, setAppId] = useState('banwanghin-lms-dev');
  const [modalStack, setModalStack] = useState([]);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to subjects metadata
  useEffect(() => {
    if (!user) return;
    const subjectsMetaPath = `artifacts/${appId}/public/data/subjects_meta`;
    const q = query(collection(db, subjectsMetaPath), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, user]);

  // Helpers to push/pop modals; using functional updates to avoid stale closures
  const openModal = (type, data = null) => {
    setModalStack((prev) => [...prev, { type, data }]);
  };
  const closeModal = () => {
    setModalStack((prev) => prev.slice(0, prev.length - 1));
  };
  const handleStudentClick = (student, grade) => openModal('studentProfile', { student, grade });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin text-teal-400" size={48} />
      </div>
    );
  }
  if (!user) {
    return <LoginView />;
  }

  // Render dashboard wrapped in ErrorBoundary for robust error handling
  return (
    <ErrorBoundary>
      {isToolkitOpen && (
        <ClassroomToolkitModal onClose={() => setIsToolkitOpen(false)} isWidget={true} />
      )}

      {view === 'dashboard' && (
        <div className="min-h-screen bg-gray-900 text-white font-sans relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] bg-teal-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 top-1/4 left-1/4"></div>
            <div className="absolute w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 bottom-1/4 right-1/4"></div>
          </div>
          <main className="relative z-10 p-4 sm:p-6 md:p-8 flex-grow w-full max-w-screen-2xl mx-auto">
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">KruKit (ครูคิท)</h1>
                <p className="text-gray-400">
                  ผู้ช่วยครูยุคดิจิทัล - โรงเรียนบ้านวังหิน by Wasin Suksuwan ICTTalent Connext ED
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-teal-500/50 flex items-center justify-center font-bold text-teal-200 flex-shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                    <span className="text-sm text-gray-300 hidden sm:block truncate">
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-md"
                      title="ออกจากระบบ"
                    >
                      <Icon name="LogOut" size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => openModal('manageRoster')}
                    className="p-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg"
                    title="ทะเบียนนักเรียน"
                  >
                    <Icon name="Users2" size={20} />
                  </button>
                  <button
                    onClick={() => openModal('lineNotifySettings')}
                    className="p-2 bg-lime-500/20 hover:bg-lime-500/30 text-lime-300 rounded-lg"
                    title="ตั้งค่าแจ้งเตือน"
                  >
                    <Icon name="Bell" size={20} />
                  </button>
                  <button
                    onClick={() => openModal('manageSubjects')}
                    className="p-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg"
                    title="ตั้งค่าวิชา"
                  >
                    <Icon name="Settings" size={20} />
                  </button>
                </div>
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-8">
                  <OverallAnalytics subjects={subjects} />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">เครื่องมือหลัก (Main Tools)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                      <AssignmentSystemCard
                        onClick={() => setView('subjects')}
                        subjectCount={subjects.length}
                      />
                      <SavingsCard onClick={() => openModal('manageSavings')} />
                      <HealthCard onClick={() => openModal('healthRecord')} />
                      <AttendanceCard onClick={() => openModal('manageAttendance')} />
                      <DevelopmentalAssessmentCard
                        onClick={() => openModal('developmentalAssessment')}
                      />
                      <Pp5Card onClick={() => openModal('pp5Generator')} />
                      <AIWorksheetFactoryCard onClick={() => openModal('aiWorksheet')} />
                      <ClassroomToolkitCard onClick={() => setIsToolkitOpen(true)} />
                    </div>
                  </div>
                </div>
                <DashboardWidgets subjects={subjects} onStudentClick={handleStudentClick} />
              </div>
            </main>
          </div>
        )}

        {view === 'subjects' && (
          <SubjectSelectionView
            subjects={subjects}
            onSubjectClick={(subject) => openModal('selectGrade', subject)}
            onClose={() => setView('dashboard')}
          />
        )}

        {modalStack.map((modal, index) => {
          if (index !== modalStack.length - 1) return null;
          switch (modal.type) {
            case 'manageAttendance':
              return <AttendanceModal key={index} onClose={closeModal} />;
            case 'lineNotifySettings':
              return <LineNotifySettingsModal key={index} onClose={closeModal} />;
            case 'selectGrade':
              return (
                <GradeSelectionModal
                  key={index}
                  subject={modal.data}
                  onSelect={(subject, grade) => openModal('classDetail', { subject, grade })}
                  onClose={closeModal}
                />
              );
            case 'classDetail':
              return (
                <ClassDetailView
                  key={index}
                  subject={modal.data.subject}
                  grade={modal.data.grade}
                  onStudentClick={handleStudentClick}
                  onClose={closeModal}
                />
              );
            case 'manageSubjects':
              return <SubjectManagementModal key={index} subjects={subjects} onClose={closeModal} />;
            case 'manageRoster':
              return <RosterManagementModal key={index} onClose={closeModal} />;
            case 'studentProfile':
              return (
                <StudentProfileModal
                  key={index}
                  student={modal.data.student}
                  grade={modal.data.grade}
                  subjects={subjects}
                  onClose={closeModal}
                />
              );
            case 'manageSavings':
              return <SavingsManagementModal key={index} onClose={closeModal} />;
            case 'aiWorksheet':
              return <AIWorksheetGeneratorModal key={index} onClose={closeModal} />;
            case 'classroomToolkit':
              return <ClassroomToolkitModal key={index} onClose={closeModal} />;
            case 'healthRecord':
              return <HealthRecordModal key={index} onClose={closeModal} />;
            case 'developmentalAssessment':
              return <DevelopmentalAssessmentModal key={index} onClose={closeModal} />;
            case 'pp5Generator':
              return <Pp5GeneratorModal key={index} subjects={subjects} onClose={closeModal} />;
            default:
              return null;
          }
        })}
      </ErrorBoundary>
    );
  }

  export default App;
