terraform {
  backend "s3" {
    bucket         = "ai-portfolio-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
