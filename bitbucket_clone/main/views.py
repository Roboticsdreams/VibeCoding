from django.shortcuts import render
from datetime import datetime, timedelta

def dashboard(request):
    return render(request, 'dashboard.html')

def overview(request):
    context = {
        'pull_request': {
            'title': 'COLPLM-7828 procedure code display',
            'id': 'COLPLM-7828',
            'description': 'Implementing procedure code display functionality',
            'author': 'John Doe',
            'created': '5 February 2026',
            'status': 'open'
        }
    }
    return render(request, 'overview.html', context)

def diff(request):
    return render(request, 'diff.html')

def commits(request):
    commits_data = [
        {
            'id': 'a1b2c3d',
            'message': 'Add procedure code display component',
            'author': 'John Doe',
            'date': '2 hours ago',
            'changes': '+145 -23'
        },
        {
            'id': 'e4f5g6h',
            'message': 'Update patient liability management',
            'author': 'Jane Smith', 
            'date': '1 day ago',
            'changes': '+67 -12'
        }
    ]
    return render(request, 'commits.html', {'commits': commits_data})

def projects(request):
    projects_data = [
        {
            'name': 'Patient Liability Management',
            'key': 'PLM',
            'updated': 'Updated 1 hour ago',
            'description': 'Core services that power patient payment workflows',
            'status': 'Active'
        },
        {
            'name': 'Collector Automation',
            'key': 'COL',
            'updated': 'Updated yesterday',
            'description': 'Automation tooling for collections team',
            'status': 'In review'
        },
        {
            'name': 'Org Security',
            'key': 'SEC',
            'updated': 'Updated 2 days ago',
            'description': 'Security hardening and compliance checklist',
            'status': 'Paused'
        }
    ]
    return render(request, 'projects.html', {'projects': projects_data})

def repositories(request):
    repos_data = [
        {
            'name': 'patient-payment-collection',
            'project': 'Patient Liability Management',
            'branches': 18,
            'pull_requests': 4,
            'updated': 'Updated 30 minutes ago'
        },
        {
            'name': 'collector-automation-engine',
            'project': 'Collector Automation',
            'branches': 9,
            'pull_requests': 2,
            'updated': 'Updated 4 hours ago'
        },
        {
            'name': 'org-security-secrets',
            'project': 'Org Security',
            'branches': 7,
            'pull_requests': 1,
            'updated': 'Updated yesterday'
        }
    ]
    return render(request, 'repositories.html', {'repositories': repos_data})

def profile(request):
    user_info = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'role': 'Senior Frontend Engineer',
        'timezone': 'UTC+05:30',
        'last_login': 'Today at 08:12 AM'
    }
    activity = [
        'Merged COLPLM-7828 procedure code display',
        'Reviewed PR #287 in patient-payment-collection',
        'Commented on COLPLM-7801 accessibility fixes'
    ]
    return render(request, 'profile.html', {'user': user_info, 'activity': activity})

def settings(request):
    preferences = {
        'notifications': True,
        'dark_mode': False,
        'email_updates': 'Daily summary'
    }
    return render(request, 'settings.html', {'preferences': preferences})

def landing(request):
    return render(request, 'landing.html')

def login_view(request):
    return render(request, 'login.html')

def builds(request):
    builds_data = [
        {
            'title': 'Collector: Patient Liability Management (CHT) » patient-payment-collection » PR-290 #9',
            'author': 'Balumond Matusami',
            'branch': 'COLPLM-7828-procedure-code-display',
            'commit_id': 'COLPLM-7828',
            'status': 'in-progress',
            'status_text': 'In progress',
            'updated': '08 February 2026 06:59 AM'
        },
        {
            'title': 'Org Security - Secrets',
            'author': 'Pramod Matusami',
            'branch': 'COLPLM-7825-procedure-code-display',  
            'commit_id': 'COLPLM-7825',
            'status': 'passed',
            'status_text': 'Passed',
            'updated': '04 February 2026 02:23 PM'
        },
        {
            'title': 'Collector: Patient Liability Management (CHT) » patient-payment-collection » COLPLM-7828-procedure-code-display #9',
            'author': 'Balumond Matusami',
            'branch': 'COLPLM-7828-procedure-code-display',
            'commit_id': 'COLPLM-7828', 
            'status': 'passed',
            'status_text': 'Passed',
            'updated': '05 February 2026 06:59 AM'
        },
        {
            'title': 'Collector: Patient Liability Management (CHT) » patient-payment-collection » COLPLM-7828-procedure-code-display #4',
            'author': 'Balumond Matusami',
            'branch': 'COLPLM-7828-procedure-code-display',
            'commit_id': 'COLPLM-7828',
            'status': 'passed', 
            'status_text': 'Passed',
            'updated': '04 February 2026 02:43 PM'
        }
    ]
    return render(request, 'builds.html', {'builds': builds_data})
