# Backend/Backend/settings_prod.py
from .settings import *
import os

DEBUG = False

ALLOWED_HOSTS = ['*']

# CORS - allow frontend
CORS_ALLOW_ALL_ORIGINS = True

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Database - use SQLite for simplicity
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
