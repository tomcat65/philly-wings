#!/bin/bash

# Quick local testing script
echo "🔥 Philly Wings Local Testing Setup 🔥"
echo "======================================"

# Check if data files exist
if [ ! -f "data/sauces.json" ] || [ ! -f "data/combos.json" ]; then
    echo "⚠️  Missing data files - dynamic content won't load!"
    echo "   Run: git pull origin my-new-feature"
    echo ""
fi

# Stop any existing container
echo "Stopping existing container if running..."
docker stop philly-test 2>/dev/null
docker rm philly-test 2>/dev/null

# Start fresh nginx container
echo "Starting nginx container..."
docker run -d -p 8080:80 -v $(pwd):/usr/share/nginx/html --name philly-test nginx:alpine

# Wait for container to start
sleep 2

# Check if running
if curl -s -I localhost:8080 > /dev/null; then
    echo "✅ Container running successfully!"
    echo ""
    echo "🌐 Access your site at:"
    echo "   http://localhost:8080"
    echo ""
    echo "📱 Test mobile view:"
    echo "   Open Chrome DevTools (F12) and toggle device mode"
    echo ""
    echo "🛑 To stop:"
    echo "   docker stop philly-test"
    echo ""
    echo "🔄 Files auto-reload - just refresh browser after changes!"
else
    echo "❌ Container failed to start"
    docker logs philly-test
fi