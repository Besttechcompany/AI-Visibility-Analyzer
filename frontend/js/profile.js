// ======================================================
// PROFILE.JS
// AI Visibility Analyzer
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";


// ======================================================
// GLOBAL PROFILE STATE
// ======================================================

let currentUser = null;


// ======================================================
// DEFAULT PROFILE IMAGE
// ======================================================

const DEFAULT_PROFILE_IMAGE =
    "assets/default-user.png";


// ======================================================
// DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Profile page initialized."
        );

        initializeProfilePage();

    }
);


// ======================================================
// GET ACCESS TOKEN
// ======================================================

function getAccessToken() {

    // --------------------------------------------------
    // Primary token location
    // --------------------------------------------------

    let token =
        localStorage.getItem(
            "access_token"
        );

    // --------------------------------------------------
    // Backward compatibility
    // --------------------------------------------------

    if (!token) {

        token =
            localStorage.getItem(
                "token"
            );
    }

    // --------------------------------------------------
    // Check URL
    // --------------------------------------------------

    if (!token) {

        const params =
            new URLSearchParams(
                window.location.search
            );

        token =
            params.get(
                "token"
            );

        // --------------------------------------------------
        // Save URL token for future API requests
        // --------------------------------------------------

        if (token) {

            localStorage.setItem(
                "access_token",
                token
            );

            // --------------------------------------------------
            // Remove token from browser URL
            // --------------------------------------------------

            try {

                const cleanUrl =
                    window.location.origin +
                    window.location.pathname;

                window.history.replaceState(
                    {},
                    document.title,
                    cleanUrl
                );

            } catch (error) {

                console.warn(
                    "Unable to clean token from URL.",
                    error
                );
            }
        }
    }

    return token;
}


// ======================================================
// SHOW SESSION EXPIRED
// ======================================================

function showSessionExpired() {

    const profileCard =
        document.getElementById(
            "profile-card"
        );

    if (!profileCard) {
        return;
    }

    profileCard.innerHTML = `

        <div class="profile-error">

            <div class="error-icon">
                🔐
            </div>

            <h3>
                Session Expired
            </h3>

            <p>
                Your login session has expired.
                Please login again.
            </p>

            <button
                type="button"
                class="primary-btn"
                onclick="goToLogin()"
            >
                Login Again
            </button>

        </div>

    `;
}


// ======================================================
// GO TO LOGIN
// ======================================================

function goToLogin() {

    window.location.href =
        "login.html";

}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(
    message,
    type = ""
) {

    const messageElement =
        document.getElementById(
            "message"
        );

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        message || "";

    messageElement.className =
        "message";

    if (type) {

        messageElement.classList.add(
            type
        );
    }

    // --------------------------------------------------
    // Automatically clear success messages
    // --------------------------------------------------

    if (type === "success") {

        setTimeout(
            function () {

                if (
                    messageElement
                ) {

                    messageElement.textContent =
                        "";

                    messageElement.className =
                        "message";
                }

            },
            4000
        );
    }
}


// ======================================================
// INITIALIZE PROFILE PAGE
// ======================================================

async function initializeProfilePage() {

    console.log(
        "Initializing profile page..."
    );

    const token =
        getAccessToken();

    // --------------------------------------------------
    // No token
    // --------------------------------------------------

    if (!token) {

        console.warn(
            "No authentication token found."
        );

        showSessionExpired();

        return;
    }

    // --------------------------------------------------
    // Load profile
    // --------------------------------------------------

    await loadProfile();

}


// ======================================================
// LOAD PROFILE
// ======================================================

async function loadProfile() {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return;
    }

    const profileCard =
        document.getElementById(
            "profile-card"
        );

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    if (profileCard) {

        profileCard.innerHTML = `

            <div class="profile-loading">

                <span class="button-loader"></span>

                <span>
                    Loading profile...
                </span>

            </div>

        `;
    }

    try {

        console.log(
            "Loading profile from:",
            `${API_URL}/profile`
        );

        const response =
            await fetch(
                `${API_URL}/profile`,
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
            "Profile response status:",
            response.status
        );

        // --------------------------------------------------
        // Authentication failure
        // --------------------------------------------------

        if (
            response.status === 401
        ) {

            console.warn(
                "Profile request returned 401."
            );

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token"
            );

            showSessionExpired();

            return;
        }

        // --------------------------------------------------
        // Other errors
        // --------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Unable to load profile: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData &&
                    errorData.detail
                ) {

                    if (
                        typeof errorData.detail ===
                        "string"
                    ) {

                        errorMessage =
                            errorData.detail;

                    } else {

                        errorMessage =
                            JSON.stringify(
                                errorData.detail
                            );
                    }
                }

            } catch (error) {

                console.warn(
                    "Unable to parse profile error.",
                    error
                );
            }

            throw new Error(
                errorMessage
            );
        }

        // --------------------------------------------------
        // Parse response
        // --------------------------------------------------

        const data =
            await response.json();

        console.log(
            "Profile response:",
            data
        );

        // --------------------------------------------------
        // Validate response
        // --------------------------------------------------

        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Profile details were not returned by the server."
            );
        }

        // --------------------------------------------------
        // Store user globally
        // --------------------------------------------------

        currentUser =
            data.user;

        console.log(
            "Current user:",
            currentUser
        );

        // --------------------------------------------------
        // Render profile
        // --------------------------------------------------

        renderProfile(
            currentUser
        );

    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

        if (profileCard) {

            profileCard.innerHTML = `

                <div class="profile-error">

                    <div class="error-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Profile
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong while loading your profile."
                        )}
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="loadProfile()"
                    >
                        Try Again
                    </button>

                </div>

            `;
        }
    }
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "Not available";
    }

    try {

        const date =
            new Date(
                dateValue
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Not available";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    } catch (error) {

        console.warn(
            "Date formatting error:",
            error
        );

        return "Not available";
    }
}


// ======================================================
// GET LOGIN METHOD
// ======================================================

function getLoginMethod(
    user
) {

    if (
        user &&
        user.google_id
    ) {

        return "Google";
    }

    return "Email & Password";
}


// ======================================================
// GET PROFILE IMAGE
// ======================================================

function getProfileImage(
    user
) {

    if (
        user &&
        user.picture &&
        typeof user.picture ===
            "string" &&
        user.picture.trim()
    ) {

        return user.picture.trim();
    }

    return DEFAULT_PROFILE_IMAGE;
}


// ======================================================
// GET SAFE USER NAME
// ======================================================

function getUserName(
    user
) {

    if (
        user &&
        user.name &&
        user.name.trim()
    ) {

        return user.name.trim();
    }

    if (
        user &&
        user.email
    ) {

        return user.email
            .split("@")[0];
    }

    return "User";
}


// ======================================================
// GET ACCOUNT STATUS
// ======================================================

function getAccountStatus(
    user
) {

    if (
        user &&
        user.is_active
    ) {

        return {

            text: "Active",

            className:
                "status-active"

        };
    }

    return {

        text: "Inactive",

        className:
            "status-inactive"
    };
}


// ======================================================
// RENDER PROFILE
// ======================================================

function renderProfile(
    user
) {

    const profileCard =
        document.getElementById(
            "profile-card"
        );

    if (!profileCard) {

        console.error(
            "profile-card element not found."
        );

        return;
    }

    const name =
        getUserName(
            user
        );

    const email =
        user.email ||
        "";

    const mobile =
        user.mobile ||
        "";

    const picture =
        getProfileImage(
            user
        );

    const loginMethod =
        getLoginMethod(
            user
        );

    const status =
        getAccountStatus(
            user
        );

    const createdAt =
        formatDate(
            user.created_at
        );

    profileCard.innerHTML = `

        <!-- =================================================
             PROFILE HEADER
        ================================================== -->

        <div class="profile-header">

            <div class="profile-image-wrapper">

                <img
                    src="${escapeHtml(picture)}"
                    alt="Profile picture"
                    class="profile-image"
                    id="profileImage"
                    onerror="handleProfileImageError(this)"
                >

                <button
                    type="button"
                    class="photo-button"
                    id="photoButton"
                    title="Change profile picture"
                    aria-label="Change profile picture"
                >
                    📷
                </button>

                <input
                    type="file"
                    id="profilePhotoInput"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style="display:none;"
                >

                <button
                    type="button"
                    class="photo-button"
                    id="deletePhotoButton"
                    title="Remove profile picture"
                    aria-label="Remove profile picture"
                    style="margin-left:6px;"
                >
                    🗑️
                </button>

            </div>


            <div class="profile-heading">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p>
                    ${escapeHtml(email)}
                </p>

                <span class="login-method">
                    ${escapeHtml(loginMethod)}
                </span>

            </div>

        </div>


        <!-- =================================================
             ACCOUNT INFORMATION
        ================================================== -->

        <div class="section-title">

            <h3>
                Account Information
            </h3>

            <p>
                Update your personal information below.
            </p>

        </div>


        <div class="form-grid">

            <!-- NAME -->

            <div class="form-group">

                <label for="profileName">
                    Full Name
                </label>

                <input
                    type="text"
                    id="profileName"
                    value="${escapeHtml(name)}"
                    autocomplete="name"
                >

            </div>


            <!-- EMAIL -->

            <div class="form-group">

                <label for="profileEmail">
                    Email Address
                </label>

                <input
                    type="email"
                    id="profileEmail"
                    value="${escapeHtml(email)}"
                    autocomplete="email"
                >

                <small>
                    This is your AI Visibility Analyzer account email.
                </small>

            </div>


            <!-- MOBILE -->

            <div class="form-group">

                <label for="profileMobile">
                    Mobile Number
                    <span style="font-weight:400;color:#94a3b8;">
                        (Optional)
                    </span>
                </label>

                <input
                    type="tel"
                    id="profileMobile"
                    value="${escapeHtml(mobile)}"
                    placeholder="Enter your mobile number"
                    autocomplete="tel"
                >

            </div>


            <!-- LOGIN METHOD -->

            <div class="form-group">

                <label>
                    Login Method
                </label>

                <div class="readonly-box">
                    ${escapeHtml(loginMethod)}
                </div>

            </div>

        </div>


        <!-- =================================================
             ACCOUNT STATUS
        ================================================== -->

        <div class="account-status">

            <div>

                <h3>
                    Account Status
                </h3>

                <p>
                    Your account is currently ${status.text.toLowerCase()}.
                </p>

            </div>

            <span class="${status.className}">
                ${escapeHtml(status.text)}
            </span>

        </div>


        <!-- =================================================
             ACCOUNT CREATED
        ================================================== -->

        <div class="section-title">

            <h3>
                Account Details
            </h3>

        </div>


        <div class="form-grid">

            <div class="form-group">

                <label>
                    Account Created
                </label>

                <div class="readonly-box">
                    ${escapeHtml(createdAt)}
                </div>

            </div>


            <div class="form-group">

                <label>
                    User ID
                </label>

                <div class="readonly-box">
                    ${escapeHtml(user.id)}
                </div>

            </div>

        </div>


        <!-- =================================================
             ACTIONS
        ================================================== -->

        <div class="profile-actions">

            <button
                type="button"
                class="secondary-btn"
                id="cancelProfileButton"
            >
                Cancel
            </button>

            <button
                type="button"
                class="primary-btn"
                id="saveProfileButton"
            >
                <span class="button-text">
                    Save Changes
                </span>

                <span
                    class="button-loader hidden"
                    id="saveProfileLoader"
                ></span>
            </button>

        </div>

    `;

    // --------------------------------------------------
    // Attach events
    // --------------------------------------------------

    attachProfileEvents();

}

// ======================================================
// ATTACH PROFILE EVENTS
// ======================================================

function attachProfileEvents() {

    // --------------------------------------------------
    // SAVE PROFILE
    // --------------------------------------------------

    const saveProfileButton =
        document.getElementById(
            "saveProfileButton"
        );

    if (saveProfileButton) {

        saveProfileButton.addEventListener(
            "click",
            saveProfile
        );
    }


    // --------------------------------------------------
    // CANCEL PROFILE
    // --------------------------------------------------

    const cancelProfileButton =
        document.getElementById(
            "cancelProfileButton"
        );

    if (cancelProfileButton) {

        cancelProfileButton.addEventListener(
            "click",
            function () {

                renderProfile(
                    currentUser
                );

                showMessage(
                    "Changes cancelled.",
                    ""
                );

            }
        );
    }


    // --------------------------------------------------
    // CHANGE PROFILE PHOTO
    // --------------------------------------------------

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (photoButton) {

        photoButton.addEventListener(
            "click",
            handlePhotoClick
        );
    }


    // --------------------------------------------------
    // PROFILE PHOTO INPUT
    // --------------------------------------------------

    const photoInput =
        document.getElementById(
            "profilePhotoInput"
        );

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            async function () {

                const file =
                    photoInput.files &&
                    photoInput.files[0];

                if (!file) {

                    return;
                }

                await uploadProfilePhoto(
                    file
                );

                // --------------------------------------------------
                // Clear input so the same image can be selected again
                // --------------------------------------------------

                photoInput.value = "";

            }
        );
    }


    // --------------------------------------------------
    // DELETE PROFILE PHOTO
    // --------------------------------------------------

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    if (deletePhotoButton) {

        deletePhotoButton.addEventListener(
            "click",
            deleteProfilePhoto
        );
    }


    // --------------------------------------------------
    // PROFILE IMAGE ERROR
    // --------------------------------------------------

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (profileImage) {

        profileImage.addEventListener(
            "error",
            function () {

                handleProfileImageError(
                    profileImage
                );

            }
        );
    }

}


// ======================================================
// HANDLE PROFILE IMAGE ERROR
// ======================================================

function handleProfileImageError(
    imageElement
) {

    if (!imageElement) {

        return;
    }

    // --------------------------------------------------
    // Prevent infinite error loop
    // --------------------------------------------------

    if (
        imageElement.dataset
            .fallbackApplied === "true"
    ) {

        return;
    }

    imageElement.dataset
        .fallbackApplied = "true";

    imageElement.src =
        DEFAULT_PROFILE_IMAGE;

}


// ======================================================
// SAVE PROFILE
// ======================================================

async function saveProfile() {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return;
    }

    // --------------------------------------------------
    // GET FORM ELEMENTS
    // --------------------------------------------------

    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    const loader =
        document.getElementById(
            "saveProfileLoader"
        );

    // --------------------------------------------------
    // VALIDATE ELEMENTS
    // --------------------------------------------------

    if (
        !nameInput ||
        !emailInput ||
        !mobileInput
    ) {

        showMessage(
            "Profile form could not be loaded correctly.",
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // READ VALUES
    // --------------------------------------------------

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const mobile =
        mobileInput.value.trim();

    // --------------------------------------------------
    // VALIDATE NAME
    // --------------------------------------------------

    if (!name) {

        showMessage(
            "Full name cannot be empty.",
            "error"
        );

        nameInput.focus();

        return;
    }

    // --------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------

    if (!email) {

        showMessage(
            "Email address cannot be empty.",
            "error"
        );

        emailInput.focus();

        return;
    }

    // --------------------------------------------------
    // SIMPLE EMAIL VALIDATION
    // --------------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailPattern.test(
            email
        )
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;
    }

    // --------------------------------------------------
    // MOBILE VALIDATION
    // --------------------------------------------------

    if (mobile) {

        const mobilePattern =
            /^[0-9+\-\s()]{7,20}$/;

        if (
            !mobilePattern.test(
                mobile
            )
        ) {

            showMessage(
                "Please enter a valid mobile number.",
                "error"
            );

            mobileInput.focus();

            return;
        }
    }

    // --------------------------------------------------
    // PREPARE BUTTON
    // --------------------------------------------------

    if (saveButton) {

        saveButton.disabled =
            true;
    }

    if (loader) {

        loader.classList.remove(
            "hidden"
        );
    }

    const buttonText =
        saveButton
            ? saveButton.querySelector(
                ".button-text"
            )
            : null;

    if (buttonText) {

        buttonText.textContent =
            "Saving...";
    }

    showMessage(
        "Saving profile changes...",
        ""
    );

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    const requestBody = {

        name: name,

        email: email,

        mobile:
            mobile || null

    };

    try {

        console.log(
            "Updating profile:",
            requestBody
        );

        const response =
            await fetch(
                `${API_URL}/profile`,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );

        console.log(
            "Profile update status:",
            response.status
        );

        // --------------------------------------------------
        // SESSION EXPIRED
        // --------------------------------------------------

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token"
            );

            showSessionExpired();

            return;
        }

        // --------------------------------------------------
        // ERROR
        // --------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Profile update failed: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                console.error(
                    "Profile update error:",
                    errorData
                );

                if (
                    errorData &&
                    errorData.detail
                ) {

                    if (
                        typeof errorData.detail ===
                        "string"
                    ) {

                        errorMessage =
                            errorData.detail;

                    } else if (
                        Array.isArray(
                            errorData.detail
                        )
                    ) {

                        errorMessage =
                            errorData.detail
                                .map(
                                    function (item) {

                                        return (
                                            item.msg ||
                                            "Validation error"
                                        );

                                    }
                                )
                                .join(", ");

                    } else {

                        errorMessage =
                            JSON.stringify(
                                errorData.detail
                            );
                    }
                }

            } catch (error) {

                console.warn(
                    "Unable to parse profile update error.",
                    error
                );
            }

            throw new Error(
                errorMessage
            );
        }

        // --------------------------------------------------
        // SUCCESS RESPONSE
        // --------------------------------------------------

        const data =
            await response.json();

        console.log(
            "Profile update response:",
            data
        );

        // --------------------------------------------------
        // UPDATE GLOBAL USER
        // --------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else {

            // --------------------------------------------------
            // Fallback in case backend returns no user object
            // --------------------------------------------------

            if (!currentUser) {

                currentUser = {};

            }

            currentUser.name =
                name;

            currentUser.email =
                email;

            currentUser.mobile =
                mobile || null;
        }

        // --------------------------------------------------
        // RENDER UPDATED PROFILE
        // --------------------------------------------------

        renderProfile(
            currentUser
        );

        // --------------------------------------------------
        // SUCCESS MESSAGE
        // --------------------------------------------------

        showMessage(
            data.message ||
            "Profile updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );

    } finally {

        // --------------------------------------------------
        // RESTORE BUTTON
        // --------------------------------------------------

        if (saveButton) {

            saveButton.disabled =
                false;
        }

        if (loader) {

            loader.classList.add(
                "hidden"
            );
        }

        if (buttonText) {

            buttonText.textContent =
                "Save Changes";
        }
    }
}


// ======================================================
// HANDLE PHOTO BUTTON
// ======================================================

function handlePhotoClick() {

    const photoInput =
        document.getElementById(
            "profilePhotoInput"
        );

    // --------------------------------------------------
    // File input must exist
    // --------------------------------------------------

    if (!photoInput) {

        console.error(
            "profilePhotoInput element was not found."
        );

        showMessage(
            "Photo selector is not available. Please refresh the page.",
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // Reset value
    //
    // This allows the user to select the same file
    // again after uploading it.
    // --------------------------------------------------

    photoInput.value =
        "";

    // --------------------------------------------------
    // Open browser file picker
    // --------------------------------------------------

    photoInput.click();

}


// ======================================================
// VALIDATE PROFILE IMAGE
// ======================================================

function validateProfileImage(
    file
) {

    if (!file) {

        return {
            valid: false,
            message:
                "Please select an image."
        };
    }

    // --------------------------------------------------
    // Allowed image types
    // --------------------------------------------------

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif"

    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        return {

            valid: false,

            message:
                "Please select a JPG, PNG, WEBP or GIF image."
        };
    }

    // --------------------------------------------------
    // Maximum size = 5 MB
    // --------------------------------------------------

    const maxSize =
        5 * 1024 * 1024;

    if (
        file.size >
        maxSize
    ) {

        return {

            valid: false,

            message:
                "Profile picture must be 5 MB or smaller."
        };
    }

    return {

        valid: true,

        message: ""
    };

}


// ======================================================
// UPLOAD PROFILE PHOTO
// ======================================================

async function uploadProfilePhoto(
    file
) {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return;
    }

    // --------------------------------------------------
    // Validate image
    // --------------------------------------------------

    const validation =
        validateProfileImage(
            file
        );

    if (!validation.valid) {

        showMessage(
            validation.message,
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // Get UI elements
    // --------------------------------------------------

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    // --------------------------------------------------
    // Remember current picture
    // --------------------------------------------------

    const previousPicture =
        currentUser &&
        currentUser.picture
            ? currentUser.picture
            : DEFAULT_PROFILE_IMAGE;

    // --------------------------------------------------
    // Create local preview
    // --------------------------------------------------

    let localPreviewUrl =
        null;

    try {

        localPreviewUrl =
            URL.createObjectURL(
                file
            );

        if (profileImage) {

            profileImage.dataset
                .fallbackApplied =
                    "false";

            profileImage.src =
                localPreviewUrl;
        }

    } catch (error) {

        console.warn(
            "Unable to create local preview.",
            error
        );
    }

    // --------------------------------------------------
    // Disable buttons while uploading
    // --------------------------------------------------

    if (photoButton) {

        photoButton.disabled =
            true;
    }

    if (deletePhotoButton) {

        deletePhotoButton.disabled =
            true;
    }

    const originalPhotoButtonText =
        photoButton
            ? photoButton.innerHTML
            : "📷";

    if (photoButton) {

        photoButton.innerHTML =
            '<span class="button-loader"></span>';
    }

    showMessage(
        "Uploading profile picture...",
        ""
    );

    // --------------------------------------------------
    // Create multipart form data
    // --------------------------------------------------

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    try {

        console.log(
            "Uploading profile photo to:",
            `${API_URL}/profile/photo`
        );

        // --------------------------------------------------
        // Upload to backend
        // --------------------------------------------------

        const response =
            await fetch(
                `${API_URL}/profile/photo`,
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    },

                    body:
                        formData
                }
            );

        console.log(
            "Photo upload status:",
            response.status
        );

        // --------------------------------------------------
        // Unauthorized
        // --------------------------------------------------

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token"
            );

            showSessionExpired();

            return;
        }

        // --------------------------------------------------
        // Handle errors
        // --------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Photo upload failed: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                console.error(
                    "Photo upload error response:",
                    errorData
                );

                if (
                    errorData &&
                    errorData.detail
                ) {

                    if (
                        typeof errorData.detail ===
                        "string"
                    ) {

                        errorMessage =
                            errorData.detail;

                    } else if (
                        Array.isArray(
                            errorData.detail
                        )
                    ) {

                        errorMessage =
                            errorData.detail
                                .map(
                                    function (item) {

                                        return (
                                            item.msg ||
                                            "Validation error"
                                        );

                                    }
                                )
                                .join(", ");

                    } else {

                        errorMessage =
                            JSON.stringify(
                                errorData.detail
                            );
                    }
                }

            } catch (error) {

                console.warn(
                    "Unable to parse photo upload error.",
                    error
                );
            }

            throw new Error(
                errorMessage
            );
        }

        // --------------------------------------------------
        // Parse successful response
        // --------------------------------------------------

        const data =
            await response.json();

        console.log(
            "Photo upload response:",
            data
        );

        // --------------------------------------------------
        // Get returned user
        // --------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        }

        // --------------------------------------------------
        // Get Cloudinary URL
        // --------------------------------------------------

        const cloudinaryUrl =
            data &&
            (
                data.picture ||
                (
                    data.user &&
                    data.user.picture
                )
            );

        if (
            !cloudinaryUrl
        ) {

            throw new Error(
                "The server did not return the uploaded profile image URL."
            );
        }

        // --------------------------------------------------
        // Update current profile image
        // --------------------------------------------------

        if (profileImage) {

            profileImage.dataset
                .fallbackApplied =
                    "false";

            profileImage.src =
                cloudinaryUrl;
        }

        // --------------------------------------------------
        // Release local preview URL
        // --------------------------------------------------

        if (localPreviewUrl) {

            URL.revokeObjectURL(
                localPreviewUrl
            );

            localPreviewUrl =
                null;
        }

        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        showMessage(
            data.message ||
            "Profile picture uploaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "PROFILE PHOTO UPLOAD ERROR:",
            error
        );

        // --------------------------------------------------
        // Restore previous image
        // --------------------------------------------------

        if (profileImage) {

            profileImage.dataset
                .fallbackApplied =
                    "false";

            profileImage.src =
                previousPicture;
        }

        // --------------------------------------------------
        // Release preview URL
        // --------------------------------------------------

        if (localPreviewUrl) {

            URL.revokeObjectURL(
                localPreviewUrl
            );

            localPreviewUrl =
                null;
        }

        showMessage(
            error.message ||
            "Unable to upload profile picture.",
            "error"
        );

    } finally {

        // --------------------------------------------------
        // Restore buttons
        // --------------------------------------------------

        if (photoButton) {

            photoButton.disabled =
                false;

            photoButton.innerHTML =
                originalPhotoButtonText;
        }

        if (deletePhotoButton) {

            deletePhotoButton.disabled =
                false;
        }
    }

}


// ======================================================
// DELETE PROFILE PHOTO
// ======================================================

async function deleteProfilePhoto() {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return;
    }

    // --------------------------------------------------
    // Confirm deletion
    // --------------------------------------------------

    const confirmed =
        window.confirm(
            "Are you sure you want to remove your profile picture?"
        );

    if (!confirmed) {

        return;
    }

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    // --------------------------------------------------
    // Disable buttons
    // --------------------------------------------------

    if (photoButton) {

        photoButton.disabled =
            true;
    }

    if (deletePhotoButton) {

        deletePhotoButton.disabled =
            true;
    }

    const originalDeleteButtonText =
        deletePhotoButton
            ? deletePhotoButton.innerHTML
            : "🗑️";

    if (deletePhotoButton) {

        deletePhotoButton.innerHTML =
            '<span class="button-loader"></span>';
    }

    showMessage(
        "Removing profile picture...",
        ""
    );

    try {

        const response =
            await fetch(
                `${API_URL}/profile/photo`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    }
                }
            );

        console.log(
            "Delete photo status:",
            response.status
        );

        // --------------------------------------------------
        // Session expired
        // --------------------------------------------------

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token"
            );

            showSessionExpired();

            return;
        }

        // --------------------------------------------------
        // Error
        // --------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Unable to remove profile picture: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData &&
                    errorData.detail
                ) {

                    if (
                        typeof errorData.detail ===
                        "string"
                    ) {

                        errorMessage =
                            errorData.detail;

                    } else {

                        errorMessage =
                            JSON.stringify(
                                errorData.detail
                            );
                    }
                }

            } catch (error) {

                console.warn(
                    "Unable to parse delete-photo error.",
                    error
                );
            }

            throw new Error(
                errorMessage
            );
        }

        // --------------------------------------------------
        // Read response
        // --------------------------------------------------

        const data =
            await response.json();

        console.log(
            "Delete photo response:",
            data
        );

        // --------------------------------------------------
        // Update current user
        // --------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else if (
            currentUser
        ) {

            currentUser.picture =
                null;
        }

        // --------------------------------------------------
        // Update image
        // --------------------------------------------------

        const profileImage =
            document.getElementById(
                "profileImage"
            );

        if (profileImage) {

            profileImage.dataset
                .fallbackApplied =
                    "false";

            profileImage.src =
                DEFAULT_PROFILE_IMAGE;
        }

        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        showMessage(
            data.message ||
            "Profile picture removed successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "PROFILE PHOTO DELETE ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Unable to remove profile picture.",
            "error"
        );

    } finally {

        if (photoButton) {

            photoButton.disabled =
                false;
        }

        if (deletePhotoButton) {

            deletePhotoButton.disabled =
                false;

            deletePhotoButton.innerHTML =
                originalDeleteButtonText;
        }
    }

}

// ======================================================
// PROFILE PHOTO UI HELPERS
// ======================================================


// ======================================================
// CREATE FILE INPUT
// ======================================================

function ensureProfilePhotoInput() {

    let photoInput =
        document.getElementById(
            "profilePhotoInput"
        );

    // --------------------------------------------------
    // If the input already exists in profile HTML,
    // use it.
    // --------------------------------------------------

    if (photoInput) {

        return photoInput;
    }

    // --------------------------------------------------
    // Create it as a fallback
    // --------------------------------------------------

    photoInput =
        document.createElement(
            "input"
        );

    photoInput.type =
        "file";

    photoInput.id =
        "profilePhotoInput";

    photoInput.accept =
        "image/jpeg,image/png,image/webp,image/gif";

    photoInput.style.display =
        "none";

    document.body.appendChild(
        photoInput
    );

    return photoInput;
}


// ======================================================
// IMAGE FILE SIZE
// ======================================================

function formatFileSize(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "0 KB";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );

    const size =
        bytes /
        Math.pow(
            1024,
            safeIndex
        );

    return (
        size.toFixed(2) +
        " " +
        units[safeIndex]
    );

}


// ======================================================
// IMAGE DIMENSIONS
// ======================================================

function getImageDimensions(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            if (!file) {

                reject(
                    new Error(
                        "No image file selected."
                    )
                );

                return;
            }

            const image =
                new Image();

            const objectUrl =
                URL.createObjectURL(
                    file
                );

            image.onload =
                function () {

                    const width =
                        image.naturalWidth;

                    const height =
                        image.naturalHeight;

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    resolve({

                        width:
                            width,

                        height:
                            height
                    });

                };

            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    reject(
                        new Error(
                            "Unable to read the selected image."
                        )
                    );

                };

            image.src =
                objectUrl;

        }
    );

}


// ======================================================
// CHECK IMAGE DIMENSIONS
// ======================================================

async function validateImageDimensions(
    file
) {

    try {

        const dimensions =
            await getImageDimensions(
                file
            );

        console.log(
            "Selected image dimensions:",
            dimensions.width,
            "x",
            dimensions.height
        );

        // --------------------------------------------------
        // Very small images are usually accidental selections.
        // --------------------------------------------------

        if (
            dimensions.width < 100 ||
            dimensions.height < 100
        ) {

            return {

                valid: false,

                message:
                    "Please select an image at least 100 × 100 pixels."
            };

        }

        return {

            valid: true,

            message: "",

            width:
                dimensions.width,

            height:
                dimensions.height
        };

    } catch (error) {

        console.warn(
            "Could not validate image dimensions.",
            error
        );

        // Do not block the upload if the browser cannot
        // determine the dimensions.
        return {

            valid: true,

            message: ""
        };
    }

}


// ======================================================
// PREVIEW SELECTED IMAGE
// ======================================================

function previewSelectedImage(
    file
) {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        console.warn(
            "profileImage element not found."
        );

        return null;
    }

    if (!file) {

        return null;
    }

    try {

        const previewUrl =
            URL.createObjectURL(
                file
            );

        // --------------------------------------------------
        // Prevent fallback from replacing the preview
        // --------------------------------------------------

        profileImage.dataset
            .fallbackApplied =
            "false";

        // --------------------------------------------------
        // Set preview
        // --------------------------------------------------

        profileImage.src =
            previewUrl;

        console.log(
            "Profile image preview created."
        );

        return previewUrl;

    } catch (error) {

        console.error(
            "Unable to create image preview:",
            error
        );

        showMessage(
            "Unable to preview the selected image.",
            "error"
        );

        return null;
    }

}


// ======================================================
// CLEAR IMAGE PREVIEW
// ======================================================

function clearImagePreview(
    previewUrl
) {

    if (!previewUrl) {

        return;
    }

    try {

        URL.revokeObjectURL(
            previewUrl
        );

    } catch (error) {

        console.warn(
            "Unable to revoke image preview URL.",
            error
        );
    }

}


// ======================================================
// RESTORE PROFILE IMAGE
// ======================================================

function restoreProfileImage() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    const originalImage =
        getProfileImage(
            currentUser
        );

    profileImage.dataset
        .fallbackApplied =
        "false";

    profileImage.src =
        originalImage;

}


// ======================================================
// HANDLE IMAGE SELECTION
// ======================================================

async function handleSelectedPhoto(
    file
) {

    if (!file) {

        return;
    }

    console.log(
        "Selected profile photo:",
        file.name
    );

    console.log(
        "File type:",
        file.type
    );

    console.log(
        "File size:",
        formatFileSize(
            file.size
        )
    );

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    const validation =
        validateProfileImage(
            file
        );

    if (!validation.valid) {

        showMessage(
            validation.message,
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // Validate dimensions
    // --------------------------------------------------

    const dimensionValidation =
        await validateImageDimensions(
            file
        );

    if (
        !dimensionValidation.valid
    ) {

        showMessage(
            dimensionValidation.message,
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // Create immediate local preview
    // --------------------------------------------------

    const previewUrl =
        previewSelectedImage(
            file
        );

    // --------------------------------------------------
    // Upload to backend / Cloudinary
    // --------------------------------------------------

    try {

        await uploadProfilePhoto(
            file
        );

    } finally {

        // --------------------------------------------------
        // uploadProfilePhoto may already revoke its
        // preview URL. Revoke again is harmless in
        // browsers, but avoid doing it if the function
        // already handled the URL.
        // --------------------------------------------------

        if (previewUrl) {

            try {

                URL.revokeObjectURL(
                    previewUrl
                );

            } catch (error) {

                console.warn(
                    "Preview cleanup warning:",
                    error
                );
            }
        }

    }

}


// ======================================================
// SETUP PHOTO INPUT
// ======================================================

function setupProfilePhotoInput() {

    const photoInput =
        ensureProfilePhotoInput();

    if (!photoInput) {

        console.error(
            "Could not create profile photo input."
        );

        return;
    }

    // --------------------------------------------------
    // Avoid duplicate event listeners
    // --------------------------------------------------

    if (
        photoInput.dataset
            .listenerAttached === "true"
    ) {

        return;
    }

    photoInput.dataset
        .listenerAttached =
            "true";

    // --------------------------------------------------
    // File selected
    // --------------------------------------------------

    photoInput.addEventListener(
        "change",
        async function () {

            const file =
                photoInput.files &&
                photoInput.files[0];

            if (!file) {

                return;
            }

            await handleSelectedPhoto(
                file
            );

            // --------------------------------------------------
            // Reset the input so selecting the same file
            // again triggers the change event.
            // --------------------------------------------------

            photoInput.value =
                "";

        }
    );

}


// ======================================================
// OPEN PROFILE PHOTO PICKER
// ======================================================

function openProfilePhotoPicker() {

    const photoInput =
        ensureProfilePhotoInput();

    if (!photoInput) {

        showMessage(
            "Unable to open photo selector.",
            "error"
        );

        return;
    }

    // --------------------------------------------------
    // Clear previous selection
    // --------------------------------------------------

    photoInput.value =
        "";

    // --------------------------------------------------
    // Open file chooser
    // --------------------------------------------------

    try {

        photoInput.click();

    } catch (error) {

        console.error(
            "Unable to open file picker:",
            error
        );

        showMessage(
            "Unable to open the photo selector.",
            "error"
        );
    }

}


// ======================================================
// HANDLE PHOTO BUTTON
// ======================================================

function handlePhotoButtonClick() {

    console.log(
        "Change profile photo button clicked."
    );

    setupProfilePhotoInput();

    openProfilePhotoPicker();

}


// ======================================================
// INITIALIZE PHOTO CONTROLS
// ======================================================

function initializePhotoControls() {

    console.log(
        "Initializing profile photo controls..."
    );

    // --------------------------------------------------
    // Make sure file input exists
    // --------------------------------------------------

    setupProfilePhotoInput();

    // --------------------------------------------------
    // Change photo button
    // --------------------------------------------------

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (photoButton) {

        // --------------------------------------------------
        // Avoid duplicate listener
        // --------------------------------------------------

        if (
            photoButton.dataset
                .listenerAttached !== "true"
        ) {

            photoButton.dataset
                .listenerAttached =
                    "true";

            photoButton.addEventListener(
                "click",
                handlePhotoButtonClick
            );
        }

    } else {

        console.warn(
            "photoButton not found."
        );
    }


    // --------------------------------------------------
    // Delete photo button
    // --------------------------------------------------

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    if (deletePhotoButton) {

        if (
            deletePhotoButton.dataset
                .listenerAttached !== "true"
        ) {

            deletePhotoButton.dataset
                .listenerAttached =
                    "true";

            deletePhotoButton.addEventListener(
                "click",
                deleteProfilePhoto
            );
        }

    } else {

        console.warn(
            "deletePhotoButton not found."
        );
    }


    // --------------------------------------------------
    // Image fallback
    // --------------------------------------------------

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (profileImage) {

        if (
            profileImage.dataset
                .errorListenerAttached !== "true"
        ) {

            profileImage.dataset
                .errorListenerAttached =
                    "true";

            profileImage.addEventListener(
                "error",
                function () {

                    handleProfileImageError(
                        profileImage
                    );

                }
            );
        }

    }

}


// ======================================================
// REFRESH PROFILE
// ======================================================

async function refreshProfile() {

    console.log(
        "Refreshing profile..."
    );

    await loadProfile();

}


// ======================================================
// GET CURRENT PROFILE
// ======================================================

function getCurrentProfile() {

    return currentUser;

}


// ======================================================
// GET CURRENT PROFILE PICTURE
// ======================================================

function getCurrentProfilePicture() {

    if (
        currentUser &&
        currentUser.picture
    ) {

        return currentUser.picture;
    }

    return DEFAULT_PROFILE_IMAGE;

}


// ======================================================
// CHECK WHETHER USER HAS PROFILE PICTURE
// ======================================================

function hasProfilePicture() {

    return Boolean(
        currentUser &&
        currentUser.picture &&
        currentUser.picture.trim()
    );

}


// ======================================================
// UPDATE PROFILE IMAGE ELEMENT
// ======================================================

function updateProfileImage(
    imageUrl
) {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    profileImage.dataset
        .fallbackApplied =
        "false";

    profileImage.src =
        imageUrl ||
        DEFAULT_PROFILE_IMAGE;

}


// ======================================================
// SET PROFILE IMAGE LOADING STATE
// ======================================================

function setProfileImageLoading(
    loading
) {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    if (loading) {

        profileImage.style.opacity =
            "0.55";

    } else {

        profileImage.style.opacity =
            "1";
    }

}


// ======================================================
// PROFILE IMAGE PRELOAD
// ======================================================

function preloadProfileImage(
    imageUrl
) {

    return new Promise(
        function (
            resolve
        ) {

            if (!imageUrl) {

                resolve(
                    false
                );

                return;
            }

            const image =
                new Image();

            image.onload =
                function () {

                    resolve(
                        true
                    );

                };

            image.onerror =
                function () {

                    resolve(
                        false
                    );

                };

            image.src =
                imageUrl;

        }
    );

}


// ======================================================
// LOAD CLOUDINARY IMAGE
// ======================================================

async function loadCloudinaryProfileImage(
    imageUrl
) {

    if (!imageUrl) {

        updateProfileImage(
            DEFAULT_PROFILE_IMAGE
        );

        return false;
    }

    setProfileImageLoading(
        true
    );

    const loaded =
        await preloadProfileImage(
            imageUrl
        );

    if (loaded) {

        updateProfileImage(
            imageUrl
        );

        setProfileImageLoading(
            false
        );

        return true;
    }

    setProfileImageLoading(
        false
    );

    updateProfileImage(
        DEFAULT_PROFILE_IMAGE
    );

    return false;

}


// ======================================================
// PROFILE PHOTO UPLOAD STATUS
// ======================================================

function showPhotoUploadStatus(
    status
) {

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (!photoButton) {

        return;
    }

    if (
        status === "uploading"
    ) {

        photoButton.disabled =
            true;

        photoButton.title =
            "Uploading profile picture...";

    } else {

        photoButton.disabled =
            false;

        photoButton.title =
            "Change profile picture";
    }

}


// ======================================================
// PROFILE PHOTO DELETE STATUS
// ======================================================

function showPhotoDeleteStatus(
    deleting
) {

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    if (!deletePhotoButton) {

        return;
    }

    deletePhotoButton.disabled =
        deleting;

}


// ======================================================
// UPDATE PHOTO BUTTON VISIBILITY
// ======================================================

function updatePhotoButtonState() {

    const deletePhotoButton =
        document.getElementById(
            "deletePhotoButton"
        );

    if (!deletePhotoButton) {

        return;
    }

    if (
        hasProfilePicture()
    ) {

        deletePhotoButton.style.display =
            "inline-flex";

    } else {

        deletePhotoButton.style.display =
            "none";
    }

}


// ======================================================
// PROFILE PHOTO SUCCESS HANDLER
// ======================================================

function handlePhotoUploadSuccess(
    imageUrl
) {

    if (!imageUrl) {

        return;
    }

    if (!currentUser) {

        currentUser = {};
    }

    currentUser.picture =
        imageUrl;

    updateProfileImage(
        imageUrl
    );

    updatePhotoButtonState();

}


// ======================================================
// PROFILE PHOTO DELETE SUCCESS HANDLER
// ======================================================

function handlePhotoDeleteSuccess() {

    if (!currentUser) {

        currentUser = {};
    }

    currentUser.picture =
        null;

    updateProfileImage(
        DEFAULT_PROFILE_IMAGE
    );

    updatePhotoButtonState();

}


// ======================================================
// INITIALIZE PROFILE PAGE PHOTO STATE
// ======================================================

function initializeProfilePhotoState() {

    const imageUrl =
        getCurrentProfilePicture();

    updateProfileImage(
        imageUrl
    );

    updatePhotoButtonState();

}


// ======================================================
// PROFILE PHOTO KEYBOARD ACCESS
// ======================================================

function enablePhotoKeyboardAccess() {

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (!photoButton) {

        return;
    }

    photoButton.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                "Enter" ||
                event.key ===
                " "
            ) {

                event.preventDefault();

                handlePhotoButtonClick();

            }

        }
    );

}


// ======================================================
// PROFILE PHOTO DRAG & DROP SUPPORT
// ======================================================

function enablePhotoDragAndDrop() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    const wrapper =
        profileImage.closest(
            ".profile-image-wrapper"
        );

    if (!wrapper) {

        return;
    }

    // --------------------------------------------------
    // Drag over
    // --------------------------------------------------

    wrapper.addEventListener(
        "dragover",
        function (
            event
        ) {

            event.preventDefault();

            wrapper.classList.add(
                "photo-drag-over"
            );

        }
    );

    // --------------------------------------------------
    // Drag leave
    // --------------------------------------------------

    wrapper.addEventListener(
        "dragleave",
        function () {

            wrapper.classList.remove(
                "photo-drag-over"
            );

        }
    );

    // --------------------------------------------------
    // Drop
    // --------------------------------------------------

    wrapper.addEventListener(
        "drop",
        async function (
            event
        ) {

            event.preventDefault();

            wrapper.classList.remove(
                "photo-drag-over"
            );

            const files =
                event.dataTransfer &&
                event.dataTransfer.files;

            if (
                !files ||
                !files.length
            ) {

                return;
            }

            const file =
                files[0];

            await handleSelectedPhoto(
                file
            );

        }
    );

}


// ======================================================
// PROFILE PHOTO CLIPBOARD SUPPORT
// ======================================================

function enablePhotoClipboardSupport() {

    document.addEventListener(
        "paste",
        async function (
            event
        ) {

            // --------------------------------------------------
            // Only handle paste when profile page is active.
            // --------------------------------------------------

            if (
                !document.getElementById(
                    "profileImage"
                )
            ) {

                return;
            }

            const items =
                event.clipboardData &&
                event.clipboardData.items;

            if (!items) {

                return;
            }

            for (
                let index = 0;
                index < items.length;
                index++
            ) {

                const item =
                    items[index];

                if (
                    item &&
                    item.type &&
                    item.type.startsWith(
                        "image/"
                    )
                ) {

                    const file =
                        item.getAsFile();

                    if (file) {

                        await handleSelectedPhoto(
                            file
                        );
                    }

                    break;
                }
            }

        }
    );

}


// ======================================================
// INITIALIZE ENHANCED PHOTO FEATURES
// ======================================================

function initializeEnhancedPhotoFeatures() {

    initializePhotoControls();

    initializeProfilePhotoState();

    enablePhotoKeyboardAccess();

    enablePhotoDragAndDrop();

    enablePhotoClipboardSupport();

}


// ======================================================
// RE-INITIALIZE AFTER PROFILE RENDER
// ======================================================

function reinitializeProfilePhotoFeatures() {

    setTimeout(
        function () {

            initializeEnhancedPhotoFeatures();

        },
        0
    );

}

// ======================================================
// PROFILE API HELPERS
// ======================================================


// ======================================================
// PARSE API ERROR
// ======================================================

async function parseApiError(
    response,
    defaultMessage
) {

    let message =
        defaultMessage ||
        "An unexpected error occurred.";

    try {

        const data =
            await response.json();

        if (
            data &&
            data.detail
        ) {

            if (
                typeof data.detail ===
                "string"
            ) {

                message =
                    data.detail;

            } else if (
                Array.isArray(
                    data.detail
                )
            ) {

                message =
                    data.detail
                        .map(
                            function (item) {

                                return (
                                    item.msg ||
                                    item.message ||
                                    "Validation error"
                                );

                            }
                        )
                        .join(", ");

            } else {

                message =
                    JSON.stringify(
                        data.detail
                    );
            }

        } else if (
            data &&
            data.message
        ) {

            message =
                data.message;
        }

    } catch (error) {

        console.warn(
            "Unable to parse API error:",
            error
        );

    }

    return message;
}


// ======================================================
// API REQUEST HELPER
// ======================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        throw new Error(
            "Authentication token not found."
        );
    }

    const requestOptions = {

        ...options,

        headers: {

            ...(options.headers || {}),

            "Authorization":
                `Bearer ${token}`,

            "Accept":
                "application/json"

        }

    };

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            requestOptions
        );

    // --------------------------------------------------
    // Authentication error
    // --------------------------------------------------

    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "token"
        );

        showSessionExpired();

        throw new Error(
            "Your session has expired. Please login again."
        );
    }

    return response;

}


// ======================================================
// UPLOAD PROFILE PHOTO TO BACKEND
// ======================================================

async function uploadPhotoToBackend(
    file
) {

    if (!file) {

        throw new Error(
            "No profile picture was selected."
        );
    }

    // --------------------------------------------------
    // Create multipart request
    // --------------------------------------------------

    const formData =
        new FormData();

    formData.append(
        "file",
        file,
        file.name
    );

    console.log(
        "Sending profile image to backend..."
    );

    const response =
        await apiRequest(
            "/profile/photo",
            {
                method: "POST",

                body:
                    formData
            }
        );

    // --------------------------------------------------
    // Handle error
    // --------------------------------------------------

    if (!response.ok) {

        const message =
            await parseApiError(
                response,
                "Unable to upload profile picture."
            );

        throw new Error(
            message
        );
    }

    // --------------------------------------------------
    // Parse response
    // --------------------------------------------------

    const data =
        await response.json();

    console.log(
        "Backend photo upload response:",
        data
    );

    return data;

}


// ======================================================
// UPLOAD PROFILE PHOTO
// ======================================================

async function uploadProfilePhotoToCloudinary(
    file
) {

    // --------------------------------------------------
    // Validate file
    // --------------------------------------------------

    const validation =
        validateProfileImage(
            file
        );

    if (!validation.valid) {

        throw new Error(
            validation.message
        );
    }

    // --------------------------------------------------
    // Show uploading state
    // --------------------------------------------------

    showPhotoUploadStatus(
        "uploading"
    );

    setProfileImageLoading(
        true
    );

    showMessage(
        "Uploading profile picture...",
        ""
    );

    let previewUrl =
        null;

    try {

        // --------------------------------------------------
        // Local preview
        // --------------------------------------------------

        previewUrl =
            previewSelectedImage(
                file
            );

        // --------------------------------------------------
        // Send to FastAPI
        //
        // FastAPI then sends the image to Cloudinary.
        // --------------------------------------------------

        const data =
            await uploadPhotoToBackend(
                file
            );

        // --------------------------------------------------
        // Get Cloudinary URL
        // --------------------------------------------------

        const imageUrl =
            data &&
            (
                data.picture ||
                data.url ||
                (
                    data.user &&
                    data.user.picture
                )
            );

        if (!imageUrl) {

            throw new Error(
                "Cloudinary uploaded the image, but the server did not return the image URL."
            );
        }

        // --------------------------------------------------
        // Update current user
        // --------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else {

            if (!currentUser) {

                currentUser = {};
            }

            currentUser.picture =
                imageUrl;
        }

        // --------------------------------------------------
        // Display Cloudinary image
        // --------------------------------------------------

        const profileImage =
            document.getElementById(
                "profileImage"
            );

        if (profileImage) {

            profileImage.dataset
                .fallbackApplied =
                "false";

            profileImage.src =
                imageUrl;
        }

        // --------------------------------------------------
        // Make sure Cloudinary image is loaded
        // --------------------------------------------------

        await loadCloudinaryProfileImage(
            imageUrl
        );

        // --------------------------------------------------
        // Update delete button
        // --------------------------------------------------

        updatePhotoButtonState();

        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        showMessage(
            data.message ||
            "Profile picture uploaded successfully.",
            "success"
        );

        return data;

    } catch (error) {

        console.error(
            "Cloudinary profile photo upload error:",
            error
        );

        // --------------------------------------------------
        // Restore previous image
        // --------------------------------------------------

        restoreProfileImage();

        showMessage(
            error.message ||
            "Unable to upload profile picture.",
            "error"
        );

        throw error;

    } finally {

        // --------------------------------------------------
        // Release preview
        // --------------------------------------------------

        clearImagePreview(
            previewUrl
        );

        setProfileImageLoading(
            false
        );

        showPhotoUploadStatus(
            "complete"
        );
    }

}


// ======================================================
// MAIN PHOTO UPLOAD FUNCTION
// ======================================================
//
// Keep this function name because other parts of the
// profile page already call uploadProfilePhoto().
//
// ======================================================

async function uploadProfilePhoto(
    file
) {

    try {

        return await uploadProfilePhotoToCloudinary(
            file
        );

    } catch (error) {

        console.error(
            "Profile photo upload failed:",
            error
        );

        return null;
    }

}


// ======================================================
// DELETE PROFILE PHOTO FROM BACKEND
// ======================================================

async function deletePhotoFromBackend() {

    console.log(
        "Deleting profile picture..."
    );

    const response =
        await apiRequest(
            "/profile/photo",
            {
                method: "DELETE"
            }
        );

    if (!response.ok) {

        const message =
            await parseApiError(
                response,
                "Unable to remove profile picture."
            );

        throw new Error(
            message
        );
    }

    const data =
        await response.json();

    console.log(
        "Delete photo response:",
        data
    );

    return data;

}


// ======================================================
// REMOVE PROFILE PHOTO
// ======================================================

async function removeProfilePhoto() {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return;
    }

    // --------------------------------------------------
    // Confirmation
    // --------------------------------------------------

    const confirmed =
        window.confirm(
            "Are you sure you want to remove your profile picture?"
        );

    if (!confirmed) {

        return;
    }

    showPhotoDeleteStatus(
        true
    );

    showMessage(
        "Removing profile picture...",
        ""
    );

    try {

        const data =
            await deletePhotoFromBackend();

        // --------------------------------------------------
        // Update user object
        // --------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else {

            if (!currentUser) {

                currentUser = {};
            }

            currentUser.picture =
                null;
        }

        // --------------------------------------------------
        // Update image
        // --------------------------------------------------

        updateProfileImage(
            DEFAULT_PROFILE_IMAGE
        );

        // --------------------------------------------------
        // Update button state
        // --------------------------------------------------

        updatePhotoButtonState();

        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        showMessage(
            data.message ||
            "Profile picture removed successfully.",
            "success"
        );

        return data;

    } catch (error) {

        console.error(
            "Remove profile photo error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to remove profile picture.",
            "error"
        );

        return null;

    } finally {

        showPhotoDeleteStatus(
            false
        );

    }

}


// ======================================================
// DELETE PROFILE PHOTO BUTTON HANDLER
// ======================================================

async function deleteProfilePhoto() {

    return await removeProfilePhoto();

}


// ======================================================
// PROFILE PHOTO UPLOAD PROGRESS
// ======================================================

function showUploadProgress(
    percent
) {

    const messageElement =
        document.getElementById(
            "message"
        );

    if (!messageElement) {

        return;
    }

    let safePercent =
        Number(percent);

    if (
        Number.isNaN(
            safePercent
        )
    ) {

        safePercent =
            0;
    }

    safePercent =
        Math.max(
            0,
            Math.min(
                100,
                safePercent
            )
        );

    messageElement.className =
        "message";

    messageElement.innerHTML = `

        <span>
            Uploading profile picture...
        </span>

        <span
            style="
                display:inline-block;
                margin-left:8px;
                font-weight:700;
            "
        >
            ${Math.round(safePercent)}%
        </span>

    `;

}


// ======================================================
// UPLOAD USING XMLHttpRequest
// ======================================================
//
// This version gives us real upload progress.
// It is not currently required by the backend,
// but it is available for the profile page.
//
// ======================================================

function uploadPhotoWithProgress(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const token =
                getAccessToken();

            if (!token) {

                reject(
                    new Error(
                        "Authentication token not found."
                    )
                );

                return;
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                file,
                file.name
            );

            const xhr =
                new XMLHttpRequest();

            // --------------------------------------------------
            // Open request
            // --------------------------------------------------

            xhr.open(
                "POST",
                `${API_URL}/profile/photo`,
                true
            );

            // --------------------------------------------------
            // Authorization
            // --------------------------------------------------

            xhr.setRequestHeader(
                "Authorization",
                `Bearer ${token}`
            );

            xhr.setRequestHeader(
                "Accept",
                "application/json"
            );

            // --------------------------------------------------
            // Upload progress
            // --------------------------------------------------

            xhr.upload.addEventListener(
                "progress",
                function (
                    event
                ) {

                    if (
                        event.lengthComputable
                    ) {

                        const percent =
                            (
                                event.loaded /
                                event.total
                            ) *
                            100;

                        showUploadProgress(
                            percent
                        );
                    }

                }
            );

            // --------------------------------------------------
            // Request completed
            // --------------------------------------------------

            xhr.addEventListener(
                "load",
                function () {

                    if (
                        xhr.status === 401
                    ) {

                        localStorage.removeItem(
                            "access_token"
                        );

                        localStorage.removeItem(
                            "token"
                        );

                        showSessionExpired();

                        reject(
                            new Error(
                                "Your session has expired."
                            )
                        );

                        return;
                    }

                    if (
                        xhr.status < 200 ||
                        xhr.status >= 300
                    ) {

                        let message =
                            "Unable to upload profile picture.";

                        try {

                            const errorData =
                                JSON.parse(
                                    xhr.responseText
                                );

                            if (
                                errorData &&
                                errorData.detail
                            ) {

                                if (
                                    typeof errorData.detail ===
                                    "string"
                                ) {

                                    message =
                                        errorData.detail;

                                } else {

                                    message =
                                        JSON.stringify(
                                            errorData.detail
                                        );
                                }
                            }

                        } catch (error) {

                            console.warn(
                                "Unable to parse upload error:",
                                error
                            );
                        }

                        reject(
                            new Error(
                                message
                            )
                        );

                        return;
                    }

                    try {

                        const data =
                            JSON.parse(
                                xhr.responseText
                            );

                        resolve(
                            data
                        );

                    } catch (error) {

                        reject(
                            new Error(
                                "Invalid server response."
                            )
                        );
                    }

                }
            );

            // --------------------------------------------------
            // Network error
            // --------------------------------------------------

            xhr.addEventListener(
                "error",
                function () {

                    reject(
                        new Error(
                            "Network error while uploading profile picture."
                        )
                    );

                }
            );

            // --------------------------------------------------
            // Request aborted
            // --------------------------------------------------

            xhr.addEventListener(
                "abort",
                function () {

                    reject(
                        new Error(
                            "Profile picture upload was cancelled."
                        )
                    );

                }
            );

            // --------------------------------------------------
            // Send
            // --------------------------------------------------

            xhr.send(
                formData
            );

        }
    );

}


// ======================================================
// OPTIONAL PROGRESS UPLOAD FUNCTION
// ======================================================

async function uploadProfilePhotoWithProgress(
    file
) {

    const validation =
        validateProfileImage(
            file
        );

    if (!validation.valid) {

        showMessage(
            validation.message,
            "error"
        );

        return null;
    }

    let previewUrl =
        null;

    try {

        previewUrl =
            previewSelectedImage(
                file
            );

        showMessage(
            "Uploading profile picture...",
            ""
        );

        const data =
            await uploadPhotoWithProgress(
                file
            );

        const imageUrl =
            data &&
            (
                data.picture ||
                data.url ||
                (
                    data.user &&
                    data.user.picture
                )
            );

        if (!imageUrl) {

            throw new Error(
                "The server did not return the Cloudinary image URL."
            );
        }

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else {

            if (!currentUser) {

                currentUser = {};
            }

            currentUser.picture =
                imageUrl;
        }

        updateProfileImage(
            imageUrl
        );

        updatePhotoButtonState();

        showMessage(
            data.message ||
            "Profile picture uploaded successfully.",
            "success"
        );

        return data;

    } catch (error) {

        console.error(
            "Progress upload error:",
            error
        );

        restoreProfileImage();

        showMessage(
            error.message ||
            "Unable to upload profile picture.",
            "error"
        );

        return null;

    } finally {

        clearImagePreview(
            previewUrl
        );

        setProfileImageLoading(
            false
        );

        showPhotoUploadStatus(
            "complete"
        );
    }

}


// ======================================================
// REFRESH PROFILE AFTER PHOTO CHANGE
// ======================================================

async function refreshProfileAfterPhotoChange() {

    try {

        await loadProfile();

    } catch (error) {

        console.error(
            "Unable to refresh profile:",
            error
        );

    }

}


// ======================================================
// VERIFY PROFILE PHOTO URL
// ======================================================

async function verifyProfilePhotoUrl(
    imageUrl
) {

    if (!imageUrl) {

        return false;
    }

    try {

        const response =
            await fetch(
                imageUrl,
                {
                    method: "HEAD"
                }
            );

        return response.ok;

    } catch (error) {

        console.warn(
            "Unable to verify profile image URL:",
            error
        );

        return false;
    }

}


// ======================================================
// CHECK CLOUDINARY URL
// ======================================================

function isCloudinaryUrl(
    url
) {

    if (
        !url ||
        typeof url !==
            "string"
    ) {

        return false;
    }

    return (
        url.includes(
            "res.cloudinary.com"
        )
    );

}


// ======================================================
// PROFILE PHOTO SOURCE
// ======================================================

function getProfilePhotoSource(
    user
) {

    if (
        !user ||
        !user.picture
    ) {

        return DEFAULT_PROFILE_IMAGE;
    }

    if (
        isCloudinaryUrl(
            user.picture
        )
    ) {

        return user.picture;
    }

    // --------------------------------------------------
    // Google profile image or any other valid URL
    // --------------------------------------------------

    return user.picture;

}


// ======================================================
// UPDATE PROFILE PHOTO SOURCE
// ======================================================

function updateProfilePhotoSource() {

    const imageUrl =
        getProfilePhotoSource(
            currentUser
        );

    updateProfileImage(
        imageUrl
    );

}


// ======================================================
// CLOUDINARY IMAGE READY
// ======================================================

function handleCloudinaryImageReady(
    imageUrl
) {

    if (!imageUrl) {

        return;
    }

    if (!currentUser) {

        currentUser = {};
    }

    currentUser.picture =
        imageUrl;

    updateProfilePhotoSource();

    updatePhotoButtonState();

}


// ======================================================
// CLOUDINARY IMAGE FAILED
// ======================================================

function handleCloudinaryImageFailed() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    profileImage.src =
        DEFAULT_PROFILE_IMAGE;

    profileImage.dataset
        .fallbackApplied =
        "true";

}


// ======================================================
// END OF PART 4
// ======================================================

// ======================================================
// PROFILE FORM HELPERS
// ======================================================


// ======================================================
// GET PROFILE FORM VALUES
// ======================================================

function getProfileFormValues() {

    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );

    return {

        name:
            nameInput
                ? nameInput.value.trim()
                : "",

        email:
            emailInput
                ? emailInput.value.trim()
                : "",

        mobile:
            mobileInput
                ? mobileInput.value.trim()
                : ""

    };

}


// ======================================================
// VALIDATE PROFILE FORM
// ======================================================

function validateProfileForm(
    values
) {

    if (
        !values.name
    ) {

        return {

            valid: false,

            field: "profileName",

            message:
                "Full name cannot be empty."

        };
    }


    if (
        !values.email
    ) {

        return {

            valid: false,

            field: "profileEmail",

            message:
                "Email address cannot be empty."

        };
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailPattern.test(
            values.email
        )
    ) {

        return {

            valid: false,

            field: "profileEmail",

            message:
                "Please enter a valid email address."

        };
    }


    if (
        values.mobile
    ) {

        const mobilePattern =
            /^[0-9+\-\s()]{7,20}$/;

        if (
            !mobilePattern.test(
                values.mobile
            )
        ) {

            return {

                valid: false,

                field: "profileMobile",

                message:
                    "Please enter a valid mobile number."

            };
        }
    }


    return {

        valid: true,

        field: "",

        message: ""

    };

}


// ======================================================
// FOCUS INVALID FIELD
// ======================================================

function focusInvalidField(
    fieldId
) {

    if (!fieldId) {

        return;
    }

    const field =
        document.getElementById(
            fieldId
        );

    if (!field) {

        return;
    }

    field.focus();

    field.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ======================================================
// SET SAVE BUTTON STATE
// ======================================================

function setSaveButtonLoading(
    loading
) {

    const button =
        document.getElementById(
            "saveProfileButton"
        );

    const loader =
        document.getElementById(
            "saveProfileLoader"
        );

    const buttonText =
        button
            ? button.querySelector(
                ".button-text"
            )
            : null;


    if (loading) {

        if (button) {

            button.disabled =
                true;
        }

        if (loader) {

            loader.classList.remove(
                "hidden"
            );
        }

        if (buttonText) {

            buttonText.textContent =
                "Saving...";
        }

    } else {

        if (button) {

            button.disabled =
                false;
        }

        if (loader) {

            loader.classList.add(
                "hidden"
            );
        }

        if (buttonText) {

            buttonText.textContent =
                "Save Changes";
        }

    }

}


// ======================================================
// SAVE PROFILE TO API
// ======================================================

async function saveProfileChanges() {

    const token =
        getAccessToken();

    if (!token) {

        showSessionExpired();

        return null;
    }


    const values =
        getProfileFormValues();


    const validation =
        validateProfileForm(
            values
        );


    if (
        !validation.valid
    ) {

        showMessage(
            validation.message,
            "error"
        );

        focusInvalidField(
            validation.field
        );

        return null;
    }


    const requestBody = {

        name:
            values.name,

        email:
            values.email,

        mobile:
            values.mobile ||
            null

    };


    setSaveButtonLoading(
        true
    );


    showMessage(
        "Saving profile changes...",
        ""
    );


    try {

        console.log(
            "Profile update request:",
            requestBody
        );


        const response =
            await fetch(
                `${API_URL}/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

                }
            );


        console.log(
            "Profile update status:",
            response.status
        );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token"
            );

            showSessionExpired();

            return null;
        }


        if (
            !response.ok
        ) {

            const message =
                await parseApiError(
                    response,
                    "Unable to update your profile."
                );

            throw new Error(
                message
            );
        }


        const data =
            await response.json();


        console.log(
            "Profile update response:",
            data
        );


        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        } else {

            if (!currentUser) {

                currentUser = {};
            }


            currentUser.name =
                values.name;

            currentUser.email =
                values.email;

            currentUser.mobile =
                values.mobile ||
                null;

        }


        // --------------------------------------------------
        // Re-render the profile
        // --------------------------------------------------

        renderProfile(
            currentUser
        );


        // --------------------------------------------------
        // Reconnect photo controls
        // --------------------------------------------------

        reinitializeProfilePhotoFeatures();


        showMessage(
            data.message ||
            "Profile updated successfully.",
            "success"
        );


        return data;

    } catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );


        return null;

    } finally {

        setSaveButtonLoading(
            false
        );

    }

}


// ======================================================
// SAVE PROFILE BUTTON HANDLER
// ======================================================

async function handleSaveProfileClick() {

    await saveProfileChanges();

}


// ======================================================
// CANCEL PROFILE CHANGES
// ======================================================

function cancelProfileChanges() {

    if (!currentUser) {

        return;
    }


    renderProfile(
        currentUser
    );


    reinitializeProfilePhotoFeatures();


    showMessage(
        "Changes cancelled.",
        ""
    );

}


// ======================================================
// RESET PROFILE FORM
// ======================================================

function resetProfileForm() {

    if (!currentUser) {

        return;
    }


    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );


    if (nameInput) {

        nameInput.value =
            currentUser.name ||
            "";

    }


    if (emailInput) {

        emailInput.value =
            currentUser.email ||
            "";

    }


    if (mobileInput) {

        mobileInput.value =
            currentUser.mobile ||
            "";

    }

}


// ======================================================
// CHECK WHETHER PROFILE HAS CHANGED
// ======================================================

function profileHasChanges() {

    if (!currentUser) {

        return false;
    }


    const values =
        getProfileFormValues();


    const originalName =
        currentUser.name ||
        "";

    const originalEmail =
        currentUser.email ||
        "";

    const originalMobile =
        currentUser.mobile ||
        "";


    return (

        values.name !==
            originalName ||

        values.email !==
            originalEmail ||

        values.mobile !==
            originalMobile

    );

}


// ======================================================
// WARN ABOUT UNSAVED CHANGES
// ======================================================

function enableUnsavedChangesWarning() {

    window.addEventListener(
        "beforeunload",
        function (
            event
        ) {

            if (
                profileHasChanges()
            ) {

                event.preventDefault();

                event.returnValue =
                    "";

            }

        }
    );

}


// ======================================================
// PROFILE FIELD INPUT HANDLING
// ======================================================

function attachProfileFieldListeners() {

    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );


    // --------------------------------------------------
    // Name
    // --------------------------------------------------

    if (nameInput) {

        nameInput.addEventListener(
            "input",
            function () {

                nameInput.classList.remove(
                    "input-error"
                );

            }
        );

    }


    // --------------------------------------------------
    // Email
    // --------------------------------------------------

    if (emailInput) {

        emailInput.addEventListener(
            "input",
            function () {

                emailInput.classList.remove(
                    "input-error"
                );

            }
        );

    }


    // --------------------------------------------------
    // Mobile
    // --------------------------------------------------

    if (mobileInput) {

        mobileInput.addEventListener(
            "input",
            function () {

                mobileInput.classList.remove(
                    "input-error"
                );

            }
        );

    }

}


// ======================================================
// ATTACH FORM EVENTS
// ======================================================

function attachProfileFormEvents() {

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    if (saveButton) {

        if (
            saveButton.dataset
                .listenerAttached !== "true"
        ) {

            saveButton.dataset
                .listenerAttached =
                    "true";

            saveButton.addEventListener(
                "click",
                handleSaveProfileClick
            );

        }

    }


    // --------------------------------------------------
    // Cancel
    // --------------------------------------------------

    if (cancelButton) {

        if (
            cancelButton.dataset
                .listenerAttached !== "true"
        ) {

            cancelButton.dataset
                .listenerAttached =
                    "true";

            cancelButton.addEventListener(
                "click",
                cancelProfileChanges
            );

        }

    }


    attachProfileFieldListeners();

}


// ======================================================
// REINITIALIZE ALL PROFILE EVENTS
// ======================================================

function reinitializeAllProfileEvents() {

    attachProfileFormEvents();

    initializeEnhancedPhotoFeatures();

}


// ======================================================
// UPDATE PROFILE AFTER API RESPONSE
// ======================================================

function updateCurrentUser(
    user
) {

    if (
        !user
    ) {

        return;
    }


    currentUser =
        user;


    updateProfilePhotoSource();

}


// ======================================================
// MERGE PROFILE DATA
// ======================================================

function mergeProfileData(
    data
) {

    if (
        !data
    ) {

        return;
    }


    if (
        data.user
    ) {

        updateCurrentUser(
            data.user
        );

        return;
    }


    if (
        !currentUser
    ) {

        currentUser = {};
    }


    Object.assign(
        currentUser,
        data
    );


    updateProfilePhotoSource();

}


// ======================================================
// PROFILE RESPONSE HANDLER
// ======================================================

function handleProfileResponse(
    data
) {

    if (
        !data
    ) {

        return;
    }


    mergeProfileData(
        data
    );


    if (
        currentUser
    ) {

        renderProfile(
            currentUser
        );

        reinitializeAllProfileEvents();

    }

}


// ======================================================
// LOAD PROFILE AGAIN AFTER LOGIN
// ======================================================

async function reloadProfile() {

    console.log(
        "Reloading profile..."
    );


    try {

        await loadProfile();

        reinitializeAllProfileEvents();

    } catch (error) {

        console.error(
            "Reload profile failed:",
            error
        );

    }

}


// ======================================================
// PROFILE PAGE VISIBILITY
// ======================================================

function isProfilePageVisible() {

    const profileCard =
        document.getElementById(
            "profile-card"
        );

    return Boolean(
        profileCard
    );

}


// ======================================================
// HANDLE BROWSER BACK/FORWARD
// ======================================================

window.addEventListener(
    "pageshow",
    function () {

        if (
            isProfilePageVisible()
        ) {

            const token =
                getAccessToken();

            if (token) {

                reloadProfile();

            }

        }

    }
);


// ======================================================
// HANDLE TAB VISIBILITY
// ======================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            if (
                isProfilePageVisible()
            ) {

                const token =
                    getAccessToken();

                if (token) {

                    console.log(
                        "Profile page became visible."
                    );

                }

            }

        }

    }
);


// ======================================================
// HANDLE ONLINE/OFFLINE STATUS
// ======================================================

window.addEventListener(
    "online",
    function () {

        console.log(
            "Internet connection restored."
        );


        if (
            isProfilePageVisible()
        ) {

            showMessage(
                "Internet connection restored.",
                "success"
            );

        }

    }
);


window.addEventListener(
    "offline",
    function () {

        console.warn(
            "Internet connection lost."
        );


        if (
            isProfilePageVisible()
        ) {

            showMessage(
                "You are currently offline.",
                "error"
            );

        }

    }
);


// ======================================================
// PROFILE EMAIL CHANGE NOTICE
// ======================================================

function showEmailChangeNotice() {

    showMessage(
        "If you change your email address, use the new email the next time you sign in.",
        ""
    );

}


// ======================================================
// EMAIL FIELD BLUR
// ======================================================

function attachEmailChangeNotice() {

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    if (!emailInput) {

        return;
    }


    if (
        emailInput.dataset
            .noticeAttached === "true"
    ) {

        return;
    }


    emailInput.dataset
        .noticeAttached =
            "true";


    emailInput.addEventListener(
        "change",
        function () {

            if (
                currentUser &&
                emailInput.value.trim() !==
                    (currentUser.email || "")
            ) {

                showEmailChangeNotice();

            }

        }
    );

}


// ======================================================
// PROFILE PAGE INITIAL EVENT SETUP
// ======================================================

function initializeProfileEvents() {

    attachProfileFormEvents();

    initializeEnhancedPhotoFeatures();

    attachEmailChangeNotice();

}


// ======================================================
// PROFILE PAGE COMPLETE INITIALIZATION
// ======================================================

function completeProfileInitialization() {

    console.log(
        "Completing profile initialization..."
    );


    initializeProfileEvents();


    enableUnsavedChangesWarning();


    console.log(
        "Profile initialization complete."
    );

}


// ======================================================
// RUN AFTER PROFILE RENDER
// ======================================================

function initializeAfterProfileRender() {

    setTimeout(
        function () {

            completeProfileInitialization();

        },
        50
    );

}


// ======================================================
// EXPORT DEBUG HELPERS
// ======================================================
//
// These are useful while testing from the browser
// console. They do not expose secrets.
//

window.profileDebug = {

    reload:
        reloadProfile,

    getUser:
        getCurrentProfile,

    getPicture:
        getCurrentProfilePicture,

    hasPicture:
        hasProfilePicture,

    refresh:
        refreshProfile,

    openPhotoPicker:
        openProfilePhotoPicker

};


// ======================================================
// FINAL INITIALIZATION HOOK
// ======================================================

setTimeout(
    function () {

        if (
            isProfilePageVisible()
        ) {

            initializeAfterProfileRender();

        }

    },
    100
);


// ======================================================
// END OF PART 5
// ======================================================

// ======================================================
// FINAL PROFILE INITIALIZATION
// ======================================================


// ======================================================
// INITIALIZE PROFILE PAGE AFTER RENDER
// ======================================================

function finalizeProfilePage() {

    console.log(
        "Finalizing AI Visibility profile page..."
    );

    // --------------------------------------------------
    // Profile form controls
    // --------------------------------------------------

    attachProfileFormEvents();

    // --------------------------------------------------
    // Profile photo controls
    // --------------------------------------------------

    initializePhotoControls();

    // --------------------------------------------------
    // Enhanced photo functionality
    // --------------------------------------------------

    initializeEnhancedPhotoFeatures();

    // --------------------------------------------------
    // Email change notice
    // --------------------------------------------------

    attachEmailChangeNotice();

    // --------------------------------------------------
    // Update current profile picture
    // --------------------------------------------------

    initializeProfilePhotoState();

    console.log(
        "Profile page is ready."
    );

}


// ======================================================
// SAFE INITIALIZATION
// ======================================================

function safeInitializeProfilePage() {

    try {

        if (
            isProfilePageVisible()
        ) {

            finalizeProfilePage();

        }

    } catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );

    }

}


// ======================================================
// INITIALIZE WHEN DOCUMENT IS READY
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            safeInitializeProfilePage();

        }
    );

} else {

    safeInitializeProfilePage();

}


// ======================================================
// PROFILE IMAGE CLICK
// ======================================================

function attachProfileImageClick() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (!profileImage) {

        return;
    }

    if (
        profileImage.dataset
            .clickListenerAttached ===
        "true"
    ) {

        return;
    }

    profileImage.dataset
        .clickListenerAttached =
            "true";

    profileImage.style.cursor =
        "pointer";

    profileImage.title =
        "Click to change profile picture";

    profileImage.addEventListener(
        "click",
        function () {

            handlePhotoButtonClick();

        }
    );

}


// ======================================================
// INITIALIZE IMAGE CLICK
// ======================================================

function initializeProfileImageClick() {

    attachProfileImageClick();

}


// ======================================================
// PROFILE PHOTO INPUT FALLBACK
// ======================================================

function ensurePhotoInputEvent() {

    const input =
        ensureProfilePhotoInput();

    if (!input) {

        return;
    }

    if (
        input.dataset
            .fallbackListenerAttached ===
        "true"
    ) {

        return;
    }

    input.dataset
        .fallbackListenerAttached =
        "true";

    input.addEventListener(
        "change",
        async function (
            event
        ) {

            const files =
                event.target.files;

            if (
                !files ||
                files.length === 0
            ) {

                return;
            }

            const file =
                files[0];

            console.log(
                "Profile photo selected:",
                file.name
            );

            await handleSelectedPhoto(
                file
            );

            event.target.value =
                "";

        }
    );

}


// ======================================================
// FINAL PHOTO CONTROL SETUP
// ======================================================

function finalPhotoControlSetup() {

    setupProfilePhotoInput();

    ensurePhotoInputEvent();

    initializeProfileImageClick();

}


// ======================================================
// FINAL FORM SETUP
// ======================================================

function finalFormSetup() {

    attachProfileFormEvents();

    attachProfileFieldListeners();

    attachEmailChangeNotice();

}


// ======================================================
// FINAL PAGE SETUP
// ======================================================

function finalPageSetup() {

    finalFormSetup();

    finalPhotoControlSetup();

    updateProfilePhotoSource();

    updatePhotoButtonState();

}


// ======================================================
// RUN FINAL PAGE SETUP
// ======================================================

setTimeout(
    function () {

        try {

            if (
                isProfilePageVisible()
            ) {

                finalPageSetup();

            }

        } catch (error) {

            console.error(
                "Final profile setup failed:",
                error
            );

        }

    },
    250
);


// ======================================================
// PROFILE PAGE NAVIGATION HELPERS
// ======================================================


// ======================================================
// GO TO DASHBOARD
// ======================================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


// ======================================================
// GO TO LOGS
// ======================================================

function goToLogs() {

    window.location.href =
        "logs.html";

}


// ======================================================
// GO TO PROFILE
// ======================================================

function goToProfile() {

    window.location.href =
        "profile.html";

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    console.log(
        "Logging out..."
    );

    // --------------------------------------------------
    // Remove authentication tokens
    // --------------------------------------------------

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "token"
    );

    // --------------------------------------------------
    // Clear profile state
    // --------------------------------------------------

    currentUser =
        null;

    // --------------------------------------------------
    // Redirect to login
    // --------------------------------------------------

    window.location.href =
        "login.html";

}


// ======================================================
// CONFIRM LOGOUT
// ======================================================

function confirmLogout() {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );

    if (
        confirmed
    ) {

        logout();

    }

}


// ======================================================
// PROFILE PAGE BEFORE UNLOAD
// ======================================================

window.addEventListener(
    "beforeunload",
    function () {

        // --------------------------------------------------
        // Nothing destructive happens here.
        //
        // Authentication remains stored in localStorage.
        // --------------------------------------------------

    }
);


// ======================================================
// HANDLE PROFILE API ERROR
// ======================================================

function handleProfileApiError(
    error
) {

    console.error(
        "Profile API error:",
        error
    );

    if (
        error &&
        error.message
    ) {

        showMessage(
            error.message,
            "error"
        );

    } else {

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );

    }

}


// ======================================================
// SAFE PROFILE REFRESH
// ======================================================

async function safeRefreshProfile() {

    try {

        await refreshProfile();

        reinitializeAllProfileEvents();

    } catch (error) {

        handleProfileApiError(
            error
        );

    }

}


// ======================================================
// REFRESH PROFILE BUTTON SUPPORT
// ======================================================

function attachRefreshProfileSupport() {

    const refreshButton =
        document.getElementById(
            "refreshProfileButton"
        );

    if (!refreshButton) {

        return;
    }

    if (
        refreshButton.dataset
            .listenerAttached ===
        "true"
    ) {

        return;
    }

    refreshButton.dataset
        .listenerAttached =
            "true";

    refreshButton.addEventListener(
        "click",
        async function () {

            await safeRefreshProfile();

        }
    );

}


// ======================================================
// AUTO REFRESH SUPPORT
// ======================================================

function enableProfileAutoRefresh() {

    // --------------------------------------------------
    // Refresh profile when the user returns to the tab.
    // --------------------------------------------------

    document.addEventListener(
        "visibilitychange",
        async function () {

            if (
                document.visibilityState !==
                "visible"
            ) {

                return;
            }

            if (
                !isProfilePageVisible()
            ) {

                return;
            }

            const token =
                getAccessToken();

            if (!token) {

                return;
            }

            console.log(
                "Refreshing profile after tab activation..."
            );

            try {

                await loadProfile();

                reinitializeAllProfileEvents();

            } catch (error) {

                console.warn(
                    "Automatic profile refresh failed:",
                    error
                );

            }

        }
    );

}


// ======================================================
// ENABLE AUTO REFRESH
// ======================================================

setTimeout(
    function () {

        enableProfileAutoRefresh();

    },
    500
);


// ======================================================
// GLOBAL PROFILE FUNCTIONS
// ======================================================
//
// Make important functions available to buttons or
// other frontend files if required.
//

window.loadProfile =
    loadProfile;

window.saveProfile =
    saveProfileChanges;

window.refreshProfile =
    refreshProfile;

window.uploadProfilePhoto =
    uploadProfilePhoto;

window.deleteProfilePhoto =
    deleteProfilePhoto;

window.handlePhotoClick =
    handlePhotoButtonClick;

window.logout =
    logout;

window.goToLogin =
    goToLogin;

window.goToDashboard =
    goToDashboard;

window.goToLogs =
    goToLogs;

window.goToProfile =
    goToProfile;


// ======================================================
// FINAL DEBUG MESSAGE
// ======================================================

console.log(
    "======================================================"
);

console.log(
    "AI Visibility Analyzer Profile JS loaded."
);

console.log(
    "API:",
    API_URL
);

console.log(
    "Cloudinary profile upload endpoint:",
    `${API_URL}/profile/photo`
);

console.log(
    "Profile endpoint:",
    `${API_URL}/profile`
);

console.log(
    "======================================================"
);


// ======================================================
// END OF PROFILE.JS
// ======================================================