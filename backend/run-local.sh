#!/bin/bash
# AI Portfolio Backend - Local Development Script
# This script runs the Spring Boot backend with local profile

echo "===================================="
echo "Starting AI Portfolio Backend (Local)"
echo "===================================="
echo ""

# Check if mvnw exists
if [ ! -f "mvnw" ]; then
    echo "Error: Maven wrapper not found!"
    echo "Please run this script from the backend directory."
    exit 1
fi

# Make mvnw executable
chmod +x mvnw

# Run Spring Boot with local profile
echo "Running: ./mvnw spring-boot:run -Dspring-boot.run.profiles=local"
echo ""

./mvnw spring-boot:run -Dspring-boot.run.profiles=local
