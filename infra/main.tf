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

  # state は S3 に置く。ローカルに置くと、作業ディレクトリを失った時点で
  # 既存リソースを Terraform が見失う。
  #
  # bucket 自体は Terraform の管理外（AWS CLI で作成）。同じ Terraform で
  # 管理すると「state を置く場所を作るのに state が要る」という循環になるため。
  backend "s3" {
    bucket  = "loop-engineering-lab-tfstate-417441750247"
    key     = "infra/terraform.tfstate"
    region  = "ap-northeast-1"
    encrypt = true
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
