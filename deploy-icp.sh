#!/bin/bash

echo "🌐 DEPLOYING TO INTERNET COMPUTER"
echo "================================="

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "Installing DFX..."
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
    source ~/.bashrc
fi

# Build the frontend
echo "🏗️  Building frontend..."
./build.sh

# Start local dfx (if not running)
echo "🚀 Starting local dfx..."
dfx start --background --clean

# Deploy Internet Identity
echo "🔐 Deploying Internet Identity..."
dfx deploy internet_identity

# Deploy backend canister
echo "⚙️  Deploying backend canister..."
dfx deploy splitchain_backend

# Deploy frontend canister
echo "🎨 Deploying frontend canister..."
dfx deploy splitchain_frontend

# Get canister URLs
BACKEND_ID=$(dfx canister id splitchain_backend)
FRONTEND_ID=$(dfx canister id splitchain_frontend)
II_ID=$(dfx canister id internet_identity)

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "Backend Canister: https://$BACKEND_ID.ic0.app"
echo "Frontend URL: https://$FRONTEND_ID.ic0.app"
echo "Internet Identity: https://$II_ID.ic0.app"
echo ""
echo "Local Development:"
echo "Frontend: http://localhost:4943/?canisterId=$FRONTEND_ID"
echo "Backend: http://localhost:4943/?canisterId=$BACKEND_ID"

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_DFX_NETWORK=local
NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=$II_ID
NEXT_PUBLIC_SPLITCHAIN_BACKEND_CANISTER_ID=$BACKEND_ID
EOF

echo "✅ Environment file created: .env.local"
echo "🚀 Your SplitChain Pay is now live on the Internet Computer!"
