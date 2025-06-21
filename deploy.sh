#!/bin/bash

# Build the Next.js app
echo "Building Next.js application..."
npm run build
npm run export

# Start local dfx
echo "Starting local dfx..."
dfx start --background --clean

# Deploy Internet Identity (for local development)
echo "Deploying Internet Identity..."
dfx deploy internet_identity

# Deploy backend canister
echo "Deploying backend canister..."
dfx deploy splitchain_backend

# Deploy frontend canister
echo "Deploying frontend canister..."
dfx deploy splitchain_frontend

# Get canister IDs
echo "Getting canister IDs..."
BACKEND_CANISTER_ID=$(dfx canister id splitchain_backend)
FRONTEND_CANISTER_ID=$(dfx canister id splitchain_frontend)
II_CANISTER_ID=$(dfx canister id internet_identity)

echo "Deployment complete!"
echo "Backend Canister ID: $BACKEND_CANISTER_ID"
echo "Frontend Canister ID: $FRONTEND_CANISTER_ID"
echo "Internet Identity Canister ID: $II_CANISTER_ID"
echo "Frontend URL: http://localhost:4943/?canisterId=$FRONTEND_CANISTER_ID"
