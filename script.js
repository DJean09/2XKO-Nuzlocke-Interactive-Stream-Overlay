// --- CONFIGURATION ---
// Change this to 'false' when you are ready to use the real AWS backend
const LOCAL_TESTING_MODE = true; 

const AWS_POST_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/update';
const AWS_WEBSOCKET_URL = 'wss://your-ws-id.execute-api.us-east-1.amazonaws.com/prod';

// --- PART 1: SENDING DATA ---
async function sendAwsUpdate(payload) {
    if (LOCAL_TESTING_MODE) {
        console.log("Local Test - Payload:", payload);
        // Bypass AWS and force the visual update immediately
        forceLocalVisualUpdate(payload);
        return; 
    }

    try {
        await fetch(AWS_POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Failed to sync with AWS:", error);
    }
}

// A helper function to immediately change the screen during testing
function forceLocalVisualUpdate(payload) {
    if (payload.action === "toggle_champion") {
        const champElement = document.getElementById(payload.champion);
        if (payload.status === "dead") {
            champElement.classList.add('dead');
        } else {
            champElement.classList.remove('dead');
        }
    }
    
    if (payload.action === "update_fuse") {
        const fuseElement = document.getElementById(payload.fuse);
        const badge = fuseElement.querySelector('.counter-badge');
        let count = parseInt(badge.innerText);
        // Ensure count doesn't drop below 0
        let newCount = Math.max(0, count + payload.change); 
        badge.innerText = newCount;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Champion Listeners
    const champions = document.querySelectorAll('.champion');
    champions.forEach(champ => {
        champ.addEventListener('click', () => {
            const isDead = champ.classList.contains('dead');
            sendAwsUpdate({
                action: "toggle_champion",
                champion: champ.id,
                status: isDead ? "alive" : "dead"
            });
        });
    });

    // Fuse Listeners
    const fuses = document.querySelectorAll('.fuse');
    fuses.forEach(fuse => {
        fuse.addEventListener('click', () => {
            sendAwsUpdate({ action: "update_fuse", fuse: fuse.id, change: 1 });
        });
        fuse.addEventListener('contextmenu', (e) => {
            e.preventDefault(); 
            sendAwsUpdate({ action: "update_fuse", fuse: fuse.id, change: -1 });
        });
    });

    // --- THE REVIVE CHAMP MENU LOGIC ---
    const reviveMenu = document.getElementById('revive-menu');
    const deadList = document.getElementById('dead-champions-list');

    // Only run this if we are on the Champions HTML page
    if (reviveMenu) {
        
        // Listen for Right-Click anywhere on the document
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Stop the default right-click menu

            // Find all champions that currently have the 'dead' class
            const deadChampions = document.querySelectorAll('.champion.dead');
            
            // If nobody is dead, don't show the menu
            if (deadChampions.length === 0) {
                reviveMenu.style.display = 'none';
                return; 
            }

            // Clear the old list
            deadList.innerHTML = '';

            // Create a clickable list item for each dead champion
            deadChampions.forEach(champ => {
                const li = document.createElement('li');
                li.innerText = champ.id; // Uses the ID (e.g., 'Braum')
                
                // When you click their name in the menu, revive them!
                li.addEventListener('click', () => {
                    sendAwsUpdate({
                        action: "toggle_champion",
                        champion: champ.id,
                        status: "alive"
                    });
                    reviveMenu.style.display = 'none'; // Hide menu after clicking
                });
                
                deadList.appendChild(li);
            });

            // Move the menu to exactly where your mouse clicked
            reviveMenu.style.left = `${e.pageX}px`;
            reviveMenu.style.top = `${e.pageY}px`;
            reviveMenu.style.display = 'block';
        });

        // Hide the menu if you left-click anywhere else on the screen
        document.addEventListener('click', (e) => {
            // Don't close if they are clicking inside the menu itself
            if (e.target.closest('#revive-menu')) return;
            reviveMenu.style.display = 'none';
        });
    }
});

// --- PART 2: WEBSOCKET ---
if (!LOCAL_TESTING_MODE) {
    const ws = new WebSocket(AWS_WEBSOCKET_URL);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        forceLocalVisualUpdate(data); // Re-using our helper function
    };
    ws.onopen = () => console.log("Connected to AWS WebSocket");
    ws.onerror = (error) => console.error("WebSocket Error: ", error);
}