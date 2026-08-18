// ============================================================
// LOGS / ANALYSIS HISTORY
// ============================================================

const API_BASE_URL =
    "https://ai-visibility-analyzer.onrender.com";


// ============================================================
// GET ACCESS TOKEN
// ============================================================

function getAccessToken() {

    // --------------------------------------------------------
    // 1. Try localStorage
    // --------------------------------------------------------

    const possibleKeys = [
        "accessToken",
        "access_token",
        "token",
        "jwt_token"
    ];

    for (const key of possibleKeys) {

        const token = localStorage.getItem(key);

        if (token && token !== "undefined" && token !== "null") {
            return token;
        }
    }


    // --------------------------------------------------------
    // 2. Try sessionStorage
    // --------------------------------------------------------

    for (const key of possibleKeys) {

        const token = sessionStorage.getItem(key);

        if (token && token !== "undefined" && token !== "null") {
            return token;
        }
    }


    // --------------------------------------------------------
    // 3. Try URL parameter
    // --------------------------------------------------------

    const params = new URLSearchParams(
        window.location.search
    );

    const urlToken = params.get("token");

    if (urlToken) {

        // Save it permanently for other pages
        localStorage.setItem(
            "accessToken",
            urlToken
        );

        return urlToken;
    }


    // --------------------------------------------------------
    // No token found
    // --------------------------------------------------------

    return null;
}


// ============================================================
// SAVE TOKEN
// ============================================================

function saveAccessToken(token) {

    if (!token) {
        return;
    }

    localStorage.setItem(
        "accessToken",
        token
    );

    sessionStorage.setItem(
        "accessToken",
        token
    );
}


// ============================================================
// LOAD ANALYSIS HISTORY
// ============================================================

async function loadAnalysisHistory() {

    const historyContainer =
        document.getElementById("history-container");

    const token =
        getAccessToken();


    // --------------------------------------------------------
    // Token missing
    // --------------------------------------------------------

    if (!token) {

        showHistoryError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    // --------------------------------------------------------
    // Show loading
    // --------------------------------------------------------

    if (historyContainer) {

        historyContainer.innerHTML = `
            <div class="history-loading">
                <p>Loading analysis history...</p>
            </div>
        `;
    }


    try {

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response = await fetch(
            `${API_BASE_URL}/analysis-history`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },

                cache: "no-store"
            }
        );


        // ----------------------------------------------------
        // UNAUTHORIZED
        // ----------------------------------------------------

        if (response.status === 401) {

            console.error(
                "Authentication failed: JWT rejected by backend."
            );

            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("accessToken");

            showHistoryError(
                "Your login session has expired. Please login again."
            );

            return;
        }


        // ----------------------------------------------------
        // FORBIDDEN
        // ----------------------------------------------------

        if (response.status === 403) {

            showHistoryError(
                "You are not authorized to view analysis history."
            );

            return;
        }


        // ----------------------------------------------------
        // OTHER SERVER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "History API Error:",
                response.status,
                errorText
            );

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // ----------------------------------------------------
        // PARSE JSON
        // ----------------------------------------------------

        const data =
            await response.json();

        console.log(
            "Analysis history received:",
            data
        );


        // ----------------------------------------------------
        // DISPLAY RESULTS
        // ----------------------------------------------------

        displayHistory(data);


    } catch (error) {

        console.error(
            "LOAD HISTORY ERROR:",
            error
        );

        showHistoryError(
            "Unable to load analysis history. Please try again."
        );
    }
}


// ============================================================
// DISPLAY HISTORY
// ============================================================

function displayHistory(data) {

    const historyContainer =
        document.getElementById("history-container");


    if (!historyContainer) {

        console.error(
            "Element #history-container was not found."
        );

        return;
    }


    // --------------------------------------------------------
    // No history
    // --------------------------------------------------------

    if (
        !data ||
        !data.history ||
        data.history.length === 0
    ) {

        historyContainer.innerHTML = `
            <div class="no-history">
                <h3>No Analysis History</h3>
                <p>
                    You have not performed any website
                    analysis yet.
                </p>
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // Create history HTML
    // --------------------------------------------------------

    historyContainer.innerHTML = "";


    data.history.forEach(
        (item) => {

            const card =
                document.createElement("div");

            card.className =
                "history-card";


            const createdAt =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString()
                    : "Date unavailable";


            card.innerHTML = `

                <div class="history-card-header">

                    <h3>
                        ${escapeHTML(
                            item.website_url || "Website"
                        )}
                    </h3>

                    <span class="history-date">
                        ${escapeHTML(createdAt)}
                    </span>

                </div>

                <div class="history-card-body">

                    <p>
                        <strong>Analysis ID:</strong>
                        ${escapeHTML(
                            String(item.id)
                        )}
                    </p>

                    <p>
                        <strong>Website:</strong>
                        ${escapeHTML(
                            item.website_url || "-"
                        )}
                    </p>

                </div>

            `;


            historyContainer.appendChild(
                card
            );
        }
    );
}


// ============================================================
// SHOW ERROR
// ============================================================

function showHistoryError(message) {

    const historyContainer =
        document.getElementById("history-container");


    if (!historyContainer) {
        return;
    }


    historyContainer.innerHTML = `

        <div class="history-error">

            <h2>
                Unable to load history
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                id="retry-history-btn"
                class="retry-btn"
            >
                Try Again
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            "retry-history-btn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                loadAnalysisHistory();

            }
        );
    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "jwt_token"
    );


    sessionStorage.removeItem(
        "accessToken"
    );

    sessionStorage.removeItem(
        "access_token"
    );

    sessionStorage.removeItem(
        "token"
    );

    sessionStorage.removeItem(
        "jwt_token"
    );


    window.location.href =
        "index.html";
}


// ============================================================
// INITIALIZE LOGS PAGE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Logs page initialized."
        );

        const token =
            getAccessToken();


        if (token) {

            console.log(
                "JWT token found."
            );

        } else {

            console.warn(
                "No JWT token found."
            );
        }


        loadAnalysisHistory();
    }
);