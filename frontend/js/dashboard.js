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

const profileCard =
    document.getElementById("profile-card");

const results =
    document.getElementById("results");

const websiteInput =
    document.getElementById("website");

// ===========================================
// Loader Variables
// ===========================================

let loaderProgress = 0;

let loaderTimer = null;


// ======================================================
// PDF LIBRARY STATUS
// ======================================================

let pdfLibraryReady = false;


// ======================================================
// LOAD PDF LIBRARY
// ======================================================

function checkPDFLibrary() {

    if (typeof html2pdf !== "undefined") {

        pdfLibraryReady = true;

        console.log(
            "✅ PDF generator loaded successfully."
        );

        return true;

    }

    console.error(
        "❌ html2pdf library is not available."
    );

    return false;
}


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

        const data =
            await response.json();

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


// ======================================================
// HORIZONTAL LOADING SCREEN
// ======================================================

function showLoading(url) {

    results.innerHTML = `

        <div class="card">

            <div class="loading-box">

                <!-- =====================================
                     HORIZONTAL PROGRESS BAR
                ====================================== -->

                <div class="analysis-progress">

                    <div class="progress-track">

                        <div
                            id="progress-bar"
                            class="progress-fill"
                            style="width:0%;"
                        >

                            <span
                                id="progress-number"
                                class="progress-label"
                            >
                                0%
                            </span>

                        </div>

                    </div>

                </div>


                <!-- =====================================
                     LOADING TITLE
                ====================================== -->

                <h2 id="loading-title">

                    Initializing Analysis...

                </h2>


                <!-- =====================================
                     STATUS
                ====================================== -->

                <p
                    id="loading-status"
                    class="loading-status"
                >

                    🔍 Connecting to Website...

                </p>


                <!-- =====================================
                     WEBSITE URL
                ====================================== -->

                <p class="loading-url">

                    ${url}

                </p>


                <!-- =====================================
                     AI PLATFORMS
                ====================================== -->

                <div
                    id="loading-platforms"
                    class="loading-platforms"
                >

                    ⏳ ChatGPT<br>

                    ⏳ Gemini<br>

                    ⏳ Claude<br>

                    ⏳ Perplexity<br>

                    ⏳ Grok<br>

                    ⏳ Google AI Mode<br>

                    ⏳ DeepSeek


                </div>

            </div>

        </div>

    `;

    startFakeLoader();

}


// ======================================================
// FAKE PROGRESS LOADER
//
// IMPORTANT:
//
// This loader can go only from:
//
// 0% → 99%
//
// It MUST NOT reach 100% here.
//
// 100% is handled only after the
// backend has actually returned the result.
// ======================================================

function startFakeLoader() {

    loaderProgress = 0;


    // Clear previous timer if one exists

    if (loaderTimer) {

        clearInterval(loaderTimer);

    }


    const number =
        document.getElementById(
            "progress-number"
        );

    const bar =
        document.getElementById(
            "progress-bar"
        );

    const status =
        document.getElementById(
            "loading-status"
        );

    const platforms =
        document.getElementById(
            "loading-platforms"
        );

    const title =
        document.getElementById(
            "loading-title"
        );


    if (
        !number ||
        !bar ||
        !status ||
        !platforms ||
        !title
    ) {

        return;

    }


    // ==================================================
    // SLOW PROGRESS
    // ==================================================

    loaderTimer = setInterval(() => {


        /*
            0 - 20%
            Faster at the beginning
        */

        if (loaderProgress < 10) {

            loaderProgress += 0.35;

        }


        /*
            20 - 45%
        */

        else if (loaderProgress < 20) {

            loaderProgress += 0.28;

        }


        /*
            45 - 70%
        */

        else if (loaderProgress < 30) {

            loaderProgress += 0.22;

        }


        /*
            70 - 90%
        */

        else if (loaderProgress < 45) {

            loaderProgress += 0.16;

        }


        /*
            90 - 97%
        */

        else if (loaderProgress < 55) {

            loaderProgress += 0.10;

        }


        /*
            97 - 99%
        */

        else if (loaderProgress < 75) {

            loaderProgress += 0.04;

        }


        /*
            NEVER allow fake loader
            to reach 100%.
        */

        loaderProgress =
            Math.min(
                loaderProgress,
                90
            );


        updateLoaderProgress(
            loaderProgress
        );


        // ==================================================
        // LOADING STATUS MESSAGES
        // ==================================================

        if (loaderProgress < 20) {

            status.innerHTML =
                "🔍 Connecting to Website...";

            title.innerHTML =
                "Initializing Analysis...";

        }

        else if (loaderProgress < 40) {

            status.innerHTML =
                "🌐 Crawling Website...";

            title.innerHTML =
                "Analyzing Website...";

        }

        else if (loaderProgress < 60) {

            status.innerHTML =
                "📄 Reading Website Content...";

            title.innerHTML =
                "Reading Website Data...";

        }

        else if (loaderProgress < 80) {

            status.innerHTML =
                "🤖 AI Analysis in Progress...";

            title.innerHTML =
                "AI Analysis in Progress...";

        }

        else if (loaderProgress < 95) {

            status.innerHTML =
                "📊 Calculating AI Visibility Score...";

            title.innerHTML =
                "Calculating Visibility Score...";

        }

        else {

            status.innerHTML =
                "🚀 Finalizing Analysis...";

            title.innerHTML =
                "Finalizing Analysis...";

        }


        // ==================================================
        // AI PLATFORM STATUS
        // ==================================================

       let html = "";


// ChatGPT

html +=
    loaderProgress >= 15
        ? "✅ ChatGPT<br>"
        : "⏳ ChatGPT<br>";


// Gemini

html +=
    loaderProgress >= 30
        ? "✅ Gemini<br>"
        : "⏳ Gemini<br>";


// Claude

html +=
    loaderProgress >= 45
        ? "✅ Claude<br>"
        : "⏳ Claude<br>";


// Perplexity

html +=
    loaderProgress >= 60
        ? "✅ Perplexity<br>"
        : "⏳ Perplexity<br>";


// Grok

html +=
    loaderProgress >= 70
        ? "✅ Grok<br>"
        : "⏳ Grok<br>";


// Google AI Mode

html +=
    loaderProgress >= 80
        ? "✅ Google AI Mode<br>"
        : "⏳ Google AI Mode<br>";


// DeepSeek

html +=
    loaderProgress >= 90
        ? "✅ DeepSeek"
        : "⏳ DeepSeek";


platforms.innerHTML = html;


    }, 100);

}


// ======================================================
// UPDATE HORIZONTAL PROGRESS BAR
// ======================================================

function updateLoaderProgress(value) {

    const number =
        document.getElementById(
            "progress-number"
        );

    const bar =
        document.getElementById(
            "progress-bar"
        );


    if (!number || !bar) {

        return;

    }


    const safeValue =
        Math.max(
            0,
            Math.min(
                value,
                100
            )
        );


    number.innerHTML =
        Math.floor(
            safeValue
        ) + "%";


    bar.style.width =
        safeValue + "%";

}


// ======================================================
// FINISH LOADER
//
// This function is called ONLY after:
//
// const data = await response.json();
//
// Therefore:
//
// Backend finished
//       ↓
// 95/99% → 100%
//       ↓
// Results
// ======================================================

function finishLoader(data) {

    clearInterval(
        loaderTimer
    );


    const number =
        document.getElementById(
            "progress-number"
        );

    const bar =
        document.getElementById(
            "progress-bar"
        );

    const status =
        document.getElementById(
            "loading-status"
        );

    const title =
        document.getElementById(
            "loading-title"
        );

    const platforms =
        document.getElementById(
            "loading-platforms"
        );


    if (
        !number ||
        !bar ||
        !status ||
        !title
    ) {

        showResults(data);

        return;

    }


    // ==================================================
    // BACKEND HAS FINISHED
    //
    // NOW continue to 100%.
    // ==================================================

    const finishTimer =
        setInterval(() => {


            loaderProgress += 0.75;


            if (
                loaderProgress >= 100
            ) {

                loaderProgress = 100;

            }


            updateLoaderProgress(
                loaderProgress
            );


            // ==========================================
            // 100% REACHED
            // ==========================================

            if (
                loaderProgress >= 100
            ) {

                clearInterval(
                    finishTimer
                );


                title.innerHTML =
                    "Analysis Complete";


                status.innerHTML =
                    "✅ Analysis completed successfully";


                if (platforms) {

                    platforms.innerHTML = `

                        ✅ ChatGPT<br>

                        ✅ Gemini<br>

                        ✅ Claude<br>

                        ✅ Perplexity<br>

                        ✅ Grok<br>

                        ✅ Google AI Mode<br>

                        ✅ DeepSeek

                              `;

                }


                /*
                    IMPORTANT:

                    Results are NOT displayed
                    until the progress bar
                    has actually reached 100%.
                */

                setTimeout(() => {

                    showResults(data);


                    const analyzeBtn =
                        document.querySelector(
                            ".analyze-btn"
                        );


                    if (analyzeBtn) {

                        analyzeBtn.disabled =
                            false;

                        analyzeBtn.innerHTML =
                            "🚀 Analyze";

                        analyzeBtn.style.opacity =
                            "1";

                        analyzeBtn.style.cursor =
                            "pointer";

                    }

                }, 350);

            }


        }, 30);

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

// ===========================================
// Analyze Website
// ===========================================

async function analyzeWebsite() {

    let website = websiteInput.value.trim();


    // ==========================================
    // EMPTY INPUT
    // ==========================================

    if (!website) {

        showError(
            "Please enter a website address.<br><br>" +
            "Example: <strong>mckinleyresearch.org</strong>"
        );

        websiteInput.focus();

        return;
    }


    // ==========================================
    // NORMALIZE URL
    // ==========================================

    if (!/^https?:\/\//i.test(website)) {

        website = "https://" + website;

    }


    // ==========================================
    // VALIDATE URL FORMAT
    // ==========================================

    let parsedURL;

    try {

        parsedURL = new URL(website);

    }
    catch (error) {

        showError(
            "The website address you entered is not valid.<br><br>" +
            "Please enter a valid domain" 
        );

        websiteInput.focus();

        return;
    }


    // ==========================================
    // CHECK DOMAIN
    // ==========================================

    if (
        !parsedURL.hostname ||
        !parsedURL.hostname.includes(".")
    ) {

        showError(
            "Please enter a valid website domain" 
         );

        websiteInput.focus();

        return;
    }


    // ==========================================
    // UPDATE INPUT
    // ==========================================

    websiteInput.value = website;


    // ==========================================
    // DISABLE ANALYZE BUTTON
    // ==========================================

    const analyzeBtn =
        document.querySelector(".analyze-btn");


    if (analyzeBtn) {

        analyzeBtn.disabled = true;

        analyzeBtn.innerHTML =
            "⏳ Analyzing...";

        analyzeBtn.style.opacity =
            "0.7";

        analyzeBtn.style.cursor =
            "wait";

    }


    // ==========================================
    // SHOW LOADING
    // ==========================================

    showLoading(website);


    try {

        // ======================================
        // SEND TO BACKEND
        // ======================================

        const response =
            await fetch(

                `${API_URL}/analyze`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            url: website

                        })

                }

            );


        // ======================================
        // SERVER ERROR
        // ======================================

        if (!response.ok) {

            let serverMessage = "";

            try {

                const errorData =
                    await response.json();

                serverMessage =
                    errorData.detail ||
                    errorData.error ||
                    "";

            }
            catch (e) {

                console.error(
                    "Error reading server response:",
                    e
                );

            }


            // ----------------------------------
            // 400
            // ----------------------------------

            if (response.status === 400) {

                throw new Error(
                    serverMessage ||
                    "The website address is invalid or could not be analyzed."
                );

            }


            // ----------------------------------
            // 401
            // ----------------------------------

            if (response.status === 401) {

                throw new Error(
                    "Your login session has expired. Please log in again."
                );

            }


            // ----------------------------------
            // 403
            // ----------------------------------

            if (response.status === 403) {

                throw new Error(
                    "Access to this website analysis is not permitted."
                );

            }


            // ----------------------------------
            // 404
            // ----------------------------------

            if (response.status === 404) {

                throw new Error(
                    "The analysis service could not be found. Please try again later."
                );

            }


            // ----------------------------------
            // 408
            // ----------------------------------

            if (response.status === 408) {

                throw new Error(
                    "The website took too long to respond. Please try again."
                );

            }


            // ----------------------------------
            // 429
            // ----------------------------------

            if (response.status === 429) {

                throw new Error(
                    "Too many analysis requests. Please wait a moment and try again."
                );

            }


            // ----------------------------------
            // 500+
            // ----------------------------------

            if (response.status >= 500) {

                throw new Error(
                    "Our analysis server is temporarily unavailable. Please try again in a few moments."
                );

            }


            // ----------------------------------
            // GENERAL ERROR
            // ----------------------------------

            throw new Error(
                serverMessage ||
                `Unable to analyze the website (Error ${response.status}).`
            );

        }


        // ======================================
        // GET RESULT
        // ======================================

        const data =
            await response.json();


        console.log(
            "Analysis Result:",
            data
        );


        // ======================================
        // BACKEND ERROR INSIDE RESPONSE
        // ======================================

        if (data.success === false) {

            throw new Error(
                data.error ||
                data.message ||
                "The website could not be analyzed."
            );

        }


        // ======================================
        // FINISH LOADER
        //
        // 99%
        // ↓
        // 100%
        // ↓
        // RESULTS
        // ======================================

        finishLoader(data);

    }


    catch (error) {

        console.error(
            "Analysis Error:",
            error
        );


        // ======================================
        // STOP LOADER
        // ======================================

        clearInterval(
            loaderTimer
        );


        // ======================================
        // SHOW PROPER ERROR
        // ======================================

        showError(
            error.message ||
            "We couldn't analyze this website. Please check the website address and try again."
        );


        // ======================================
        // RESTORE BUTTON
        // ======================================

        if (analyzeBtn) {

            analyzeBtn.disabled =
                false;

            analyzeBtn.innerHTML =
                "🚀 Analyze";

            analyzeBtn.style.opacity =
                "1";

            analyzeBtn.style.cursor =
                "pointer";

        }

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

    // ==================================================
    // DOWNLOAD PDF BUTTON
    // APPEARS ONLY AFTER RESULTS
    // ==================================================

    const pdfSection =
        document.createElement("section");


    pdfSection.className =
        "pdf-download-section";


    pdfSection.innerHTML = `

    <button
        type="button"
        id="download-pdf-btn"
        class="pdf-btn"
        onclick="downloadPDF()"
    >

        📄 Download PDF Report

    </button>

`;


    results.appendChild(
        pdfSection
    );

}


// ======================================================
// Overall AI Visibility
// ======================================================

function renderOverallScore(data) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    card.innerHTML = `

        <h2>

            Overall AI Visibility

        </h2>

        <div class="overall-card">

            <div class="overall-left">

                <h1>

                    ${data
                        .overall_ai_visibility
                        .overall_score}

                </h1>

                <span class="grade">

                    Grade

                    ${data
                        .overall_ai_visibility
                        .grade}

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

// ======================================================
// AI PLATFORM SCORES
// ======================================================

function renderAIScores(data) {

    const card =
        document.createElement("section");

    card.className = "card";

    // ------------------------------------------
    // Safely get platform scores
    // ------------------------------------------

    const chatgpt =
        data.chatgpt?.score ?? 0;

    const gemini =
        data.gemini?.score ?? 0;

    const claude =
        data.claude?.score ?? 0;

    const perplexity =
        data.perplexity?.score ?? 0;

    const grok =
        data.grok?.score ?? 0;

    const googleAIMode =
        data.google_ai_mode?.score ?? 0;

    const deepseek =
        data.deepseek?.score ?? 0;


    // ------------------------------------------
    // Build AI Platform Cards
    // ------------------------------------------

    card.innerHTML = `

        <h2>
            AI Platform Scores
        </h2>

        <div class="score-grid">


            <!-- =================================
                 CHATGPT
            ================================== -->

            <div class="score-card">

                <h3>
                    ChatGPT
                </h3>

                <h1>
                    ${chatgpt}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 GEMINI
            ================================== -->

            <div class="score-card">

                <h3>
                    Gemini
                </h3>

                <h1>
                    ${gemini}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 CLAUDE
            ================================== -->

            <div class="score-card">

                <h3>
                    Claude
                </h3>

                <h1>
                    ${claude}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 PERPLEXITY
            ================================== -->

            <div class="score-card">

                <h3>
                    Perplexity
                </h3>

                <h1>
                    ${perplexity}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 GROK
            ================================== -->

            <div class="score-card">

                <h3>
                    Grok
                </h3>

                <h1>
                    ${grok}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 GOOGLE AI MODE
            ================================== -->

            <div class="score-card">

                <h3>
                    Google AI Mode
                </h3>

                <h1>
                    ${googleAIMode}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


            <!-- =================================
                 DEEPSEEK
            ================================== -->

            <div class="score-card">

                <h3>
                    DeepSeek
                </h3>

                <h1>
                    ${deepseek}
                </h1>

                <p>
                    AI Visibility Score
                </p>

            </div>


        </div>

    `;


    return card;

}


// ======================================================
// Technology Detection
// ======================================================

// ======================================================
// Technology Detection
// ALL TECHNOLOGIES — 2 CARDS PER ROW
// ======================================================

function renderTechnology(data) {

    const card =
        document.createElement("section");

    card.className = "card";

    let html = `

        <h2>
            Technology Detection
        </h2>

    `;


    // ==================================================
    // CHECK TECHNOLOGY DATA
    // ==================================================

    if (
        !data.technology ||
        !data.technology.categories ||
        Object.keys(data.technology.categories).length === 0
    ) {

        html += `

            <p>
                No technologies detected.
            </p>

        `;

        card.innerHTML = html;

        return card;
    }


    // ==================================================
    // CREATE ONE GLOBAL TECHNOLOGY GRID
    // ==================================================

    html += `

        <div class="technology-grid">

    `;


    // ==================================================
    // LOOP THROUGH ALL CATEGORIES
    // ==================================================

    Object.entries(
        data.technology.categories
    ).forEach(
        ([category, technologies]) => {

            if (
                !technologies ||
                technologies.length === 0
            ) {

                return;

            }


            // ==========================================
            // ADD EVERY TECHNOLOGY TO SAME GRID
            // ==========================================

            technologies.forEach(
                tech => {

                    html += `

                        <div class="technology-card">

                            <div class="technology-category">

                                ${category}

                            </div>


                            <h3>
                                ${tech.technology || "Unknown Technology"}
                            </h3>


                            <p>

                                Confidence:

                                <strong>
                                    ${tech.confidence || 0}%
                                </strong>

                            </p>


                            <p>

                                Evidence:

                                ${
                                    (tech.evidence || [])
                                        .join(", ")
                                    || "Not available"
                                }

                            </p>

                        </div>

                    `;

                }
            );

        }
    );


    // ==================================================
    // CLOSE GLOBAL GRID
    // ==================================================

    html += `

        </div>

    `;


    card.innerHTML = html;

    return card;

}


// ======================================================
// Basic Information
// ======================================================

function renderBasicInformation(data) {

    const basic =
        data.basic || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    card.innerHTML = `

        <h2>
            Basic Information
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Title
                </td>

                <td>
                    ${basic.title || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Meta Description
                </td>

                <td>
                    ${basic.meta_description || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Language
                </td>

                <td>
                    ${basic.language || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Canonical URL
                </td>

                <td>
                    ${basic.canonical || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Robots
                </td>

                <td>
                    ${basic.robots || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    H1 Headings
                </td>

                <td>

                    ${
                        (basic.h1 || []).length

                            ? basic.h1.join("<br>")

                            : "-"
                    }

                </td>

            </tr>


            <tr>

                <td>
                    H2 Headings
                </td>

                <td>

                    ${
                        (basic.h2 || []).length

                            ? basic.h2.join("<br>")

                            : "-"
                    }

                </td>

            </tr>

        </table>

    `;


    return card;

}


// ======================================================
// Technical SEO
// ======================================================

function renderTechnicalSEO(data) {

    const seo =
        data.technical_seo || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    card.innerHTML = `

        <h2>
            Technical SEO
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    HTTPS
                </td>

                <td>
                    ${
                        seo.https
                            ? "✅ Yes"
                            : "❌ No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Status Code
                </td>

                <td>
                    ${seo.status_code || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Response Time
                </td>

                <td>
                    ${seo.response_time_ms || "-"} ms
                </td>

            </tr>


            <tr>

                <td>
                    Page Size
                </td>

                <td>
                    ${seo.page_size_kb || "-"} KB
                </td>

            </tr>


            <tr>

                <td>
                    Redirected
                </td>

                <td>
                    ${
                        seo.redirected
                            ? "Yes"
                            : "No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Final URL
                </td>

                <td>
                    ${seo.final_url || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    robots.txt
                </td>

                <td>
                    ${
                        seo.robots_txt
                            ? "✅ Found"
                            : "❌ Missing"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Sitemap.xml
                </td>

                <td>
                    ${
                        seo.sitemap
                            ? "✅ Found"
                            : "❌ Missing"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Structured Data
                </td>

                <td>
                    ${
                        seo.structured_data
                            ? "✅ Yes"
                            : "❌ No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    JSON-LD Count
                </td>

                <td>
                    ${seo.json_ld_count || 0}
                </td>

            </tr>


            <tr>

                <td>
                    Favicon
                </td>

                <td>

                    ${
                        seo.favicon

                            ? `
                                <img
                                    src="${seo.favicon}"
                                    style="
                                        height:40px;
                                        border-radius:5px;
                                    "
                                >
                              `

                            : "-"
                    }

                </td>

            </tr>

        </table>

    `;


    return card;

}


// ======================================================
// Website Audit
// ======================================================

function renderAudit(data) {

    const audit =
        data.audit || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    card.innerHTML = `

        <h2>
            Website Audit
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Meta Description
                </td>

                <td>
                    ${
                        audit.meta_description
                            ? "✅ Available"
                            : "❌ Missing"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Canonical URL
                </td>

                <td>
                    ${
                        audit.canonical
                            ? "✅ Available"
                            : "❌ Missing"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Robots Meta
                </td>

                <td>
                    ${
                        audit.robots
                            ? "✅ Available"
                            : "❌ Missing"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    H1 Count
                </td>

                <td>
                    ${audit.h1_count || 0}
                </td>

            </tr>


            <tr>

                <td>
                    Total Images
                </td>

                <td>
                    ${audit.images || 0}
                </td>

            </tr>


            <tr>

                <td>
                    Images Without ALT
                </td>

                <td>
                    ${audit.images_without_alt || 0}
                </td>

            </tr>


            <tr>

                <td>
                    Total Links
                </td>

                <td>
                    ${audit.total_links || 0}
                </td>

            </tr>

        </table>

    `;


    return card;

}


// ======================================================
// Open Graph
// ======================================================

function renderOpenGraph(data) {

    const technicalSEO =
        data.technical_seo || {};


    const og =
        technicalSEO.open_graph || {};


    const summary =
        technicalSEO.open_graph_summary || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            Open Graph
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Available
                </td>

                <td>
                    ${
                        summary.exists
                            ? "✅ Yes"
                            : "❌ No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Title
                </td>
  <td>
                    ${
                        summary.title
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Description
                </td>

                <td>
                    ${
                        summary.description
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Image
                </td>

                <td>
                    ${
                        summary.image
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    URL
                </td>

                <td>
                    ${
                        summary.url
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Site Name
                </td>

                <td>
                    ${
                        summary.site_name
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>

        </table>

        <br>

        <h3>
            Open Graph Tags
        </h3>

        <table class="info-table">

    `;


    Object.entries(
        og
    ).forEach(
        ([key, value]) => {

            html += `

                <tr>

                    <td>
                        ${key}
                    </td>

                    <td>
                        ${value}
                    </td>

                </tr>

            `;

        }
    );


    html += `

        </table>

    `;


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// Twitter Cards
// ======================================================

function renderTwitterCards(data) {

    const technicalSEO =
        data.technical_seo || {};


    const twitter =
        technicalSEO.twitter_cards || {};


    const summary =
        technicalSEO.twitter_summary || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            Twitter Cards
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Available
                </td>

                <td>
                    ${
                        summary.exists
                            ? "✅ Yes"
                            : "❌ No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Card Type
                </td>

                <td>
                    ${summary.card || "-"}
                </td>

            </tr>

        </table>

    `;


    if (
        Object.keys(twitter).length
    ) {

        html += `

            <br>

            <h3>
                Twitter Meta Tags
            </h3>

            <table class="info-table">

        `;


        Object.entries(
            twitter
        ).forEach(
            ([key, value]) => {

                html += `

                    <tr>

                        <td>
                            ${key}
                        </td>

                        <td>
                            ${value}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

            </table>

        `;

    }


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// LLMs.txt
// ======================================================

function renderLLMS(data) {

    const llms =
        data.llms || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    card.innerHTML = `

        <h2>
            LLMs.txt
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Exists
                </td>

                <td>
                    ${
                        llms.exists
                            ? "✅ Yes"
                            : "❌ No"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    URL
                </td>

                <td>
                    ${llms.url || "-"}
                </td>

            </tr>


            <tr>

                <td>
                    Size
                </td>

                <td>
                    ${llms.size || 0} Bytes
                </td>

            </tr>


            <tr>

                <td>
                    Preview
                </td>

                <td>
                    ${llms.preview || "-"}
                </td>

            </tr>

        </table>

    `;


    return card;

}


// ======================================================
// E-E-A-T
// ======================================================

function renderEEAT(data) {

    const eeat =
        data.eeat || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            E-E-A-T Analysis
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Score
                </td>

                <td>
                    ${eeat.score || 0}
                </td>

            </tr>


            <tr>

                <td>
                    Author
                </td>

                <td>
                    ${
                        eeat.author
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    About
                </td>

                <td>
                    ${
                        eeat.about
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Contact
                </td>

                <td>
                    ${
                        eeat.contact
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Privacy Policy
                </td>

                <td>
                    ${
                        eeat.privacy
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>


            <tr>

                <td>
                    Terms & Conditions
                </td>

                <td>
                    ${
                        eeat.terms
                            ? "✅"
                            : "❌"
                    }
                </td>

            </tr>

        </table>

    `;


    if (
        eeat.recommendations &&
        eeat.recommendations.length
    ) {

        html += `

            <br>

            <h3>
                Recommendations
            </h3>

            <ul class="recommendation-list">

        `;


        eeat.recommendations
            .forEach(
                item => {

                    html += `

                        <li>
                            ${item}
                        </li>

                    `;

                }
            );


        html += `

            </ul>

        `;

    }


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// Entity Analysis
// ======================================================

function renderEntities(data) {

    const entity =
        data.entities || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            Entity Analysis
        </h2>

        <table class="info-table">

            <tr>

                <td>
                    Total Entities
                </td>

                <td>
                    ${entity.count || 0}
                </td>

            </tr>

        </table>

    `;


    html += renderEntityGroup(
        "Organizations",
        entity.organizations
    );


    html += renderEntityGroup(
        "Services",
        entity.services
    );


    html += renderEntityGroup(
        "Topics",
        entity.topics
    );


    html += renderEntityGroup(
        "Top Entities",
        entity.top_entities
    );


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// Entity Helper
// ======================================================

function renderEntityGroup(
    title,
    list
) {

    if (
        !list ||
        list.length === 0
    ) {

        return `

            <h3>
                ${title}
            </h3>

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

            ${
                list
                    .map(
                        item =>
                            `<li>${item}</li>`
                    )
                    .join("")
            }

        </ul>

    `;

}


// ======================================================
// Recommendations
// ======================================================

function renderRecommendations(data) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            AI Recommendations
        </h2>

    `;


    const recommendations =
        data.recommendations || [];


    if (
        recommendations.length
    ) {

        
        html += `

            <ul class="recommendation-list">

        `;


        recommendations.forEach(
            item => {

                html += `

                    <li>
                        ${item}
                    </li>

                `;

            }
        );


        html += `

            </ul>

        `;

    }

    else {

        html += `

            <p>

                Excellent!

                No recommendations found.

            </p>

        `;

    }


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// Reset Dashboard
// ======================================================

function resetDashboard() {

    websiteInput.value = "";


    clearInterval(
        loaderTimer
    );


    loaderProgress = 0;


    results.innerHTML = `

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


    const analyzeBtn =
        document.querySelector(
            ".analyze-btn"
        );


    if (analyzeBtn) {

        analyzeBtn.disabled =
            false;

        analyzeBtn.innerHTML =
            "🚀 Analyze";

        analyzeBtn.style.opacity =
            "1";

        analyzeBtn.style.cursor =
            "pointer";

    }

}


// ======================================================
// Notification
// ======================================================

function showNotification(
    message,
    type = "success"
) {

    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        `notification ${type}`;


    notification.innerHTML =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "show"
            );

        },
        100
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    notification.remove();

                },
                300
            );

        },
        3000
    );

}


// ======================================================
// Initialize Dashboard
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProfile();

        // Check PDF library after page loads
        setTimeout(() => {

            checkPDFLibrary();

        }, 500);

    }
);

// ======================================================
// DOWNLOAD PDF REPORT
// FINAL WIDTH / BLANK PAGE FIX
// ======================================================

async function downloadPDF() {

    const results =
        document.getElementById("results");

    const button =
        document.getElementById("download-pdf-btn");


    if (!results) {

        showNotification(
            "Report not found.",
            "error"
        );

        return;
    }


    if (typeof html2pdf === "undefined") {

        showNotification(
            "PDF generator is not loaded.",
            "error"
        );

        return;
    }


    if (button) {

        button.disabled = true;
        button.innerHTML = "⏳ Generating PDF...";

    }


    let exportArea = null;


    try {

        // ==============================================
        // CREATE CLEAN EXPORT AREA
        // ==============================================

        exportArea =
            document.createElement("div");


        exportArea.id =
            "pdf-export-area";


        // A4 usable width.
        // Do NOT use 794px + canvas width overrides.

        exportArea.style.width =
            "190mm";

        exportArea.style.margin =
            "0 auto";

        exportArea.style.padding =
            "0";

        exportArea.style.background =
            "#ffffff";

        exportArea.style.color =
            "#111827";

        exportArea.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        exportArea.style.boxSizing =
            "border-box";


        // ==============================================
        // CLONE RESULTS
        // ==============================================

        const clone =
            results.cloneNode(true);


        clone.removeAttribute("id");


        // Remove download button

        const downloadSection =
            clone.querySelector(
                ".pdf-download-section"
            );


        if (downloadSection) {

            downloadSection.remove();

        }


        // ==============================================
        // FORCE FULL WIDTH
        // ==============================================

        clone.style.width =
            "100%";

        clone.style.maxWidth =
            "none";

        clone.style.margin =
            "0";

        clone.style.padding =
            "0";

        clone.style.background =
            "#ffffff";

        clone.style.boxSizing =
            "border-box";


        // ==============================================
        // PDF CSS
        // ==============================================

        const style =
            document.createElement("style");


        style.textContent = `

            #pdf-export-area,
            #pdf-export-area * {
                box-sizing: border-box !important;
            }


            #pdf-export-area {
                width: 190mm !important;
                max-width: 190mm !important;
                background: white !important;
            }


            #pdf-export-area .card {

                width: 100% !important;
                max-width: 100% !important;

                margin:
                    0 0 6mm 0 !important;

                padding:
                    6mm !important;

                background:
                    #ffffff !important;

                overflow:
                    visible !important;

                transform:
                    none !important;
            }


            /* ========================================
               OVERALL SCORE
               ======================================== */

            #pdf-export-area .overall-card {

                width:
                    100% !important;

                max-width:
                    100% !important;

                display:
                    flex !important;

                box-sizing:
                    border-box !important;
            }


            /* ========================================
               AI SCORE GRID
               ======================================== */

            #pdf-export-area .score-grid {

                width:
                    100% !important;

                max-width:
                    100% !important;

                display:
                    grid !important;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;

                gap:
                    4mm !important;
            }


            #pdf-export-area .score-card {

                width:
                    auto !important;

                min-width:
                    0 !important;

                max-width:
                    none !important;

                margin:
                    0 !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;
            }


            /* ========================================
               TECHNOLOGY GRID
               ======================================== */

            #pdf-export-area .technology-grid {

                width:
                    100% !important;

                max-width:
                    100% !important;

                display:
                    grid !important;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;

                gap:
                    4mm !important;
            }


            #pdf-export-area .technology-card {

                width:
                    auto !important;

                min-width:
                    0 !important;

                max-width:
                    none !important;

                margin:
                    0 !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;
            }


            /* ========================================
               TABLES
               ======================================== */

            #pdf-export-area table {

                width:
                    100% !important;

                max-width:
                    100% !important;

                table-layout:
                    fixed !important;

                border-collapse:
                    collapse !important;
            }


            #pdf-export-area td,
            #pdf-export-area th {

                word-break:
                    break-word !important;

                overflow-wrap:
                    anywhere !important;
            }


            #pdf-export-area tr {

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;
            }


            /* ========================================
               IMAGES
               ======================================== */

            #pdf-export-area img {

                max-width:
                    100% !important;

                height:
                    auto !important;
            }


            /* ========================================
               TEXT
               ======================================== */

            #pdf-export-area h1,
            #pdf-export-area h2,
            #pdf-export-area h3,
            #pdf-export-area p,
            #pdf-export-area li {

                overflow-wrap:
                    anywhere !important;
            }


            /* ========================================
               PAGE BREAK CONTROL
               ======================================== */

            #pdf-export-area .score-card,
            #pdf-export-area .technology-card {

                break-inside:
                    avoid-page !important;

                page-break-inside:
                    avoid !important;
            }

        `;


        exportArea.appendChild(
            style
        );


        exportArea.appendChild(
            clone
        );


        // ==============================================
        // PUT INTO DOCUMENT
        // ==============================================

        document.body.appendChild(
            exportArea
        );


        // ==============================================
        // WAIT FOR BROWSER RENDER
        // ==============================================

        await new Promise(
            resolve =>
                requestAnimationFrame(
                    () =>
                        requestAnimationFrame(
                            resolve
                        )
                )
        );


        // ==============================================
        // WAIT FOR FONTS
        // ==============================================

        if (document.fonts) {

            try {

                await document.fonts.ready;

            }
            catch (e) {

                console.warn(e);

            }

        }


        // ==============================================
        // WAIT FOR IMAGES
        // ==============================================

        const images =
            exportArea.querySelectorAll(
                "img"
            );


        await Promise.all(

            Array.from(images).map(

                img => {

                    if (img.complete) {

                        return Promise.resolve();

                    }


                    return new Promise(

                        resolve => {

                            img.onload =
                                resolve;

                            img.onerror =
                                resolve;

                        }

                    );

                }

            )

        );


        // ==============================================
        // SMALL FINAL WAIT
        // ==============================================

        await new Promise(

            resolve =>
                setTimeout(
                    resolve,
                    500
                )

        );


        // ==============================================
        // FILE NAME
        // ==============================================

        let websiteName =
            "AI-Visibility-Report";


        if (
            websiteInput &&
            websiteInput.value
        ) {

            try {

                const url =
                    new URL(
                        websiteInput.value
                    );


                websiteName =
                    url.hostname
                        .replace(
                            /^www\./,
                            ""
                        )
                        .replace(
                            /[^a-zA-Z0-9.-]/g,
                            "-"
                        );

            }
            catch (e) {

                console.warn(e);

            }

        }


        const date =
            new Date()
                .toISOString()
                .split("T")[0];


        // ==============================================
        // HTML2PDF OPTIONS
        // ==============================================

        const options = {

            margin: [
                8,
                8,
                8,
                8
            ],


            filename:
                `${websiteName}-AI-Visibility-Report-${date}.pdf`,


            image: {

                type:
                    "jpeg",

                quality:
                    0.96

            },


            html2canvas: {

                scale:
                    2,

                useCORS:
                    true,

                allowTaint:
                    false,

                backgroundColor:
                    "#ffffff",

                logging:
                    false,

                scrollX:
                    0,

                scrollY:
                    0

                // IMPORTANT:
                // NO width
                // NO height
                // NO windowWidth
                // NO windowHeight

            },


            jsPDF: {

                unit:
                    "mm",

                format:
                    "a4",

                orientation:
                    "portrait",

                compress:
                    true

            },


            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ],

                avoid: [

                    ".score-card",

                    ".technology-card",

                    "tr"

                ]

            }

        };


        // ==============================================
        // GENERATE
        // ==============================================

        await html2pdf()

            .set(options)

            .from(exportArea)

            .save();


        // ==============================================
        // SUCCESS
        // ==============================================

        showNotification(
            "PDF report downloaded successfully.",
            "success"
        );


    }
    catch (error) {

        console.error(
            "PDF ERROR:",
            error
        );


        showNotification(
            "Unable to generate PDF.",
            "error"
        );

    }
    finally {

        // ==============================================
        // CLEANUP
        // ==============================================

        if (exportArea) {

            exportArea.remove();

        }


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "📄 Download PDF Report";

            button.style.opacity =
                "1";

            button.style.cursor =
                "pointer";

        }

    }

}