import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


function AIScreening({ isHR = false, candidateData }) {
    if (!candidateData) {
        return (
            <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 mt-6 flex items-center justify-center h-48">
                <p className="text-slate-400">No candidate data available. Please upload a resume first.</p>
            </div>
        );
    }

    const candidate = candidateData;

    const parseArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

    const matchedSkills = parseArray(candidate.matchedSkills || candidate.currentSkills || candidate.current_skills);
    const requiredSkills = parseArray(candidate.requiredSkills || candidate.required_skills);
    const missingSkills = parseArray(candidate.missingSkills || candidate.missing_skills);
    const rawScore = candidate.score || 0;
    const score = typeof rawScore === 'string' ? parseInt(rawScore.toString().replace('%', ''), 10) : rawScore;


    const scoreMessage = score >= 60 ? "Good Match" : "Needs Improvement";

    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 mt-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                AI Screening Report
            </h2>

            {/* Candidate Info */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Candidate Name</p>
                    <p className="font-semibold text-lg truncate">{candidate.name}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Match Score</p>
                    <p className="font-bold text-lg text-cyan-400">Score: {score}%</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Global Rank</p>
                    <p className="font-bold text-lg text-yellow-400">{candidate.rank ? `#${candidate.rank}` : "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Match Status</p>
                    <p className={`font-bold text-lg ${score >= 60 ? "text-green-400" : "text-red-400"}`}>
                        {scoreMessage}
                    </p>
                </div>
            </div>

            {/* Skills Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* Matched Skills */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wider">
                        Matched Skills
                    </h3>
                    {matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {matchedSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-green-500/10 text-green-300 text-xs rounded border border-green-500/20">{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 italic text-sm">No matched skills found.</p>
                    )}
                </div>

                {/* Required Skills */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                        Required Skills
                    </h3>
                    {requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {requiredSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-cyan-500/10 text-cyan-300 text-xs rounded border border-cyan-500/20">{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 italic text-sm">No specific requirements.</p>
                    )}
                </div>

                {/* Missing Skills */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">
                        Missing Skills
                    </h3>
                    {missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {missingSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-red-500/10 text-red-300 text-xs rounded border border-red-500/20">{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-green-400 text-sm">All required skills matched 🎉</p>
                    )}
                </div>
            </div>

            {/* Smart Suggestion */}
            <div className={`mt-6 p-4 rounded-xl border ${score >= 60 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${score >= 60 ? 'text-green-400' : 'text-red-400'}`}>
                    AI Improvement Advice
                </h3>

                <p className={`mb-4 ${score >= 60 ? 'text-green-300' : 'text-red-300'}`}>
                    {candidate.feedback ? (
                        candidate.feedback
                    ) : (
                        isHR
                            ? (score >= 60 ? "Candidate is highly eligible for this position. Good Match!" : "Candidate lacks key required skills for this position. Needs Improvement.")
                            : (score >= 60 ? "You are eligible 🎉 Apply now and prepare for interviews!" : "Needs Improvement: Your resume is missing some crucial skills required for this role.")
                    )}
                </p>

                {!isHR && missingSkills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm font-semibold mb-3 text-slate-300">Targeted Learning Path for Missing Skills:</p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`https://chatgpt.com/?q=${encodeURIComponent('Provide a study plan to help me learn these skills: ' + missingSkills.join(', ') + ' to improve my resume for a tech role.')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex px-4 py-2 bg-[#10a37f]/20 text-[#10a37f] hover:bg-[#10a37f]/30 border border-[#10a37f]/30 transition-colors rounded-lg items-center justify-center text-sm font-medium"
                            >
                                Ask ChatGPT for Study Plan
                            </a>
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent('how to learn ' + missingSkills.join(' and '))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors rounded-lg items-center justify-center text-sm font-medium"
                            >
                                Search Google Resources
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Visualizations */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
                {/* Score Bar Chart */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Candidate Score</h3>
                    <div className="w-full max-w-[300px] aspect-square flex items-center justify-center">
                        <Bar 
                            data={{
                                labels: [candidate.name || "Candidate"],
                                datasets: [{
                                    label: "Match Score (%)",
                                    data: [score],
                                    backgroundColor: "rgba(6, 182, 212, 0.6)",
                                    borderColor: "rgba(6, 182, 212, 1)",
                                    borderWidth: 1,
                                    borderRadius: 4,
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                                        ticks: { color: "#94a3b8" }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: "#94a3b8" }
                                    }
                                },
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Skills Pie Chart */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Skills Match Analysis</h3>
                    <div className="w-full max-w-[250px] aspect-square flex items-center justify-center">
                        {matchedSkills.length === 0 && missingSkills.length === 0 ? (
                            <p className="text-slate-400 text-sm">No skill data available for chart.</p>
                        ) : (
                            <Pie 
                                data={{
                                    labels: ["Matched Skills", "Missing Skills"],
                                    datasets: [{
                                        data: [matchedSkills.length, missingSkills.length],
                                        backgroundColor: [
                                            "rgba(34, 197, 94, 0.6)", // Green
                                            "rgba(239, 68, 68, 0.6)"  // Red
                                        ],
                                        borderColor: [
                                            "rgba(34, 197, 94, 1)",
                                            "rgba(239, 68, 68, 1)"
                                        ],
                                        borderWidth: 1,
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { color: "#94a3b8", padding: 20 }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIScreening;