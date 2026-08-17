/* =========================================================
   AI VISIBILITY ANALYZER
   LOGS / ANALYSIS HISTORY
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
   GET LOGIN TOKEN
========================================================= */

function getToken() {

    /*
       IMPORTANT:
       dashboard.js stores the login token
       using localStorage key:

       "token"

       Therefore logs.js must use the
       SAME key.
    */

    let token =
        localStorage.getItem("token");


    /*
       If token is not found in localStorage,
       check whether it was passed in the URL.
    */

    if (!token) {

        const params =
            new URLSearchParams(
                window.location.search
            );

        token =
            params.get("token");


        /*
           If token exists in URL,
           save it for future pages.
        */

        if (token) {

            localStorage.setItem(
                "token",
                token
            );


            /*
               Remove token from URL
               after saving it.
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
   LOAD ANALYSIS HISTORY
========================================================= */

async function loadHistory() {

    /*
       Show loading
    */

    loading.classList.remove(
        "hidden"
    );


    /*
       Hide previous states
    */

    errorBox.classList.add(
        "hidden"
    );

    emptyBox.classList.add(
        "hidden"
    );

    historyContainer.classList.add(
        "hidden"
    );


    /*
       Get logged-in user's token
    */

    const token =
        getToken();


    /* -----------------------------------------------------
       NO TOKEN
    ----------------------------------------------------- */

    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    try {

        /* -------------------------------------------------
           REQUEST HISTORY FROM FASTAPI
        ------------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/analysis-history`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        console.log(
            "History API status:",
            response.status
        );


        /* -------------------------------------------------
           LOGIN EXPIRED / INVALID TOKEN
        ------------------------------------------------- */

        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );


            showError(
                "Your login session has expired. Please login again."
            );

            return;
        }


        /* -------------------------------------------------
           OTHER SERVER ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "History API error:",
                errorText
            );


            throw new Error(
                `Server returned ${response.status}`
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
           DISPLAY HISTORY
        ------------------------------------------------- */

        displayHistory(
            data.history || []
        );


    } catch (error) {

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

    /*
       Hide loading
    */

    loading.classList.add(
        "hidden"
    );


    /*
       Make sure history is an array
    */

    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        emptyBox.classList.remove(
            "hidden"
        );

        return;
    }


    /*
       Show history container
    */

    historyContainer.classList.remove(
        "hidden"
    );


    /*
       Display count
    */

    historyCount.textContent =
        `${history.length} ${
            history.length === 1
                ? "analysis"
                : "analyses"
        }`;


    /*
       Clear old records
    */

    historyList.innerHTML = "";


    /*
       Create history cards
    */

    history.forEach(
        function (
            item,
            index
        ) {

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
            "div"
        );


    card.className =
        "history-card";


    /* -----------------------------------------------------
       TOP SECTION
    ----------------------------------------------------- */

    const top =
        document.createElement(
            "div"
        );


    top.className =
        "history-top";


    /* -----------------------------------------------------
       WEBSITE URL
    ----------------------------------------------------- */

    const website =
        document.createElement(
            "div"
        );


    website.className =
        "website";


    website.textContent =
        item.website_url ||
        "Website unavailable";


    /* -----------------------------------------------------
       DATE + TIME
    ----------------------------------------------------- */

    const date =
        document.createElement(
            "div"
        );


    date.className =
        "date-time";


    date.textContent =
        formatDateTime(
            item.created_at
        );


    top.appendChild(
        website
    );


    top.appendChild(
        date
    );


    /* -----------------------------------------------------
       BOTTOM SECTION
    ----------------------------------------------------- */

    const bottom =
        document.createElement(
            "div"
        );


    bottom.className =
        "history-bottom";


    /* -----------------------------------------------------
       ANALYSIS ID
    ----------------------------------------------------- */

    const id =
        document.createElement(
            "div"
        );


    id.className =
        "history-id";


    id.textContent =
        `Analysis #${item.id}`;


    /* -----------------------------------------------------
       VIEW REPORT BUTTON
    ----------------------------------------------------- */

    const viewButton =
        document.createElement(
            "button"
        );


    viewButton.className =
        "view-btn";


    viewButton.type =
        "button";


    viewButton.textContent =
        "View Report";


    viewButton.addEventListener(
        "click",
        function () {

            viewReport(
                item
            );
        }
    );


    /* -----------------------------------------------------
       ASSEMBLE BOTTOM
    ----------------------------------------------------- */

    bottom.appendChild(
        id
    );


    bottom.appendChild(
        viewButton
    );


    /* -----------------------------------------------------
       ASSEMBLE CARD
    ----------------------------------------------------- */

    card.appendChild(
        top
    );


    card.appendChild(
        bottom
    );


    return card;
}


/* =========================================================
   FORMAT DATE + TIME
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


    /*
       Example:

       17 Aug 2026, 10:12:50 am
    */

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit",

            hour12: true
        }
    );
}


/* =========================================================
   VIEW HISTORICAL REPORT
========================================================= */

function viewReport(
    item
) {

    /*
       Save the complete selected
       history record temporarily.
    */

    sessionStorage.setItem(
        "selected_analysis",
        JSON.stringify(item)
    );


    /*
       Return to dashboard.

       dashboard.js can then read
       selected_analysis and display
       the historical report.
    */

    window.location.href =
        "dashboard.html";
}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(
    message
) {

    /*
       Hide loading
    */

    loading.classList.add(
        "hidden"
    );


    /*
       Hide history
    */

    historyContainer.classList.add(
        "hidden"
    );


    /*
       Hide empty state
    */

    emptyBox.classList.add(
        "hidden"
    );


    /*
       Set error message
    */

    errorMessage.textContent =
        message;


    /*
       Show error box
    */

    errorBox.classList.remove(
        "hidden"
    );
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

            /*
               IMPORTANT:
               Dashboard uses "token",
               so Logs must remove "token".
            */

            localStorage.removeItem(
                "token"
            );


            /*
               Remove selected historical report.
            */

            sessionStorage.removeItem(
                "selected_analysis"
            );


            /*
               Return to login.
            */

            window.location.href =
                "login.html";

        }
    );
}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHistory();

    }
);