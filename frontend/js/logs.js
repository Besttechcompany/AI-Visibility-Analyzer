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
            Array.isArray(
                data.history
            )
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