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


## Example Pipeline Structure

Here are YAML examples for each stage, now including the artifact tasks.

### Stage 1: Test Model-Driven App

This stage handles authentication for the internal Model-Driven App and runs the corresponding tests.

```yaml
UPDATE
```

### Stage 2: Test Power Pages Portal

This stage handles Azure AD B2C authentication for the external-facing Power Pages portal.

```yaml
UPDATE
```

### Stage 3: Test Static Web App (Public File)

This stage handles authentication for the public file static web app and runs its tests.

```yaml
UPDATE
```

### Stage 4: Run Load Tests

This stage runs after the functional tests. It first downloads all the necessary auth files published by the previous stages and then executes the Locust tests.

```yaml
UPDATE
```
