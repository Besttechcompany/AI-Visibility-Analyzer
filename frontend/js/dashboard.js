// ======================================================
// AI Visibility Analyzer Dashboard
// ======================================================


// ===========================================
// Backend API
// ===========================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";


// =========================================================
// AUTHENTICATION TOKEN HELPER
// =========================================================

// =========================================================
// AUTHENTICATION TOKEN
// =========================================================

let accessToken = null;


function getAccessToken() {

    return localStorage.getItem(
        "access_token"
    );

}


// ===========================================
// DOM Elements
// ===========================================

const profileCard =
    document.getElementById(
        "profile-card"
    );


const results =
    document.getElementById(
        "results"
    );


const websiteInput =
    document.getElementById(
        "website"
    );


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

    if (
        typeof html2pdf !== "undefined"
    ) {

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


// =========================================================
// AUTHENTICATION
// RECEIVE JWT FROM GOOGLE CALLBACK
// =========================================================


// =========================================================
// AUTHENTICATION
// RECEIVE JWT FROM GOOGLE CALLBACK
// =========================================================


// =========================================================
// AUTHENTICATION
// HANDLE NORMAL LOGIN + GOOGLE LOGIN
// =========================================================

function initializeAuthentication() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    // =====================================================
    // CHECK FOR GOOGLE LOGIN TOKEN
    // =====================================================

    const token =
        urlParams.get(
            "token"
        );


    // =====================================================
    // GOOGLE LOGIN
    // =====================================================

    if (token) {

        console.log(
            "Google JWT received successfully."
        );


        // Save Google JWT

        localStorage.setItem(
            "access_token",
            token
        );


        // Update global token

        accessToken =
            token;


        // Remove token from browser URL

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    }


    // =====================================================
    // NORMAL LOGIN / STORED TOKEN
    // =====================================================

    accessToken =
        localStorage.getItem(
            "access_token"
        );


    // =====================================================
    // NO TOKEN
    // =====================================================

    if (!accessToken) {

        console.log(
            "No access token found. Redirecting to login."
        );


        window.location.href =
            "login.html";


        return false;

    }


    // =====================================================
    // AUTHENTICATED
    // =====================================================

    console.log(
        "Authentication successful."
    );


    return true;

}


// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadProfile() {

    const token =
        getAccessToken();


    // =====================================================
    // CHECK TOKEN
    // =====================================================

    if (!token) {

        console.error(
            "No access token found."
        );


        window.location.href =
            "login.html";


        return;

    }


    // =====================================================
    // SHOW PROFILE LOADING
    // =====================================================

    if (profileCard) {

        profileCard.innerHTML = `

            <div class="user-card">

                <div class="profile-loading">
                    Loading...
                </div>

            </div>

        `;

    }


    try {

        // =================================================
        // REQUEST PROFILE
        // =================================================

        const response =
            await fetch(
                `${API_URL}/profile`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        // =================================================
        // INVALID TOKEN
        // =================================================

        if (
            response.status === 401
        ) {

            console.error(
                "Access token expired or invalid."
            );


            localStorage.removeItem(
                "access_token"
            );


            window.location.href =
                "login.html";


            return;

        }


        // =================================================
        // OTHER ERROR
        // =================================================

        if (!response.ok) {

            throw new Error(
                `Profile request failed: ${response.status}`
            );

        }


        // =================================================
        // GET RESPONSE
        // =================================================

        const data =
            await response.json();


        console.log(
            "Profile loaded successfully:",
            data
        );


        // =================================================
        // USER DATA
        // =================================================

        const user =
            data.user || {};


        const name =
            user.name ||
            "User";


        const email =
            user.email ||
            "";


        // =================================================
        // DEFAULT PROFILE IMAGE
        // =================================================

        const defaultProfileImage =
            "assets/default-user.png";


        const profileImage =
            user.picture &&
            user.picture.trim() !== ""
                ? user.picture
                : defaultProfileImage;


        // =================================================
        // DISPLAY PROFILE
        // =================================================

        if (profileCard) {

            profileCard.innerHTML = `

                <div class="user-card">

                    <img
                        src="${profileImage}"
                        class="profile-image"
                        alt="Profile"
                        onerror="
                            this.onerror=null;
                            this.src='assets/default-user.png';
                        "
                    >

                    <div class="user-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <p>
                            ${escapeHTML(email)}
                        </p>

                    </div>

                </div>

            `;

        }

    }


    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        // =================================================
        // FALLBACK PROFILE
        // =================================================

        if (profileCard) {

            profileCard.innerHTML = `

                <div class="user-card">

                    <img
                        src="assets/default-user.png"
                        class="profile-image"
                        alt="Profile"
                    >

                    <div class="user-info">

                        <h3>
                            User
                        </h3>

                        <p>
                            Unable to load profile
                        </p>

                    </div>

                </div>

            `;

        }

    }

}


// =========================================================
// LOGOUT
// =========================================================


// =========================================================
// LOGOUT
// =========================================================

function logout() {

    console.log(
        "Logging out..."
    );


    // Remove JWT

    localStorage.removeItem(
        "access_token"
    );


    // Remove temporary selected report

    sessionStorage.removeItem(
        "selected_analysis"
    );


    // Go back to login

    window.location.href =
        "login.html";

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

        clearInterval(
            loaderTimer
        );

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

    loaderTimer =
        setInterval(
            () => {


                /*
                    0 - 10%
                    Faster at the beginning
                */

                if (
                    loaderProgress < 10
                ) {

                    loaderProgress +=
                        0.35;

                }


                /*
                    10 - 20%
                */

                else if (
                    loaderProgress < 20
                ) {

                    loaderProgress +=
                        0.28;

                }


                /*
                    20 - 30%
                */

                else if (
                    loaderProgress < 30
                ) {

                    loaderProgress +=
                        0.22;

                }


                /*
                    30 - 45%
                */

                else if (
                    loaderProgress < 45
                ) {

                    loaderProgress +=
                        0.16;

                }


                /*
                    45 - 55%
                */

                else if (
                    loaderProgress < 55
                ) {

                    loaderProgress +=
                        0.10;

                }


                /*
                    55 - 75%
                */

                else if (
                    loaderProgress < 75
                ) {

                    loaderProgress +=
                        0.04;

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

                if (
                    loaderProgress < 20
                ) {

                    status.innerHTML =
                        "🔍 Connecting to Website...";


                    title.innerHTML =
                        "Initializing Analysis...";

                }


                else if (
                    loaderProgress < 40
                ) {

                    status.innerHTML =
                        "🌐 Crawling Website...";


                    title.innerHTML =
                        "Analyzing Website...";

                }


                else if (
                    loaderProgress < 60
                ) {

                    status.innerHTML =
                        "📄 Reading Website Content...";


                    title.innerHTML =
                        "Reading Website Data...";

                }


                else if (
                    loaderProgress < 80
                ) {

                    status.innerHTML =
                        "🤖 AI Analysis in Progress...";


                    title.innerHTML =
                        "AI Analysis in Progress...";

                }


                else if (
                    loaderProgress < 95
                ) {

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

                if (
                    loaderProgress < 25
                ) {

                    html +=
                        "⏳ ChatGPT<br>";

                } else {

                    html +=
                        "✅ ChatGPT<br>";

                }


                if (
                    loaderProgress < 35
                ) {

                    html +=
                        "⏳ Gemini<br>";

                } else {

                    html +=
                        "✅ Gemini<br>";

                }


                if (
                    loaderProgress < 45
                ) {

                    html +=
                        "⏳ Claude<br>";

                } else {

                    html +=
                        "✅ Claude<br>";

                }


                if (
                    loaderProgress < 55
                ) {

                    html +=
                        "⏳ Perplexity<br>";

                } else {

                    html +=
                        "✅ Perplexity<br>";

                }


                if (
                    loaderProgress < 65
                ) {

                    html +=
                        "⏳ Grok<br>";

                } else {

                    html +=
                        "✅ Grok<br>";

                }


                if (
                    loaderProgress < 75
                ) {

                    html +=
                        "⏳ Google AI Mode<br>";

                } else {

                    html +=
                        "✅ Google AI Mode<br>";

                }


                if (
                    loaderProgress < 85
                ) {

                    html +=
                        "⏳ DeepSeek";

                } else {

                    html +=
                        "✅ DeepSeek";

                }


                platforms.innerHTML =
                    html;


            },
            1000
        );

}


// ======================================================
// UPDATE LOADER PROGRESS
// ======================================================

function updateLoaderProgress(
    progress
) {

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


    const safeProgress =
        Math.min(
            Math.max(
                progress,
                0
            ),
            99
        );


    bar.style.width =
        `${safeProgress}%`;


    number.textContent =
        `${Math.floor(safeProgress)}%`;

}


// ======================================================
// STOP LOADER
// ======================================================

function stopFakeLoader() {

    if (loaderTimer) {

        clearInterval(
            loaderTimer
        );

        loaderTimer = null;

    }

}


// ======================================================
// COMPLETE LOADER
// ======================================================

function completeLoader() {

    stopFakeLoader();


    updateLoaderProgress(
        100
    );


    const title =
        document.getElementById(
            "loading-title"
        );


    const status =
        document.getElementById(
            "loading-status"
        );


    if (title) {

        title.innerHTML =
            "Analysis Complete!";

    }


    if (status) {

        status.innerHTML =
            "✅ Analysis completed successfully.";

    }

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

// ======================================================
// AI PLATFORM LOADING STATUS
// ======================================================

function updatePlatformLoadingStatus() {

    const platforms =
        document.getElementById(
            "loading-platforms"
        );

    if (!platforms) {
        return;
    }


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


    platforms.innerHTML =
        html;

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
// VALIDATE ANALYSIS RESPONSE
//
// IMPORTANT FIX
//
// The old code directly called:
//
// data.overall_ai_visibility.overall_score
//
// If the backend returns an incomplete result,
// JavaScript crashes.
//
// This function prevents that.
// ======================================================

function isValidAnalysisResult(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return false;

    }


    /*
       Some APIs may wrap the actual
       analysis result inside "result"
       or "data".
    */

    let analysis =
        data;


    if (
        data.result &&
        typeof data.result === "object"
    ) {

        analysis =
            data.result;

    }


    if (
        analysis.data &&
        typeof analysis.data === "object"
    ) {

        analysis =
            analysis.data;

    }


    /*
       Backend may return an explicit failure.
    */

    if (
        analysis.success === false
    ) {

        return false;

    }


    /*
       Overall visibility is mandatory
       for a completed analysis.
    */

    if (
        !analysis.overall_ai_visibility ||
        typeof analysis.overall_ai_visibility !== "object"
    ) {

        /*
           Some versions of the backend may return
           the score directly.
        */

        if (
            analysis.overall_score !== undefined &&
            analysis.overall_score !== null
        ) {

            return true;

        }


        return false;

    }


    /*
       Score must exist.
    */

    const score =
        analysis
            .overall_ai_visibility
            .overall_score;


    if (
        score === undefined ||
        score === null ||
        score === ""
    ) {

        return false;

    }


    return true;

}


// ======================================================
// NORMALIZE ANALYSIS DATA
//
// Makes different backend response formats
// easier for the frontend to handle.
// ======================================================

function normalizeAnalysisData(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return null;

    }


    let analysis =
        data;


    /*
       Handle:

       {
           result: {...}
       }
    */

    if (
        analysis.result &&
        typeof analysis.result === "object"
    ) {

        analysis =
            analysis.result;

    }


    /*
       Handle:

       {
           data: {...}
       }
    */

    if (
        analysis.data &&
        typeof analysis.data === "object"
    ) {

        analysis =
            analysis.data;

    }


    return analysis;

}


// ======================================================
// GET BACKEND ERROR MESSAGE
// ======================================================

function getAnalysisErrorMessage(
    data
) {

    if (!data) {

        return null;

    }


    return (

        data.detail ||

        data.message ||

        data.error ||

        data.reason ||

        null

    );

}


// ======================================================
// FINISH LOADER
//
// IMPORTANT:
//
// This function is called ONLY after the
// backend has actually returned a valid result.
//
// 90% → 100%
//       ↓
// Results
// ======================================================

function finishLoader(
    data
) {

    /*
       FINAL SAFETY CHECK.

       Never display an incomplete analysis.
    */

    if (
        !isValidAnalysisResult(data)
    ) {

        stopFakeLoader();


        showError(
            getAnalysisErrorMessage(data) ||
            "The analysis completed without returning a valid report."
        );


        return;

    }


    /*
       Normalize the response before rendering.
    */

    const analysisData =
        normalizeAnalysisData(data);


    if (!analysisData) {

        stopFakeLoader();


        showError(
            "The analysis server returned an invalid result."
        );


        return;

    }


    /*
       Stop fake progress.
    */

    clearInterval(
        loaderTimer
    );


    loaderTimer =
        null;


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


    /*
       If loader elements are missing,
       show the result directly.
    */

    if (
        !number ||
        !bar ||
        !status ||
        !title
    ) {

        showResults(
            analysisData
        );


        return;

    }


    /*
       Backend has finished.

       Now move from current progress
       to exactly 100%.
    */

    const finishTimer =
        setInterval(
            () => {

                loaderProgress +=
                    0.75;


                if (
                    loaderProgress >= 100
                ) {

                    loaderProgress =
                        100;

                }


                updateLoaderProgress(
                    loaderProgress
                );


                /*
                   100% reached.
                */

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
                       Give the progress bar a small
                       moment to visually reach 100%.
                    */

                    setTimeout(
                        () => {

                            /*
                               ONE MORE SAFETY CHECK.
                            */

                            if (
                                !isValidAnalysisResult(
                                    analysisData
                                )
                            ) {

                                showError(
                                    "The analysis completed without returning a valid report."
                                );


                                return;

                            }


                            /*
                               NOW render results.
                            */

                            showResults(
                                analysisData
                            );


                            /*
                               Restore Analyze button.
                            */

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


                        },
                        350
                    );

                }

            },
            30
        );

}


// ======================================================
// SHOW ANALYSIS ERROR
// ======================================================

function showError(
    message
) {

    /*
       Stop loading animation.
    */

    if (loaderTimer) {

        clearInterval(
            loaderTimer
        );

        loaderTimer =
            null;

    }


    /*
       Reset loader.
    */

    loaderProgress =
        0;


    /*
       Restore Analyze button.
    */

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


    /*
       Make sure there is always
       a useful message.
    */

    const safeMessage =
        message ||
        "The website analysis could not be completed.";


    /*
       Escape HTML because backend
       messages should never be inserted
       as raw HTML.
    */

    const safeText =
        escapeHTML(
            String(safeMessage)
        );


    results.innerHTML = `

        <div class="card analysis-error-card">

            <div class="analysis-error-icon">

                ⚠️

            </div>


            <h2>

                Analysis Failed

            </h2>


            <p class="analysis-error-title">

                We could not complete the analysis
                for this website.

            </p>


            <div class="analysis-error-message">

                ${safeText}

            </div>


            <p class="analysis-error-help">

                Please check the website URL and
                try again. If the problem continues,
                the analysis service may have
                encountered an error.

            </p>


            <button
                type="button"
                class="retry-btn"
                onclick="retryAnalysis()"
            >

                🔄 Try Again

            </button>

        </div>

    `;

}


// ======================================================
// RETRY ANALYSIS
// ======================================================

function retryAnalysis() {

    if (!websiteInput) {

        return;

    }


    const website =
        websiteInput.value.trim();


    if (!website) {

        websiteInput.focus();

        return;

    }


    analyzeWebsite();

}


// ======================================================
// ANALYZE WEBSITE
// ======================================================

async function analyzeWebsite() {

    // ==================================================
    // GET ACCESS TOKEN
    // ==================================================

    const token =
        getAccessToken();


    // ==================================================
    // CHECK AUTHENTICATION
    // ==================================================

    if (!token) {

        console.error(
            "No access token found."
        );


        showError(
            "Your login session has expired. Please login again."
        );


        setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1500
        );


        return;

    }


    // ==================================================
    // GET WEBSITE
    // ==================================================

    let website =
        websiteInput
            ? websiteInput.value.trim()
            : "";


    // ==================================================
    // EMPTY INPUT
    // ==================================================

    if (!website) {

        showError(
            "Please enter a website address. Example: mckinleyresearch.org"
        );


        if (websiteInput) {

            websiteInput.focus();

        }


        return;

    }


    // ==================================================
    // NORMALIZE URL
    // ==================================================

    if (
        !/^https?:\/\//i.test(
            website
        )
    ) {

        website =
            "https://" +
            website;

    }


    // ==================================================
    // VALIDATE URL
    // ==================================================

    let parsedURL;


    try {

        parsedURL =
            new URL(
                website
            );

    }

    catch (error) {

        console.error(
            "Invalid URL:",
            error
        );


        showError(
            "The website address you entered is not valid. Please enter a valid domain."
        );


        if (websiteInput) {

            websiteInput.focus();

        }


        return;

    }


    // ==================================================
    // VALIDATE DOMAIN
    // ==================================================

    if (
        !parsedURL.hostname ||
        !parsedURL.hostname.includes(".")
    ) {

        showError(
            "Please enter a valid website domain. Example: mckinleyresearch.org"
        );


        if (websiteInput) {

            websiteInput.focus();

        }


        return;

    }


    // ==================================================
    // UPDATE INPUT
    // ==================================================

    if (websiteInput) {

        websiteInput.value =
            website;

    }


    // ==================================================
    // ANALYZE BUTTON
    // ==================================================

    const analyzeBtn =
        document.querySelector(
            ".analyze-btn"
        );


    if (analyzeBtn) {

        analyzeBtn.disabled =
            true;


        analyzeBtn.innerHTML =
            "⏳ Analyzing...";


        analyzeBtn.style.opacity =
            "0.7";


        analyzeBtn.style.cursor =
            "wait";

    }


    // ==================================================
    // SHOW LOADING
    // ==================================================

    showLoading(
        website
    );


    // ==================================================
    // SEND REQUEST
    // ==================================================

    try {

        console.log(
            "Starting website analysis..."
        );


        console.log(
            "Website:",
            website
        );


        const response =
            await fetch(
                `${API_URL}/analyze`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            url:
                                website
                        })

                }
            );


        // ==================================================
        // HANDLE UNAUTHORIZED
        // ==================================================

        if (
            response.status === 401
        ) {

            console.error(
                "Authentication failed."
            );


            localStorage.removeItem(
                "access_token"
            );


            showError(
                "Your login session has expired. Please login again."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                1500
            );


            return;

        }


        // ==================================================
        // READ RESPONSE
        // ==================================================

        let data =
            null;


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
            "Analysis API response:",
            data
        );


        // ==================================================
        // HANDLE HTTP ERROR
        // ==================================================

        if (
            !response.ok
        ) {

            console.error(
                "Analysis request failed:",
                response.status,
                data
            );


            throw new Error(

                getAnalysisErrorMessage(
                    data
                ) ||

                `Analysis server returned ${response.status}.`

            );

        }


        // ==================================================
        // CHECK EXPLICIT BACKEND FAILURE
        // ==================================================

        if (
            data &&
            data.success === false
        ) {

            throw new Error(

                getAnalysisErrorMessage(
                    data
                ) ||

                "The website analysis failed."

            );

        }


        // ==================================================
        // NORMALIZE RESPONSE
        // ==================================================

        const analysisData =
            normalizeAnalysisData(
                data
            );


        // ==================================================
        // CRITICAL VALIDATION
        // ==================================================

        if (
            !isValidAnalysisResult(
                analysisData
            )
        ) {

            console.error(
                "Invalid analysis response:",
                data
            );


            throw new Error(

                getAnalysisErrorMessage(
                    data
                ) ||

                "The analysis server returned an incomplete result."

            );

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "Valid analysis result received:",
            analysisData
        );


        /*
           IMPORTANT:

           Do NOT call showResults()
           directly here.

           finishLoader() moves the progress
           to 100% first.
        */

        finishLoader(
            analysisData
        );

    }


    catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        showError(

            error.message ||

            "The website analysis failed. Please try again."

        );

    }

    finally {

        /*
           Do NOT immediately restore the button
           while a valid result is still progressing
           from 90% → 100%.

           finishLoader() handles that.

           For an error, showError() already restores it.
        */

    }

}


// ======================================================
// SHOW RESULTS
// ======================================================

function showResults(
    data
) {

    /*
       FINAL SAFETY CHECK.

       This is the most important protection
       against the original error.
    */

    if (
        !isValidAnalysisResult(
            data
        )
    ) {

        console.error(
            "showResults received invalid data:",
            data
        );


        showError(
            getAnalysisErrorMessage(data) ||
            "The analysis result is incomplete and cannot be displayed."
        );


        return;

    }


    /*
       Normalize data.
    */

    data =
        normalizeAnalysisData(
            data
        );


    // ==================================================
    // CLEAR PREVIOUS RESULTS
    // ==================================================

    results.innerHTML =
        "";


    // ==================================================
    // RENDER OVERALL SCORE
    // ==================================================

    results.appendChild(
        renderOverallScore(
            data
        )
    );


    // ==================================================
    // RENDER AI SCORES
    // ==================================================

    results.appendChild(
        renderAIScores(
            data
        )
    );


    // ==================================================
    // RENDER TECHNOLOGY
    // ==================================================

    results.appendChild(
        renderTechnology(
            data
        )
    );


    // ==================================================
    // RENDER BASIC INFORMATION
    // ==================================================

    results.appendChild(
        renderBasicInformation(
            data
        )
    );


    // ==================================================
    // RENDER TECHNICAL SEO
    // ==================================================

    results.appendChild(
        renderTechnicalSEO(
            data
        )
    );


    // ==================================================
    // RENDER AUDIT
    // ==================================================

    results.appendChild(
        renderAudit(
            data
        )
    );


    // ==================================================
    // RENDER OPEN GRAPH
    // ==================================================

    results.appendChild(
        renderOpenGraph(
            data
        )
    );


    // ==================================================
    // RENDER TWITTER CARDS
    // ==================================================

    results.appendChild(
        renderTwitterCards(
            data
        )
    );


    // ==================================================
    // RENDER LLMS.TXT
    // ==================================================

    results.appendChild(
        renderLLMS(
            data
        )
    );


    // ==================================================
    // RENDER E-E-A-T
    // ==================================================

    results.appendChild(
        renderEEAT(
            data
        )
    );


    // ==================================================
    // RENDER ENTITIES
    // ==================================================

    results.appendChild(
        renderEntities(
            data
        )
    );


    // ==================================================
    // RENDER RECOMMENDATIONS
    // ==================================================

    results.appendChild(
        renderRecommendations(
            data
        )
    );

}

// ======================================================
// PDF DOWNLOAD SECTION
// ======================================================

function addPDFDownloadSection() {

    const existing =
        document.getElementById(
            "download-pdf-btn"
        );


    if (existing) {

        return;

    }


    const pdfSection =
        document.createElement(
            "section"
        );


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
// OVERALL AI VISIBILITY
//
// FIXED:
//
// Never directly access:
//
// data.overall_ai_visibility.overall_score
//
// without checking it first.
// ======================================================

function renderOverallScore(
    data
) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    /*
       Safely get overall visibility.
    */

    const overall =
        data?.overall_ai_visibility || {};


    /*
       Score can come from:

       overall_ai_visibility.overall_score

       OR

       overall_score
    */

    let score =
        overall.overall_score;


    if (
        score === undefined ||
        score === null ||
        score === ""
    ) {

        score =
            data?.overall_score;

    }


    /*
       If score is still missing,
       calculate it from platform scores.
    */

    if (
        score === undefined ||
        score === null ||
        score === ""
    ) {

        const platformScores = [

            data?.chatgpt?.score,

            data?.gemini?.score,

            data?.claude?.score,

            data?.perplexity?.score,

            data?.grok?.score,

            data?.google_ai_mode?.score,

            data?.deepseek?.score

        ]
        .filter(
            value =>
                value !== undefined &&
                value !== null &&
                !isNaN(
                    Number(value)
                )
        )
        .map(
            value =>
                Number(value)
        );


        if (
            platformScores.length > 0
        ) {

            score =
                Math.round(
                    platformScores.reduce(
                        (
                            total,
                            value
                        ) =>
                            total + value,
                        0
                    ) /
                    platformScores.length
                );

        }

        else {

            score =
                0;

        }

    }


    /*
       Make sure score is numeric.
    */

    score =
        Number(score);


    if (
        !Number.isFinite(score)
    ) {

        score =
            0;

    }


    /*
       Keep score between 0 and 100.
    */

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    /*
       Grade.

       Use backend grade when available.

       Otherwise calculate it.
    */

    let grade =
        overall.grade;


    if (
        grade === undefined ||
        grade === null ||
        grade === ""
    ) {

        grade =
            calculateGrade(
                score
            );

    }


    card.innerHTML = `

        <h2>
            Overall AI Visibility
        </h2>


        <div class="overall-card">

            <div class="overall-left">

                <h1>
                    ${score}
                </h1>


                <span class="grade">

                    Grade
                    ${escapeHTML(grade)}

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
// CALCULATE GRADE
// ======================================================

function calculateGrade(
    score
) {

    const numericScore =
        Number(score);


    if (
        numericScore >= 90
    ) {

        return "A+";

    }


    if (
        numericScore >= 80
    ) {

        return "A";

    }


    if (
        numericScore >= 70
    ) {

        return "B";

    }


    if (
        numericScore >= 60
    ) {

        return "C";

    }


    if (
        numericScore >= 50
    ) {

        return "D";

    }


    return "F";

}


// ======================================================
// AI PLATFORM SCORES
// ======================================================

function renderAIScores(
    data
) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    // ------------------------------------------
    // Safely get platform scores
    // ------------------------------------------

    const chatgpt =
        Number(
            data?.chatgpt?.score ?? 0
        );


    const gemini =
        Number(
            data?.gemini?.score ?? 0
        );


    const claude =
        Number(
            data?.claude?.score ?? 0
        );


    const perplexity =
        Number(
            data?.perplexity?.score ?? 0
        );


    const grok =
        Number(
            data?.grok?.score ?? 0
        );


    const googleAIMode =
        Number(
            data?.google_ai_mode?.score ?? 0
        );


    const deepseek =
        Number(
            data?.deepseek?.score ?? 0
        );


    // ------------------------------------------
    // Build AI Platform Cards
    // ------------------------------------------

    card.innerHTML = `

        <h2>
            AI Platform Scores
        </h2>


        <div class="score-grid">


            <!-- CHATGPT -->

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


            <!-- GEMINI -->

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


            <!-- CLAUDE -->

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


            <!-- PERPLEXITY -->

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


            <!-- GROK -->

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


            <!-- GOOGLE AI MODE -->

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


            <!-- DEEPSEEK -->

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
// TECHNOLOGY DETECTION
// ALL TECHNOLOGIES — 2 CARDS PER ROW
// ======================================================

function renderTechnology(
    data
) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            Technology Detection
        </h2>

    `;


    // ==================================================
    // CHECK TECHNOLOGY DATA
    // ==================================================

    if (
        !data?.technology ||
        !data.technology.categories ||
        Object.keys(
            data.technology.categories
        ).length === 0
    ) {

        html += `

            <p>
                No technologies detected.
            </p>

        `;


        card.innerHTML =
            html;


        return card;

    }


    // ==================================================
    // CREATE GLOBAL TECHNOLOGY GRID
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
        (
            [
                category,
                technologies
            ]
        ) => {

            if (
                !technologies ||
                technologies.length === 0
            ) {

                return;

            }


            technologies.forEach(
                tech => {

                    const technologyName =
                        tech?.technology ||
                        "Unknown Technology";


                    const confidence =
                        tech?.confidence ??
                        0;


                    const evidence =
                        Array.isArray(
                            tech?.evidence
                        )
                            ? tech.evidence.join(
                                ", "
                            )
                            : (
                                tech?.evidence ||
                                "Not available"
                            );


                    html += `

                        <div class="technology-card">

                            <div class="technology-category">

                                ${escapeHTML(
                                    category
                                )}

                            </div>


                            <h3>

                                ${escapeHTML(
                                    technologyName
                                )}

                            </h3>


                            <p>

                                Confidence:

                                <strong>

                                    ${escapeHTML(
                                        confidence
                                    )}%

                                </strong>

                            </p>


                            <p>

                                Evidence:

                                ${escapeHTML(
                                    evidence
                                )}

                            </p>

                        </div>

                    `;

                }
            );

        }
    );


    // ==================================================
    // CLOSE GRID
    // ==================================================

    html += `

        </div>

    `;


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// BASIC INFORMATION
// ======================================================

function renderBasicInformation(
    data
) {

    const basic =
        data?.basic || {};


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    const title =
        basic.title ||
        "-";


    const metaDescription =
        basic.meta_description ||
        "-";


    const language =
        basic.language ||
        "-";


    const canonical =
        basic.canonical ||
        "-";


    const robots =
        basic.robots ||
        "-";


    const h1 =
        Array.isArray(
            basic.h1
        )
            ? basic.h1
            : [];


    const h2 =
        Array.isArray(
            basic.h2
        )
            ? basic.h2
            : [];


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
                    ${escapeHTML(title)}
                </td>

            </tr>


            <tr>

                <td>
                    Meta Description
                </td>

                <td>
                    ${escapeHTML(
                        metaDescription
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Language
                </td>

                <td>
                    ${escapeHTML(
                        language
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Canonical URL
                </td>

                <td>
                    ${escapeHTML(
                        canonical
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Robots
                </td>

                <td>
                    ${escapeHTML(
                        robots
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    H1 Headings
                </td>

                <td>

                    ${
                        h1.length
                            ? h1
                                .map(
                                    item =>
                                        escapeHTML(
                                            item
                                        )
                                )
                                .join(
                                    "<br>"
                                )
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
                        h2.length
                            ? h2
                                .map(
                                    item =>
                                        escapeHTML(
                                            item
                                        )
                                )
                                .join(
                                    "<br>"
                                )
                            : "-"
                    }

                </td>

            </tr>


        </table>

    `;


    return card;

}


// ======================================================
// TECHNICAL SEO
// ======================================================

function renderTechnicalSEO(
    data
) {

    const seo =
        data?.technical_seo || {};


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
                    ${escapeHTML(
                        seo.status_code ??
                        "-"
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Response Time
                </td>

                <td>
                    ${escapeHTML(
                        seo.response_time_ms ??
                        "-"
                    )} ms
                </td>

            </tr>


            <tr>

                <td>
                    Page Size
                </td>

                <td>
                    ${escapeHTML(
                        seo.page_size_kb ??
                        "-"
                    )} KB
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
                    ${escapeHTML(
                        seo.final_url ??
                        "-"
                    )}
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
                    ${escapeHTML(
                        seo.json_ld_count ??
                        0
                    )}
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
                                    src="${escapeHTML(
                                        seo.favicon
                                    )}"
                                    style="
                                        height:40px;
                                        border-radius:5px;
                                    "
                                    alt="Favicon"
                                >

                            `

                            : "❌ Missing"

                    }

                </td>

            </tr>


        </table>

    `;


    return card;

}

// ======================================================
// ENTITY ANALYSIS — CONTINUED
// ======================================================

function renderEntities(data) {

    const entity =
        data?.entities || {};


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
                    ${escapeHTML(
                        entity.count ??
                        0
                    )}
                </td>

            </tr>


        </table>

    `;


    // ==================================================
    // ENTITY LIST
    // ==================================================

    const entityList =
        entity.entities ||
        entity.items ||
        [];


    if (
        Array.isArray(entityList) &&
        entityList.length > 0
    ) {

        html += `

            <br>

            <h3>
                Detected Entities
            </h3>

            <div class="entity-list">

        `;


        entityList.forEach(
            item => {

                if (
                    typeof item === "string"
                ) {

                    html += `

                        <div class="entity-item">

                            ${escapeHTML(
                                item
                            )}

                        </div>

                    `;

                    return;

                }


                if (
                    item &&
                    typeof item === "object"
                ) {

                    const name =
                        item.name ||
                        item.entity ||
                        item.title ||
                        "Unknown Entity";


                    const type =
                        item.type ||
                        item.category ||
                        "";


                    html += `

                        <div class="entity-item">

                            <strong>

                                ${escapeHTML(
                                    name
                                )}

                            </strong>


                            ${
                                type
                                    ? `
                                        <span>
                                            ${escapeHTML(
                                                type
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    `;

                }

            }
        );


        html += `

            </div>

        `;

    }


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// RECOMMENDATIONS
// ======================================================

function renderRecommendations(
    data
) {

    const recommendations =
        data?.recommendations ||
        data?.recommendation ||
        [];


    const card =
        document.createElement(
            "section"
        );


    card.className =
        "card";


    let html = `

        <h2>
            Recommendations
        </h2>

    `;


    // ==================================================
    // ARRAY
    // ==================================================

    if (
        Array.isArray(
            recommendations
        )
    ) {

        if (
            recommendations.length === 0
        ) {

            html += `

                <p>
                    No additional recommendations available.
                </p>

            `;

        }

        else {

            html += `

                <ul class="recommendation-list">

            `;


            recommendations.forEach(
                item => {

                    let text =
                        "";


                    if (
                        typeof item === "string"
                    ) {

                        text =
                            item;

                    }

                    else if (
                        item &&
                        typeof item === "object"
                    ) {

                        text =
                            item.recommendation ||
                            item.message ||
                            item.description ||
                            item.title ||
                            JSON.stringify(
                                item
                            );

                    }

                    else {

                        text =
                            String(item);

                    }


                    html += `

                        <li>

                            ${escapeHTML(
                                text
                            )}

                        </li>

                    `;

                }
            );


            html += `

                </ul>

            `;

        }

    }


    // ==================================================
    // OBJECT
    // ==================================================

    else if (
        recommendations &&
        typeof recommendations === "object"
    ) {

        const entries =
            Object.entries(
                recommendations
            );


        if (
            entries.length === 0
        ) {

            html += `

                <p>
                    No additional recommendations available.
                </p>

            `;

        }

        else {

            html += `

                <ul class="recommendation-list">

            `;


            entries.forEach(
                (
                    [
                        key,
                        value
                    ]
                ) => {

                    html += `

                        <li>

                            <strong>
                                ${escapeHTML(
                                    key
                                )}:
                            </strong>

                            ${escapeHTML(
                                typeof value === "object"
                                    ? JSON.stringify(
                                        value
                                    )
                                    : value
                            )}

                        </li>

                    `;

                }
            );


            html += `

                </ul>

            `;

        }

    }


    else {

        html += `

            <p>
                No additional recommendations available.
            </p>

        `;

    }


    card.innerHTML =
        html;


    return card;

}


// ======================================================
// GENERIC SAFE VALUE
// ======================================================

function safeValue(
    value,
    fallback = "-"
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;

    }


    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(
                value
            );

        }

        catch {

            return fallback;

        }

    }


    return String(
        value
    );

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ======================================================
// DOWNLOAD PDF
// ======================================================

async function downloadPDF() {

    const button =
        document.getElementById(
            "download-pdf-btn"
        );


    /*
       Make sure the PDF library exists.
    */

    if (
        !checkPDFLibrary()
    ) {

        showPDFMessage(
            "PDF generator is not available. Please refresh the page and try again."
        );


        return;

    }


    /*
       Make sure there are results.
    */

    if (
        !results ||
        !results.innerHTML.trim()
    ) {

        showPDFMessage(
            "There is no completed analysis available to download."
        );


        return;

    }


    /*
       Disable button while generating.
    */

    if (button) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.innerHTML;


        button.innerHTML =
            "⏳ Generating PDF...";

    }


    try {

        /*
           Clone results so we do not modify
           the visible dashboard.
        */

        const pdfContent =
            results.cloneNode(
                true
            );


        /*
           Remove the PDF button itself
           from the PDF.
        */

        const pdfButton =
            pdfContent.querySelector(
                "#download-pdf-btn"
            );


        if (pdfButton) {

            pdfButton.remove();

        }


        /*
           Remove PDF section.
        */

        const pdfSection =
            pdfContent.querySelector(
                ".pdf-download-section"
            );


        if (pdfSection) {

            pdfSection.remove();

        }


        /*
           Create temporary wrapper.
        */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.style.background =
            "#ffffff";


        wrapper.style.padding =
            "30px";


        wrapper.style.width =
            "100%";


        wrapper.style.fontFamily =
            "Arial, Helvetica, sans-serif";


        wrapper.innerHTML = `

            <div
                style="
                    text-align:center;
                    margin-bottom:25px;
                "
            >

                <h1
                    style="
                        margin:0;
                        color:#14213d;
                    "
                >
                    AI Visibility Analyzer
                </h1>


                <p
                    style="
                        color:#6680a5;
                        margin-top:8px;
                    "
                >
                    Website AI Visibility Analysis Report
                </p>

            </div>

        `;


        wrapper.appendChild(
            pdfContent
        );


        /*
           Temporarily place wrapper
           in document.
        */

        wrapper.style.position =
            "absolute";


        wrapper.style.left =
            "-100000px";


        wrapper.style.top =
            "0";


        document.body.appendChild(
            wrapper
        );


        /*
           Generate filename.
        */

        let domain =
            "website";


        if (
            websiteInput &&
            websiteInput.value
        ) {

            try {

                const url =
                    new URL(
                        websiteInput.value
                    );


                domain =
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

            catch {

                domain =
                    "website";

            }

        }


        const filename =
            `AI-Visibility-Report-${domain}.pdf`;


        /*
           PDF options.
        */

        const options = {

            margin:
                0.45,

            filename:
                filename,

            image: {

                type:
                    "jpeg",

                quality:
                    0.95

            },

            html2canvas: {

                scale:
                    2,

                useCORS:
                    true,

                backgroundColor:
                    "#ffffff"

            },

            jsPDF: {

                unit:
                    "in",

                format:
                    "a4",

                orientation:
                    "portrait"

            },

            pagebreak: {

                mode:
                    [
                        "avoid-all",
                        "css",
                        "legacy"
                    ]

            }

        };


        /*
           Generate PDF.
        */

        await html2pdf()
            .set(options)
            .from(wrapper)
            .save();


        /*
           Remove temporary wrapper.
        */

        wrapper.remove();


        /*
           Restore button.
        */

        if (button) {

            button.disabled =
                false;


            button.innerHTML =
                button.dataset.originalText ||
                "📄 Download PDF Report";

        }


    }


    catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        /*
           Remove temporary wrapper
           if it still exists.
        */

        const temporaryWrappers =
            document.querySelectorAll(
                "body > div"
            );


        temporaryWrappers.forEach(
            element => {

                if (
                    element.style.left ===
                    "-100000px"
                ) {

                    element.remove();

                }

            }
        );


        if (button) {

            button.disabled =
                false;


            button.innerHTML =
                button.dataset.originalText ||
                "📄 Download PDF Report";

        }


        showPDFMessage(
            "Unable to generate the PDF report. Please try again."
        );

    }

}


// ======================================================
// PDF MESSAGE
// ======================================================

function showPDFMessage(
    text
) {

    /*
       Use existing popup if the dashboard
       has one.
    */

    if (
        typeof showPopup ===
        "function"
    ) {

        showPopup(
            text,
            "error"
        );


        return;

    }


    /*
       Otherwise use a simple browser alert.
    */

    alert(
        text
    );

}


// ======================================================
// SAVE ANALYSIS RESULT LOCALLY
//
// Used when moving between dashboard
// and other pages.
// ======================================================

function saveAnalysisResult(
    data
) {

    try {

        sessionStorage.setItem(
            "latest_analysis",
            JSON.stringify(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Unable to save analysis result:",
            error
        );

    }

}


// ======================================================
// GET SAVED ANALYSIS
// ======================================================

function getSavedAnalysisResult() {

    try {

        const saved =
            sessionStorage.getItem(
                "latest_analysis"
            );


        if (!saved) {

            return null;

        }


        return JSON.parse(
            saved
        );

    }

    catch (error) {

        console.error(
            "Unable to read saved analysis:",
            error
        );


        return null;

    }

}


// ======================================================
// CLEAR SAVED ANALYSIS
// ======================================================

function clearSavedAnalysisResult() {

    sessionStorage.removeItem(
        "latest_analysis"
    );

}


// ======================================================
// ANALYSIS SCORE COLOR
// ======================================================

function getScoreClass(
    score
) {

    const numericScore =
        Number(score);


    if (
        numericScore >= 80
    ) {

        return "score-good";

    }


    if (
        numericScore >= 60
    ) {

        return "score-medium";

    }


    return "score-low";

}


// ======================================================
// ANALYSIS STATUS
// ======================================================

function getAnalysisStatus(
    data
) {

    if (!data) {

        return "failed";

    }


    if (
        data.success === false
    ) {

        return "failed";

    }


    if (
        data.status
    ) {

        return String(
            data.status
        ).toLowerCase();

    }


    if (
        data.completed === true
    ) {

        return "completed";

    }


    if (
        isValidAnalysisResult(
            data
        )
    ) {

        return "completed";

    }


    return "failed";

}


// ======================================================
// INITIALIZE DASHBOARD
// ======================================================

async function initializeDashboard() {

    console.log(
        "Initializing AI Visibility Dashboard..."
    );


    /*
       Check authentication first.
    */

    if (
        !initializeAuthentication()
    ) {

        return;

    }


    /*
       Check PDF library.
    */

    checkPDFLibrary();


    /*
       Load profile.
    */

    await loadProfile();


    /*
       Make sure results area is ready.
    */

    if (
        results
    ) {

        /*
           Do not automatically display
           old incomplete analysis.
        */

        const saved =
            getSavedAnalysisResult();


        if (
            saved &&
            isValidAnalysisResult(
                saved
            )
        ) {

            console.log(
                "Restoring valid saved analysis."
            );


            showResults(
                saved
            );

        }

    }


    console.log(
        "Dashboard initialized successfully."
    );

}


// ======================================================
// DOM READY
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

}

else {

    initializeDashboard();

}


// ======================================================
// GLOBAL FUNCTIONS
//
// These are required because some HTML
// buttons use onclick="..."
// ======================================================

window.logout =
    logout;


window.analyzeWebsite =
    analyzeWebsite;


window.retryAnalysis =
    retryAnalysis;


window.downloadPDF =
    downloadPDF;


window.showResults =
    showResults;


window.loadProfile =
    loadProfile;

    // ======================================================
// GENERIC SAFE VALUE
// ======================================================

function safeValue(value, fallback = "-") {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(value);

        }

        catch (error) {

            return fallback;

        }

    }

    return String(value);

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ======================================================
// PDF DOWNLOAD
// ======================================================

async function downloadPDF() {

    const button =
        document.getElementById(
            "download-pdf-btn"
        );


    // ==================================================
    // CHECK PDF LIBRARY
    // ==================================================

    if (
        !checkPDFLibrary()
    ) {

        showPDFMessage(
            "PDF generator is not available. Please refresh the page and try again."
        );

        return;

    }


    // ==================================================
    // CHECK COMPLETED RESULTS
    // ==================================================

    if (
        !results ||
        !results.innerHTML.trim()
    ) {

        showPDFMessage(
            "There is no completed analysis available to download."
        );

        return;

    }


    // ==================================================
    // DISABLE BUTTON
    // ==================================================

    if (button) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.innerHTML;

        button.innerHTML =
            "⏳ Generating PDF...";

    }


    let wrapper = null;


    try {

        // ==================================================
        // CLONE RESULTS
        // ==================================================

        const pdfContent =
            results.cloneNode(
                true
            );


        // ==================================================
        // REMOVE DOWNLOAD BUTTON
        // ==================================================

        const pdfButton =
            pdfContent.querySelector(
                "#download-pdf-btn"
            );


        if (pdfButton) {

            pdfButton.remove();

        }


        // ==================================================
        // REMOVE PDF SECTION
        // ==================================================

        const pdfSection =
            pdfContent.querySelector(
                ".pdf-download-section"
            );


        if (pdfSection) {

            pdfSection.remove();

        }


        // ==================================================
        // CREATE PDF WRAPPER
        // ==================================================

        wrapper =
            document.createElement(
                "div"
            );


        wrapper.style.background =
            "#ffffff";

        wrapper.style.padding =
            "30px";

        wrapper.style.width =
            "100%";

        wrapper.style.boxSizing =
            "border-box";

        wrapper.style.fontFamily =
            "Arial, Helvetica, sans-serif";


        // ==================================================
        // PDF HEADER
        // ==================================================

        wrapper.innerHTML = `

            <div
                style="
                    text-align:center;
                    margin-bottom:25px;
                    padding-bottom:15px;
                    border-bottom:2px solid #e5e7eb;
                "
            >

                <h1
                    style="
                        margin:0;
                        color:#14213d;
                        font-size:26px;
                    "
                >
                    AI Visibility Analyzer
                </h1>


                <p
                    style="
                        color:#6680a5;
                        margin-top:8px;
                        margin-bottom:0;
                        font-size:14px;
                    "
                >
                    Website AI Visibility Analysis Report
                </p>

            </div>

        `;


        wrapper.appendChild(
            pdfContent
        );


        // ==================================================
        // HIDE TEMPORARILY
        // ==================================================

        wrapper.style.position =
            "absolute";

        wrapper.style.left =
            "-100000px";

        wrapper.style.top =
            "0";

        wrapper.style.width =
            "1000px";

        wrapper.style.zIndex =
            "-1";


        document.body.appendChild(
            wrapper
        );


        // ==================================================
        // GENERATE DOMAIN NAME
        // ==================================================

        let domain =
            "website";


        if (
            websiteInput &&
            websiteInput.value
        ) {

            try {

                let website =
                    websiteInput.value.trim();


                if (
                    !/^https?:\/\//i.test(
                        website
                    )
                ) {

                    website =
                        "https://" +
                        website;

                }


                const url =
                    new URL(
                        website
                    );


                domain =
                    url.hostname
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
                    "Unable to determine domain:",
                    error
                );

                domain =
                    "website";

            }

        }


        // ==================================================
        // PDF FILENAME
        // ==================================================

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        const filename =
            `${domain}-AI-Visibility-Report-${year}-${month}-${day}.pdf`;


        // ==================================================
        // PDF OPTIONS
        // ==================================================

        const options = {

            margin:
                0.45,

            filename:
                filename,

            image: {

                type:
                    "jpeg",

                quality:
                    0.95

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

                imageTimeout:
                    15000

            },

            jsPDF: {

                unit:
                    "in",

                format:
                    "a4",

                orientation:
                    "portrait",

                compress:
                    true

            },

            pagebreak: {

                mode: [
                    "avoid-all",
                    "css",
                    "legacy"
                ]

            }

        };


        // ==================================================
        // GENERATE PDF
        // ==================================================

        await html2pdf()
            .set(
                options
            )
            .from(
                wrapper
            )
            .save();


        // ==================================================
        // SUCCESS
        // ==================================================

        showPDFMessage(
            "PDF report generated successfully."
        );


    }

    catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        showPDFMessage(
            "Unable to generate the PDF report. Please try again."
        );

    }


    finally {

        // ==================================================
        // REMOVE TEMPORARY WRAPPER
        // ==================================================

        if (wrapper) {

            try {

                wrapper.remove();

            }

            catch (error) {

                console.warn(
                    "PDF wrapper cleanup failed:",
                    error
                );

            }

        }


        // ==================================================
        // RESTORE BUTTON
        // ==================================================

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                button.dataset.originalText ||
                "📄 Download PDF Report";

            button.style.opacity =
                "1";

            button.style.cursor =
                "pointer";

        }

    }

}


// ======================================================
// PDF MESSAGE
// ======================================================

function showPDFMessage(
    text
) {

    if (
        typeof showPopup ===
        "function"
    ) {

        showPopup(
            text,
            "error"
        );

        return;

    }


    alert(
        text
    );

}


// ======================================================
// SAVE ANALYSIS RESULT
// ======================================================
//
// Only save valid completed analysis.
// Failed results must NEVER be saved.
//
// ======================================================

function saveAnalysisResult(
    data
) {

    try {

        const normalized =
            normalizeAnalysisData(
                data
            );


        if (
            !normalized ||
            !isValidAnalysisResult(
                normalized
            )
        ) {

            console.warn(
                "Not saving invalid or failed analysis."
            );

            return false;

        }


        sessionStorage.setItem(
            "latest_analysis",
            JSON.stringify(
                normalized
            )
        );


        console.log(
            "Completed analysis saved successfully."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Unable to save analysis result:",
            error
        );


        return false;

    }

}


// ======================================================
// GET SAVED ANALYSIS
// ======================================================

function getSavedAnalysisResult() {

    try {

        const saved =
            sessionStorage.getItem(
                "latest_analysis"
            );


        if (!saved) {

            return null;

        }


        const parsed =
            JSON.parse(
                saved
            );


        const normalized =
            normalizeAnalysisData(
                parsed
            );


        if (
            !normalized ||
            !isValidAnalysisResult(
                normalized
            )
        ) {

            sessionStorage.removeItem(
                "latest_analysis"
            );


            return null;

        }


        return normalized;

    }

    catch (error) {

        console.error(
            "Unable to read saved analysis:",
            error
        );


        sessionStorage.removeItem(
            "latest_analysis"
        );


        return null;

    }

}


// ======================================================
// CLEAR SAVED ANALYSIS
// ======================================================

function clearSavedAnalysisResult() {

    try {

        sessionStorage.removeItem(
            "latest_analysis"
        );

    }

    catch (error) {

        console.error(
            "Unable to clear saved analysis:",
            error
        );

    }

}


// ======================================================
// ANALYSIS SCORE COLOR
// ======================================================

function getScoreClass(
    score
) {

    const numericScore =
        Number(score);


    if (
        numericScore >= 80
    ) {

        return "score-good";

    }


    if (
        numericScore >= 60
    ) {

        return "score-medium";

    }


    return "score-low";

}


// ======================================================
// ANALYSIS STATUS
// ======================================================

function getAnalysisStatus(
    data
) {

    if (!data) {

        return "failed";

    }


    if (
        data.success === false
    ) {

        return "failed";

    }


    if (
        data.status
    ) {

        const status =
            String(
                data.status
            ).toLowerCase();


        if (
            status === "failed" ||
            status === "error" ||
            status === "failure"
        ) {

            return "failed";

        }


        if (
            status === "completed" ||
            status === "complete" ||
            status === "success" ||
            status === "successful"
        ) {

            return "completed";

        }

    }


    if (
        data.completed === true
    ) {

        return "completed";

    }


    if (
        isValidAnalysisResult(
            data
        )
    ) {

        return "completed";

    }


    return "failed";

}

// ======================================================
// INITIALIZE DASHBOARD
// ======================================================

async function initializeDashboard() {

    console.log(
        "Initializing AI Visibility Dashboard..."
    );


    // ==================================================
    // AUTHENTICATION
    // ==================================================

    const authenticated =
        initializeAuthentication();


    if (!authenticated) {

        return;

    }


    // ==================================================
    // CHECK PDF LIBRARY
    // ==================================================

    checkPDFLibrary();


    // ==================================================
    // LOAD PROFILE
    // ==================================================

    try {

        await loadProfile();

    }

    catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );

    }


    // ==================================================
    // RESTORE ONLY VALID COMPLETED ANALYSIS
    // ==================================================

    if (results) {

        const saved =
            getSavedAnalysisResult();


        if (
            saved &&
            isValidAnalysisResult(
                saved
            )
        ) {

            console.log(
                "Restoring valid completed analysis."
            );


            showResults(
                saved
            );

        }

        else {

            console.log(
                "No valid completed analysis to restore."
            );


            results.innerHTML =
                "";

        }

    }


    console.log(
        "Dashboard initialized successfully."
    );

}


// ======================================================
// DOM READY
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

}

else {

    initializeDashboard();

}


// ======================================================
// OPEN PROFILE PAGE
// ======================================================

function openProfilePage() {

    window.location.href =
        "profile.html";

}


// ======================================================
// GLOBAL FUNCTIONS
//
// Required by HTML onclick="..."
// ======================================================

window.logout =
    logout;


window.analyzeWebsite =
    analyzeWebsite;


window.retryAnalysis =
    retryAnalysis;


window.downloadPDF =
    downloadPDF;


window.showResults =
    showResults;


window.loadProfile =
    loadProfile;


window.openProfilePage =
    openProfilePage;


// ======================================================
// OPTIONAL GLOBAL HELPERS
// ======================================================

window.saveAnalysisResult =
    saveAnalysisResult;


window.getSavedAnalysisResult =
    getSavedAnalysisResult;


window.clearSavedAnalysisResult =
    clearSavedAnalysisResult;


window.getAnalysisStatus =
    getAnalysisStatus;


// ======================================================
// END OF DASHBOARD.JS
// ======================================================