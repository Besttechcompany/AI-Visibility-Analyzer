/* =========================================================
   AI VISIBILITY ANALYZER
   ANALYSIS HISTORY
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   CONFIGURATION
   --------------------------------------------------------- */

const API_BASE_URL = "https://ai-visibility-analyzer.onrender.com";

/*
   IMPORTANT:
   Change this ONLY if your backend uses a different route.

   Examples:
   /analysis-history
   /api/analysis-history
   /history
*/
const HISTORY_API = "/analysis-history";


/* ---------------------------------------------------------
   DOM ELEMENTS
   --------------------------------------------------------- */

const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const emptyBox = document.getElementById("emptyBox");
const historyContainer = document.getElementById("historyContainer");

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");

const logoutBtn = document.getElementById("logoutBtn");


/* ---------------------------------------------------------
   AUTHENTICATION
   --------------------------------------------------------- */

function getAuthToken() {

    const urlParams = new URLSearchParams(window.location.search);

    const urlToken =
        urlParams.get("token") ||
        urlParams.get("access_token") ||
        urlParams.get("accessToken");

    if (urlToken) {

        localStorage.setItem("token", urlToken);

        /*
         Remove token from browser address bar
         after storing it.
        */
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        return urlToken;
    }


    const localToken =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

    if (localToken) {
        return localToken;
    }


    const sessionToken =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("accessToken");

    if (sessionToken) {
        return sessionToken;
    }


    return null;
}


/* ---------------------------------------------------------
   UI STATES
   --------------------------------------------------------- */

function hideAllStates() {

    if (loading) {
        loading.classList.add("hidden");
    }

    if (errorBox) {
        errorBox.classList.add("hidden");
    }

    if (emptyBox) {
        emptyBox.classList.add("hidden");
    }

    if (historyContainer) {
        historyContainer.classList.add("hidden");
    }
}


function showLoading() {

    hideAllStates();

    if (loading) {
        loading.classList.remove("hidden");
    }
}


function showError(message) {

    hideAllStates();

    if (errorMessage) {
        errorMessage.textContent =
            message || "Unable to load analysis history.";
    }

    if (errorBox) {
        errorBox.classList.remove("hidden");
    }
}


function showEmpty() {

    hideAllStates();

    if (emptyBox) {
        emptyBox.classList.remove("hidden");
    }
}


function showHistory() {

    hideAllStates();

    if (historyContainer) {
        historyContainer.classList.remove("hidden");
    }
}


/* ---------------------------------------------------------
   SECURITY
   --------------------------------------------------------- */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ---------------------------------------------------------
   DATA HELPERS
   --------------------------------------------------------- */

function getAnalysisId(item) {

    return (
        item?.id ??
        item?.analysis_id ??
        item?.analysisId ??
        item?.ID ??
        ""
    );
}


function getWebsite(item) {

    return (
        item?.url ??
        item?.website ??
        item?.website_url ??
        item?.websiteUrl ??
        ""
    );
}


function getCreatedDate(item) {

    return (
        item?.created_at ??
        item?.createdAt ??
        item?.date ??
        item?.timestamp ??
        item?.created ??
        ""
    );
}


function getStatus(item) {

    return (
        item?.status ??
        item?.analysis_status ??
        "Completed"
    );
}


/* ---------------------------------------------------------
   DATE FORMAT
   --------------------------------------------------------- */

function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


/* ---------------------------------------------------------
   NORMALIZE API RESPONSE
   --------------------------------------------------------- */

function normalizeHistoryResponse(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.history)) {
        return data.history;
    }

    if (Array.isArray(data?.analyses)) {
        return data.analyses;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
}


/* ---------------------------------------------------------
   LOAD HISTORY FROM SERVER
   --------------------------------------------------------- */

async function fetchHistory() {

    const token = getAuthToken();

    if (!token) {

        throw new Error(
            "Your login session has expired. Please login again."
        );
    }


    const response = await fetch(
        `${API_BASE_URL}${HISTORY_API}`,
        {
            method: "GET",

            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },

            cache: "no-store"
        }
    );


    console.log(
        "History API:",
        `${API_BASE_URL}${HISTORY_API}`
    );

    console.log(
        "History response:",
        response.status
    );


    if (response.status === 401) {

        throw new Error(
            "Your login session has expired. Please login again."
        );
    }


    if (response.status === 404) {

        throw new Error(
            "History API returned HTTP 404. The backend history route does not exist or the frontend is using the wrong API route."
        );
    }


    if (!response.ok) {

        throw new Error(
            `Server returned HTTP ${response.status}.`
        );
    }


    return await response.json();
}


/* ---------------------------------------------------------
   PDF DOWNLOAD
   --------------------------------------------------------- */

async function downloadPDF(
    analysisId,
    button
) {

    if (!analysisId) {

        alert(
            "Analysis ID is missing. PDF cannot be downloaded."
        );

        return;
    }


    const token = getAuthToken();

    if (!token) {

        alert(
            "Your login session has expired. Please login again."
        );

        return;
    }


    const originalText =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML =
        "⏳ Preparing PDF...";


    try {

        /*
           IMPORTANT:
           This is the expected PDF route.

           If your backend uses another route,
           change it here.
        */

        const pdfURL =
            `${API_BASE_URL}/analysis/${encodeURIComponent(
                analysisId
            )}/pdf`;


        const response = await fetch(
            pdfURL,
            {
                method: "GET",

                headers: {
                    "Accept": "application/pdf",
                    "Authorization": `Bearer ${token}`
                },

                cache: "no-store"
            }
        );


        if (response.status === 401) {

            throw new Error(
                "Your login session has expired. Please login again."
            );
        }


        if (response.status === 404) {

            throw new Error(
                "PDF endpoint was not found on the server."
            );
        }


        if (!response.ok) {

            throw new Error(
                `PDF download failed (${response.status}).`
            );
        }


        const blob =
            await response.blob();


        const blobURL =
            window.URL.createObjectURL(blob);


        const downloadLink =
            document.createElement("a");


        downloadLink.href =
            blobURL;


        downloadLink.download =
            `AI-Visibility-Analysis-${analysisId}.pdf`;


        document.body.appendChild(
            downloadLink
        );


        downloadLink.click();


        downloadLink.remove();


        setTimeout(
            () => {
                window.URL.revokeObjectURL(
                    blobURL
                );
            },
            1000
        );

    }
    catch (error) {

        console.error(
            "PDF download error:",
            error
        );


        alert(
            error.message ||
            "Unable to download PDF report."
        );

    }
    finally {

        button.disabled = false;

        button.innerHTML =
            originalText;
    }
}


/* ---------------------------------------------------------
   CREATE PDF BUTTON
   --------------------------------------------------------- */

function createPDFSection(
    analysisId
) {

    const footer =
        document.createElement("div");

    footer.className =
        "history-card-footer";


    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "download-pdf-btn";


    button.innerHTML =
        "📄 Download PDF Report";


    button.addEventListener(
        "click",
        () => {

            downloadPDF(
                analysisId,
                button
            );

        }
    );


    footer.appendChild(
        button
    );


    return footer;
}


/* ---------------------------------------------------------
   CREATE HISTORY CARD
   --------------------------------------------------------- */

function createHistoryCard(
    item
) {

    const analysisId =
        getAnalysisId(item);


    const website =
        getWebsite(item);


    const createdDate =
        getCreatedDate(item);


    const status =
        getStatus(item);


    const card =
        document.createElement("article");


    card.className =
        "history-card";


    /* -----------------------------------------
       MAIN CONTENT
       ----------------------------------------- */

    const content =
        document.createElement("div");


    content.className =
        "history-card-content";


    /* WEBSITE */

    const websiteTitle =
        document.createElement("h4");


    websiteTitle.className =
        "history-website";


    websiteTitle.textContent =
        website ||
        "Website unavailable";


    content.appendChild(
        websiteTitle
    );


    /* DATE */

    const date =
        document.createElement("p");


    date.className =
        "history-date";


    date.textContent =
        formatDate(createdDate);


    content.appendChild(
        date
    );


    /* DETAILS */

    const details =
        document.createElement("div");


    details.className =
        "history-details";


    details.innerHTML = `

        <p class="history-detail">

            <strong>Analysis ID:</strong>

            ${escapeHTML(analysisId)}

        </p>


        <p class="history-detail history-url">

            <strong>Website:</strong>

            ${escapeHTML(website)}

        </p>


        <p class="history-detail">

            <strong>Status:</strong>

            <span class="status-completed">

                ${escapeHTML(status)}

            </span>

        </p>

    `;


    content.appendChild(
        details
    );


    card.appendChild(
        content
    );


    /* -----------------------------------------
       PDF BUTTON AT END OF RECORD
       ----------------------------------------- */

    card.appendChild(
        createPDFSection(
            analysisId
        )
    );


    return card;
}


/* ---------------------------------------------------------
   LOAD HISTORY
   --------------------------------------------------------- */

async function loadHistory() {

    showLoading();


    try {

        const data =
            await fetchHistory();


        const history =
            normalizeHistoryResponse(
                data
            );


        console.log(
            "Analysis history:",
            history
        );


        if (
            !Array.isArray(history) ||
            history.length === 0
        ) {

            if (historyList) {
                historyList.innerHTML = "";
            }

            if (historyCount) {
                historyCount.textContent =
                    "0 analyses";
            }

            showEmpty();

            return;
        }


        /* -----------------------------------------
           NEWEST FIRST
           ----------------------------------------- */

        history.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        getCreatedDate(a)
                    ).getTime();


                const dateB =
                    new Date(
                        getCreatedDate(b)
                    ).getTime();


                if (
                    Number.isNaN(dateA) &&
                    Number.isNaN(dateB)
                ) {
                    return 0;
                }


                if (
                    Number.isNaN(dateA)
                ) {
                    return 1;
                }


                if (
                    Number.isNaN(dateB)
                ) {
                    return -1;
                }


                return dateB - dateA;
            }
        );


        historyList.innerHTML = "";


        history.forEach(
            item => {

                const card =
                    createHistoryCard(
                        item
                    );


                historyList.appendChild(
                    card
                );

            }
        );


        if (historyCount) {

            historyCount.textContent =
                `${history.length} ${
                    history.length === 1
                        ? "analysis"
                        : "analyses"
                }`;

        }


        showHistory();

    }
    catch (error) {

        console.error(
            "Analysis history error:",
            error
        );


        showError(
            error.message ||
            "Unable to load analysis history."
        );
    }
}


/* ---------------------------------------------------------
   RETRY
   --------------------------------------------------------- */

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadHistory
    );

}


/* ---------------------------------------------------------
   LOGOUT
   --------------------------------------------------------- */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "accessToken"
            );


            sessionStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "access_token"
            );

            sessionStorage.removeItem(
                "accessToken"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHistory();

    }
);