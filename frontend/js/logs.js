// ============================================================
// AI VISIBILITY ANALYZER
// ANALYSIS HISTORY / LOGS
// ============================================================

"use strict";


// ============================================================
// CONFIGURATION
// ============================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";

const HISTORY_URL =
    `${API_URL}/analysis-history`;

const REQUEST_TIMEOUT =
    30000;


// ============================================================
// DOM ELEMENTS
// ============================================================

let loading;
let errorBox;
let errorMessage;
let retryBtn;
let emptyBox;
let historyContainer;
let historyList;
let historyCount;
let logoutBtn;


// ============================================================
// INITIALIZE PAGE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "========================================"
        );

        console.log(
            "LOGS PAGE LOADED"
        );

        console.log(
            "========================================"
        );


        // ----------------------------------------------------
        // GET DOM ELEMENTS
        // ----------------------------------------------------

        loading =
            document.getElementById("loading");

        errorBox =
            document.getElementById("errorBox");

        errorMessage =
            document.getElementById("errorMessage");

        retryBtn =
            document.getElementById("retryBtn");

        emptyBox =
            document.getElementById("emptyBox");

        historyContainer =
            document.getElementById(
                "historyContainer"
            );

        historyList =
            document.getElementById(
                "historyList"
            );

        historyCount =
            document.getElementById(
                "historyCount"
            );

        logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        // ----------------------------------------------------
        // VERIFY REQUIRED ELEMENTS
        // ----------------------------------------------------

        console.log(
            "Loading element:",
            !!loading
        );

        console.log(
            "Error element:",
            !!errorBox
        );

        console.log(
            "Empty element:",
            !!emptyBox
        );

        console.log(
            "History container:",
            !!historyContainer
        );

        console.log(
            "History list:",
            !!historyList
        );


        if (!loading) {

            console.error(
                "ERROR: #loading was not found."
            );

        }

        if (!historyContainer) {

            console.error(
                "ERROR: #historyContainer was not found."
            );

        }

        if (!historyList) {

            console.error(
                "ERROR: #historyList was not found."
            );

        }


        // ----------------------------------------------------
        // RETRY BUTTON
        // ----------------------------------------------------

        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                function () {

                    loadAnalysisHistory();

                }
            );

        }


        // ----------------------------------------------------
        // LOGOUT BUTTON
        // ----------------------------------------------------

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logout
            );

        }


        // ----------------------------------------------------
        // LOAD HISTORY
        // ----------------------------------------------------

        loadAnalysisHistory();

    }
);


// ============================================================
// GET ACCESS TOKEN
// ============================================================

function getAccessToken() {

    const tokenKeys = [
        "access_token",
        "accessToken",
        "token",
        "jwt"
    ];


    // --------------------------------------------------------
    // LOCAL STORAGE
    // --------------------------------------------------------

    for (
        const key of tokenKeys
    ) {

        const token =
            localStorage.getItem(key);


        if (
            token &&
            token !== "null" &&
            token !== "undefined"
        ) {

            console.log(
                "Token found in localStorage:",
                key
            );

            return token;

        }

    }


    // --------------------------------------------------------
    // SESSION STORAGE
    // --------------------------------------------------------

    for (
        const key of tokenKeys
    ) {

        const token =
            sessionStorage.getItem(key);


        if (
            token &&
            token !== "null" &&
            token !== "undefined"
        ) {

            console.log(
                "Token found in sessionStorage:",
                key
            );

            return token;

        }

    }


    // --------------------------------------------------------
    // URL TOKEN
    // --------------------------------------------------------

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const urlToken =
            params.get("token");


        if (urlToken) {

            console.log(
                "Token found in URL."
            );


            localStorage.setItem(
                "access_token",
                urlToken
            );


            return urlToken;

        }

    }
    catch (error) {

        console.warn(
            "Unable to read URL token:",
            error
        );

    }


    // --------------------------------------------------------
    // NO TOKEN
    // --------------------------------------------------------

    console.warn(
        "No access token found."
    );


    return null;

}


// ============================================================
// SHOW LOADING
// ============================================================

function showLoading() {

    console.log(
        "Showing history loading..."
    );


    // Show loading section

    if (loading) {

        loading.classList.remove(
            "hidden"
        );

    }


    // Hide error

    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }


    // Hide empty state

    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    // Hide history

    if (historyContainer) {

        historyContainer.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// HIDE LOADING
// ============================================================

function hideLoading() {

    console.log(
        "Hiding history loading..."
    );


    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    console.error(
        "History error:",
        message
    );


    // Hide loading

    hideLoading();


    // Hide empty

    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    // Hide history

    if (historyContainer) {

        historyContainer.classList.add(
            "hidden"
        );

    }


    // Set error message

    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    // Show error

    if (errorBox) {

        errorBox.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// SHOW EMPTY HISTORY
// ============================================================

function showEmptyHistory() {

    console.log(
        "No analysis history found."
    );


    // Hide loading

    hideLoading();


    // Hide error

    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }


    // Hide history

    if (historyContainer) {

        historyContainer.classList.add(
            "hidden"
        );

    }


    // Show empty

    if (emptyBox) {

        emptyBox.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// SHOW HISTORY
// ============================================================

function showHistory() {

    console.log(
        "Showing history."
    );


    // Hide loading

    hideLoading();


    // Hide error

    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }


    // Hide empty

    if (emptyBox) {

        emptyBox.classList.add(
            "hidden"
        );

    }


    // Show history

    if (historyContainer) {

        historyContainer.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// LOAD ANALYSIS HISTORY
// ============================================================

async function loadAnalysisHistory() {

    console.log(
        "========================================"
    );

    console.log(
        "LOADING ANALYSIS HISTORY"
    );

    console.log(
        "========================================"
    );


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    showLoading();


    // --------------------------------------------------------
    // GET TOKEN
    // --------------------------------------------------------

    const token =
        getAccessToken();


    console.log(
        "Access token available:",
        !!token
    );


    // --------------------------------------------------------
    // TOKEN MISSING
    // --------------------------------------------------------

    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;

    }


    // --------------------------------------------------------
    // ABORT CONTROLLER
    // --------------------------------------------------------

    const controller =
        new AbortController();


    const timeoutId =
        setTimeout(
            function () {

                controller.abort();

            },
            REQUEST_TIMEOUT
        );


    try {

        console.log(
            "Requesting:",
            HISTORY_URL
        );


        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response =
            await fetch(
                HISTORY_URL,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"

                    },

                    cache:
                        "no-store",

                    signal:
                        controller.signal
                }
            );


        // ----------------------------------------------------
        // CLEAR TIMEOUT
        // ----------------------------------------------------

        clearTimeout(
            timeoutId
        );


        console.log(
            "History HTTP status:",
            response.status
        );


        // ----------------------------------------------------
        // 401
        // ----------------------------------------------------

        if (
            response.status === 401
        ) {

            console.error(
                "401 Unauthorized."
            );


            removeAuthTokens();


            showError(
                "Your login session has expired. Please login again."
            );


            return;

        }


        // ----------------------------------------------------
        // 403
        // ----------------------------------------------------

        if (
            response.status === 403
        ) {

            console.error(
                "403 Forbidden."
            );


            showError(
                "You are not authorized to view analysis history."
            );


            return;

        }


        // ----------------------------------------------------
        // OTHER HTTP ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `History request failed with status ${response.status}`
            );

        }


        // ----------------------------------------------------
        // READ RESPONSE TEXT FIRST
        // ----------------------------------------------------

        const responseText =
            await response.text();


        console.log(
            "History response received."
        );


        console.log(
            "Response length:",
            responseText.length
        );


        // ----------------------------------------------------
        // EMPTY RESPONSE
        // ----------------------------------------------------

        if (
            !responseText ||
            !responseText.trim()
        ) {

            console.warn(
                "Server returned an empty response."
            );


            showEmptyHistory();

            return;

        }


        // ----------------------------------------------------
        // PARSE JSON
        // ----------------------------------------------------

        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (parseError) {

            console.error(
                "JSON parsing failed:",
                parseError
            );


            console.error(
                "Server response:",
                responseText
            );


            throw new Error(
                "The server returned an invalid history response."
            );

        }


        console.log(
            "History API data:",
            data
        );


        // ----------------------------------------------------
        // NORMALIZE RESPONSE
        // ----------------------------------------------------

        const history =
            normalizeHistory(
                data
            );


        console.log(
            "History records:",
            history.length
        );


        // ----------------------------------------------------
        // NO HISTORY
        // ----------------------------------------------------

        if (
            history.length === 0
        ) {

            showEmptyHistory();

            return;

        }


        // ----------------------------------------------------
        // DISPLAY HISTORY
        // ----------------------------------------------------

        displayHistory(
            history
        );


        // ----------------------------------------------------
        // SHOW HISTORY
        // ----------------------------------------------------

        showHistory();


        console.log(
            "========================================"
        );

        console.log(
            "HISTORY LOADED SUCCESSFULLY"
        );

        console.log(
            "========================================"
        );

    }
    catch (error) {

        // Make sure loading is never left visible

        clearTimeout(
            timeoutId
        );


        console.error(
            "HISTORY LOAD ERROR:",
            error
        );


        // ----------------------------------------------------
        // TIMEOUT
        // ----------------------------------------------------

        if (
            error.name === "AbortError"
        ) {

            showError(
                "The history request timed out. Please try again."
            );


            return;

        }


        // ----------------------------------------------------
        // NETWORK ERROR
        // ----------------------------------------------------

        if (
            error instanceof TypeError
        ) {

            showError(
                "Unable to connect to the server. Please check your internet connection and try again."
            );


            return;

        }


        // ----------------------------------------------------
        // GENERAL ERROR
        // ----------------------------------------------------

        showError(
            error.message ||
            "Unable to load analysis history."
        );

    }

}


// ============================================================
// NORMALIZE API RESPONSE
// ============================================================

function normalizeHistory(data) {

    // --------------------------------------------------------
    // RESPONSE IS DIRECT ARRAY
    // --------------------------------------------------------

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // --------------------------------------------------------
    // { history: [] }
    // --------------------------------------------------------

    if (
        data &&
        Array.isArray(
            data.history
        )
    ) {

        return data.history;

    }


    // --------------------------------------------------------
    // { data: [] }
    // --------------------------------------------------------

    if (
        data &&
        Array.isArray(
            data.data
        )
    ) {

        return data.data;

    }


    // --------------------------------------------------------
    // { results: [] }
    // --------------------------------------------------------

    if (
        data &&
        Array.isArray(
            data.results
        )
    ) {

        return data.results;

    }


    // --------------------------------------------------------
    // { analyses: [] }
    // --------------------------------------------------------

    if (
        data &&
        Array.isArray(
            data.analyses
        )
    ) {

        return data.analyses;

    }


    // --------------------------------------------------------
    // NOTHING FOUND
    // --------------------------------------------------------

    console.warn(
        "Could not find history array in response."
    );


    return [];

}


// ============================================================
// DISPLAY HISTORY
// ============================================================

function displayHistory(
    history
) {

    console.log(
        "Displaying:",
        history.length,
        "history records."
    );


    // --------------------------------------------------------
    // VERIFY HISTORY LIST
    // --------------------------------------------------------

    if (!historyList) {

        console.error(
            "ERROR: #historyList does not exist."
        );


        showError(
            "History display area was not found."
        );


        return;

    }


    // --------------------------------------------------------
    // CLEAR OLD CONTENT
    // --------------------------------------------------------

    historyList.innerHTML =
        "";


    // --------------------------------------------------------
    // UPDATE COUNT
    // --------------------------------------------------------

    if (historyCount) {

        const count =
            history.length;


        historyCount.textContent =
            `${count} ${
                count === 1
                    ? "analysis"
                    : "analyses"
            }`;

    }


    // --------------------------------------------------------
    // CREATE CARDS
    // --------------------------------------------------------

    history.forEach(
        function (item) {

            const card =
                createHistoryCard(
                    item
                );


            historyList.appendChild(
                card
            );

        }
    );


    console.log(
        "History cards created successfully."
    );

}


// ============================================================
// CREATE HISTORY CARD
// ============================================================

function createHistoryCard(
    item
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "history-card";


    // --------------------------------------------------------
    // WEBSITE URL
    // --------------------------------------------------------

    const website =
        item.website_url ||
        item.url ||
        item.website ||
        "Unknown website";


    // --------------------------------------------------------
    // ANALYSIS ID
    // --------------------------------------------------------

    const analysisId =
        item.id ||
        item.analysis_id ||
        "-";


    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    let date =
        "Date unavailable";


    if (
        item.created_at ||
        item.createdAt ||
        item.date ||
        item.timestamp
    ) {

        const rawDate =
            item.created_at ||
            item.createdAt ||
            item.date ||
            item.timestamp;


        const parsedDate =
            new Date(
                rawDate
            );


        if (
            !Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            date =
                parsedDate.toLocaleString(
                    "en-IN",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }
        else {

            date =
                String(
                    rawDate
                );

        }

    }


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    const status =
        item.status ||
        item.website_status ||
        "Completed";


    // --------------------------------------------------------
    // CARD HTML
    // --------------------------------------------------------

    card.innerHTML = `

        <div class="history-card-header">

            <div>

                <h3>
                    ${escapeHTML(
                        website
                    )}
                </h3>

                <span class="history-date">

                    ${escapeHTML(
                        date
                    )}

                </span>

            </div>

        </div>


        <div class="history-card-body">

            <p>

                <strong>
                    Analysis ID:
                </strong>

                ${escapeHTML(
                    String(
                        analysisId
                    )
                )}

            </p>


            <p>

                <strong>
                    Website:
                </strong>

                ${escapeHTML(
                    website
                )}

            </p>


            <p>

                <strong>
                    Status:
                </strong>

                ${escapeHTML(
                    String(
                        status
                    )
                )}

            </p>

        </div>

    `;


    return card;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}


// ============================================================
// REMOVE AUTH TOKENS
// ============================================================

function removeAuthTokens() {

    const keys = [
        "access_token",
        "accessToken",
        "token",
        "jwt"
    ];


    keys.forEach(
        function (key) {

            localStorage.removeItem(
                key
            );

            sessionStorage.removeItem(
                key
            );

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    console.log(
        "Logging out..."
    );


    removeAuthTokens();


    // --------------------------------------------------------
    // REDIRECT
    // --------------------------------------------------------

    window.location.href =
        "index.html";

}


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Logs page JavaScript error:",
            event.error ||
            event.message
        );

    }
);


// ============================================================
// UNHANDLED PROMISE ERROR
// ============================================================

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Logs page promise error:",
            event.reason
        );

    }
);