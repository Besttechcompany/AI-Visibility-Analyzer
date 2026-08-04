// ======================================================
// AI Visibility Analyzer Dashboard
// ======================================================

// ===========================================
// Backend API
// ===========================================

const API_URL = "https://ai-visibility-analyzer.onrender.com";

// ===========================================
// Authentication
// ===========================================

const params = new URLSearchParams(window.location.search);

let token = params.get("token");

if (token) {

    localStorage.setItem("token", token);

    window.history.replaceState(
        {},
        document.title,
        "dashboard.html"
    );

}
else {

    token = localStorage.getItem("token");

}

if (!token) {

    window.location.href = "login.html";

}

// ===========================================
// DOM Elements
// ===========================================

const profileCard = document.getElementById("profile-card");

const results = document.getElementById("results");

const websiteInput = document.getElementById("website");

// ===========================================
// Load User Profile
// ===========================================

async function loadProfile() {

    try {

        const response = await fetch(

            `${API_URL}/profile`,

            {

                method: "GET",

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error("Unauthorized");

        }

        const data = await response.json();

        profileCard.innerHTML = `

            <div class="user-card">

                <img
                    src="${data.user.picture}"
                    class="profile-image"
                    alt="Profile"
                >

                <div class="user-info">

                    <h3>

                        ${data.user.name}

                    </h3>

                    <p>

                        ${data.user.email}

                    </p>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(error);

        logout();

    }

}

// ===========================================
// Logout
// ===========================================

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}

// ===========================================
// Loading Screen
// ===========================================

function showLoading(url) {

    results.innerHTML = `

        <div class="card">

            <div class="loading-box">

                <div class="spinner"></div>

                <br>

                <h2>

                    Analyzing Website

                </h2>

                <br>

                <p>

                    ${url}

                </p>

                <br>

                <p>

                    Please wait while AI analyzes your website...

                </p>

            </div>

        </div>

    `;

}

// ===========================================
// Error
// ===========================================

function showError(message) {

    results.innerHTML = `

        <div class="card">

            <h2>

                Analysis Failed

            </h2>

            <br>

            <p>

                ${message}

            </p>

        </div>

    `;

}

// ===========================================
// Analyze Website
// ===========================================

async function analyzeWebsite() {

    const website = websiteInput.value.trim();

    if (!website) {

        alert("Please enter website URL.");

        return;

    }

    showLoading(website);

    try {

        const response = await fetch(

            `${API_URL}/analyze`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    url: website

                })

            }

        );

        if (!response.ok) {

            throw new Error("Analysis Failed");

        }

        const data = await response.json();

        console.log(data);

        showResults(data);

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

}


// ======================================================
// Show Results
// ======================================================

function showResults(data) {

    results.innerHTML = "";

    results.appendChild(
        renderOverallScore(data)
    );

    results.appendChild(
        renderAIScores(data)
    );

    results.appendChild(
        renderScreenshots(data)
    );

    results.appendChild(
        renderTechnology(data)
    );

    results.appendChild(
        renderBasicInformation(data)
    );

    results.appendChild(
        renderTechnicalSEO(data)
    );

    results.appendChild(
        renderAudit(data)
    );

    results.appendChild(
        renderOpenGraph(data)
    );

    results.appendChild(
        renderTwitterCards(data)
    );

    results.appendChild(
        renderLLMS(data)
    );

    results.appendChild(
        renderEEAT(data)
    );

    results.appendChild(
        renderEntities(data)
    );

    results.appendChild(
        renderRecommendations(data)
    );

}


// ======================================================
// Overall AI Visibility
// ======================================================

function renderOverallScore(data){

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            Overall AI Visibility

        </h2>

        <div class="overall-card">

            <div class="overall-left">

                <h1>

                    ${data.overall_ai_visibility.overall_score}

                </h1>

                <span class="grade">

                    Grade

                    ${data.overall_ai_visibility.grade}

                </span>

            </div>

            <div class="overall-right">

                <p>

                    Your website's overall AI readiness.

                </p>

            </div>

        </div>

    `;

    return card;

}



// ======================================================
// AI Platform Scores
// ======================================================

function renderAIScores(data){

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            AI Platform Scores

        </h2>

        <div class="score-grid">

            <div class="score-card">

                <h3>

                    ChatGPT

                </h3>

                <h1>

                    ${data.chatgpt.score}

                </h1>

            </div>

            <div class="score-card">

                <h3>

                    Gemini

                </h3>

                <h1>

                    ${data.gemini.score}

                </h1>

            </div>

            <div class="score-card">

                <h3>

                    Claude

                </h3>

                <h1>

                    ${data.claude.score}

                </h1>

            </div>

            <div class="score-card">

                <h3>

                    Perplexity

                </h3>

                <h1>

                    ${data.perplexity.score}

                </h1>

            </div>

        </div>

    `;

    return card;

}

// ======================================================
// Website Screenshots
// ======================================================

function renderScreenshots(data){

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            Website Screenshots

        </h2>

        <div class="screenshots">

            <div class="shot">

                <h3>

                    Desktop View

                </h3>

                <img

                    src="${API_URL}${data.screenshots.desktop}"

                    alt="Desktop Screenshot"

                    onclick="window.open(this.src,'_blank')"

                >

            </div>

            <div class="shot">

                <h3>

                    Mobile View

                </h3>

                <img

                    src="${API_URL}${data.screenshots.mobile}"

                    alt="Mobile Screenshot"

                    onclick="window.open(this.src,'_blank')"

                >

            </div>

        </div>

    `;

    return card;

}


// ======================================================
// Technology Detection
// ======================================================

function renderTechnology(data){

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            Technology Detection

        </h2>

    `;

    if(

        !data.technology ||

        !data.technology.categories ||

        Object.keys(data.technology.categories).length===0

    ){

        html+=`

            <p>

                No technologies detected.

            </p>

        `;

    }

    else{

        html+=`

            <div class="technology-wrapper">

        `;

        Object.entries(

            data.technology.categories

        ).forEach(

            ([category,technologies])=>{

                html+=`

                    <div class="technology-section">

                        <h3>

                            ${category}

                        </h3>

                        <div class="technology-grid">

                `;

                technologies.forEach(tech=>{

                    html+=`

                        <div class="technology-card">

                            <h3>

                                ${tech.technology}

                            </h3>

                            <p>

                                Confidence :

                                <strong>

                                    ${tech.confidence}%

                                </strong>

                            </p>

                            <p>

                                Evidence :

                                ${(tech.evidence||[]).join(", ")}

                            </p>

                        </div>

                    `;

                });

                html+=`

                        </div>

                    </div>

                `;

            }

        );

        html+=`

            </div>

        `;

    }

    card.innerHTML=html;

    return card;

}

// ======================================================
// Basic Information
// ======================================================

function renderBasicInformation(data){

    const basic=data.basic;

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            Basic Information

        </h2>

        <table class="info-table">

            <tr>

                <td>Title</td>

                <td>${basic.title||"-"}</td>

            </tr>

            <tr>

                <td>Meta Description</td>

                <td>${basic.meta_description||"-"}</td>

            </tr>

            <tr>

                <td>Language</td>

                <td>${basic.language||"-"}</td>

            </tr>

            <tr>

                <td>Canonical URL</td>

                <td>${basic.canonical||"-"}</td>

            </tr>

            <tr>

                <td>Robots</td>

                <td>${basic.robots||"-"}</td>

            </tr>

            <tr>

                <td>H1 Headings</td>

                <td>

                    ${(basic.h1||[]).length
                        ? basic.h1.join("<br>")
                        : "-"}

                </td>

            </tr>

            <tr>

                <td>H2 Headings</td>

                <td>

                    ${(basic.h2||[]).length
                        ? basic.h2.join("<br>")
                        : "-"}

                </td>

            </tr>

        </table>

    `;

    return card;

}



// ======================================================
// Technical SEO
// ======================================================

function renderTechnicalSEO(data){

    const seo=data.technical_seo;

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            Technical SEO

        </h2>

        <table class="info-table">

            <tr>

                <td>HTTPS</td>

                <td>${seo.https?"✅ Yes":"❌ No"}</td>

            </tr>

            <tr>

                <td>Status Code</td>

                <td>${seo.status_code}</td>

            </tr>

            <tr>

                <td>Response Time</td>

                <td>${seo.response_time_ms} ms</td>

            </tr>

            <tr>

                <td>Page Size</td>

                <td>${seo.page_size_kb} KB</td>

            </tr>

            <tr>

                <td>Redirected</td>

                <td>${seo.redirected?"Yes":"No"}</td>

            </tr>

            <tr>

                <td>Final URL</td>

                <td>${seo.final_url}</td>

            </tr>

            <tr>

                <td>robots.txt</td>

                <td>${seo.robots_txt?"✅ Found":"❌ Missing"}</td>

            </tr>

            <tr>

                <td>Sitemap.xml</td>

                <td>${seo.sitemap?"✅ Found":"❌ Missing"}</td>

            </tr>

            <tr>

                <td>Structured Data</td>

                <td>${seo.structured_data?"✅ Yes":"❌ No"}</td>

            </tr>

            <tr>

                <td>JSON-LD Count</td>

                <td>${seo.json_ld_count}</td>

            </tr>

            <tr>

                <td>Favicon</td>

                <td>

                    ${seo.favicon
                        ? `<img src="${seo.favicon}" style="height:40px;border-radius:5px;">`
                        : "-"}

                </td>

            </tr>

        </table>

    `;

    return card;

}



// ======================================================
// Website Audit
// ======================================================

function renderAudit(data){

    const audit=data.audit;

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            Website Audit

        </h2>

        <table class="info-table">

            <tr>

                <td>Meta Description</td>

                <td>${audit.meta_description?"✅ Available":"❌ Missing"}</td>

            </tr>

            <tr>

                <td>Canonical URL</td>

                <td>${audit.canonical?"✅ Available":"❌ Missing"}</td>

            </tr>

            <tr>

                <td>Robots Meta</td>

                <td>${audit.robots?"✅ Available":"❌ Missing"}</td>

            </tr>

            <tr>

                <td>H1 Count</td>

                <td>${audit.h1_count}</td>

            </tr>

            <tr>

                <td>Total Images</td>

                <td>${audit.images}</td>

            </tr>

            <tr>

                <td>Images Without ALT</td>

                <td>${audit.images_without_alt}</td>

            </tr>

            <tr>

                <td>Total Links</td>

                <td>${audit.total_links}</td>

            </tr>

        </table>

    `;

    return card;

}

// ======================================================
// Open Graph
// ======================================================

function renderOpenGraph(data){

    const og=data.technical_seo.open_graph||{};

    const summary=data.technical_seo.open_graph_summary||{};

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            Open Graph

        </h2>

        <table class="info-table">

            <tr>

                <td>Available</td>

                <td>${summary.exists?"✅ Yes":"❌ No"}</td>

            </tr>

            <tr>

                <td>Title</td>

                <td>${summary.title?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Description</td>

                <td>${summary.description?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Image</td>

                <td>${summary.image?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>URL</td>

                <td>${summary.url?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Site Name</td>

                <td>${summary.site_name?"✅":"❌"}</td>

            </tr>

        </table>

        <br>

        <h3>

            Open Graph Tags

        </h3>

        <table class="info-table">

    `;

    Object.entries(og).forEach(([key,value])=>{

        html+=`

            <tr>

                <td>${key}</td>

                <td>${value}</td>

            </tr>

        `;

    });

    html+=`

        </table>

    `;

    card.innerHTML=html;

    return card;

}



// ======================================================
// Twitter Cards
// ======================================================

function renderTwitterCards(data){

    const twitter=data.technical_seo.twitter_cards||{};

    const summary=data.technical_seo.twitter_summary||{};

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            Twitter Cards

        </h2>

        <table class="info-table">

            <tr>

                <td>Available</td>

                <td>${summary.exists?"✅ Yes":"❌ No"}</td>

            </tr>

            <tr>

                <td>Card Type</td>

                <td>${summary.card||"-"}</td>

            </tr>

        </table>

    `;

    if(Object.keys(twitter).length){

        html+=`

            <br>

            <h3>

                Twitter Meta Tags

            </h3>

            <table class="info-table">

        `;

        Object.entries(twitter).forEach(([key,value])=>{

            html+=`

                <tr>

                    <td>${key}</td>

                    <td>${value}</td>

                </tr>

            `;

        });

        html+=`

            </table>

        `;

    }

    card.innerHTML=html;

    return card;

}



// ======================================================
// LLMs.txt
// ======================================================

function renderLLMS(data){

    const llms=data.llms;

    const card=document.createElement("section");

    card.className="card";

    card.innerHTML=`

        <h2>

            LLMs.txt

        </h2>

        <table class="info-table">

            <tr>

                <td>Exists</td>

                <td>${llms.exists?"✅ Yes":"❌ No"}</td>

            </tr>

            <tr>

                <td>URL</td>

                <td>${llms.url}</td>

            </tr>

            <tr>

                <td>Size</td>

                <td>${llms.size} Bytes</td>

            </tr>

            <tr>

                <td>Preview</td>

                <td>${llms.preview||"-"}</td>

            </tr>

        </table>

    `;

    return card;

}



// ======================================================
// E-E-A-T
// ======================================================

function renderEEAT(data){

    const eeat=data.eeat;

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            E-E-A-T Analysis

        </h2>

        <table class="info-table">

            <tr>

                <td>Score</td>

                <td>${eeat.score}</td>

            </tr>

            <tr>

                <td>Author</td>

                <td>${eeat.author?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>About</td>

                <td>${eeat.about?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Contact</td>

                <td>${eeat.contact?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Privacy Policy</td>

                <td>${eeat.privacy?"✅":"❌"}</td>

            </tr>

            <tr>

                <td>Terms & Conditions</td>

                <td>${eeat.terms?"✅":"❌"}</td>

            </tr>

        </table>

    `;

    if(eeat.recommendations?.length){

        html+=`

            <br>

            <h3>

                Recommendations

            </h3>

            <ul class="recommendation-list">

        `;

        eeat.recommendations.forEach(item=>{

            html+=`

                <li>${item}</li>

            `;

        });

        html+=`

            </ul>

        `;

    }

    card.innerHTML=html;

    return card;

}

// ======================================================
// Entity Analysis
// ======================================================

function renderEntities(data){

    const entity=data.entities||{};

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            Entity Analysis

        </h2>

        <table class="info-table">

            <tr>

                <td>Total Entities</td>

                <td>${entity.count||0}</td>

            </tr>

        </table>

    `;

    html+=renderEntityGroup(

        "Organizations",

        entity.organizations

    );

    html+=renderEntityGroup(

        "Services",

        entity.services

    );

    html+=renderEntityGroup(

        "Topics",

        entity.topics

    );

    html+=renderEntityGroup(

        "Top Entities",

        entity.top_entities

    );

    card.innerHTML=html;

    return card;

}


// ======================================================
// Entity Helper
// ======================================================

function renderEntityGroup(title,list){

    if(!list || list.length===0){

        return `

            <h3>${title}</h3>

            <p>

                No Data

            </p>

        `;

    }

    return `

        <h3>

            ${title}

        </h3>

        <ul class="entity-list">

            ${list.map(item=>`<li>${item}</li>`).join("")}

        </ul>

    `;

}



// ======================================================
// Recommendations
// ======================================================

function renderRecommendations(data){

    const card=document.createElement("section");

    card.className="card";

    let html=`

        <h2>

            AI Recommendations

        </h2>

    `;

    if(data.recommendations.length){

        html+=`

            <ul class="recommendation-list">

        `;

        data.recommendations.forEach(item=>{

            html+=`

                <li>

                    ${item}

                </li>

            `;

        });

        html+=`

            </ul>

        `;

    }

    else{

        html+=`

            <p>

                Excellent!

                No recommendations found.

            </p>

        `;

    }

    card.innerHTML=html;

    return card;

}



// ======================================================
// Reset Dashboard
// ======================================================

function resetDashboard(){

    websiteInput.value="";

    results.innerHTML=`

        <div class="card">

            <div class="loading-box">

                <h2>

                    🚀 Welcome to AI Visibility Analyzer

                </h2>

                <br>

                <p>

                    Enter your website URL

                    and click

                    Analyze.

                </p>

            </div>

        </div>

    `;

}



// ======================================================
// Notification
// ======================================================

function showNotification(message,type="success"){

    const notification=document.createElement("div");

    notification.className=`notification ${type}`;

    notification.innerHTML=message;

    document.body.appendChild(notification);

    setTimeout(()=>{

        notification.classList.add("show");

    },100);

    setTimeout(()=>{

        notification.classList.remove("show");

        setTimeout(()=>{

            notification.remove();

        },300);

    },3000);

}



// ======================================================
// Initialize Dashboard
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadProfile();

    }

);