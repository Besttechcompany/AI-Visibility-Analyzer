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
        localStorage.getItem(
            "access_token"
        );


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
       Website.
    */

    const website =
        document.createElement(
            "div"
        );

    website.className =
        "history-website";


    website.textContent =
        item.website_url ||
        "Website unavailable";


    /*
       Date.
    */

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


    /*
       Analysis ID.
    */

    const id =
        document.createElement(
            "div"
        );

    id.className =
        "history-id";


    id.textContent =
        `#${item.id}`;


    /*
       Status.
    */

    const status =
        document.createElement(
            "div"
        );

    status.className =
        "history-status";


    status.textContent =
        "Completed";


    /*
       PDF button.
    */

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


    /*
       Assemble card.
    */

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
        pdfButton
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
           IMPORTANT:

           This MUST match the FastAPI route:

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
           Analysis not found.
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
           Make sure we actually received PDF.
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