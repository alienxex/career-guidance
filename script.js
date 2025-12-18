import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// ==========================================
// CONFIGURATION
// ==========================================
// Your live Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = "https://career-ai-proxy.robust9223.workers.dev"; 

// ==========================================
// 1. THREE.JS BACKGROUND
// ==========================================
const initBackground = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create Stars
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

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// ==========================================
// 2. APP LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initBackground();

    const welcomeScreen = document.getElementById('welcome-screen');
    const appScreen = document.getElementById('app');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const inputSection = document.getElementById('input-section');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const outputText = document.getElementById('output-text');

    // Welcome Screen Transition
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
            appScreen.classList.add('fade-in');
        });
    }

    // Handle Submission
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            // Get inputs
            const name = document.getElementById('user-name').value;
            const education = document.getElementById('user-education').value; // <--- NEW FIELD
            const skills = document.getElementById('user-input').value;

            if (!skills) {
                alert("Please enter your skills to proceed.");
                return;
            }

            // Show Loading
            inputSection.classList.add('hidden');
            loadingState.classList.remove('hidden');
            loadingState.style.display = 'flex';

            try {
                // Fetch advice with all 3 parameters
                const aiResponse = await fetchCareerAdvice(name, education, skills);
                
                // Show Result
                loadingState.classList.add('hidden');
                resultSection.classList.remove('hidden');
                resultSection.style.display = 'flex';
                
                // Render Markdown
                if (typeof marked !== 'undefined') {
                    outputText.innerHTML = marked.parse(aiResponse);
                } else {
                    outputText.innerText = aiResponse;
                }

            } catch (error) {
                console.error(error);
                loadingState.classList.add('hidden');
                inputSection.classList.remove('hidden');
                alert(`Error: ${error.message}`);
            }
        });
    }
});

// ==========================================
// 3. API CONNECTION
// ==========================================
async function fetchCareerAdvice(name, education, skills) {
    
    // Construct the prompt with the new education field
    const prompt = `
        Role: Expert Career Counselor.
        User Name: ${name || 'User'}
        Current Education Level: ${education || 'Not specified'}
        User Skills & Interests: ${skills}

        Task: Suggest 3 specific career paths suitable for someone with this education background and skill set.
        
        For each path include:
        1. Job Title
        2. Why it fits their skills & education
        3. A "First Step" to get started.

        Format: Markdown (Bold titles, bullet points).
    `;

    const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errText}`);
    }
    
    const data = await response.json();
    if (data.answer) return data.answer;
    if (data.error) throw new Error(data.error);
    throw new Error("Invalid response format.");
}
