import React, { useState } from 'react';
import { FiUpload, FiRefreshCw, FiAlertCircle, FiExternalLink, FiSearch, FiDownload, FiPrinter } from 'react-icons/fi';

const CircularProgress = ({ percentage, colorClass }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${colorClass} transition-all duration-1000 ease-out`} />
      </svg>
      <span className={`absolute text-xl font-bold ${colorClass}`}>{percentage}%</span>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-pulse mt-8">
    <div className="bg-black/20 border-b border-white/5 p-6 md:p-8 flex justify-between items-center gap-6">
      <div className="space-y-3 w-1/3">
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-6 bg-slate-700 rounded w-3/4"></div>
      </div>
      <div className="w-24 h-24 rounded-full bg-slate-800"></div>
    </div>
    <div className="p-6 md:p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-800 rounded w-16"></div>
            <div className="h-6 bg-slate-800 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ResumeScreener = () => {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDesc(e.target.value);
    if (error === 'Please enter job description') {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!file) {
      setError('Please upload a resume');
      return;
    }
    if (!jobDesc.trim()) {
      setError('Please enter job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', file.name || "Candidate");
    formData.append('email', "candidate@example.com");
    formData.append('job_desc', jobDesc);

    try {
      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      const resultData = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : data);

      const parseArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

      // Construct a new result object bridging the new and old schemas strictly without fake data
      const newResult = {
        id: Date.now(),
        fileName: file.name,
        candidate_name: resultData.candidate_name || file.name,
        score: resultData.match_score !== undefined ? resultData.match_score : (resultData.score || 0),
        matched_skills: parseArray(resultData.matched_skills),
        missing_skills: parseArray(resultData.missing_skills),
        required_skills: parseArray(resultData.required_skills),
        resume_skills: parseArray(resultData.resume_skills),
        improvement_suggestions: parseArray(resultData.improvement_suggestions).length > 0 
          ? parseArray(resultData.improvement_suggestions) 
          : (resultData.feedback ? [resultData.feedback] : []),
        ai_advice: parseArray(resultData.ai_advice)
      };

      setResults(prev => [newResult, ...prev]);
      
      setFile(null);
      const fileInput = document.getElementById('resume-upload-input');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error(err);
      setError(`API Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setJobDesc('');
    setResults([]);
    setError(null);
    const fileInput = document.getElementById('resume-upload-input');
    if (fileInput) fileInput.value = '';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Candidate Name', 'Match Score', 'Matched Skills', 'Missing Skills', 'Status'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        `"${r.candidate_name}"`,
        r.score,
        `"${r.matched_skills.join(', ')}"`,
        `"${r.missing_skills.join(', ')}"`,
        r.score >= 70 ? 'Highly Eligible' : r.score >= 40 ? 'Moderate Match' : 'Low Match'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'ai_screening_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">AI Resume Screener</h1>
            <p className="text-slate-400 mt-2">Upload candidate resumes against your job description for an instant AI evaluation.</p>
          </div>
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 shadow-sm"
          >
            <FiRefreshCw /> Clear All
          </button>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Upload Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiUpload className="text-cyan-400" /> Upload Section
              </h2>
              <div className="w-full h-full min-h-[14rem]">
                <label 
                  htmlFor="resume-upload-input" 
                  className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    file ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 hover:border-cyan-500/50 bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <FiUpload className={`w-10 h-10 mb-3 ${file ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <p className="mb-2 text-sm text-slate-400">
                      {file ? (
                        <span className="font-semibold text-cyan-400">{file.name}</span>
                      ) : (
                        <span><span className="font-semibold text-white">Click to upload</span> or drag and drop</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF Resumes Only</p>
                  </div>
                  <input 
                    id="resume-upload-input" 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Job Description Section */}
            <div className="space-y-4 flex flex-col">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                Job Description Section
              </h2>
              <textarea
                className="w-full flex-grow p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none min-h-[14rem]"
                placeholder="Paste the full job description or list of requirements here..."
                value={jobDesc}
                onChange={handleJobDescriptionChange}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
              <FiAlertCircle className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              isLoading 
                ? 'bg-cyan-600/50 text-white/70 cursor-not-allowed' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="animate-spin" /> Processing...
              </>
            ) : (
              'Screen Candidate'
            )}
          </button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <FiRefreshCw className="animate-spin" /> AI is analyzing the resume...
            </h2>
            <SkeletonLoader />
          </div>
        )}

        {/* Results Section */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Screening Results</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiDownload /> Export CSV
                </button>
                <button 
                  onClick={handlePrintPDF}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPrinter /> Save as PDF
                </button>
              </div>
            </div>
            
            <div className="grid gap-8">
              {results.map((result) => (
                <div key={result.id} className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  
                  {/* Candidate Info Card */}
                  <div className="bg-black/20 border-b border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Candidate Profile</h3>
                      <h2 className="text-2xl font-bold text-white">{result.candidate_name}</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1 text-right">Match Score</p>
                        <p className={`text-sm text-right ${getScoreColor(result.score)}`}>
                          {result.score >= 70 ? 'Highly Eligible' : result.score >= 40 ? 'Moderate Match' : 'Low Match'}
                        </p>
                      </div>
                      <CircularProgress percentage={result.score} colorClass={getScoreColor(result.score)} />
                    </div>
                  </div>

                  {/* Skills Display Grid */}
                  <div className="p-6 md:p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    

                    {/* Matched Skills (Green) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Matched Skills
                      </h4>
                      {result.matched_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.matched_skills.map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No matches found</p>
                      )}
                    </div>

                    {/* Missing Skills (Red) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Missing Skills
                      </h4>
                      {result.missing_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills.map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-green-500 italic">No missing skills!</p>
                      )}
                    </div>

                    {/* Resume Skills (Neutral) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div> Resume Skills
                      </h4>
                      {result.resume_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.resume_skills.map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">None extracted</p>
                      )}
                    </div>
                  </div>

                  {/* Advice & Learning Section */}
                  <div className="bg-slate-950/30 p-6 md:p-8 border-t border-white/5 space-y-8">
                    
                    {/* Improvement Suggestions */}
                    {result.improvement_suggestions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white">Improvement Suggestions</h4>
                        <ul className="space-y-2">
                          {result.improvement_suggestions.map((sug, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-cyan-500 mt-1">•</span> {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Advice */}
                    {result.ai_advice.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-cyan-400">Detailed AI Advice</h4>
                        <div className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded-xl">
                          {result.ai_advice.map((advice, idx) => (
                            <p key={idx} className="text-sm text-cyan-100 leading-relaxed mb-2 last:mb-0">
                              {advice}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Learning Links for Missing Skills */}
                    {result.missing_skills.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h4 className="text-sm font-bold text-slate-200">Learning Resources</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {result.missing_skills.map((skill, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-500 transition-colors">
                              <p className="font-semibold text-slate-200 text-sm">Learn <span className="text-red-400">{skill}</span></p>
                              <div className="flex flex-col gap-2">
                                <a 
                                  href={`https://chatgpt.com/?q=${encodeURIComponent('Provide a comprehensive learning path and tutorial to help me learn ' + skill + ' for a technical role.')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs flex items-center justify-between px-3 py-2 bg-[#10a37f]/10 text-[#10a37f] hover:bg-[#10a37f]/20 rounded transition-colors"
                                >
                                  <span>Learn with ChatGPT</span>
                                  <FiExternalLink />
                                </a>
                                <a 
                                  href={`https://www.google.com/search?q=${encodeURIComponent('learn ' + skill)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs flex items-center justify-between px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                >
                                  <span>Search on Google</span>
                                  <FiSearch />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeScreener;
