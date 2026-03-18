locals {
  # Base path for all Docker images in Artifact Registry
  image_base_path          = "${google_artifact_registry_repository.images.location}-docker.pkg.dev/${google_artifact_registry_repository.images.project}/${google_artifact_registry_repository.images.repository_id}"
  backend_image_full_path  = "${local.image_base_path}/backend"
  frontend_image_full_path = "${local.image_base_path}/frontend"
  database_url             = "postgresql+asyncpg://${google_sql_user.app_user.name}:${google_sql_user.app_user.password}@/${google_sql_database.app_db.name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}

# Backend Cloud Run service
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region

  template {
    service_account = google_service_account.backend.email

    containers {
      # Placeholder used on first apply; replace with `task infra:deploy-backend`
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      env {
        name  = "DATABASE_URL"
        value = local.database_url
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }

    # Cloud SQL Auth Proxy socket — connects the container to the DB instance
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }
  }

  # Image is managed by `task infra:deploy-*`, not by Terraform
  lifecycle {
    ignore_changes = [
      template[0].containers[0].name,
      template[0].containers[0].image,
      client,
      client_version
    ]
  }

  depends_on = [
    google_project_iam_member.backend_cloudsql_client,
  ]
}

# Make the backend publicly accessible (no auth required)
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  name   = google_cloud_run_v2_service.backend.name
  role   = "roles/run.invoker"
  member = "allUsers"
}

# Frontend Cloud Run service
resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region

  template {
    service_account = google_service_account.frontend.email

    containers {
      # Placeholder used on first apply; replace with `task infra:deploy-frontend`
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      # Injected at container startup via envsubst in nginx.conf.template
      env {
        name  = "API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
    }
  }

  # Image is managed by `task infra:deploy-*`, not by Terraform
  lifecycle {
    ignore_changes = [
      template[0].containers[0].name,
      template[0].containers[0].image,
      client,
      client_version
    ]
  }

  depends_on = [
    google_cloud_run_v2_service.backend,
  ]
}

# Make the frontend publicly accessible (no auth required)
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name   = google_cloud_run_v2_service.frontend.name
  role   = "roles/run.invoker"
  member = "allUsers"
}
