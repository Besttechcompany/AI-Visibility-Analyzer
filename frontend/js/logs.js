/* =========================================================
   AI VISIBILITY ANALYZER
   ANALYSIS HISTORY
========================================================= */


/* =========================================================
   API
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
   GET TOKEN
========================================================= */

function getToken() {

    let token =
        localStorage.getItem("access_token");


    if (!token) {

        const params =
            new URLSearchParams(
                window.location.search
            );


        token =
            params.get("token");


        if (token) {

            localStorage.setItem(
                "access_token",
                token
            );


            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

        }

    }


    return token;

}


/* =========================================================
   LOAD HISTORY
========================================================= */

async function loadHistory() {

    console.log(
        "Loading analysis history..."
    );


    /* -----------------------------------------------------
       SHOW LOADING
    ----------------------------------------------------- */

    if (loading) {

        loading.classList.remove(
            "hidden"
        );

    }


    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }


    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    if (historyContainer) {

        historyContainer.classList.add(
            "hidden"
        );

    }


    const token =
        getToken();


    /* -----------------------------------------------------
       CHECK TOKEN
    ----------------------------------------------------- */

    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;

    }


    try {

        console.log(
            "Requesting:",
            `${API_BASE_URL}/analysis-history`
        );


        const response =
            await fetch(
                `${API_BASE_URL}/analysis-history`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }
                }
            );


        console.log(
            "History HTTP status:",
            response.status
        );


        /* -------------------------------------------------
           UNAUTHORIZED
        ------------------------------------------------- */

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );


            showError(
                "Your login session has expired. Please login again."
            );


            return;

        }


        /* -------------------------------------------------
           SERVER ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );

        }


        /* -------------------------------------------------
           READ JSON
        ------------------------------------------------- */

        const data =
            await response.json();


        console.log(
            "Analysis history response:",
            data
        );


        /* -------------------------------------------------
           CHECK RESPONSE
        ------------------------------------------------- */

        if (
            !data ||
            !Array.isArray(
                data.history
            )
        ) {

            throw new Error(
                "Invalid history response from server."
            );

        }


        /* -------------------------------------------------
           DISPLAY
        ------------------------------------------------- */

        displayHistory(
            data.history
        );

    }
    catch (error) {

        console.error(
            "History loading error:",
            error
        );


        showError(
            error.message ||
            "Unable to load your analysis history. Please try again."
        );

    }

}

/* =========================================================
   DISPLAY HISTORY
========================================================= */

function displayHistory(
    history
) {

    /* -----------------------------------------------------
       STOP LOADING
    ----------------------------------------------------- */

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       EMPTY
    ----------------------------------------------------- */

    if (
        !history ||
        history.length === 0
    ) {

        if (historyContainer) {

            historyContainer.classList.add(
                "hidden"
            );

        }


        if (emptyBox) {

            emptyBox.classList.remove(
                "hidden"
            );

        }


        return;

    }


    /* -----------------------------------------------------
       SHOW HISTORY
    ----------------------------------------------------- */

    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    if (historyContainer) {

        historyContainer.classList.remove(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       COUNT
    ----------------------------------------------------- */

    if (historyCount) {

        historyCount.textContent =
            `${history.length} ${
                history.length === 1
                    ? "analysis"
                    : "analyses"
            }`;

    }


    /* -----------------------------------------------------
       CLEAR OLD RECORDS
    ----------------------------------------------------- */

    if (historyList) {

        historyList.innerHTML = "";

    }


    /* -----------------------------------------------------
       CREATE CARDS
    ----------------------------------------------------- */

    history.forEach(
        (
            item,
            index
        ) => {

            const card =
                createHistoryCard(
                    item,
                    index
                );


            if (historyList) {

                historyList.appendChild(
                    card
                );

            }

        }
    );

}


/* =========================================================
   CREATE HISTORY CARD
========================================================= */

function createHistoryCard(
    item,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "history-card";


    /* =====================================================
       WEBSITE
    ===================================================== */

    const website =
        document.createElement(
            "div"
        );


    website.className =
        "history-website";


    website.textContent =
        item.website_url ||
        item.website ||
        "Website unavailable";


    /* =====================================================
       DATE
    ===================================================== */

    const date =
        document.createElement(
            "div"
        );


    date.className =
        "history-date";


    date.textContent =
        formatDateTime(
            item.created_at
        );


    /* =====================================================
       ID
    ===================================================== */

    const id =
        document.createElement(
            "div"
        );


    id.className =
        "history-id";


    id.textContent =
        `#${item.id}`;


    /* =====================================================
       STATUS
    ===================================================== */

    const status =
        document.createElement(
            "div"
        );


    status.className =
        "history-status";


    const itemStatus =
        String(
            item.status ||
            ""
        )
        .trim()
        .toLowerCase();


    /* -----------------------------------------------------
       FAILED
    ----------------------------------------------------- */

    if (
        itemStatus === "failed" ||
        itemStatus === "failure" ||
        itemStatus === "error"
    ) {

        status.textContent =
            "✕ Failed";


        status.classList.add(
            "status-failed"
        );

    }


    /* -----------------------------------------------------
       PROCESSING
    ----------------------------------------------------- */

    else if (
        itemStatus === "processing" ||
        itemStatus === "running"
    ) {

        status.textContent =
            "⟳ Processing";


        status.classList.add(
            "status-processing"
        );

    }


    /* -----------------------------------------------------
       PENDING
    ----------------------------------------------------- */

    else if (
        itemStatus === "pending" ||
        itemStatus === "queued"
    ) {

        status.textContent =
            "⏳ Pending";


        status.classList.add(
            "status-pending"
        );

    }


    /* -----------------------------------------------------
       COMPLETED
    ----------------------------------------------------- */

    else {

        /*
           Old records without status are considered
           completed because they already exist in history.
        */

        status.textContent =
            "✓ Completed";


        status.classList.add(
            "status-completed"
        );

    }


    /* =====================================================
       PDF AREA
    ===================================================== */

    const pdfArea =
        document.createElement(
            "div"
        );


    pdfArea.className =
        "history-pdf";


    /* -----------------------------------------------------
       FAILED = NO PDF
    ----------------------------------------------------- */

    if (
        itemStatus === "failed" ||
        itemStatus === "failure" ||
        itemStatus === "error"
    ) {

        createUnavailablePDF(
            pdfArea
        );

    }


    /* -----------------------------------------------------
       PROCESSING = NO PDF
    ----------------------------------------------------- */

    else if (
        itemStatus === "processing" ||
        itemStatus === "running"
    ) {

        createUnavailablePDF(
            pdfArea
        );

    }


    /* -----------------------------------------------------
       PENDING = NO PDF
    ----------------------------------------------------- */

    else if (
        itemStatus === "pending" ||
        itemStatus === "queued"
    ) {

        createUnavailablePDF(
            pdfArea
        );

    }


    /* -----------------------------------------------------
       COMPLETED = PDF
    ----------------------------------------------------- */

    else {

        createPDFButton(
            pdfArea,
            item.id
        );

    }


    /* =====================================================
       ASSEMBLE CARD
    ===================================================== */

    card.appendChild(
        website
    );


    card.appendChild(
        date
    );


    card.appendChild(
        id
    );


    card.appendChild(
        status
    );


    card.appendChild(
        pdfArea
    );


    return card;

}


/* =========================================================
   UNAVAILABLE PDF
========================================================= */

function createUnavailablePDF(
    container
) {

    const text =
        document.createElement(
            "span"
        );


    text.className =
        "pdf-unavailable";


    text.textContent =
        "PDF unavailable";


    container.appendChild(
        text
    );

}


/* =========================================================
   CREATE PDF BUTTON
========================================================= */

function createPDFButton(
    container,
    analysisId
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "download-pdf-btn";


    button.textContent =
        "📄 Download PDF";


    button.addEventListener(
        "click",
        function () {

            downloadPDF(
                analysisId,
                button
            );

        }
    );


    container.appendChild(
        button
    );

}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(
    dateString
) {

    if (!dateString) {

        return "Date unavailable";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"
        }
    );

}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

async function downloadPDF(
    analysisId,
    button
) {

    const token =
        getToken();


    /* -----------------------------------------------------
       LOGIN CHECK
    ----------------------------------------------------- */

    if (!token) {

        alert(
            "Your login session has expired. Please login again."
        );


        window.location.href =
            "login.html";


        return;

    }


    /* -----------------------------------------------------
       ID CHECK
    ----------------------------------------------------- */

    if (
        analysisId === undefined ||
        analysisId === null ||
        analysisId === ""
    ) {

        alert(
            "Invalid analysis ID."
        );


        return;

    }


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "⏳ Preparing PDF...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/analysis/${encodeURIComponent(analysisId)}/pdf`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/pdf"

                    }
                }
            );


        /* -------------------------------------------------
           UNAUTHORIZED
        ------------------------------------------------- */

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );


            alert(
                "Your login session has expired. Please login again."
            );


            window.location.href =
                "login.html";


            return;

        }


        /* -------------------------------------------------
           FAILED ANALYSIS
        ------------------------------------------------- */

        if (
            response.status === 409
        ) {

            let message =
                "PDF is unavailable because this analysis failed.";


            try {

                const errorData =
                    await response.json();


                if (
                    errorData &&
                    errorData.detail
                ) {

                    message =
                        errorData.detail;

                }

            }
            catch (error) {

                console.log(
                    "Could not read 409 response."
                );

            }


            alert(
                message
            );


            return;

        }


        /* -------------------------------------------------
           NOT FOUND
        ------------------------------------------------- */

        if (
            response.status === 404
        ) {

            alert(
                "Analysis report was not found."
            );


            return;

        }


        /* -------------------------------------------------
           OTHER ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                `Unable to generate PDF. Server returned ${response.status}.`
            );

        }


        /* -------------------------------------------------
           PDF BLOB
        ------------------------------------------------- */

        const blob =
            await response.blob();


        if (
            !blob ||
            blob.size === 0
        ) {

            throw new Error(
                "The server returned an empty PDF."
            );

        }


        /* -------------------------------------------------
           CREATE DOWNLOAD URL
        ------------------------------------------------- */

        const blobUrl =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            blobUrl;


        link.download =
            `AI_Visibility_Report_${analysisId}.pdf`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        /* -------------------------------------------------
           CLEAN URL
        ------------------------------------------------- */

        setTimeout(
            function () {

                window.URL.revokeObjectURL(
                    blobUrl
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
            "Unable to download the PDF."
        );

    }
    finally {

        button.disabled =
            false;


        button.textContent =
            originalText;

    }

}

/* =========================================================
   SHOW ERROR
========================================================= */

function showError(
    message
) {

    /* -----------------------------------------------------
       HIDE LOADING
    ----------------------------------------------------- */

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       HIDE HISTORY
    ----------------------------------------------------- */

    if (historyContainer) {

        historyContainer.classList.add(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       HIDE EMPTY
    ----------------------------------------------------- */

    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       ERROR MESSAGE
    ----------------------------------------------------- */

    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (errorBox) {

        errorBox.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   RETRY BUTTON
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
                "access_token"
            );


            sessionStorage.removeItem(
                "selected_analysis"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Logs page initialized."
        );


        loadHistory();

    }
);