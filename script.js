import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// ==========================================
// CONFIGURATION
// ==========================================
// Your live Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = "https://career-ai-proxy.robust9223.workers.dev"; 

// ==========================================
// 1. THREE.JS BACKGROUND (Stars Animation)
// ==========================================
const initBackground = () => {
    const container = document.getElementById('canvas-container');
    
    // Safety check
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create Star Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 3000; i++) {
        vertices.push((Math.random() - 0.5) * 2000); // x
        vertices.push((Math.random() - 0.5) * 2000); // y
        vertices.push((Math.random() - 0.5) * 2000); // z
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x888888, size: 2 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    camera.position.z = 1000;

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        stars.rotation.x += 0.0002;
        stars.rotation.y += 0.0005;
        renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// ==========================================
// 2. USER INTERFACE LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initBackground();

    // Select DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const appScreen = document.getElementById('app');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    const inputSection = document.getElementById('input-section');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const outputText = document.getElementById('output-text');

    // Button: Enter App
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
            appScreen.classList.add('fade-in');
        });
    }

    // Button: Generate Career Path
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const name = document.getElementById('user-name').value;
            const skills = document.getElementById('user-input').value;

            // Validation
            if (!skills) {
                alert("Please enter your skills and interests to proceed.");
                return;
            }

            // UI: Switch to Loading
            inputSection.classList.add('hidden');
            loadingState.classList.remove('hidden');
            loadingState.style.display = 'flex';

            try {
                // Fetch Data
                const aiResponse = await fetchCareerAdvice(name, skills);
                
                // UI: Switch to Results
                loadingState.classList.add('hidden');
                resultSection.classList.remove('hidden');
                resultSection.style.display = 'flex';
                
                // Render Markdown (Requires marked.js in HTML)
                if (typeof marked !== 'undefined') {
                    outputText.innerHTML = marked.parse(aiResponse);
                } else {
                    outputText.innerText = aiResponse;
                }

            } catch (error) {
                console.error("App Error:", error);
                
                // Reset UI on error
                loadingState.classList.add('hidden');
                inputSection.classList.remove('hidden');
                alert(`Connection Error: ${error.message}`);
            }
        });
    }
});

// ==========================================
// 3. API CONNECTION (To Cloudflare)
// ==========================================
async function fetchCareerAdvice(name, skills) {
    
    // Create the prompt
    const prompt = `
        Role: Expert Career Counselor.
        User Name: ${name || 'User'}
        User Skills & Interests: ${skills}

        Task: Analyze the user's profile and suggest 3 specific career paths.
        For each path include:
        1. Job Title
        2. Why it fits their skills
        3. A "First Step" to get started.

        Format: Use Markdown (Bold titles, bullet points).
    `;

    // Send to your Cloudflare Worker
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned status: ${response.status} - ${errText}`);
    }
    
    const data = await response.json();
    
    if (data.answer) {
        return data.answer;
    } else if (data.error) {
        throw new Error(data.error);
    } else {
        throw new Error("Invalid response format from server");
    }
}
