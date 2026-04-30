from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Resume
from .resume_parser import extract_text_from_pdf, calculate_score, analyze_resume
from django.conf import settings
import shutil, os
from django.http import FileResponse
from django.core.mail import send_mail, EmailMessage


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({'error': 'All fields are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return Response({'message': 'User created successfully'}, status=200)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')  # candidate / recruiter

    if not username or not password or not role:
        return Response({"error": "All fields are required"}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid username or password"}, status=401)

    if role == "candidate" and user.username.startswith("c_"):
        return Response({
            "message": "Candidate login successful",
            "username": user.username
        }, status=200)
    elif role == "recruiter" and user.username.startswith("r_"):
        return Response({
            "message": "Recruiter login successful",
            "username": user.username
        }, status=200)
    else:
        return Response({"error": "Invalid role or user type"}, status=403)

@api_view(['GET'])
def download_backup(request):
    file_path = os.path.join(settings.BASE_DIR, 'db_backup.sqlite3')
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename='db_backup.sqlite3')
    else:
        return Response({'error': 'Backup database file not found'}, status=404)      
   

@csrf_exempt
@api_view(['POST'])
def upload_resume(request):

    data = request.data
    names = data.getlist('name') if hasattr(data, 'getlist') else data.get('name') or data.get('names')
    if isinstance(names, str): names = [names]
    elif not names: names = []
    
    emails = data.getlist('email') if hasattr(data, 'getlist') else data.get('email') or data.get('emails')
    if isinstance(emails, str): emails = [emails]
    elif not emails: emails = []
    
    resume_files = request.FILES.getlist('resume') if hasattr(request.FILES, 'getlist') else request.FILES.get('resume') or request.FILES.get('resumes')
    if not isinstance(resume_files, list): resume_files = [resume_files] if resume_files else []
    
    job_desc = data.get('job_desc') or data.get('jobDescription')
    job_skills = data.get('job_skills')

    if not names and request.data.get('name'):
        names = [request.data.get('name')]
    if not emails and request.data.get('email'):
        emails = [request.data.get('email')]

    if len(names) == 1 and isinstance(names[0], str) and ',' in names[0]:
        names = [name.strip() for name in names[0].split(',') if name.strip()]
    if len(emails) == 1 and isinstance(emails[0], str) and ',' in emails[0]:
        emails = [email.strip() for email in emails[0].split(',') if email.strip()]

    if not job_desc:
        return Response({"error": "Job description required"}, status=400)

    if len(names) != len(resume_files) or len(emails) != len(resume_files):
        return Response({"error": "Each resume must have name & email"}, status=400)

    # clear old data
    Resume.objects.all().delete()

    results = []

    for i, file in enumerate(resume_files):
        try:
            text = extract_text_from_pdf(file)
        except ValueError as e:
            return Response({"error": f"Failed to process resume {i+1}: {str(e)}"}, status=400)

        analysis = analyze_resume(text, job_desc, job_skills)

        score = analysis["score"]  # Already a percentage
        matched = ", ".join(analysis["matched_skills"])
        missing = ", ".join(analysis["missing_skills"])

        # Use the feedback from analysis
        problem = analysis["feedback"]

        resume = Resume.objects.create(
            name=names[i],
            email=emails[i],
            resume_file=file,
            score=score,
            matched_skills=matched,
            missing_skills=missing,
            problem=problem
        )

    # ranking
    resumes = Resume.objects.all().order_by('-score')

    for index, r in enumerate(resumes, start=1):
        r.rank = index
        r.save()

    final_results = []

    for r in resumes:
        # status
        status ="Selected" if r.score >50 else "Rejected"
        if r.score >= 70:
            category = "Excellent"
        elif r.score >= 40:
            category = "Average"
        else:
            category = "Not Eligible"
        final_results.append({
            "name": r.name,
            "score": round(r.score, 2),
            "rank": r.rank,
            "matched_skills": r.matched_skills,
            "missing_skills": r.missing_skills,
            "problem": r.problem,
            "status": status,
            "category": category,
            "improve_link": f"https://chat.openai.com/?prompt=How to improve skills: {r.missing_skills}",
            "google_link": f"https://www.google.com/search?q={r.missing_skills}"
        })

        # Send Email Notification
        feedback_text = "Good match" if r.score >= 50 else "Needs improvement"
        message = (
            f"Hello {r.name},\n"
            f"Your resume score is {round(r.score, 2)}%.\n"
            f"Matched Skills: {r.matched_skills}\n"
            f"Missing Skills: {r.missing_skills}\n"
            f"Feedback: {feedback_text}\n"
            f"Please improve your skills for better opportunities."
        )
        
        bcc_emails = [e for e in [settings.EMAIL_HOST_USER, getattr(settings, 'EMAIL_HOST_USER_2', None)] if e]

        try:
            email_msg = EmailMessage(
                "Resume Screening Result",
                message,
                settings.EMAIL_HOST_USER,
                [r.email],
                bcc=bcc_emails,
            )
            email_msg.send(fail_silently=False)
        except Exception as e:
            print(f"Primary email failed for {r.email}: {e}. Trying secondary email...")
            try:
                from django.core.mail import get_connection
                connection2 = get_connection(
                    username=settings.EMAIL_HOST_USER_2,
                    password=settings.EMAIL_HOST_PASSWORD_2,
                    fail_silently=False,
                )
                email_msg = EmailMessage(
                    "Resume Screening Result",
                    message,
                    settings.EMAIL_HOST_USER_2,
                    [r.email],
                    bcc=bcc_emails,
                    connection=connection2,
                )
                email_msg.send(fail_silently=False)
            except Exception as e2:
                print(f"Secondary email also failed for {r.email}: {e2}")

    # BACKUP DATABASE FILE
    try:
        shutil.copy("db.sqlite3", "db_backup.sqlite3")
    except:
        pass

    return Response({
        "message": "Resumes uploaded and analyzed successfully",
        "results": final_results
    })
    