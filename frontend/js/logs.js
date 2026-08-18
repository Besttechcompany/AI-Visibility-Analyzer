/* =========================================================
   AI VISIBILITY ANALYZER
   ANALYSIS HISTORY
   ========================================================= */


/* =========================================================
   BACKEND API
   IMPORTANT:
   Do NOT use relative API URLs here.
   The frontend is hosted on Vercel.
   The backend is hosted on Render.
   ========================================================= */

const API_BASE_URL =
    "https://ai-visibility-analyzer.onrender.com";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

const emptyBox =
    document.getElementById("emptyBox");

const historyContainer =
    document.getElementById("historyContainer");

const historyList =
    document.getElementById("historyList");

const historyCount =
    document.getElementById("historyCount");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================================================
   GET AUTH TOKEN
   ========================================================= */

function getAuthToken() {

    /*
       First check URL parameter.

       Google login in your application redirects with:

       dashboard.html?token=JWT
    */

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlToken =
        urlParams.get("token");


    if (urlToken) {

        localStorage.setItem(
            "token",
            urlToken
        );

        /*
           Remove token from browser URL
           after saving it.
        */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        return urlToken;
    }


    /*
       Otherwise use previously stored token.
    */

    return localStorage.getItem("token");
}


/* =========================================================
   TOKEN
   ========================================================= */

const token =
    getAuthToken();


/* =========================================================
   HIDE ALL STATES
   ========================================================= */

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


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    hideAllStates();

    if (loading) {
        loading.classList.remove("hidden");
    }
}


/* =========================================================
   SHOW ERROR
   ========================================================= */

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


/* =========================================================
   SHOW EMPTY
   ========================================================= */

function showEmpty() {

    hideAllStates();

    if (emptyBox) {
        emptyBox.classList.remove("hidden");
    }
}


/* =========================================================
   SHOW HISTORY
   ========================================================= */

function showHistory() {

    hideAllStates();

    if (historyContainer) {
        historyContainer.classList.remove("hidden");
    }
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return value;
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


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GET VALUES FROM DIFFERENT POSSIBLE API FORMATS
   ========================================================= */

function getAnalysisId(item) {

    return (
        item.id ??
        item.analysis_id ??
        item.analysisId ??
        item.ID ??
        ""
    );
}


function getWebsite(item) {

    return (
        item.url ??
        item.website ??
        item.website_url ??
        item.websiteUrl ??
        ""
    );
}


function getCreatedDate(item) {

    return (
        item.created_at ??
        item.createdAt ??
        item.date ??
        item.timestamp ??
        item.created ??
        ""
    );
}


function getStatus(item) {

    return (
        item.status ??
        item.analysis_status ??
        "Completed"
    );
}


/* =========================================================
   PDF DOWNLOAD
   ========================================================= */

function downloadAnalysisPDF(id, website) {

    /*
       IMPORTANT

       This function first checks whether your application
       already has a PDF endpoint.

       If your backend PDF endpoint is different, change
       PDF URL below.
    */

    if (!id) {

        alert(
            "Analysis ID is missing. PDF cannot be downloaded."
        );

        return;
    }


    const pdfURL =
        `${API_BASE_URL}/analysis/${encodeURIComponent(id)}/pdf`;


    /*
       Open the PDF endpoint.

       Authentication is included through a temporary
       authenticated request because browsers do not allow
       custom Authorization headers with window.open().
    */

    fetch(pdfURL, {

        method: "GET",

        headers: {

            "Authorization":
                `Bearer ${token}`

        }

    })

    .then(async response => {

        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                `PDF download failed (${response.status})`
            );
        }


        return response.blob();

    })

    .then(blob => {

        const url =
            window.URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            `analysis-${id}.pdf`;


        document.body.appendChild(link);


        link.click();


        link.remove();


        window.URL.revokeObjectURL(url);

    })

    .catch(error => {

        console.error(
            "PDF download error:",
            error
        );


        alert(
            "Unable to download the PDF report."
        );

    });
}


/* =========================================================
   MAKE PDF BUTTON
   ========================================================= */

function createPDFButton(id, website) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "history-pdf-section";


    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "history-pdf-btn";


    button.innerHTML =
        "📄 Download PDF Report";


    button.addEventListener(
        "click",
        function () {

            downloadAnalysisPDF(
                id,
                website
            );

        }
    );


    wrapper.appendChild(button);


    return wrapper;
}


/* =========================================================
   CREATE HISTORY CARD
   ========================================================= */

function createHistoryCard(item) {

    const id =
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


    /* =====================================================
       CARD CONTENT
       ===================================================== */

    const content =
        document.createElement("div");


    content.className =
        "history-card-content";


    const title =
        document.createElement("h4");


    title.className =
        "history-website";


    title.textContent =
        website || "Website unavailable";


    content.appendChild(title);


    const date =
        document.createElement("p");


    date.className =
        "history-date";


    date.textContent =
        formatDate(createdDate);


    content.appendChild(date);


    const analysisID =
        document.createElement("p");


    analysisID.className =
        "history-detail";


    analysisID.innerHTML =
        `<strong>Analysis ID:</strong> ${escapeHTML(id)}`;


    content.appendChild(analysisID);


    const websiteRow =
        document.createElement("p");


    websiteRow.className =
        "history-detail";


    websiteRow.innerHTML =
        `<strong>Website:</strong> ${escapeHTML(website)}`;


    content.appendChild(websiteRow);


    const statusRow =
        document.createElement("p");


    statusRow.className =
        "history-detail";


    statusRow.innerHTML =
        `<strong>Status:</strong> ${escapeHTML(status)}`;


    content.appendChild(statusRow);


    card.appendChild(content);


    /* =====================================================
       PDF BUTTON AT THE END OF EACH RECORD
       ===================================================== */

    card.appendChild(
        createPDFButton(
            id,
            website
        )
    );


    return card;
}


/* =========================================================
   NORMALIZE API RESPONSE
   ========================================================= */

function normalizeHistoryResponse(data) {

    /*
       Your backend may return:

       []
       OR
       { history: [] }
       OR
       { analyses: [] }
       OR
       { data: [] }

       Handle all common formats.
    */

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(data.history)
    ) {
        return data.history;
    }


    if (
        data &&
        Array.isArray(data.analyses)
    ) {
        return data.analyses;
    }


    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }


    if (
        data &&
        Array.isArray(data.results)
    ) {
        return data.results;
    }


    return [];
}


/* =========================================================
   LOAD HISTORY
   ========================================================= */

async function loadHistory() {

    showLoading();


    /*
       Check authentication.
    */

    const currentToken =
        getAuthToken();


    if (!currentToken) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    try {

        console.log(
            "Loading analysis history..."
        );


        console.log(
            "API:",
            `${API_BASE_URL}/analysis-history`
        );


        /*
           IMPORTANT:
           Call Render backend directly.
        */

        const response =
            await fetch(
                `${API_BASE_URL}/analysis-history`,
                {

                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${currentToken}`

                    },

                    cache: "no-store"

                }
            );


        console.log(
            "History response status:",
            response.status
        );


        /* =================================================
           HANDLE 401
        ================================================= */

        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );


            showError(
                "Your login session has expired. Please login again."
            );


            return;
        }


        /* =================================================
           HANDLE 404
        ================================================= */

        if (response.status === 404) {

            throw new Error(
                "History API was not found. Please check the Render backend URL and /analysis-history route."
            );
        }


        /* =================================================
           HANDLE OTHER SERVER ERRORS
        ================================================= */

        if (!response.ok) {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }


        /* =================================================
           READ JSON
        ================================================= */

        const data =
            await response.json();


        console.log(
            "History API response:",
            data
        );


        const history =
            normalizeHistoryResponse(data);


        /* =================================================
           EMPTY HISTORY
        ================================================= */

        if (!history.length) {

            showEmpty();

            if (historyCount) {
                historyCount.textContent =
                    "0 analyses";
            }

            return;
        }


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        history.sort(
            function (a, b) {

                const dateA =
                    new Date(
                        getCreatedDate(a)
                    ).getTime();


                const dateB =
                    new Date(
                        getCreatedDate(b)
                    ).getTime();


                return dateB - dateA;

            }
        );


        /* =================================================
           CLEAR OLD RECORDS
        ================================================= */

        historyList.innerHTML = "";


        /* =================================================
           UPDATE COUNT
        ================================================= */

        if (historyCount) {

            historyCount.textContent =
                `${history.length} ${
                    history.length === 1
                        ? "analysis"
                        : "analyses"
                }`;

        }


        /* =================================================
           CREATE CARDS
        ================================================= */

        history.forEach(
            function (item) {

                historyList.appendChild(
                    createHistoryCard(item)
                );

            }
        );


        /* =================================================
           SHOW HISTORY
        ================================================= */

        showHistory();


        console.log(
            `Loaded ${history.length} analysis records.`
        );

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


/* =========================================================
   RETRY
   ========================================================= */

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        function () {

            loadHistory();

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "authToken"
            );


            sessionStorage.clear();


            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHistory();

    }
);