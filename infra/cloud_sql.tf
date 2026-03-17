resource "google_sql_database_instance" "postgres" {
  name             = var.app_name
  database_version = "POSTGRES_18"

  settings {
    tier              = var.db_tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL" # Single zone for price; choose "REGIONAL" for production
    disk_size         = 10
  }
}

resource "google_sql_database" "app_db" {
  name     = var.app_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "app_user" {
  name     = var.app_name
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}
