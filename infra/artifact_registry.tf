resource "google_artifact_registry_repository" "images" {
  repository_id = var.app_name
  description   = "Docker images for ${var.app_name}"
  format        = "DOCKER"
}
