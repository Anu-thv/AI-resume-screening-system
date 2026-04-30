from django.urls import path
from .views import signup, login, upload_resume


urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('upload/', upload_resume, name='upload_resume'),
    path('analyze-resumes/', upload_resume, name='analyze_resumes'),
    path('rank/', upload_resume, name='rank_resumes'),
    path('api/get-resumes/', upload_resume, name='get_resumes'),

]
