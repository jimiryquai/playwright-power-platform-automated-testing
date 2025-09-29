#!/bin/bash
# Helper script to run Locust tests with correct Python path

# Add load-tests to Python path so imports work
export PYTHONPATH="${PYTHONPATH}:$(pwd)/load-tests"

# Activate venv
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null

# Get the test file (default to mda_with_auth)
TEST_FILE=${1:-mda_with_auth}
SHIFT_ARGS=${@:2}

# Run Locust
cd load-tests && python -m locust -f locustfiles/${TEST_FILE}.py ${SHIFT_ARGS}
