# 最小アプリのデプロイ先。Lambda + API Gateway のみ。
# DB は使う段階で足す（README の「空箱を並べない」方針）。

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "loop-engineering-lab"
      ManagedBy = "terraform"
    }
  }
}

locals {
  name = "loop-engineering-lab"

  # ビルド成果物。scripts/build_lambda.sh が作る。
  package_path = "${path.module}/build/lambda.zip"
}
