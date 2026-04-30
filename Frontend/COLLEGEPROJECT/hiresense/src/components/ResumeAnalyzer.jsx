import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUploadCloud,
    FiFileText,
    FiUser,
    FiMail,
    FiCheckCircle,
    FiAlertCircle,
    FiAward,
    FiExternalLink,
    FiLoader
} from 'react-icons/fi';

const ResumeAnalyzer = () => {
    // Form and File State
    const [files, setFiles] = useState([]);
    const [names, setNames] = useState('');
    const [emails, setEmails] = useState('');
    const [jobDesc, setJobDesc] = useState('');

    // UI Feedback State
    const [isUploading, setIsUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [results, setResults] = useState([]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleRemoveFile = (indexToRemove) => {
        setFiles(files.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (files.length === 0) {
            setErrorMsg("Please upload at least one resume.");
            return;
        }

        setIsUploading(true);
        setErrorMsg('');
        setSuccessMsg('');
        setResults([]);

        const namesList = names ? names.split(',').map(n => n.trim()) : [];
        const emailsList = emails ? emails.split(',').map(e => e.trim()) : [];

        try {
            // Send all requests in parallel
            const uploadPromises = files.map(async (file, index) => {
                try {
                    const formData = new FormData();
                    formData.append("resume", file);
                    formData.append("name", namesList[index] || `Candidate ${index + 1}`);
                    formData.append("email", emailsList[index] || `candidate${index + 1}@example.com`);
                    formData.append("job_desc", jobDesc);

                    // Fetch from backend API using relative path so Vite proxy intercepts it
                    const response = await fetch("/api/upload/", {
                        method: "POST",
                        body: formData
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Backend error:", errorText);
                        throw new Error(`Failed to process ${file.name}`);
                    }

                    const data = await response.json();
                    return (data.results && data.results.length > 0) ? data.results[0] : (Array.isArray(data) ? data[0] : data);
                } catch (err) {
                    console.error(`Error uploading ${file.name}:`, err);
                    return null; // Return null for failed requests to continue processing others
                }
            });

            const allResults = await Promise.all(uploadPromises);
            
            // Filter out failed uploads
            const candidateResults = allResults.filter(result => result !== null);

            if (candidateResults.length === 0 && files.length > 0) {
                throw new Error("All resume uploads failed. Please check your backend connection.");
            }

            const parseSkills = (skills) => typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : (skills || []);

            // Map strictly to the ATS JSON output
            const mappedResults = candidateResults.map((cand, i) => {
                const scoreValue = cand.score !== undefined ? cand.score : (cand.match_score !== undefined ? cand.match_score : 0);
                return {
                    id: i + 1,
                    name: cand.candidate_name || cand.name || namesList[i] || "Candidate",
                    email: cand.email || emailsList[i] || `candidate${i + 1}@example.com`,
                    score: scoreValue,
                    status: cand.status || cand.match_status || (scoreValue >= 60 ? "Eligible" : "Not Evaluated"),
                    matchedSkills: parseSkills(cand.matched_skills),
                    missingSkills: parseSkills(cand.missing_skills),
                    resumeSkills: parseSkills(cand.resume_skills || cand.matched_skills), // backend doesn't always provide resume_skills
                    problemStatement: cand.feedback || cand.problem || "No feedback provided."
                };
            });

            // Sort by score descending and assign ranks
            const sortedResults = mappedResults.sort((a, b) => b.score - a.score).map((cand, idx) => ({
                ...cand,
                // Assign rank if not available
                rank: cand.rank || (idx + 1)
            }));

            setResults(sortedResults);
            setSuccessMsg("Analysis completed successfully!");

        } catch (error) {
            console.error("Backend Error:", error);
            setErrorMsg(`Backend fetch failed: ${error.message}. Please check if your backend is running and CORS is configured.`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* 1. UPLOAD FORM SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100"
                >
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Resume Screening</h2>
                        <p className="text-slate-500 mt-2 text-lg">Upload candidate resumes to analyze and match against your job requirements.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* File Upload Area */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Upload Resumes (PDF, DOCX)</label>
                            <div className="relative group border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 transition-colors flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/50">
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                    <FiUploadCloud className="text-3xl text-indigo-500" />
                                </div>
                                <p className="text-slate-700 font-semibold text-lg">Drag & drop files or click to browse</p>
                                <p className="text-slate-400 font-medium mt-1">Select multiple files at once</p>
                            </div>

                            {/* Selected Files List */}
                            {files.length > 0 && (
                                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {files.map((f, i) => (
                                        <li key={i} className="flex items-center justify-between bg-white border border-slate-200 py-3 px-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <FiFileText className="text-indigo-600 text-lg" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 truncate">{f.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(i)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Names Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    <FiUser className="text-slate-400" /> Candidate Names
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe, Jane Smith (comma separated)"
                                    value={names}
                                    onChange={(e) => setNames(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-slate-50 placeholder:text-slate-400 text-slate-800 font-medium"
                                />
                            </div>

                            {/* Emails Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    <FiMail className="text-slate-400" /> Candidate Emails
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. john@mail.com, jane@mail.com"
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-slate-50 placeholder:text-slate-400 text-slate-800 font-medium"
                                />
                            </div>
                        </div>

                        {/* Job Description Textarea */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Job Description</label>
                            <textarea
                                rows={5}
                                placeholder="Paste the required skills and job responsibilities here..."
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-slate-50 placeholder:text-slate-400 resize-none text-slate-800 font-medium"
                            ></textarea>
                        </div>

                        {/* Optional: Status Messages */}
                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 mt-4">
                                    <FiAlertCircle className="shrink-0 text-xl" />
                                    <p className="font-semibold text-sm">{errorMsg}</p>
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 mt-4">
                                    <FiCheckCircle className="shrink-0 text-xl" />
                                    <p className="font-semibold text-sm">{successMsg}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <FiLoader className="text-xl animate-spin" />
                                        Analyzing Resumes...
                                    </>
                                ) : (
                                    <>
                                        <FiAward className="text-xl" />
                                        Analyze Candidates
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* 2. RESULTS DISPLAY SECTION */}
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-extrabold text-slate-800">Analysis Results</h3>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="grid gap-8">
                            {results.map((candidate) => {
                                // 4. TOP CANDIDATE Highlight
                                const isTopCandidate = candidate.rank === 1;

                                // 6. BUTTON - Chatgpt link generation
                                const missingSkillsString = (candidate.missingSkills || []).join(', ');
                                const improveQuery = encodeURIComponent(`I need to learn and improve these skills for a job interview: ${missingSkillsString}. Basic problem statement provided by resume parser: ${candidate.problemStatement}. Please give me a study plan.`);
                                const improveLink = candidate.improveLink || `https://chatgpt.com/?q=${improveQuery}`;

                                return (
                                    <div
                                        key={candidate.id || candidate.name}
                                        // 5. UI DESIGN - Clean card layout, Light background, highlight top candidate in green
                                        className={`relative bg-white rounded-3xl p-6 md:p-10 transition-all ${isTopCandidate ? 'ring-4 ring-emerald-500 shadow-xl shadow-emerald-100' : 'border border-slate-200 shadow-md shadow-slate-100'
                                            }`}
                                    >
                                        {/* TOP CANDIDATE Badge */}
                                        {isTopCandidate && (
                                            <div className="absolute -top-5 -right-2 md:-right-5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 transform md:rotate-2">
                                                <span className="text-lg">🏆 Top Candidate</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                                            {/* Candidate Basic Info */}
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-3xl font-extrabold text-slate-900">{candidate.name}</h4>
                                                    <span className={`px-4 py-1 rounded-full text-sm font-bold ${isTopCandidate ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                        }`}>
                                                        Rank #{candidate.rank}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 font-semibold flex flex-wrap gap-4 items-center">
                                                    <span>Score: <span className={`text-xl font-extrabold ${isTopCandidate ? 'text-emerald-500' : 'text-slate-800'}`}>{candidate.score}%</span></span>
                                                    {candidate.email && <span className="text-slate-400 font-normal">| {candidate.email}</span>}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <a
                                                href={improveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all mt-4 md:mt-0 ${isTopCandidate
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                                    }`}
                                            >
                                                Improve Skills <FiExternalLink />
                                            </a>
                                        </div>

                                        {/* Problem Statement Box */}
                                        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-400"></div>
                                            <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <FiAlertCircle /> AI Analysis Summary
                                            </h5>
                                            <p className="text-slate-700 leading-relaxed font-medium text-lg italic">"{candidate.problemStatement}"</p>
                                        </div>

                                        {/* 3. TABLE DESIGN - Two Tables Grid */}
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            {/* Table 1: Matched Skills */}
                                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                                                    <h5 className="font-extrabold text-indigo-900 flex items-center gap-2 text-lg">
                                                        <FiCheckCircle className="text-indigo-500" /> Required / Matched Skills
                                                    </h5>
                                                </div>
                                                <div className="p-0 overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-white text-slate-400 text-sm uppercase tracking-wider border-b border-slate-100">
                                                            <tr>
                                                                <th className="px-6 py-4 font-bold">Skill Name</th>
                                                                <th className="px-6 py-4 font-bold text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {(candidate.matchedSkills || []).length > 0 ? (
                                                                candidate.matchedSkills.map((skill, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-6 py-4 font-semibold text-slate-700">{skill}</td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                                                <FiCheckCircle /> Matched
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic font-medium">No matched skills found for this candidate.</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Table 2: Missing Skills */}
                                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                                <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
                                                    <h5 className="font-extrabold text-rose-900 flex items-center gap-2 text-lg">
                                                        <FiAlertCircle className="text-rose-500" /> Missing Skills
                                                    </h5>
                                                </div>
                                                <div className="p-0 overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-white text-slate-400 text-sm uppercase tracking-wider border-b border-slate-100">
                                                            <tr>
                                                                <th className="px-6 py-4 font-bold">Skill Name</th>
                                                                <th className="px-6 py-4 font-bold text-right">Impact</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {(candidate.missingSkills || []).length > 0 ? (
                                                                candidate.missingSkills.map((skill, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-6 py-4 font-semibold text-slate-700">{skill}</td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                                                <FiAlertCircle /> Required
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan="2" className="px-6 py-8 text-center text-emerald-500 font-bold bg-emerald-50/30">✨ All required skills met!</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
