Run this in your terminal (while the venv is active):

powershell
pip install -r requirements.txt
Once the installation is finished, try running the worker using this command:

powershell
$env:PYTHONPATH = ".."
python -m celery -A celery_app worker --loglevel=info -P solo
Note: I added python -m before celery. This is a more reliable way to run it on Windows because it ensures you're using the exact Celery version installed in your active virtual environment.

5:24 AM
