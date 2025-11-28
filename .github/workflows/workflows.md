# GitHub Actions

Pipeline workflows for Portal application.

## Workflows

### Triggered

- **Manual Deployment** ([do-manual-deploy.yml](do-manual-deploy.yml)):

  Deploy to Development or QA environment.

- **Development Deployment** ([do-dev-deploy.yml](do-dev-deploy.yml)):

  Deploy to Development environment.

- **QA Deployment** ([do-dev-deploy.yml](do-qa-deploy.yml)):

  Deploy to QA environment.

### Reusable

- **Build and Push Image** ([build-push-ar.yml](build-push-ar.yml)):

  Build image and push to GCP Artifact Registry.

- **Update Image** ([update-image-cr.yml](update-image-cr.yml)):

  Update GCP Cloud Run service to use new image.

## Pipeline

### Development

Committing to the `dev` branch deploys to the Development environment.

### QA

Committing to the `main` branch deploys to the QA environment.

## Setup

### GCP

1. Enable the Cloud Run Admin API (run.googleapis.com) in the `platform-common` project.
1. Create a service account in the `platform-common` project.
   - Name: sa-platform-githubactions
   - Description: Manages code deployment from Github actions for platform.
   - Role: `Artifact Registry Writer`
1. Create an access key for the service account.
1. Grant the service account access to the Dev and QA projects.
   - Serviec Account: sa-platform-githubactions
   - Role: `Cloud Run Admin`
1. Grant the service account the `Service Account User` role on the Compute Engine default service account in the Dev and QA projects (Service Account->Permissions->Grant Access).
1. Grant the Cloud Run Service Agent access to the `platform-common` project in the Dev and QA projects.
   - Service Account: `service-{project_number}@serverless-robot-prod.iam.gserviceaccount.com`
   - Role: `Artifact Registry Reader` (`artifactregistry.repositories.downloadArtifacts`)

### Github

#### Secrets

Ensure the following IAM security credentials are populated in GH secrets.

- GCP_ACCESS_KEY - Access key for GCP for IAM service account.

## TODO

1. Add QA environment selection to Manual Deployment, needs project_id logic.
1. Restrict Github actions SA to only cloud run permissions needed (list services, deploy revision).
1. Restrict Github actions SA to only actAs (iam.serviceaccounts.actAs) on default compute SA.
