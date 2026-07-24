from decouple import config

from .base import *  # noqa: F401,F403

DEBUG = True

if config('USE_POSTGRES', default=False, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='noteflow'),
            'USER': config('DB_USER', default='noteflow'),
            'PASSWORD': config('DB_PASSWORD', default='noteflow'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }

CORS_ALLOW_ALL_ORIGINS = True
