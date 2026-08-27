// ======================================================
// AI VISIBILITY ANALYZER
// PROFILE PAGE
// ======================================================


// ======================================================
// API
// ======================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";


// ======================================================
// GLOBAL USER
// ======================================================

let currentUser = null;


// ======================================================
// DEFAULT PROFILE IMAGE
// ======================================================

const DEFAULT_PROFILE_IMAGE =
    "https://ui-avatars.com/api/?name=User&background=2563eb&color=ffffff&size=256";


// ======================================================
// DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeProfilePage();

    }
);


// ======================================================
// GET TOKEN
// ======================================================

function getAccessToken() {

    let token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        token =
            localStorage.getItem(
                "token"
            );

    }


    return token;

}


// ======================================================
// INITIALIZE
// ======================================================

async function initializeProfilePage() {

    const token =
        getAccessToken();


    if (!token) {

        showSessionExpired();

        return;

    }


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


    if (!profileCard) {

        return;

    }


    profileCard.innerHTML = `

        <div class="profile-loading">

            <span class="button-loader"></span>

            <span>
                Loading profile...
            </span>

        </div>

    `;


    try {

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


        if (!response.ok) {

            const message =
                await parseApiError(
                    response,
                    "Unable to load your profile."
                );


            throw new Error(
                message
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Profile information was not returned by the server."
            );

        }


        currentUser =
            data.user;


        renderProfile(
            currentUser
        );

    }


    catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );


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
                        "Something went wrong."
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

        return;

    }


    const name =
        user?.name ||
        "";


    const email =
        user?.email ||
        "";


    const mobile =
        user?.mobile ||
        "";


    const picture =
        user?.picture ||
        DEFAULT_PROFILE_IMAGE;


    profileCard.innerHTML = `

        <!-- =================================================
             PROFILE PHOTO
        ================================================== -->

        <div class="profile-photo-section">

            <div class="profile-photo-wrapper">

                <img
                    id="profileImage"
                    class="profile-image"
                    src="${escapeHtml(picture)}"
                    alt="Profile photo"
                    onerror="handleProfileImageError(this)"
                >


                <button
                    type="button"
                    id="changePhotoButton"
                    class="photo-button"
                    title="Change profile photo"
                    aria-label="Change profile photo"
                >
                    📷
                </button>

            </div>


            <div class="profile-photo-info">

                <h3>
                    ${escapeHtml(name || "Your Profile")}
                </h3>

                <p>
                    ${escapeHtml(email)}
                </p>

                <button
                    type="button"
                    id="changePhotoTextButton"
                    class="photo-text-button"
                >
                    Change Profile Photo
                </button>

            </div>

        </div>



        <!-- =================================================
             PERSONAL INFORMATION
        ================================================== -->

        <div class="section-title">

            <h3>
                Personal Information
            </h3>

            <p>
                Update your name, email address and mobile number.
            </p>

        </div>



        <div class="form-grid">


            <!-- NAME -->

            <div class="form-group">

                <label
                    for="profileName"
                >
                    Full Name
                </label>

                <input
                    type="text"
                    id="profileName"
                    value="${escapeHtml(name)}"
                    placeholder="Enter your full name"
                    autocomplete="name"
                    readonly
                >

            </div>



            <!-- EMAIL -->

            <div class="form-group">

                <label
                    for="profileEmail"
                >
                    Email Address
                </label>

                <input
                    type="email"
                    id="profileEmail"
                    value="${escapeHtml(email)}"
                    placeholder="Enter your email address"
                    autocomplete="email"
                    readonly
                >

            </div>



            <!-- MOBILE -->

            <div class="form-group">

                <label
                    for="profileMobile"
                >
                    Mobile Number
                    <span class="optional-label">
                        Optional
                    </span>
                </label>

                <input
                    type="tel"
                    id="profileMobile"
                    value="${escapeHtml(mobile)}"
                    placeholder="Enter your mobile number"
                    autocomplete="tel"
                    readonly
                >

                <small>
                    Mobile number is optional.
                </small>

            </div>


        </div>



        <!-- =================================================
             ACTION BUTTONS
        ================================================== -->

        <div class="profile-actions">


            <!-- EDIT -->

            <button
                type="button"
                id="editProfileButton"
                class="primary-btn"
            >
                ✏️ Edit Profile
            </button>


            <!-- CANCEL -->

            <button
                type="button"
                id="cancelProfileButton"
                class="secondary-btn hidden"
            >
                Cancel
            </button>


            <!-- SAVE -->

            <button
                type="button"
                id="saveProfileButton"
                class="primary-btn hidden"
            >

                <span class="button-text">
                    Save Changes
                </span>

                <span
                    id="saveProfileLoader"
                    class="button-loader hidden"
                ></span>

            </button>

        </div>

    `;


    attachProfileEvents();

}


// ======================================================
// ATTACH EVENTS
// ======================================================

function attachProfileEvents() {

    const editButton =
        document.getElementById(
            "editProfileButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );


    const photoButton =
        document.getElementById(
            "changePhotoButton"
        );


    const photoTextButton =
        document.getElementById(
            "changePhotoTextButton"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            enableEditMode
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelEditMode
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveProfile
        );

    }


    if (photoButton) {

        photoButton.addEventListener(
            "click",
            openProfilePhotoPicker
        );

    }


    if (photoTextButton) {

        photoTextButton.addEventListener(
            "click",
            openProfilePhotoPicker
        );

    }


    setupProfilePhotoInput();

}


// ======================================================
// ENABLE EDIT MODE
// ======================================================

function enableEditMode() {

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


    const editButton =
        document.getElementById(
            "editProfileButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );


    [
        nameInput,
        emailInput,
        mobileInput
    ].forEach(
        function (input) {

            if (input) {

                input.removeAttribute(
                    "readonly"
                );

            }

        }
    );


    if (editButton) {

        editButton.classList.add(
            "hidden"
        );

    }


    if (cancelButton) {

        cancelButton.classList.remove(
            "hidden"
        );

    }


    if (saveButton) {

        saveButton.classList.remove(
            "hidden"
        );

    }


    if (nameInput) {

        nameInput.focus();

    }

}


// ======================================================
// CANCEL EDIT
// ======================================================

function cancelEditMode() {

    if (!currentUser) {

        return;

    }


    renderProfile(
        currentUser
    );


    showMessage(
        "Changes cancelled.",
        "info"
    );

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


    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    const loader =
        document.getElementById(
            "saveProfileLoader"
        );


    const buttonText =
        saveButton?.querySelector(
            ".button-text"
        );


    if (
        !nameInput ||
        !emailInput ||
        !mobileInput
    ) {

        showMessage(
            "Profile form is unavailable.",
            "error"
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const email =
        emailInput.value.trim();


    const mobile =
        mobileInput.value.trim();



    // ==================================================
    // VALIDATE NAME
    // ==================================================

    if (!name) {

        showMessage(
            "Full name cannot be empty.",
            "error"
        );

        nameInput.focus();

        return;

    }



    // ==================================================
    // VALIDATE EMAIL
    // ==================================================

    if (!email) {

        showMessage(
            "Email address cannot be empty.",
            "error"
        );

        emailInput.focus();

        return;

    }


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



    // ==================================================
    // VALIDATE MOBILE
    // ==================================================

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



    // ==================================================
    // LOADING STATE
    // ==================================================

    if (saveButton) {

        saveButton.disabled =
            true;

    }


    if (cancelButton) {

        cancelButton.disabled =
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


    showMessage(
        "Saving profile changes...",
        "info"
    );


    try {

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
                        JSON.stringify({

                            name:
                                name,

                            email:
                                email,

                            mobile:
                                mobile ||
                                null

                        })

                }
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

            return;

        }


        if (!response.ok) {

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


        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        }

        else {

            currentUser =
                currentUser ||
                {};

            currentUser.name =
                name;

            currentUser.email =
                email;

            currentUser.mobile =
                mobile ||
                null;

        }


        renderProfile(
            currentUser
        );


        showMessage(
            data.message ||
            "Profile updated successfully.",
            "success"
        );

    }


    catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update your profile.",
            "error"
        );

    }


    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

        }


        if (cancelButton) {

            cancelButton.disabled =
                false;

        }

    }

}


// ======================================================
// PROFILE PHOTO INPUT
// ======================================================

function setupProfilePhotoInput() {

    const input =
        document.getElementById(
            "profilePhotoInput"
        );


    if (!input) {

        return;

    }


    if (
        input.dataset.listenerAttached ===
        "true"
    ) {

        return;

    }


    input.dataset.listenerAttached =
        "true";


    input.addEventListener(
        "change",
        async function () {

            const file =
                input.files &&
                input.files[0];


            if (!file) {

                return;

            }


            await handleSelectedPhoto(
                file
            );


            input.value =
                "";

        }
    );

}


// ======================================================
// OPEN PHOTO PICKER
// ======================================================

function openProfilePhotoPicker() {

    const input =
        document.getElementById(
            "profilePhotoInput"
        );


    if (!input) {

        showMessage(
            "Unable to open photo selector.",
            "error"
        );

        return;

    }


    input.value =
        "";


    input.click();

}


// ======================================================
// HANDLE SELECTED PHOTO
// ======================================================

async function handleSelectedPhoto(
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

        return;

    }


    const image =
        document.getElementById(
            "profileImage"
        );


    let oldImage =
        image
            ? image.src
            : DEFAULT_PROFILE_IMAGE;


    // --------------------------------------------------
    // Immediate preview
    // --------------------------------------------------

    const previewUrl =
        URL.createObjectURL(
            file
        );


    if (image) {

        image.src =
            previewUrl;

    }


    showMessage(
        "Uploading profile picture...",
        "info"
    );


    try {

        const data =
            await uploadProfilePhoto(
                file
            );


        const imageUrl =
            data?.picture ||
            data?.url ||
            data?.user?.picture;


        if (!imageUrl) {

            throw new Error(
                "The server did not return the uploaded profile photo."
            );

        }


        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

        }

        else {

            currentUser =
                currentUser ||
                {};

            currentUser.picture =
                imageUrl;

        }


        const profileImage =
            document.getElementById(
                "profileImage"
            );


        if (profileImage) {

            profileImage.src =
                imageUrl;

        }


        showMessage(
            data.message ||
            "Profile picture uploaded successfully.",
            "success"
        );

    }


    catch (error) {

        console.error(
            "PROFILE PHOTO ERROR:",
            error
        );


        if (image) {

            image.src =
                oldImage;

        }


        showMessage(
            error.message ||
            "Unable to upload profile picture.",
            "error"
        );

    }


    finally {

        URL.revokeObjectURL(
            previewUrl
        );

    }

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

        throw new Error(
            "Your session has expired. Please login again."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file,
        file.name
    );


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
            "Your session has expired."
        );

    }


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


    return await response.json();

}


// ======================================================
// VALIDATE IMAGE
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


    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        return {

            valid: false,

            message:
                "Profile photo must be 5 MB or smaller."

        };

    }


    return {

        valid: true

    };

}


// ======================================================
// IMAGE ERROR FALLBACK
// ======================================================

function handleProfileImageError(
    image
) {

    if (!image) {

        return;

    }


    if (
        image.dataset.fallbackApplied ===
        "true"
    ) {

        return;

    }


    image.dataset.fallbackApplied =
        "true";


    image.src =
        DEFAULT_PROFILE_IMAGE;

}


// ======================================================
// API ERROR PARSER
// ======================================================

async function parseApiError(
    response,
    fallback
) {

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

                return data.detail;

            }


            if (
                Array.isArray(
                    data.detail
                )
            ) {

                return data.detail
                    .map(
                        function (item) {

                            return (
                                item.msg ||
                                "Validation error"
                            );

                        }
                    )
                    .join(", ");

            }

        }


        if (
            data &&
            data.message
        ) {

            return data.message;

        }

    }

    catch (error) {

        console.warn(
            "Could not parse API error.",
            error
        );

    }


    return fallback;

}


// ======================================================
// POPUP MESSAGE
// ======================================================

function showMessage(
    message,
    type = "info"
) {

    removeExistingToast();


    if (!message) {

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `profile-toast ${type}`;


    let icon =
        "ℹ️";


    if (
        type === "success"
    ) {

        icon =
            "✓";

    }

    else if (
        type === "error"
    ) {

        icon =
            "⚠";

    }

    else if (
        type === "warning"
    ) {

        icon =
            "⚠";

    }


    toast.innerHTML = `

        <div class="toast-icon">
            ${icon}
        </div>

        <div class="toast-message">
            ${escapeHtml(message)}
        </div>

        <button
            type="button"
            class="toast-close"
            aria-label="Close"
        >
            ×
        </button>

    `;


    document.body.appendChild(
        toast
    );


    const close =
        toast.querySelector(
            ".toast-close"
        );


    if (close) {

        close.addEventListener(
            "click",
            function () {

                toast.remove();

            }
        );

    }


    setTimeout(
        function () {

            if (
                toast.parentNode
            ) {

                toast.classList.add(
                    "toast-hide"
                );


                setTimeout(
                    function () {

                        if (
                            toast.parentNode
                        ) {

                            toast.remove();

                        }

                    },
                    250
                );

            }

        },
        type === "error"
            ? 6000
            : 4000
    );

}


// ======================================================
// REMOVE EXISTING TOAST
// ======================================================

function removeExistingToast() {

    const existing =
        document.querySelector(
            ".profile-toast"
        );


    if (existing) {

        existing.remove();

    }

}


// ======================================================
// SESSION EXPIRED
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
// LOGIN
// ======================================================

function goToLogin() {

    window.location.href =
        "login.html";

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem(
        "access_token"
    );


    localStorage.removeItem(
        "token"
    );


    currentUser =
        null;


    window.location.href =
        "login.html";

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
// GLOBAL FUNCTIONS
// ======================================================

window.loadProfile =
    loadProfile;

window.saveProfile =
    saveProfile;

window.logout =
    logout;

window.goToLogin =
    goToLogin;

window.openProfilePhotoPicker =
    openProfilePhotoPicker;

window.handleProfileImageError =
    handleProfileImageError;

window.uploadProfilePhoto =
    uploadProfilePhoto;