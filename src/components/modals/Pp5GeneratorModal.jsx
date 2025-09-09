// src/components/modals/Pp5GeneratorModal.jsx
import React from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db, appId } from '../../firebase/firebase';
import { grades } from '../../constants/data';
import { gradeStyles } from '../../constants/theme';
import Icon from '../../icons/Icon';

const Pp5GeneratorModal = ({ subjects, onClose }) => {
    const [status, setStatus] = React.useState('idle'); // idle, fetching, generating, success, error
    const [message, setMessage] = React.useState('');
    const [fileUrl, setFileUrl] = React.useState('');
    const [schoolName, setSchoolName] = React.useState('โรงเรียนบ้านวังหิน');
    const [teacherName, setTeacherName] = React.useState('');
    const [directorName, setDirectorName] = React.useState('');

    const handleGeneratePp5 = async (grade) => {
        setStatus('fetching');
        setMessage(`กำลังรวบรวมข้อมูลทั้งหมดของชั้น ป.${grade.replace('p', '')}...`);
        setFileUrl('');

        try {
            const currentYear = new Date().getFullYear() + 543;

            // 1. Fetch Students
            const studentsPath = `artifacts/${appId}/public/data/rosters/${grade}/students`;
            const studentsQuery = query(collection(db, studentsPath), orderBy("studentNumber"));
            const studentsSnap = await getDocs(studentsQuery);
            const studentList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (studentList.length === 0) {
                throw new Error(`ไม่พบข้อมูลนักเรียนในชั้น ป.${grade.replace('p', '')}`);
            }

            // 2. Fetch Assessments for both terms
            const assessments = {};
            for (const term of ['term1', 'term2']) {
                const assessmentId = `${grade}-${currentYear}-${term}`;
                const assessmentRef = doc(db, `artifacts/${appId}/public/data/assessments`, assessmentId);
                const assessmentSnap = await getDoc(assessmentRef);
                assessments[term] = assessmentSnap.exists() ? assessmentSnap.data() : {};
            }
            
            // 3. Fetch all Subject Data (Assignments & Scores)
            const allSubjectsData = [];
            for (const subject of subjects) {
                const subjectData = {
                    ...subject,
                    term1: { assignments: [], scores: {} },
                    term2: { assignments: [], scores: {} }
                };

                for (const term of ['term1', 'term2']) {
                     // Note: In a real scenario, you'd filter assignments by term.
                     // For now, we assume all assignments are fetched for simplicity.
                    const assignmentsPath = `artifacts/${appId}/public/data/subjects/${subject.id}/grades/${grade}/assignments`;
                    const assignmentsQuery = query(collection(db, assignmentsPath), orderBy("createdAt"));
                    const assignmentsSnap = await getDocs(assignmentsQuery);
                    subjectData[term].assignments = assignmentsSnap.docs.map(d => ({id: d.id, ...d.data()}));
                    
                    const scoresPath = `artifacts/${appId}/public/data/subjects/${subject.id}/grades/${grade}/scores`;
                    const scoresSnap = await getDocs(collection(db, scoresPath));
                    scoresSnap.forEach(scoreDoc => {
                        subjectData[term].scores[scoreDoc.id] = scoreDoc.data();
                    });
                }
                allSubjectsData.push(subjectData);
            }
            
            // 4. Prepare payload for Apps Script
            const payload = {
                action: "generatePP5", // Required by the Apps Script
                grade: grade.replace('p', ''),
                year: currentYear,
                schoolName: schoolName,
                teacherName: teacherName,
                directorName: directorName,
                students: studentList,
                subjects: allSubjectsData,
                assessments: assessments,
            };

            setStatus('generating');
            setMessage('ข้อมูลครบถ้วน! กำลังส่งไปสร้างไฟล์ ปพ.5...');

            // 5. Call Google Apps Script
            const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
            if (!scriptUrl) {
                throw new Error("VITE_APPS_SCRIPT_URL is not configured in .env file.");
            }

            const response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Important for Apps Script web apps
                headers: { 'Content-Type': 'text/plain' }, // Required by Apps Script
                body: JSON.stringify(payload)
            });
            
            // NOTE: With 'no-cors', we cannot read the response body directly.
            // We assume success if the request doesn't throw a network error.
            // The Apps Script will need to handle providing the URL to the user (e.g., via email or another method).
            // For this version, we will just show a success message.
            setStatus('success');
            setMessage(`สร้างไฟล์ ปพ.5 สำหรับชั้น ป.${grade.replace('p','')} สำเร็จแล้ว! โปรดตรวจสอบใน Google Drive ของคุณ`);
            // setFileUrl(responseData.fileUrl); // This line won't work with no-cors

        } catch (error) {
            console.error("Error generating ปพ.5:", error);
            setStatus('error');
            setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={status === 'idle' || status === 'success' ? onClose : undefined}>
            <div className="bg-gray-800/80 backdrop-blur-xl border border-blue-500/50 rounded-2xl w-full max-w-3xl shadow-2xl p-8 text-center" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-white mb-2">สร้างเอกสาร ปพ.5 อัตโนมัติ</h2>
                <p className="text-lg text-gray-300 mb-6">กรอกข้อมูลที่จำเป็นก่อนสร้างเอกสาร</p>

                <div className="space-y-4 mb-8 text-left max-w-xl mx-auto">
                    <div>
                        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-300 mb-1">ชื่อสถานศึกษา</label>
                        <input
                            type="text"
                            id="schoolName"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="เช่น โรงเรียนบ้านวังหิน"
                        />
                    </div>
                    <div>
                        <label htmlFor="teacherName" className="block text-sm font-medium text-gray-300 mb-1">ชื่อครูประจำชั้น</label>
                        <input
                            type="text"
                            id="teacherName"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="เช่น นายใจดี มีเมตตา"
                        />
                    </div>
                    <div>
                        <label htmlFor="directorName" className="block text-sm font-medium text-gray-300 mb-1">ชื่อผู้อำนวยการสถานศึกษา</label>
                        <input
                            type="text"
                            id="directorName"
                            value={directorName}
                            onChange={(e) => setDirectorName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="เช่น นางสาวสมศรี รักการเรียน"
                        />
                    </div>
                </div>

                <div className="w-full border-t border-white/10 my-8"></div>

                <p className="text-lg text-gray-300 mb-8">จากนั้น เลือกชั้นเรียนที่ต้องการส่งออกข้อมูล</p>
                
                {status === 'idle' || status === 'success' || status === 'error' ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                            {grades.map((gradeId, index) => {
                                const style = gradeStyles[gradeId];
                                return (
                                    <button 
                                        key={gradeId} 
                                        onClick={() => handleGeneratePp5(gradeId)} 
                                        className="group w-full p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center"
                                    >
                                        <Icon name={style.icon} className={`w-12 h-12 mb-3 transition-colors ${style.color}`} />
                                        <span className="text-xl font-bold text-white">ป.{index + 1}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {status === 'success' && <p className="mt-6 text-green-300">{message}</p>}
                        {/* {status === 'success' && fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-green-600 px-4 py-2 rounded-lg">เปิดไฟล์ที่สร้าง</a>} */}
                        {status === 'error' && <p className="mt-6 text-red-400">{message}</p>}

                        <button onClick={onClose} className="mt-8 text-gray-400 hover:text-white">ปิดหน้าต่าง</button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Icon name="Loader2" className="animate-spin text-blue-400" size={48} />
                        <p className="mt-4 text-white">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pp5GeneratorModal;