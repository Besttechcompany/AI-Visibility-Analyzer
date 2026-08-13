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

    // =====================================================
    // EMPTY INPUT
    // =====================================================

    if (!website) {

        showError(
            "Please enter a website address.<br><br>" +
            "Example: <strong>mckinleyresearch.org</strong>"
        );

        websiteInput.focus();

        return;
    }


    // =====================================================
    // NORMALIZE URL
    // =====================================================

    if (!/^https?:\/\//i.test(website)) {

        website = "https://" + website;

    }


    // =====================================================
    // VALIDATE URL
    // =====================================================

    let parsedURL;

    try {

        parsedURL = new URL(website);

    }
    catch (error) {

        showError(
            "The website address you entered is not valid.<br><br>" +
            "Please enter a valid domain.<br><br>" +
            "Example: <strong>mckinleyresearch.org</strong>"
        );

        websiteInput.focus();

        return;
    }


    // =====================================================
    // VALIDATE DOMAIN
    // =====================================================

    if (
        !parsedURL.hostname ||
        !parsedURL.hostname.includes(".")
    ) {

        showError(
            "Please enter a valid website domain.<br><br>" +
            "Example: <strong>mckinleyresearch.org</strong>"
        );

        websiteInput.focus();

        return;
    }


    // =====================================================
    // UPDATE INPUT
    // =====================================================

    websiteInput.value = website;


    // =====================================================
    // ANALYZE BUTTON
    // =====================================================

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


    // =====================================================
    // SHOW LOADING
    // =====================================================

    showLoading(website);


    try {

        // =================================================
        // SEND WEBSITE TO BACKEND
        // =================================================

        const response =
            await fetch(

                `${API_URL}/analyze`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            url: website

                        })

                }

            );


        // =================================================
        // READ SERVER RESPONSE
        // =================================================

        let data = null;


        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            console.error(
                "Error reading server response:",
                jsonError
            );

            throw new Error(
                "The analysis server returned an invalid response."
            );

        }


        console.log(
            "Website submitted:",
            website
        );


        console.log(
            "Analysis response:",
            data
        );


        // =================================================
        // HTTP ERROR
        // =================================================

        if (!response.ok) {

            const serverMessage =
                data?.detail ||
                data?.error ||
                data?.message ||
                "";


            // ---------------------------------------------
            // 400
            // ---------------------------------------------

            if (response.status === 400) {

                throw new Error(
                    serverMessage ||
                    "The website address is invalid or could not be analyzed."
                );

            }


            // ---------------------------------------------
            // 401
            // ---------------------------------------------

            if (response.status === 401) {

                throw new Error(
                    "Your login session has expired. Please log in again."
                );

            }


            // ---------------------------------------------
            // 403
            // ---------------------------------------------

            if (response.status === 403) {

                throw new Error(
                    "Access to this website analysis is not permitted."
                );

            }


            // ---------------------------------------------
            // 404
            // ---------------------------------------------

            if (response.status === 404) {

                throw new Error(
                    "The website analysis service could not be found. Please try again later."
                );

            }


            // ---------------------------------------------
            // 408
            // ---------------------------------------------

            if (response.status === 408) {

                throw new Error(
                    "The website took too long to respond. Please try again."
                );

            }


            // ---------------------------------------------
            // 429
            // ---------------------------------------------

            if (response.status === 429) {

                throw new Error(
                    "Too many analysis requests. Please wait a moment and try again."
                );

            }


            // ---------------------------------------------
            // 500+
            // ---------------------------------------------

            if (response.status >= 500) {

                throw new Error(
                    "Our analysis server is temporarily unavailable. Please try again in a few moments."
                );

            }


            // ---------------------------------------------
            // GENERAL HTTP ERROR
            // ---------------------------------------------

            throw new Error(

                serverMessage ||

                `Unable to analyze the website (Error ${response.status}).`

            );

        }


        // =================================================
        // VALIDATE RESPONSE
        // =================================================

        if (
            !data ||
            typeof data !== "object"
        ) {

            throw new Error(
                "The analysis server did not return a valid result."
            );

        }


        // =================================================
        // IMPORTANT:
        // WEBSITE MUST BE ACTUALLY LIVE
        // =================================================

        const websiteStatus =
            String(
                data.website_status ||
                ""
            ).toLowerCase();


        const analysisMode =
            String(
                data.analysis_mode ||
                ""
            ).toLowerCase();


        const fetchError =
            String(
                data.fetch_error ||
                ""
            ).toLowerCase();


        // =================================================
        // DETECT INACTIVE / UNREACHABLE WEBSITE
        // =================================================

        const inactiveStatuses = [

            "inactive",
            "unreachable",
            "unavailable",
            "offline",
            "dead",
            "parked",
            "parking",
            "domain_parked",
            "dns_error",
            "dns_failed",
            "connection_failed",
            "timeout",
            "not_found",
            "error"

        ];


        const inactiveModes = [

            "estimated",
            "not_analyzed",
            "inactive",
            "unavailable",
            "offline"

        ];


        const isInactiveWebsite =

            data.live_website === false ||

            data.live_website === null ||

            inactiveStatuses.includes(
                websiteStatus
            ) ||

            inactiveModes.includes(
                analysisMode
            ) ||

            fetchError !== "";


        // =================================================
        // STOP INACTIVE WEBSITE
        // =================================================

        if (isInactiveWebsite) {

            console.warn(
                "Inactive website rejected:",
                {
                    website: website,
                    website_status:
                        data.website_status,
                    analysis_mode:
                        data.analysis_mode,
                    live_website:
                        data.live_website,
                    fetch_error:
                        data.fetch_error
                }
            );


            throw new Error(

                "<strong>Website is currently inactive or unavailable.</strong><br><br>" +

                "We could not verify an active website at:<br>" +

                `<strong>${website}</strong><br><br>` +

                "Please make sure the website is currently live and accessible, then try again."

            );

        }


        // =================================================
        // BACKEND EXPLICIT FAILURE
        // =================================================

        if (data.success === false) {

            throw new Error(

                data.error ||

                data.message ||

                data.detail ||

                "The website could not be analyzed."

            );

        }


        // =================================================
        // SUCCESS MUST BE TRUE
        // =================================================

        if (data.success !== true) {

            throw new Error(
                "The analysis server returned an incomplete result."
            );

        }


        // =================================================
        // FINAL LIVE WEBSITE SAFETY CHECK
        // =================================================

        if (
            data.live_website !== true
        ) {

            throw new Error(

                "<strong>Website verification failed.</strong><br><br>" +

                "The website could not be confirmed as an active live website.<br><br>" +

                "Please check the website and try again."

            );

        }


        // =================================================
        // WEBSITE IS CONFIRMED LIVE
        // =================================================

        console.log(
            "Live website confirmed:",
            website
        );


        // =================================================
        // FINISH LOADER
        //
        // Only a confirmed live website reaches here.
        //
        // 99%
        //   ↓
        // 100%
        //   ↓
        // RESULTS
        // =================================================

        finishLoader(
            data
        );


        // =================================================
        // RESTORE ANALYZE BUTTON
        // =================================================

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


    // =====================================================
    // ERROR HANDLING
    // =====================================================

    catch (error) {

        console.error(
            "Analysis Error:",
            error
        );


        // =================================================
        // STOP LOADER
        // =================================================

        if (
            typeof loaderTimer !==
            "undefined"
        ) {

            clearInterval(
                loaderTimer
            );

        }


        // =================================================
        // RESTORE ANALYZE BUTTON
        // =================================================

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


        // =================================================
        // SHOW ERROR
        // =================================================

        showError(

            error.message ||

            "We couldn't analyze this website. Please check the website address and make sure it is active."

        );

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
// ======================================================


async function downloadPDF() {

    const results =
        document.getElementById("results");

    const button =
        document.getElementById("download-pdf-btn");


    // =====================================================
    // CHECK REPORT
    // =====================================================

    if (!results) {

        showNotification(
            "Report not found.",
            "error"
        );

        return;
    }


    // =====================================================
    // CHECK HTML2PDF
    // =====================================================

    if (
        typeof html2pdf === "undefined"
    ) {

        showNotification(
            "PDF generator is not loaded. Please try again.",
            "error"
        );

        return;
    }


    // =====================================================
    // DISABLE BUTTON
    // =====================================================

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "⏳ Generating PDF...";

        button.style.opacity = "0.7";

        button.style.cursor = "wait";
    }


    let exportArea = null;


    try {

        // =================================================
        // CREATE EXPORT AREA
        // =================================================

        exportArea =
            document.createElement("div");

        exportArea.id =
            "pdf-export-area";


        Object.assign(
            exportArea.style,
            {
                width: "190mm",
                maxWidth: "190mm",
                margin: "0 auto",
                padding: "0",
                background: "#ffffff",
                color: "#111827",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
                boxSizing: "border-box",
                overflow: "visible"
            }
        );


        // =================================================
        // CLONE COMPLETE REPORT
        // =================================================

        const clone =
            results.cloneNode(true);


        clone.removeAttribute("id");


        Object.assign(
            clone.style,
            {
                width: "100%",
                maxWidth: "none",
                margin: "0",
                padding: "0",
                background: "#ffffff",
                boxSizing: "border-box"
            }
        );


        // =================================================
        // REMOVE PDF DOWNLOAD BUTTON
        // =================================================

        clone
            .querySelectorAll(
                ".pdf-download-section"
            )
            .forEach(
                element => element.remove()
            );


        // =================================================
        // REMOVE NOTIFICATIONS
        // =================================================

        clone
            .querySelectorAll(
                ".notification"
            )
            .forEach(
                element => element.remove()
            );


        // =================================================
        // =================================================
        // AI PLATFORM SCORES
        // =================================================
        //
        // PERMANENT STRUCTURE:
        //
        // ROW 1: ChatGPT       Gemini
        // ROW 2: Claude        Perplexity
        // ROW 3: Grok          Google AI Mode
        // ROW 4: DeepSeek      Empty
        //
        // We physically create rows.
        // We DO NOT rely only on CSS Grid.
        // =================================================


        const scoreGrids =
            clone.querySelectorAll(
                ".score-grid"
            );


        scoreGrids.forEach(
            grid => {

                const scoreCards =
                    Array.from(
                        grid.querySelectorAll(
                            ":scope > .score-card"
                        )
                    );


                if (
                    scoreCards.length === 0
                ) {

                    return;

                }


                // -----------------------------------------
                // CREATE PERMANENT SCORE WRAPPER
                // -----------------------------------------

                const scoreWrapper =
                    document.createElement(
                        "div"
                    );


                scoreWrapper.className =
                    "pdf-score-wrapper";


                // -----------------------------------------
                // CREATE EXACTLY 4 ROWS
                // -----------------------------------------

                for (
                    let rowIndex = 0;
                    rowIndex < 4;
                    rowIndex++
                ) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "pdf-score-row";


                    // First card
                    const firstIndex =
                        rowIndex * 2;


                    if (
                        scoreCards[firstIndex]
                    ) {

                        row.appendChild(
                            scoreCards[firstIndex]
                        );

                    }
                    else {

                        row.appendChild(
                            createEmptyScoreCard()
                        );

                    }


                    // Second card
                    const secondIndex =
                        firstIndex + 1;


                    if (
                        scoreCards[secondIndex]
                    ) {

                        row.appendChild(
                            scoreCards[secondIndex]
                        );

                    }
                    else {

                        row.appendChild(
                            createEmptyScoreCard()
                        );

                    }


                    scoreWrapper.appendChild(
                        row
                    );

                }


                // -----------------------------------------
                // REPLACE ORIGINAL GRID
                // -----------------------------------------

                grid.replaceWith(
                    scoreWrapper
                );

            }
        );


        // =================================================
        // =================================================
        // TOP ENTITIES
        // =================================================
        //
        // Convert ANY existing entity markup into a
        // controlled pill container.
        //
        // Example:
        //
        // Across   Ago   Anchoring   Anita
        // Archiving   Arjun   Best   Bhagavad
        //
        // Exactly like your screenshot.
        // =================================================


        const entityContainers =
            clone.querySelectorAll(
                ".entities-list, " +
                ".entity-list, " +
                ".top-entities, " +
                ".entities-section, " +
                ".entity-section"
            );


        entityContainers.forEach(
            container => {

                const entityValues =
                    extractEntityValues(
                        container
                    );


                if (
                    entityValues.length === 0
                ) {

                    return;

                }


                // -----------------------------------------
                // CREATE NEW CONTROLLED ENTITY CONTAINER
                // -----------------------------------------

                const pillContainer =
                    document.createElement(
                        "div"
                    );


                pillContainer.className =
                    "pdf-top-entities";


                // -----------------------------------------
                // CREATE PILLS
                // -----------------------------------------

                entityValues.forEach(
                    value => {

                        const pill =
                            document.createElement(
                                "span"
                            );


                        pill.className =
                            "pdf-entity-pill";


                        pill.textContent =
                            value;


                        pillContainer.appendChild(
                            pill
                        );

                    }
                );


                // -----------------------------------------
                // IF THIS IS A SECTION, PRESERVE HEADING
                // -----------------------------------------

                const heading =
                    container.querySelector(
                        "h1, h2, h3, h4, h5"
                    );


                const replacement =
                    document.createElement(
                        "div"
                    );


                replacement.className =
                    "pdf-entities-wrapper";


                if (heading) {

                    const headingClone =
                        heading.cloneNode(true);


                    replacement.appendChild(
                        headingClone
                    );

                }


                replacement.appendChild(
                    pillContainer
                );


                // -----------------------------------------
                // REPLACE ONLY ONCE
                // -----------------------------------------

                if (
                    container.parentNode
                ) {

                    container.replaceWith(
                        replacement
                    );

                }

            }
        );


        // =================================================
        // NORMALIZE TECHNOLOGY DETECTION
        // =================================================

        const technologyGrids =
            clone.querySelectorAll(
                ".technology-grid"
            );


        technologyGrids.forEach(
            grid => {

                const cards =
                    Array.from(
                        grid.querySelectorAll(
                            ".technology-card"
                        )
                    );


                if (
                    cards.length === 0
                ) {

                    return;
                }


                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "pdf-technology-wrapper";


                for (
                    let i = 0;
                    i < cards.length;
                    i += 2
                ) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "pdf-technology-row";


                    row.appendChild(
                        cards[i]
                    );


                    if (
                        cards[i + 1]
                    ) {

                        row.appendChild(
                            cards[i + 1]
                        );

                    }
                    else {

                        row.appendChild(
                            createEmptyTechnologyCard()
                        );

                    }


                    wrapper.appendChild(
                        row
                    );

                }


                grid.replaceWith(
                    wrapper
                );


                const section =
                    wrapper.closest(
                        ".technology-section"
                    );


                if (section) {

                    section.classList.add(
                        "pdf-technology-section"
                    );

                }

            }
        );


        // =================================================
        // PDF CSS
        // =================================================

        const pdfStyle =
            document.createElement(
                "style"
            );


        pdfStyle.textContent = `

            /* =================================================
               GLOBAL PDF
            ================================================= */

            #pdf-export-area,
            #pdf-export-area * {

                box-sizing:
                    border-box !important;

            }


            #pdf-export-area {

                width:
                    190mm !important;

                max-width:
                    190mm !important;

                margin:
                    0 auto !important;

                padding:
                    0 !important;

                background:
                    #ffffff !important;

                color:
                    #111827 !important;

                overflow:
                    visible !important;

            }


            /* =================================================
               GENERAL CARDS
            ================================================= */

            #pdf-export-area .card {

                width:
                    100% !important;

                max-width:
                    100% !important;

                margin:
                    0 0 5mm 0 !important;

                padding:
                    5mm !important;

                background:
                    #ffffff !important;

                overflow:
                    visible !important;

                transform:
                    none !important;

            }


            /* =================================================
               HEADINGS
            ================================================= */

            #pdf-export-area h1,
            #pdf-export-area h2,
            #pdf-export-area h3,
            #pdf-export-area h4 {

                break-after:
                    avoid !important;

                page-break-after:
                    avoid !important;

                overflow-wrap:
                    anywhere !important;

            }


            /* =================================================
               AI PLATFORM SCORE WRAPPER
               
               EXACTLY 4 ROWS
            ================================================= */

            #pdf-export-area
            .pdf-score-wrapper {

                display:
                    block !important;

                width:
                    100% !important;

                max-width:
                    100% !important;

                margin:
                    3mm 0 !important;

                padding:
                    0 !important;

            }


            /* =================================================
               AI SCORE ROW
               
               EXACTLY 2 COLUMNS
            ================================================= */

            #pdf-export-area
            .pdf-score-row {

                display:
                    flex !important;

                flex-direction:
                    row !important;

                width:
                    100% !important;

                min-width:
                    100% !important;

                margin:
                    0 0 5mm 0 !important;

                padding:
                    0 !important;

                gap:
                    5mm !important;

                align-items:
                    stretch !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               SCORE CARD
            ================================================= */

            #pdf-export-area
            .pdf-score-row
            .score-card {

                flex:
                    0 0 calc(
                        50% - 2.5mm
                    ) !important;

                width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                max-width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-height:
                    30mm !important;

                margin:
                    0 !important;

                padding:
                    4mm !important;

                display:
                    flex !important;

                flex-direction:
                    column !important;

                justify-content:
                    center !important;

                align-items:
                    center !important;

                text-align:
                    center !important;

                overflow:
                    hidden !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               SCORE TITLE
            ================================================= */

            #pdf-export-area
            .score-card h3 {

                width:
                    100% !important;

                margin:
                    0 0 2mm 0 !important;

                padding:
                    0 !important;

                font-size:
                    13px !important;

                line-height:
                    1.25 !important;

                text-align:
                    center !important;

                overflow-wrap:
                    anywhere !important;

            }


            /* =================================================
               SCORE NUMBER
            ================================================= */

            #pdf-export-area
            .score-card h1 {

                margin:
                    0 !important;

                padding:
                    0 !important;

                font-size:
                    30px !important;

                line-height:
                    1 !important;

                text-align:
                    center !important;

            }


            /* =================================================
               EMPTY SCORE CARD
            ================================================= */

            #pdf-export-area
            .pdf-empty-score-card {

                flex:
                    0 0 calc(
                        50% - 2.5mm
                    ) !important;

                width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-height:
                    30mm !important;

                visibility:
                    hidden !important;

            }


            /* =================================================
               TOP ENTITIES WRAPPER
            ================================================= */

            #pdf-export-area
            .pdf-entities-wrapper {

                width:
                    100% !important;

                max-width:
                    100% !important;

                margin:
                    0 0 5mm 0 !important;

                padding:
                    0 !important;

                overflow:
                    visible !important;

            }


            /* =================================================
               TOP ENTITIES HEADING
            ================================================= */

            #pdf-export-area
            .pdf-entities-wrapper h1,
            #pdf-export-area
            .pdf-entities-wrapper h2,
            #pdf-export-area
            .pdf-entities-wrapper h3,
            #pdf-export-area
            .pdf-entities-wrapper h4,
            #pdf-export-area
            .pdf-entities-wrapper h5 {

                margin:
                    0 0 4mm 0 !important;

                padding:
                    0 !important;

            }


            /* =================================================
               TOP ENTITY PILLS
               
               THIS IS THE IMPORTANT PERMANENT FIX
            ================================================= */

            #pdf-export-area
            .pdf-top-entities {

                display:
                    flex !important;

                flex-direction:
                    row !important;

                flex-wrap:
                    wrap !important;

                align-items:
                    flex-start !important;

                align-content:
                    flex-start !important;

                justify-content:
                    flex-start !important;

                width:
                    100% !important;

                max-width:
                    100% !important;

                height:
                    auto !important;

                min-height:
                    0 !important;

                margin:
                    0 !important;

                padding:
                    0 !important;

                gap:
                    3mm !important;

                overflow:
                    visible !important;

            }


            /* =================================================
               ENTITY PILL
            ================================================= */

            #pdf-export-area
            .pdf-entity-pill {

                display:
                    inline-flex !important;

                flex:
                    0 0 auto !important;

                align-items:
                    center !important;

                justify-content:
                    center !important;

                width:
                    auto !important;

                max-width:
                    none !important;

                min-width:
                    0 !important;

                height:
                    auto !important;

                min-height:
                    11mm !important;

                margin:
                    0 !important;

                padding:
                    2.5mm 5mm !important;

                border:
                    0.3mm solid #d7e6ff !important;

                border-radius:
                    8mm !important;

                background:
                    #f2f7ff !important;

                color:
                    #1455d9 !important;

                font-family:
                    Arial,
                    Helvetica,
                    sans-serif !important;

                font-size:
                    11px !important;

                font-weight:
                    600 !important;

                line-height:
                    1.2 !important;

                white-space:
                    nowrap !important;

                text-align:
                    center !important;

                overflow:
                    visible !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               TECHNOLOGY SECTION
            ================================================= */

            #pdf-export-area
            .pdf-technology-section {

                break-before:
                    page !important;

                page-break-before:
                    always !important;

            }


            /* =================================================
               TECHNOLOGY WRAPPER
            ================================================= */

            #pdf-export-area
            .pdf-technology-wrapper {

                width:
                    100% !important;

                display:
                    block !important;

                margin:
                    0 !important;

                padding:
                    0 !important;

            }


            /* =================================================
               TECHNOLOGY ROW
            ================================================= */

            #pdf-export-area
            .pdf-technology-row {

                display:
                    flex !important;

                flex-direction:
                    row !important;

                width:
                    100% !important;

                gap:
                    5mm !important;

                margin:
                    0 0 5mm 0 !important;

                padding:
                    0 !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               TECHNOLOGY CARD
            ================================================= */

            #pdf-export-area
            .pdf-technology-row
            .technology-card {

                flex:
                    0 0 calc(
                        50% - 2.5mm
                    ) !important;

                width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                max-width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-height:
                    30mm !important;

                margin:
                    0 !important;

                padding:
                    4mm !important;

                overflow:
                    hidden !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               EMPTY TECHNOLOGY CARD
            ================================================= */

            #pdf-export-area
            .pdf-empty-technology-card {

                flex:
                    0 0 calc(
                        50% - 2.5mm
                    ) !important;

                width:
                    calc(
                        50% - 2.5mm
                    ) !important;

                min-height:
                    30mm !important;

                visibility:
                    hidden !important;

            }


            /* =================================================
               E-E-A-T
            ================================================= */

            #pdf-export-area
            .eeat-grid {

                display:
                    grid !important;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;

                gap:
                    5mm !important;

                width:
                    100% !important;

            }


            #pdf-export-area
            .eeat-card {

                width:
                    100% !important;

                min-width:
                    0 !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               SUMMARY
            ================================================= */

            #pdf-export-area
            .summary-grid {

                display:
                    grid !important;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;

                gap:
                    5mm !important;

                width:
                    100% !important;

            }


            #pdf-export-area
            .summary-card {

                width:
                    100% !important;

                min-width:
                    0 !important;

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            /* =================================================
               TABLES
            ================================================= */

            #pdf-export-area table {

                width:
                    100% !important;

                max-width:
                    100% !important;

                border-collapse:
                    collapse !important;

                table-layout:
                    fixed !important;

            }


            #pdf-export-area tr {

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }


            #pdf-export-area td,
            #pdf-export-area th {

                overflow-wrap:
                    anywhere !important;

                word-break:
                    break-word !important;

                vertical-align:
                    top !important;

            }


            /* =================================================
               IMAGES
            ================================================= */

            #pdf-export-area img {

                display:
                    inline-block !important;

                visibility:
                    visible !important;

                opacity:
                    1 !important;

                max-width:
                    100% !important;

                object-fit:
                    contain !important;

            }


            /* =================================================
               LINKS
            ================================================= */

            #pdf-export-area a {

                text-decoration:
                    none !important;

            }


            /* =================================================
               PAGE PROTECTION
            ================================================= */

            #pdf-export-area
            .score-card,

            #pdf-export-area
            .pdf-score-row,

            #pdf-export-area
            .technology-card,

            #pdf-export-area
            .pdf-technology-row,

            #pdf-export-area
            .pdf-entity-pill,

            #pdf-export-area
            .eeat-card,

            #pdf-export-area
            .summary-card {

                break-inside:
                    avoid !important;

                page-break-inside:
                    avoid !important;

            }

        `;


        // =================================================
        // ADD CSS
        // =================================================

        exportArea.appendChild(
            pdfStyle
        );


        // =================================================
        // ADD REPORT
        // =================================================

        exportArea.appendChild(
            clone
        );


        // =================================================
        // ADD TO DOCUMENT
        // =================================================

        document.body.appendChild(
            exportArea
        );


        // =================================================
        // WAIT FOR BROWSER REFLOW
        // =================================================

        await new Promise(
            resolve => {

                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            resolve
                        );

                    }
                );

            }
        );


        // =================================================
        // WAIT FOR FONTS
        // =================================================

        if (
            document.fonts &&
            document.fonts.ready
        ) {

            try {

                await document.fonts.ready;

            }
            catch (fontError) {

                console.warn(
                    "Font loading warning:",
                    fontError
                );

            }

        }


        // =================================================
        // WAIT FOR IMAGES
        // =================================================

        const images =
            Array.from(
                exportArea.querySelectorAll(
                    "img"
                )
            );


        await Promise.all(

            images.map(
                img => {

                    if (
                        img.complete &&
                        img.naturalWidth > 0
                    ) {

                        return Promise.resolve();

                    }


                    return new Promise(
                        resolve => {

                            let completed =
                                false;


                            const finish =
                                () => {

                                    if (
                                        completed
                                    ) {

                                        return;

                                    }


                                    completed =
                                        true;

                                    resolve();

                                };


                            img.addEventListener(
                                "load",
                                finish,
                                {
                                    once:
                                        true
                                }
                            );


                            img.addEventListener(
                                "error",
                                finish,
                                {
                                    once:
                                        true
                                }
                            );


                            setTimeout(
                                finish,
                                5000
                            );

                        }
                    );

                }
            )

        );


        // =================================================
        // FINAL REFLOW
        // =================================================

        void exportArea.offsetHeight;


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );


        // =================================================
        // FILE NAME
        // =================================================

        let domainName =
            "website";


        try {

            let currentWebsite =
                websiteInput.value.trim();


            if (
                !/^https?:\/\//i.test(
                    currentWebsite
                )
            ) {

                currentWebsite =
                    "https://" +
                    currentWebsite;

            }


            const currentURL =
                new URL(
                    currentWebsite
                );


            domainName =
                currentURL.hostname
                    .replace(
                        /^www\./i,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9.-]/g,
                        "-"
                    );

        }
        catch (error) {

            console.warn(
                "Could not determine PDF filename:",
                error
            );

        }


        // =================================================
        // DATE
        // =================================================

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        const fileName =
            `${domainName}-AI-Visibility-Report-${year}-${month}-${day}.pdf`;


        // =================================================
        // HTML2PDF OPTIONS
        // =================================================

        const options = {

            margin:
                [
                    8,
                    8,
                    8,
                    8
                ],

            filename:
                fileName,

            image:
                {
                    type:
                        "jpeg",

                    quality:
                        0.98
                },

            html2canvas:
                {

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

                    imageTimeout:
                        15000,

                    scrollX:
                        0,

                    scrollY:
                        0

                },

            jsPDF:
                {

                    unit:
                        "mm",

                    format:
                        "a4",

                    orientation:
                        "portrait",

                    compress:
                        true

                },

            pagebreak:
                {

                    mode:
                        [
                            "css",
                            "legacy"
                        ],

                    before:
                        [
                            ".pdf-technology-section"
                        ],

                    avoid:
                        [
                            ".score-card",
                            ".pdf-score-row",
                            ".technology-card",
                            ".pdf-technology-row",
                            ".pdf-entity-pill",
                            ".eeat-card",
                            ".summary-card",
                            "tr"
                        ]

                }

        };


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "===================================="
        );

        console.log(
            "PDF GENERATION"
        );

        console.log(
            "Score rows:",
            exportArea.querySelectorAll(
                ".pdf-score-row"
            ).length
        );

        console.log(
            "Score cards:",
            exportArea.querySelectorAll(
                ".score-card"
            ).length
        );

        console.log(
            "Top entity pills:",
            exportArea.querySelectorAll(
                ".pdf-entity-pill"
            ).length
        );

        console.log(
            "Technology rows:",
            exportArea.querySelectorAll(
                ".pdf-technology-row"
            ).length
        );

        console.log(
            "===================================="
        );


        // =================================================
        // GENERATE PDF
        // =================================================

        await html2pdf()

            .set(
                options
            )

            .from(
                exportArea
            )

            .save();


        // =================================================
        // SUCCESS
        // =================================================

        showNotification(
            "PDF report generated successfully.",
            "success"
        );

    }


    catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        showNotification(
            "Unable to generate PDF. Please try again.",
            "error"
        );

    }


    finally {

        // =================================================
        // CLEANUP
        // =================================================

        if (exportArea) {

            try {

                exportArea.remove();

            }
            catch (cleanupError) {

                console.warn(
                    "PDF cleanup warning:",
                    cleanupError
                );

            }

        }


        // =================================================
        // RESTORE BUTTON
        // =================================================

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


/* =========================================================
   CREATE EMPTY SCORE CARD
   ========================================================= */

function createEmptyScoreCard() {

    const empty =
        document.createElement(
            "div"
        );

    empty.className =
        "pdf-empty-score-card";


    return empty;
}


/* =========================================================
   CREATE EMPTY TECHNOLOGY CARD
   ========================================================= */

function createEmptyTechnologyCard() {

    const empty =
        document.createElement(
            "div"
        );

    empty.className =
        "pdf-empty-technology-card";


    return empty;
}


/* =========================================================
   EXTRACT TOP ENTITY VALUES
   ========================================================= */

function extractEntityValues(container) {

    const values = [];


    // -----------------------------------------------------
    // First try common entity elements
    // -----------------------------------------------------

    const elements =
        container.querySelectorAll(
            ".entity-pill, " +
            ".entity-tag, " +
            ".entity-badge, " +
            ".entity-chip, " +
            "li"
        );


    elements.forEach(
        element => {

            const text =
                element.textContent
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            if (
                text &&
                !values.includes(text)
            ) {

                values.push(
                    text
                );

            }

        }
    );


    // -----------------------------------------------------
    // If no entity elements were found,
    // inspect direct text-containing elements.
    // -----------------------------------------------------

    if (
        values.length === 0
    ) {

        const candidates =
            container.querySelectorAll(
                "span, a, button"
            );


        candidates.forEach(
            element => {

                const text =
                    element.textContent
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                if (
                    text &&
                    text.length <= 60 &&
                    !values.includes(text)
                ) {

                    values.push(
                        text
                    );

                }

            }
        );

    }


    return values;

}

 