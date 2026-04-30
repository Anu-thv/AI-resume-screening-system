import React, { useState } from "react";
import AIScreening from "../components/AIScreening";
import { FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiStar, FiPlusCircle, FiTrash2 } from "react-icons/fi";

function HRDashboard() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('hr_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showJobForm, setShowJobForm] = useState(false);
  
  // Job Form State
  const [newJob, setNewJob] = useState({
    companyName: "",
    location: "",
    description: "",
    experience: "",
    salary: "",
    skills: ""
  });

  // Candidate Form State
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('hr_candidates');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    score: "",
    status: "Eligible",
    currentSkills: "",
    requiredSkills: ""
  });

  // Set default selected candidate when list changes
  React.useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates, selectedCandidate]);

  // Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem('hr_jobs', JSON.stringify(jobs));
  }, [jobs]);

  React.useEffect(() => {
    localStorage.setItem('hr_candidates', JSON.stringify(candidates));
  }, [candidates]);

  const handleDeleteJob = (indexToDelete) => {
    setJobs(jobs.filter((_, idx) => idx !== indexToDelete));
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    if (newJob.companyName && newJob.description) {
      setJobs([newJob, ...jobs]);
      setNewJob({ companyName: "", location: "", description: "", experience: "", salary: "", skills: "" });
      setShowJobForm(false);
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (newCandidate.name) {
      const curSkillsArr = newCandidate.currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      const reqSkillsArr = newCandidate.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const missingArr = reqSkillsArr.filter(req => !curSkillsArr.some(cur => cur.toLowerCase() === req.toLowerCase()));

      const candidateObj = {
        name: newCandidate.name,
        score: Number(newCandidate.score) || 0,
        status: newCandidate.status,
        skills: newCandidate.currentSkills,
        currentSkills: curSkillsArr,
        requiredSkills: reqSkillsArr,
        missingSkills: missingArr
      };
      setCandidates([...candidates, candidateObj].sort((a, b) => b.score - a.score));
      setNewCandidate({ name: "", score: "", status: "Eligible", currentSkills: "", requiredSkills: "" });
      setShowCandidateForm(false);
    }
  };

  const handleDeleteCandidate = (e, indexToDelete) => {
    e.stopPropagation();
    const candidateToDelete = candidates[indexToDelete];
    const updatedCandidates = candidates.filter((_, idx) => idx !== indexToDelete);
    setCandidates(updatedCandidates);
    if (selectedCandidate && candidateToDelete.name === selectedCandidate.name) {
       setSelectedCandidate(updatedCandidates.length > 0 ? updatedCandidates[0] : null);
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen p-6 pt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-black/20 p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              HR Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Manage job postings and screen candidates.</p>
          </div>
          <button 
            onClick={() => setShowJobForm(!showJobForm)}
            className="btn-primary flex items-center justify-center gap-2 px-6"
          >
            <FiPlusCircle /> {showJobForm ? "Cancel Posting" : "Post a Job"}
          </button>
        </div>

        {/* Post Job Form */}
        {showJobForm && (
          <form onSubmit={handlePostJob} className="card p-6 border-cyan-500/30">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              <FiBriefcase /> Post a New Job
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Company Name" required className="input" value={newJob.companyName} onChange={e => setNewJob({...newJob, companyName: e.target.value})} />
              <input type="text" placeholder="Location" className="input" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
              <input type="text" placeholder="Experience Required (e.g., 2+ Years)" className="input" value={newJob.experience} onChange={e => setNewJob({...newJob, experience: e.target.value})} />
              <input type="text" placeholder="Salary Range" className="input" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} />
              <input type="text" placeholder="Required Skills (comma separated)" className="input md:col-span-2" value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} />
              <textarea placeholder="Job Description" required className="input md:col-span-2 h-24 resize-none" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn-primary w-full mt-4">Publish Job</button>
          </form>
        )}

        {/* Active Jobs Section */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Active Job Postings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job, idx) => (
                <div key={idx} className="card p-5 border-white/10 hover:border-cyan-500/30 transition-colors relative group">
                  <button 
                    onClick={() => handleDeleteJob(idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Job"
                  >
                    <FiTrash2 size={20} />
                  </button>
                  <h3 className="text-xl font-bold text-purple-400 pr-8">{job.companyName}</h3>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-300">
                    {job.location && <span className="flex items-center gap-1"><FiMapPin /> {job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1"><FiDollarSign /> {job.salary}</span>}
                    {job.experience && <span className="flex items-center gap-1"><FiAward /> {job.experience}</span>}
                  </div>
                  <p className="mt-4 text-slate-400 text-sm line-clamp-2">{job.description}</p>
                  {job.skills && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {job.skills.split(',').map((skill, i) => (
                         <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs">{skill.trim()}</span>
                       ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidates & Screening Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FiStar className="text-yellow-400" /> Candidates list
              </h2>
              <button 
                onClick={() => setShowCandidateForm(!showCandidateForm)}
                className="text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 px-3 py-1 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1"
              >
                <FiPlusCircle /> {showCandidateForm ? "Cancel" : "Add Candidate"}
              </button>
            </div>

            {showCandidateForm && (
              <form onSubmit={handleAddCandidate} className="card p-5 border-purple-500/30">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Manually Add Candidate</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Candidate Name" required className="input w-full" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                     <input type="number" placeholder="Score (0-100)" required className="input w-full" value={newCandidate.score} onChange={e => setNewCandidate({...newCandidate, score: e.target.value})} />
                    <select className="input w-full bg-slate-900 border border-white/10" value={newCandidate.status} onChange={e => setNewCandidate({...newCandidate, status: e.target.value})}>
                      <option value="Eligible">Eligible</option>
                      <option value="Not Eligible">Not Eligible</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Current Skills (comma separated)" className="input w-full" value={newCandidate.currentSkills} onChange={e => setNewCandidate({...newCandidate, currentSkills: e.target.value})} />
                  <input type="text" placeholder="Required Job Skills (comma separated)" className="input w-full" value={newCandidate.requiredSkills} onChange={e => setNewCandidate({...newCandidate, requiredSkills: e.target.value})} />
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">Save Candidate</button>
                </div>
              </form>
            )}

            <div className="card p-0 overflow-hidden divide-y divide-white/5 bg-black/20 text-center min-h-[100px] flex flex-col justify-center">
              {candidates.length === 0 ? (
                <p className="p-6 text-slate-500 italic">No candidates available. Add one manually.</p>
              ) : (
                candidates.map((c, i) => {
                const isTop5 = i < 5;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-4 flex items-center justify-between transition-all cursor-pointer group ${isTop5 ? 'bg-gradient-to-r from-cyan-500/5 to-purple-500/5 hover:from-cyan-500/10 hover:to-purple-500/10' : 'hover:bg-white/5'} ${selectedCandidate?.name === c.name ? 'border-l-4 border-cyan-500 bg-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${isTop5 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-white/10 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div className="text-left">
                        <p className={`font-semibold tracking-wide ${isTop5 ? 'text-white' : 'text-slate-300'}`}>{c.name} {isTop5 && "🏅"}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{c.skills}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className={`text-xl font-bold ${isTop5 ? 'text-cyan-400' : 'text-slate-500'}`}>{c.score}%</p>
                      <button 
                        onClick={(e) => handleDeleteCandidate(e, i)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100"
                        title="Delete Candidate"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>

          <div>
             <AIScreening isHR={true} candidateData={selectedCandidate ? { ...selectedCandidate, rank: candidates.findIndex(c => c.name === selectedCandidate.name) + 1 } : null} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default HRDashboard;