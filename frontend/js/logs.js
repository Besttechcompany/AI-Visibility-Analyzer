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


    /*
       If token is not in localStorage,
       check URL.
    */

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


            /*
               Remove token from URL.
            */

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

    /*
       Reset interface.
    */

    loading.classList.remove(
        "hidden"
    );

    errorBox.classList.add(
        "hidden"
    );

    emptyBox.classList.add(
        "hidden"
    );

    historyContainer.classList.add(
        "hidden"
    );


    const token =
        getToken();


    /*
       No token.
    */

    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;

    }


    try {

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


        /*
           Unauthorized.
        */

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


        /*
           Other server errors.
        */

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Analysis history:",
            data
        );


        /*
           IMPORTANT:
           We DO NOT filter failed records.

           Every record returned by the API
           will be displayed.
        */

        displayHistory(

            Array.isArray(data.history)
                ? data.history
                : []

        );


    }

    catch (error) {

        console.error(
            "History loading error:",
            error
        );


        showError(
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

    loading.classList.add(
        "hidden"
    );


    /*
       Empty.
    */

    if (
        !history ||
        history.length === 0
    ) {

        historyContainer.classList.add(
            "hidden"
        );

        emptyBox.classList.remove(
            "hidden"
        );

        return;

    }


    /*
       Show history.
    */

    emptyBox.classList.add(
        "hidden"
    );

    historyContainer.classList.remove(
        "hidden"
    );


    /*
       Count.
    */

    historyCount.textContent =
        `${history.length} ${
            history.length === 1
                ? "analysis"
                : "analyses"
        }`;


    /*
       Clear existing cards.
    */

    historyList.innerHTML = "";


    /*
       Create records.
    */

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


            historyList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   GET ANALYSIS STATUS
========================================================= */

function getAnalysisStatus(item) {

    /*
       Different backend versions may use
       different property names.

       We check the common possibilities.
    */

    const rawStatus =

        item?.status ??
        item?.analysis_status ??
        item?.state ??
        item?.result_status ??
        null;


    /*
       Boolean completed field.
    */

    if (
        item?.completed === true
    ) {

        return "completed";

    }


    /*
       Boolean failed field.
    */

    if (
        item?.failed === true
    ) {

        return "failed";

    }


    /*
       No status supplied.
    */

    if (
        rawStatus === null ||
        rawStatus === undefined
    ) {

        /*
           Do NOT automatically call an unknown
           record Completed.

           If your backend does not currently send
           a status field, see the note below.
        */

        return "unknown";

    }


    const status =
        String(rawStatus)
            .trim()
            .toLowerCase();


    /*
       COMPLETED
    */

    if (

        status === "completed" ||

        status === "complete" ||

        status === "success" ||

        status === "successful" ||

        status === "done" ||

        status === "finished"

    ) {

        return "completed";

    }


    /*
       FAILED
    */

    if (

        status === "failed" ||

        status === "failure" ||

        status === "error" ||

        status === "errored"

    ) {

        return "failed";

    }


    /*
       PENDING / RUNNING
    */

    if (

        status === "pending" ||

        status === "processing" ||

        status === "running" ||

        status === "in_progress" ||

        status === "in-progress" ||

        status === "started"

    ) {

        return "pending";

    }


    /*
       Unknown status.
    */

    return "unknown";

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


    /*
       Determine actual status.
    */

    const analysisStatus =
        getAnalysisStatus(
            item
        );


    /* =====================================================
       WEBSITE
    ===================================================== */

    const website =
        document.createElement(
            "div"
        );


    website.className =
        "history-website";


    const websiteUrl =
        item.website_url ||
        "Website unavailable";


    /*
       Show website as clickable link
       only when a valid URL exists.
    */

    if (
        item.website_url
    ) {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            item.website_url;


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            item.website_url;


        website.appendChild(
            link
        );

    }

    else {

        website.textContent =
            websiteUrl;

    }


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
       ANALYSIS ID
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


    /*
       COMPLETED
    */

    if (
        analysisStatus === "completed"
    ) {

        status.classList.add(
            "status-completed"
        );

        status.textContent =
            "Completed";

    }


    /*
       FAILED
    */

    else if (
        analysisStatus === "failed"
    ) {

        status.classList.add(
            "status-failed"
        );

        status.textContent =
            "Failed";

    }


    /*
       PENDING
    */

    else if (
        analysisStatus === "pending"
    ) {

        status.classList.add(
            "status-pending"
        );

        status.textContent =
            "Processing";

    }


    /*
       UNKNOWN
    */

    else {

        status.classList.add(
            "status-pending"
        );

        status.textContent =
            "Status unavailable";

    }


    /* =====================================================
       ACTION AREA
    ===================================================== */

    const action =
        document.createElement(
            "div"
        );


    action.className =
        "history-action";


    /*
       IMPORTANT:

       PDF BUTTON IS CREATED ONLY FOR
       COMPLETED ANALYSES.
    */

    if (
        analysisStatus === "completed"
    ) {

        const pdfButton =
            document.createElement(
                "button"
            );


        pdfButton.type =
            "button";


        pdfButton.className =
            "download-pdf-btn";


        pdfButton.textContent =
            "📄 Download PDF";


        pdfButton.addEventListener(
            "click",
            () => {

                downloadPDF(
                    item.id,
                    pdfButton
                );

            }
        );


        action.appendChild(
            pdfButton
        );

    }


    /*
       FAILED ANALYSIS

       No PDF button.
    */

    else if (
        analysisStatus === "failed"
    ) {

        const failedText =
            document.createElement(
                "span"
            );


        failedText.className =
            "no-pdf-text";


        failedText.textContent =
            "No report available";


        action.appendChild(
            failedText
        );

    }


    /*
       PROCESSING

       No PDF button.
    */

    else if (
        analysisStatus === "pending"
    ) {

        const processingText =
            document.createElement(
                "span"
            );


        processingText.className =
            "no-pdf-text"
        ;


        processingText.textContent =
            "Report not ready";


        action.appendChild(
            processingText
        );

    }


    /*
       UNKNOWN

       No PDF button.
    */

    else {

        const unavailableText =
            document.createElement(
                "span"
            );


        unavailableText.className =
            "no-pdf-text";


        unavailableText.textContent =
            "Report unavailable";


        action.appendChild(
            unavailableText
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
        action
    );


    return card;

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

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

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


    /*
       Check login.
    */

    if (!token) {

        alert(
            "Your login session has expired. Please login again."
        );


        window.location.href =
            "login.html";


        return;

    }


    /*
       Validate analysis ID.
    */

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


    /*
       Save original button text.
    */

    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "⏳ Preparing PDF...";


    try {

        /*
           FastAPI route:

           /analysis/{analysis_id}/pdf
        */

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


        /*
           Unauthorized.
        */

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


        /*
           Not found.
        */

        if (
            response.status === 404
        ) {

            let message =
                "PDF report was not found.";


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

            catch (e) {

                /*
                   Ignore JSON parsing error.
                */

            }


            alert(
                message
            );


            return;

        }


        /*
           Other server errors.
        */

        if (!response.ok) {

            let message =
                `Unable to generate PDF. Server returned ${response.status}.`;


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

            catch (e) {

                /*
                   Ignore JSON parsing error.
                */

            }


            throw new Error(
                message
            );

        }


        /*
           Get PDF as Blob.
        */

        const blob =
            await response.blob();


        /*
           Make sure we received something.
        */

        if (
            !blob ||
            blob.size === 0
        ) {

            throw new Error(
                "The server returned an empty PDF file."
            );

        }


        /*
           Create temporary download URL.
        */

        const blobUrl =
            window.URL.createObjectURL(
                blob
            );


        /*
           Create temporary anchor.
        */

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


        /*
           Release memory.
        */

        setTimeout(
            () => {

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
            "Unable to download the PDF report."
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

    loading.classList.add(
        "hidden"
    );

    historyContainer.classList.add(
        "hidden"
    );

    emptyBox.classList.add(
        "hidden"
    );


    errorMessage.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );

}


/* =========================================================
   RETRY
========================================================= */

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        () => {

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
        () => {

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
    () => {

        loadHistory();

    }
);