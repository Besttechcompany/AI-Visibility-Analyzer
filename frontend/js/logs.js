/* =========================================================
   AI VISIBILITY ANALYZER
   ANALYSIS HISTORY
========================================================= */

"use strict";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const emptyBox = document.getElementById("emptyBox");

const historyContainer =
    document.getElementById("historyContainer");

const historyList =
    document.getElementById("historyList");

const historyCount =
    document.getElementById("historyCount");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL =
    window.API_BASE_URL ||
    "";


/* =========================================================
   AUTH TOKEN
========================================================= */

function getAccessToken() {

    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken") ||
        null
    );
}


/* =========================================================
   AUTH HEADERS
========================================================= */

function getAuthHeaders() {

    const token = getAccessToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}


/* =========================================================
   SHOW / HIDE UI
========================================================= */

function showLoading() {

    loading.classList.remove("hidden");

    errorBox.classList.add("hidden");

    emptyBox.classList.add("hidden");

    historyContainer.classList.add("hidden");
}


function showError(message) {

    loading.classList.add("hidden");

    errorBox.classList.remove("hidden");

    emptyBox.classList.add("hidden");

    historyContainer.classList.add("hidden");

    errorMessage.textContent =
        message || "Unable to load analysis history.";
}


function showEmpty() {

    loading.classList.add("hidden");

    errorBox.classList.add("hidden");

    emptyBox.classList.remove("hidden");

    historyContainer.classList.add("hidden");
}


function showHistory() {

    loading.classList.add("hidden");

    errorBox.classList.add("hidden");

    emptyBox.classList.add("hidden");

    historyContainer.classList.remove("hidden");
}


/* =========================================================
   FORMAT DATE
========================================================= */

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
            minute: "2-digit"
        }
    );
}


/* =========================================================
   FORMAT WEBSITE URL
========================================================= */

function normalizeUrl(url) {

    if (!url) {
        return "Website unavailable";
    }

    return String(url);
}


/* =========================================================
   CREATE HISTORY CARD
========================================================= */

function createHistoryCard(item) {

    const card =
        document.createElement("article");

    card.className = "history-card";


    const website =
        normalizeUrl(item.website_url);


    const createdAt =
        formatDate(item.created_at);


    const analysisId =
        item.id ?? "N/A";


    /* -----------------------------------------------
       TOP
    ------------------------------------------------ */

    const top =
        document.createElement("div");

    top.className =
        "history-card-top";


    const left =
        document.createElement("div");


    const websiteTitle =
        document.createElement("div");

    websiteTitle.className =
        "history-website";

    websiteTitle.textContent =
        website;


    const date =
        document.createElement("div");

    date.className =
        "history-date";

    date.textContent =
        createdAt;


    left.appendChild(websiteTitle);

    left.appendChild(date);


    const status =
        document.createElement("span");

    status.className =
        "history-status";

    status.textContent =
        "Completed";


    top.appendChild(left);

    top.appendChild(status);


    /* -----------------------------------------------
       DETAILS
    ------------------------------------------------ */

    const details =
        document.createElement("div");

    details.className =
        "history-details";


    const idDetail =
        document.createElement("div");

    idDetail.className =
        "history-detail";

    idDetail.innerHTML =
        `<strong>Analysis ID:</strong> ${escapeHtml(analysisId)}`;


    const urlDetail =
        document.createElement("div");

    urlDetail.className =
        "history-detail history-url";

    urlDetail.innerHTML =
        `<strong>Website:</strong> ${escapeHtml(website)}`;


    details.appendChild(idDetail);

    details.appendChild(urlDetail);


    /* -----------------------------------------------
       PDF FOOTER
    ------------------------------------------------ */

    const footer =
        document.createElement("div");

    footer.className =
        "history-card-footer";


    const pdfButton =
        document.createElement("button");

    pdfButton.type =
        "button";

    pdfButton.className =
        "download-pdf-btn";

    pdfButton.innerHTML =
        "📄 Download PDF Report";


    pdfButton.addEventListener(
        "click",
        function () {

            downloadHistoryPDF(
                item,
                pdfButton
            );

        }
    );


    footer.appendChild(pdfButton);


    /* -----------------------------------------------
       COMPLETE CARD
    ------------------------------------------------ */

    card.appendChild(top);

    card.appendChild(details);

    card.appendChild(footer);


    return card;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   LOAD HISTORY
========================================================= */

async function loadHistory() {

    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/analysis-history`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders(),

                    credentials: "include"
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                throw new Error(
                    "Your login session has expired. Please login again."
                );
            }

            throw new Error(
                data?.detail ||
                data?.message ||
                `Unable to load history. HTTP ${response.status}`
            );
        }


        const history =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data?.history)
                        ? data.history
                        : []
                );


        historyList.innerHTML = "";


        if (history.length === 0) {

            historyCount.textContent =
                "0 analyses";

            showEmpty();

            return;
        }


        /* ---------------------------------------------
           NEWEST FIRST
        --------------------------------------------- */

        history.sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.created_at || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.created_at || 0
                    ).getTime();

                return dateB - dateA;
            }
        );


        history.forEach(
            function (item) {

                const card =
                    createHistoryCard(item);

                historyList.appendChild(card);

            }
        );


        historyCount.textContent =
            `${history.length} ${
                history.length === 1
                    ? "analysis"
                    : "analyses"
            }`;


        showHistory();

    } catch (error) {

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
   DOWNLOAD PDF
========================================================= */

async function downloadHistoryPDF(
    item,
    button
) {

    const originalText =
        button.innerHTML;


    try {

        button.disabled = true;

        button.innerHTML =
            "⏳ Creating PDF...";


        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            throw new Error(
                "PDF library could not be loaded. Please refresh the page."
            );
        }


        const {
            jsPDF
        } = window.jspdf;


        const doc =
            new jsPDF(
                {
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                }
            );


        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();


        const margin = 18;

        const contentWidth =
            pageWidth - (margin * 2);


        let y = 20;


        /* ---------------------------------------------
           HEADER
        --------------------------------------------- */

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(20);

        doc.text(
            "AI Visibility Analysis Report",
            margin,
            y
        );


        y += 9;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);

        doc.setTextColor(
            90,
            105,
            130
        );


        doc.text(
            "AI Visibility Analyzer",
            margin,
            y
        );


        y += 12;


        /* ---------------------------------------------
           WEBSITE INFORMATION
        --------------------------------------------- */

        doc.setTextColor(
            15,
            23,
            42
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(13);

        doc.text(
            "Analysis Information",
            margin,
            y
        );


        y += 8;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);


        addPDFField(
            doc,
            "Website",
            item.website_url || "N/A",
            margin,
            contentWidth,
            function (newY) {
                y = newY;
            },
            y
        );


        addPDFField(
            doc,
            "Analysis ID",
            item.id ?? "N/A",
            margin,
            contentWidth,
            function (newY) {
                y = newY;
            },
            y
        );


        addPDFField(
            doc,
            "Date",
            formatDate(item.created_at),
            margin,
            contentWidth,
            function (newY) {
                y = newY;
            },
            y
        );


        addPDFField(
            doc,
            "Status",
            "Completed",
            margin,
            contentWidth,
            function (newY) {
                y = newY;
            },
            y
        );


        y += 7;


        /* ---------------------------------------------
           ANALYSIS DATA
        --------------------------------------------- */

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(13);

        doc.setTextColor(
            15,
            23,
            42
        );

        y =
            ensurePDFSpace(
                doc,
                y,
                30,
                margin
            );


        doc.text(
            "Analysis Results",
            margin,
            y
        );


        y += 8;


        const analysisData =
            parseAnalysisData(
                item.analysis_data
            );


        y =
            renderObjectToPDF(
                doc,
                analysisData,
                margin,
                y,
                contentWidth,
                pageHeight
            );


        /* ---------------------------------------------
           FOOTER
        --------------------------------------------- */

        addPDFFooter(
            doc,
            pageWidth,
            pageHeight
        );


        /* ---------------------------------------------
           FILE NAME
        --------------------------------------------- */

        const safeName =
            makeSafeFileName(
                item.website_url ||
                "website"
            );


        const analysisId =
            item.id ?? "analysis";


        doc.save(
            `AI-Visibility-${safeName}-${analysisId}.pdf`
        );


    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        alert(
            error.message ||
            "Unable to generate PDF report."
        );

    } finally {

        button.disabled = false;

        button.innerHTML =
            originalText;
    }
}


/* =========================================================
   PDF FIELD
========================================================= */

function addPDFField(
    doc,
    label,
    value,
    margin,
    contentWidth,
    setY,
    currentY
) {

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        35,
        50,
        75
    );


    doc.text(
        `${label}:`,
        margin,
        currentY
    );


    const labelWidth =
        doc.getTextWidth(
            `${label}:`
        );


    doc.setFont(
        "helvetica",
        "normal"
    );


    const text =
        String(value);


    const lines =
        doc.splitTextToSize(
            text,
            contentWidth - labelWidth - 3
        );


    doc.text(
        lines,
        margin + labelWidth + 3,
        currentY
    );


    setY(
        currentY +
        Math.max(
            6,
            lines.length * 5
        )
    );
}


/* =========================================================
   PARSE ANALYSIS DATA
========================================================= */

function parseAnalysisData(data) {

    if (!data) {
        return {};
    }


    if (typeof data === "object") {
        return data;
    }


    if (typeof data === "string") {

        try {

            return JSON.parse(data);

        } catch (error) {

            return {
                result: data
            };
        }
    }


    return {
        result: String(data)
    };
}


/* =========================================================
   RENDER OBJECT TO PDF
========================================================= */

function renderObjectToPDF(
    doc,
    object,
    margin,
    y,
    contentWidth,
    pageHeight,
    level = 0
) {

    if (
        object === null ||
        object === undefined
    ) {

        return y;
    }


    if (
        typeof object !== "object"
    ) {

        return renderPDFText(
            doc,
            String(object),
            margin,
            y,
            contentWidth,
            pageHeight
        );
    }


    const entries =
        Array.isArray(object)
            ? object.map(
                (value, index) => [
                    String(index + 1),
                    value
                ]
            )
            : Object.entries(object);


    for (
        const [key, value]
        of entries
    ) {

        y =
            ensurePDFSpace(
                doc,
                y,
                15,
                margin
            );


        if (
            value !== null &&
            typeof value === "object"
        ) {

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                Math.max(
                    10,
                    12 - level
                )
            );

            doc.setTextColor(
                20,
                45,
                80
            );


            const heading =
                prettifyKey(key);


            doc.text(
                heading,
                margin + (level * 4),
                y
            );


            y += 6;


            y =
                renderObjectToPDF(
                    doc,
                    value,
                    margin,
                    y,
                    contentWidth,
                    pageHeight,
                    level + 1
                );


            y += 3;

        } else {

            const label =
                `${prettifyKey(key)}:`;


            const text =
                value === null
                    ? "N/A"
                    : String(value);


            y =
                renderPDFLabelValue(
                    doc,
                    label,
                    text,
                    margin + (level * 4),
                    y,
                    contentWidth - (level * 4),
                    pageHeight
                );
        }
    }


    return y;
}


/* =========================================================
   PDF LABEL / VALUE
========================================================= */

function renderPDFLabelValue(
    doc,
    label,
    value,
    x,
    y,
    width,
    pageHeight
) {

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        45,
        60,
        80
    );


    const labelWidth =
        Math.min(
            55,
            doc.getTextWidth(label)
        );


    doc.text(
        label,
        x,
        y
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setTextColor(
        40,
        40,
        40
    );


    const lines =
        doc.splitTextToSize(
            value,
            width - labelWidth - 3
        );


    doc.text(
        lines,
        x + labelWidth + 3,
        y
    );


    return y +
        Math.max(
            5,
            lines.length * 4.5
        );
}


/* =========================================================
   PDF TEXT
========================================================= */

function renderPDFText(
    doc,
    text,
    margin,
    y,
    width,
    pageHeight
) {

    const lines =
        doc.splitTextToSize(
            text,
            width
        );


    for (
        const line
        of lines
    ) {

        y =
            ensurePDFSpace(
                doc,
                y,
                6,
                margin
            );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(9);

        doc.text(
            line,
            margin,
            y
        );


        y += 5;
    }


    return y;
}


/* =========================================================
   PAGE SPACE
========================================================= */

function ensurePDFSpace(
    doc,
    y,
    requiredHeight,
    margin
) {

    const pageHeight =
        doc.internal.pageSize.getHeight();


    if (
        y + requiredHeight >
        pageHeight - 18
    ) {

        doc.addPage();

        addPDFFooter(
            doc,
            doc.internal.pageSize.getWidth(),
            pageHeight
        );


        return margin;
    }


    return y;
}


/* =========================================================
   PDF FOOTER
========================================================= */

function addPDFFooter(
    doc,
    pageWidth,
    pageHeight
) {

    const pageCount =
        doc.internal.getNumberOfPages();


    for (
        let i = 1;
        i <= pageCount;
        i++
    ) {

        doc.setPage(i);


        doc.setDrawColor(
            220,
            225,
            232
        );


        doc.line(
            18,
            pageHeight - 14,
            pageWidth - 18,
            pageHeight - 14
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            120,
            130,
            145
        );


        doc.text(
            "AI Visibility Analyzer | Powered by Best Tech Company",
            18,
            pageHeight - 8
        );


        doc.text(
            `Page ${i}`,
            pageWidth - 30,
            pageHeight - 8
        );
    }
}


/* =========================================================
   SAFE FILE NAME
========================================================= */

function makeSafeFileName(
    url
) {

    return String(url)
        .replace(
            /^https?:\/\//,
            ""
        )
        .replace(
            /[^a-zA-Z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .substring(
            0,
            60
        ) || "website";
}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

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
                "authToken"
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
                "authToken"
            );


            window.location.href =
                "index.html";
        }
    );
}


/* =========================================================
   RETRY
========================================================= */

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadHistory
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHistory();

    }
);