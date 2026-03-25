#!/bin/bash

# Don't use set -e - we want the server to start even if wallet init fails
# The server will run in degraded mode if Linera is unavailable

# Initialize Linera wallet if it doesn't exist
WALLET_DIR="/root/.config/linera"

if [ ! -d "$WALLET_DIR" ] || [ ! -f "$WALLET_DIR/wallet.json" ]; then
    echo "[Startup] Initializing Linera wallet..."

    # Create wallet directory
    mkdir -p "$WALLET_DIR"

    # Initialize wallet with Conway testnet faucet (v0.15.x syntax)
    # Use timeout to prevent hanging - 30 seconds max for each command
    echo "[Startup] Step 1: Initialize wallet (30s timeout)..."
    if timeout 30 linera wallet init --faucet https://faucet.testnet-conway.linera.net 2>&1; then
        echo "[Startup] Wallet initialized"

        # Step 2: Request a new chain from the faucet and set it as default
        echo "[Startup] Step 2: Request chain from faucet (30s timeout)..."
        if timeout 30 linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net --set-default 2>&1; then
            echo "[Startup] Wallet initialized successfully"
        else
            echo "[Startup] WARNING: Failed to request chain from faucet (timeout or error)"
            echo "[Startup] Server will start in degraded mode"
        fi
    else
        echo "[Startup] WARNING: Failed to initialize wallet (timeout or error)"
        echo "[Startup] Server will start in degraded mode"
    fi
else
    echo "[Startup] Wallet already exists"
fi

# Start the Node.js server (always, even if wallet init failed)
echo "[Startup] Starting Air Hockey server on PORT=${PORT:-3001}..."
exec node dist/index.js
