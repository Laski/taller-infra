# Service account for the backend Cloud Run service
resource "google_service_account" "backend" {
  account_id   = "${var.app_name}-backend"
  display_name = "${var.app_name} Backend"
}

# Service account for the frontend Cloud Run service
resource "google_service_account" "frontend" {
  account_id   = "${var.app_name}-frontend"
  display_name = "${var.app_name} Frontend"
}

# Backend can connect to Cloud SQL via Auth Proxy
resource "google_project_iam_member" "backend_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# Backend Cloud Run can pull images from Artifact Registry
resource "google_artifact_registry_repository_iam_member" "backend_reader" {
  repository = google_artifact_registry_repository.images.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.backend.email}"
}

# Frontend Cloud Run can pull images from Artifact Registry
resource "google_artifact_registry_repository_iam_member" "frontend_reader" {
  repository = google_artifact_registry_repository.images.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.frontend.email}"
}
