# Azure DevOps Pipeline Strategy

This document outlines the recommended Azure DevOps YAML Pipeline strategy for running the automated tests in this repository. The core concept is to use separate pipeline stages to handle the different authentication requirements for each application under test (Model-Driven App, Power Pages Portal, and Static Web App).

## Rationale

The application has multiple user roles, and for each role will need its own distinct authentication using the authentication scraper and, therefore, a different Playwright authentication setup script (`*.setup.ts`). By isolating these into separate stages, we achieve:

-   **Clarity:** The pipeline clearly shows the test execution flow for each application.
-   **Parallelism:** Stages can be run in parallel to speed up the overall execution time. Although make sure the same user is not being assigned the same role at the same time in two separate stages.
-   **Isolation:** A failure in one application's test suite does not prevent others from running.
-   **Targeted Re-runs:** If tests for only one application fail, that specific stage can be re-run without needing to execute the entire pipeline.

## The Stage Pattern

Each testing stage will follow the same fundamental pattern:

1.  **Install Dependencies:** Install `npm` packages.
2.  **Generate Auth State:** Run the specific Playwright `setup` script for the application being tested. This logs in and saves the authentication state to a JSON file.
3.  **Use Auth File:** The generated JSON file is published as a pipeline artifact, making it available to other tasks.
4.  **Run Tests:** Execute the Playwright tests for that application.
5.  **Publish Results:** Publish the test results to the pipeline run.

## Agent Lifecycle and Sharing Data Between Stages

It is critical to understand that in Azure DevOps, **each job runs on a fresh agent (virtual machine)** by default. Since our design uses one job per stage, this means each stage starts in a clean environment.

This means any files created during a stage—like the JSON authentication files—are discarded when the stage finishes.

To pass these files between stages, we use **Pipeline Artifacts**.
-   The stage that creates the auth file uses the `PublishPipelineArtifact` task to save it.
-   Any subsequent stage that needs the file (like the Load Testing stage) uses the `DownloadPipelineArtifact` task to retrieve it.

---

## Example Pipeline Structure

Here are YAML examples for each stage, now including the artifact tasks.

### Stage 1: Test Model-Driven App

This stage handles authentication for the internal Model-Driven App and runs the corresponding tests.

```yaml
- stage: Test_Model_Driven_App
  displayName: 'Test: Model-Driven App'
  jobs:
  - job: RunMDATests
    displayName: 'Run MDA Playwright Tests'
    steps:
    - task: Npm@1
      displayName: 'Install Dependencies'
      inputs:
        command: 'ci'

    - script: npx playwright test --project="auth-mda"
      displayName: 'Generate MDA Auth State'

    - task: PublishPipelineArtifact@1
      displayName: 'Publish MDA Auth File'
      inputs:
        targetPath: '.auth/mda.json' # Assuming this is where the auth file is saved
        artifact: 'mda-auth'

    - script: npx playwright test --project="mda"
      displayName: 'Run MDA Tests'

    - task: PublishTestResults@2
      displayName: 'Publish Test Results'
      inputs:
        testResultsFiles: 'playwright-report/results.xml'
      condition: always()
```

### Stage 2: Test Power Pages Portal

This stage handles Azure AD B2C authentication for the external-facing Power Pages portal.

```yaml
- stage: Test_Power_Pages_Portal
  displayName: 'Test: Power Pages Portal'
  jobs:
  - job: RunPortalTests
    displayName: 'Run Portal Playwright Tests'
    steps:
    - task: Npm@1
      displayName: 'Install Dependencies'
      inputs:
        command: 'ci'

    - script: npx playwright test --project="auth-b2c"
      displayName: 'Generate Portal B2C Auth State'

    - task: PublishPipelineArtifact@1
      displayName: 'Publish Portal Auth File'
      inputs:
        targetPath: '.auth/b2c.json' # Assuming this is where the auth file is saved
        artifact: 'portal-auth'

    - script: npx playwright test --project="portal"
      displayName: 'Run Portal Tests'

    - task: PublishTestResults@2
      displayName: 'Publish Test Results'
      inputs:
        testResultsFiles: 'playwright-report/results.xml'
      condition: always()
```

### Stage 3: Test Static Web App (Public File)

This stage handles authentication for the public file static web app and runs its tests.

```yaml
- stage: Test_Public_File
  displayName: 'Test: Static Web App (Public File)'
  jobs:
  - job: RunPublicFileTests
    displayName: 'Run Public File Playwright Tests'
    steps:
    - task: Npm@1
      displayName: 'Install Dependencies'
      inputs:
        command: 'ci'

    - script: npx playwright test --project="auth-public-file"
      displayName: 'Generate Public File Auth State'

    - task: PublishPipelineArtifact@1
      displayName: 'Publish Public File Auth File'
      inputs:
        targetPath: '.auth/public-file.json' # Assuming this is where the auth file is saved
        artifact: 'public-file-auth'

    - script: npx playwright test --project="public-file"
      displayName: 'Run Public File Tests'

    - task: PublishTestResults@2
      displayName: 'Publish Test Results'
      inputs:
        testResultsFiles: 'playwright-report/results.xml'
      condition: always()
```

### Stage 4: Run Load Tests

This stage runs after the functional tests. It first downloads all the necessary auth files published by the previous stages and then executes the Locust tests.

```yaml
- stage: Run_Load_Tests
  displayName: 'Run: Load Tests'
  dependsOn: # This stage runs only if the functional tests succeed
  - Test_Model_Driven_App
  - Test_Power_Pages_Portal
  - Test_Public_File
  jobs:
  - job: RunLocustTests
    displayName: 'Run Locust Load Tests'
    steps:
    - task: DownloadPipelineArtifact@2
      displayName: 'Download All Auth Files'
      inputs:
        buildType: 'current'
        # This downloads all published artifacts to $(Pipeline.Workspace)
        # The files will be at $(Pipeline.Workspace)/mda-auth/mda.json, etc.

    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.11'
      displayName: 'Use Python 3.11'

    - script: pip install -r load-tests/requirements.txt
      displayName: 'Install Locust Dependencies'

    # This step would be configured to trigger Azure Load Testing
    # Your locust scripts will need to know to look for the auth files in the download path
    - script: |
        echo "Triggering Azure Load Testing with Locust scripts..."
        # Example: ls -R $(Pipeline.Workspace) to see the downloaded files
        # az load test run ...
      displayName: 'Execute Load Tests via Azure Load Testing'
```
