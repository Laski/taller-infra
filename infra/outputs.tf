output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "backend_image" {
  description = "Full Artifact Registry path for the backend image (append :<tag>)"
  value       = local.backend_image_full_path
}

output "frontend_image" {
  description = "Full Artifact Registry path for the frontend image (append :<tag>)"
  value       = local.frontend_image_full_path
}

output "backend_service" {
  description = "Cloud Run backend service name"
  value       = google_cloud_run_v2_service.backend.name
}

output "frontend_service" {
  description = "Cloud Run frontend service name"
  value       = google_cloud_run_v2_service.frontend.name
}

output "backend_url" {
  description = "Cloud Run backend service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "Cloud Run frontend service URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL instance connection name (for Cloud SQL Auth Proxy)"
  value       = google_sql_database_instance.postgres.connection_name
}
