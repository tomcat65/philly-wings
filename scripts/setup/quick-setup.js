// Quick Firestore Setup Script
// Run this in your browser console at https://philly-wings.web.app

async function quickSetup() {
    // Import Firebase (already loaded on your site)
    const { db } = await import('/src/firebase-config.js');
    const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    
    try {
        // Create settings document
        await setDoc(doc(db, 'settings', 'main'), {
            businessHours: {
                monday: { open: "11:00", close: "22:00" },
                tuesday: { open: "11:00", close: "22:00" },
                wednesday: { open: "11:00", close: "22:00" },
                thursday: { open: "11:00", close: "22:00" },
                friday: { open: "11:00", close: "23:00" },
                saturday: { open: "11:00", close: "23:00" },
                sunday: { open: "12:00", close: "21:00" }
            },
            deliveryPlatforms: {
                doorDash: { active: true, url: "https://www.doordash.com/store/philly-wings-express" },
                uberEats: { active: true, url: "https://www.ubereats.com/store/philly-wings-express" },
                grubHub: { active: true, url: "https://www.grubhub.com/restaurant/philly-wings-express" }
            },
            socialMedia: {
                instagram: "@phillywingsexpress",
                facebook: "phillywingsexpress",
                twitter: "@phillywings"
            },
            analytics: {
                orderCount: 0,
                lastHourOrders: 17
            },
            updatedAt: serverTimestamp()
        });
        
        console.log('✅ Settings created successfully!');
        
        // Create a sample game day banner
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        await addDoc(collection(db, 'gameDayBanners'), {
            active: true,
            team1: "EAGLES",
            team2: "COWBOYS",
            gameDate: new Date('2025-09-14T13:00:00'),
            message: "Order your Tailgate Special now",
            specialOffer: "Free delivery on orders $30+",
            priority: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log('✅ Sample game day banner created!');
        console.log('🎉 Setup complete! Refresh the page to see changes.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the setup
quickSetup();