import re
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


COMMON_SKILLS = [
    # Programming Languages
    "python", "java", "c", "c++", "javascript", "typescript", "go", "ruby",

    # Web Development
    "html", "css", "react", "angular", "vue", "node", "express", "django", "flask",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "oracle", "sqlite",

    # Data Science & AI
    "machine learning", "deep learning", "nlp", "data analysis", "data science",
    "pandas", "numpy", "scikit-learn", "tensorflow", "keras", "matplotlib",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "git", "github",

    # Software Tools
    "linux", "unix", "rest api", "graphql", "postman",

    # Mobile Development
    "android", "ios", "react native", "flutter",

    # Soft Skills
    "communication", "teamwork", "problem solving", "leadership", "time management"
]

SKILL_WEIGHTS = {

    #Programming Languages (Core)
    "python": 2.0, "java": 2.0, "c": 1.5, "c++": 1.5,
    "javascript": 2.0, "typescript": 1.5, "go": 1.5, "ruby": 1.5,

    # Web Development
    "react": 2.0, "angular": 1.5, "vue": 1.5,
    "node": 2.0, "express": 1.5, "django": 2.0, "flask": 1.5,
    "html": 1.0, "css": 1.0,

    # Databases
    "sql": 2.0, "mysql": 1.5, "postgresql": 1.5,
    "mongodb": 1.5, "oracle": 1.5, "sqlite": 1.0,

    # AI / Data Science (HIGH IMPORTANCE)
    "machine learning": 2.5, "deep learning": 2.5, "nlp": 2.5,
    "data science": 2.0, "data analysis": 1.5,
    "pandas": 1.5, "numpy": 1.5, "scikit-learn": 2.0,
    "tensorflow": 2.5, "keras": 2.0, "matplotlib": 1.0,

    # Cloud & DevOps
    "aws": 2.0, "azure": 1.5, "gcp": 1.5,
    "docker": 2.0, "kubernetes": 2.0,
    "ci/cd": 1.5, "jenkins": 1.5, "git": 1.5, "github": 1.0,

    # Tools & Systems
    "linux": 1.5, "unix": 1.5,
    "rest api": 2.0, "graphql": 1.5, "postman": 1.0,

    # Mobile
    "android": 1.5, "ios": 1.5,
    "react native": 1.5, "flutter": 1.5,

    # Soft Skills (LOW WEIGHT)
    "communication": 0.5,
    "teamwork": 0.5,
    "problem solving": 1.0,
    "leadership": 0.5,
    "time management": 0.5
}

def tfidf_score(resume_text, job_desc):
    if not resume_text or not job_desc:
        return 0

    documents = [resume_text, job_desc]

    tfidf = TfidfVectorizer(stop_words='english')
    vectors = tfidf.fit_transform(documents)

    similarity = cosine_similarity(vectors[0:1], vectors[1:2])

    return similarity[0][0]   # value between 0–1

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text

def extract_skills(text):
    text = clean_text(text)

    words = set(text.split())  # convert to words

    found_skills = []

    for skill in COMMON_SKILLS:
        skill_words = skill.lower().split()

        # check multi-word skills properly
        if len(skill_words) == 1:
            if skill_words[0] in words:
                found_skills.append(skill)

        else:
            # for multi-word like "machine learning"
            if skill.lower() in text:
                found_skills.append(skill)

    return list(set(found_skills))

#step 1 extract text from pdf
def extract_text_from_pdf(file_path):
    try:
        reader = PyPDF2.PdfReader(file_path)
        text = ""

        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")

#step 2 calculate similarity score
def calculate_score(resume_text, job_description):
    if not resume_text or not job_description:
        return 0

    documents = [resume_text, job_description]

    tfidf = TfidfVectorizer(stop_words='english')
    vectors = tfidf.fit_transform(documents)

    similarity = cosine_similarity(vectors[0:1], vectors[1:2])

    return round(similarity[0][0] * 100, 2) 

def analyze_resume(text, job_desc, job_skills=None):
    import re

    if not text or not job_desc:
        return {
            "score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "required_skills": [],
            "feedback": "Candidate needs improvement."
        }

    text = text.lower()
    job_desc = job_desc.lower()

    required_skills = []

    if job_skills:
        skills_list = [s.strip().lower() for s in job_skills.split(',') if s.strip()]
        required_skills.extend(skills_list)
    else:
        for skill in COMMON_SKILLS:
            # More flexible pattern matching for skills
            pattern = r'(?:^|\W)' + re.escape(skill) + r'(?:\W|$)'
            if re.search(pattern, job_desc):
                required_skills.append(skill)

    matched_skills = []

    for skill in required_skills:
        # More flexible pattern matching - handles multi-word skills better
        pattern = r'(?:^|\W)' + re.escape(skill) + r'(?:\W|$)'
        if re.search(pattern, text):
            matched_skills.append(skill)

    missing_skills = list(set(required_skills) - set(matched_skills))

    # Calculate weighted score based on skill importance
    matched_weight = sum(SKILL_WEIGHTS.get(skill, 1.0) for skill in matched_skills)
    required_weight = sum(SKILL_WEIGHTS.get(skill, 1.0) for skill in required_skills)
    
    if required_weight > 0:
        weighted_score = (matched_weight / required_weight) * 100
    else:
        weighted_score = 0
    
    # Normalize to 0-100 range
    score = min(100, max(0, weighted_score))
    score = round(score, 2)

    # Accurate feedback based on score
    if score >= 80:
        feedback = "Excellent match for the role"
    elif score >= 60:
        feedback = "Good match for the role"
    elif score >= 40:
        feedback = f"Moderate match - Missing skills: {', '.join(missing_skills[:3])}" if missing_skills else "Moderate match"
    else:
        feedback = "Candidate lacks required skills"

    # Extract all skills present in the resume
    all_resume_skills = extract_skills(text)

    return {
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "required_skills": required_skills,
        "resume_skills": all_resume_skills,
        "feedback": feedback
    }
    
def generate_feedback(score, missing_skills):
    if score >= 70:
        feedback = "Good match"
    elif score >= 40:
        feedback = "Moderate match, needs improvement"
    else:
        feedback = "Candidate lacks required skills"

    if missing_skills:
        feedback += f". Missing skills: {', '.join(missing_skills)}"

    return feedback
    
