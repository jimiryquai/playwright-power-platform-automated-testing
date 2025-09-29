@echo off
REM Helper script to run Locust tests on Windows

REM Add load-tests to Python path
set PYTHONPATH=%PYTHONPATH%;%cd%\load-tests

REM Activate venv
call .venv\Scripts\activate

REM Get test file (default to mda_with_auth)
set TEST_FILE=%1
if "%TEST_FILE%"=="" set TEST_FILE=mda_with_auth

REM Run Locust
cd load-tests
python -m locust -f locustfiles\%TEST_FILE%.py %2 %3 %4 %5 %6 %7 %8 %9
