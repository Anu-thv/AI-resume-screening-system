import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiCpu, FiShield } from 'react-icons/fi';

const AboutPage = () => {
  // You can replace these with your actual team members' names and roles
  const teamMembers = [
    { name: "Anushree Singh", role: "Backend" },
    { name: "Harshali Singh", role: "Frontend" },
    { name: "Anurag Singh", role: "Database" },
    { name: "Harsh Singh", role: "Documentation" },
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
            About HireSense
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            HireSense is an intelligent Resume Screening and Eligibility Prediction System designed to streamline the recruitment process. We leverage AI and Natural Language Processing to make hiring faster, fairer, and more accurate.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition">
            <FiCpu className="text-4xl text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
            <p className="text-slate-400">Automated extraction of skills and experience from resumes, matching them directly against job descriptions with high precision.</p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition">
            <FiTarget className="text-4xl text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Objective Scoring</h3>
            <p className="text-slate-400">Removes human bias by calculating an objective match score based strictly on required competencies and qualifications.</p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-green-500/50 transition">
            <FiShield className="text-4xl text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
            <p className="text-slate-400">Candidates receive immediate, automated email feedback with actionable insights on missing skills and areas for improvement.</p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-pink-500/50 transition">
            <FiUsers className="text-4xl text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Built for HR & Candidates</h3>
            <p className="text-slate-400">A dual-dashboard system that provides HR with ranked shortlists while empowering candidates with transparency.</p>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center pt-10 border-t border-white/10"
        >
          <h2 className="text-3xl font-bold mb-10 text-cyan-400">Developed By</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white/5 px-8 py-6 rounded-2xl border border-white/10 min-w-[250px] hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/5">
                <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                <p className="text-cyan-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-500 mt-10 text-sm italic">
            Developed as a College Project to innovate modern recruitment solutions.
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutPage;
