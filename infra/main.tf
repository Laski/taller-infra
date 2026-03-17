terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  backend "gcs" {
    bucket = "eryx-terraform-state-bucket"
    prefix = "mentyx"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
