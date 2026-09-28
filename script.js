/* =========================================
   DocuScan - GKP-S
   Photo Manager + Basic Editor
========================================= */

let photos = [];
let currentEditIndex = null;

let brightness = 100;
let contrast = 100;
let blackWhite = false;
let rotation = 0;


/* =========================================
   ELEMENTS
========================================= */

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");

const photoList = document.getElementById("photoList");
const photoCount = document.getElementById("photoCount");
const emptyMessage = document.getElementById("emptyMessage");

const clearAllBtn = document.getElementById("clearAllBtn");

const editor = document.getElementById("editor");
const editCanvas = document.getElementById("editCanvas");

const rotateLeft = document.getElementById("rotateLeft");
const rotateRight = document.getElementById("rotateRight");
const cropBtn = document.getElementById("cropBtn");
const bwBtn = document.getElementById("bwBtn");
const applyEditBtn = document.getElementById("applyEditBtn");

const brightnessSlider = document.getElementById("brightness");
const contrastSlider = document.getElementById("contrast");

const brightnessValue = document.getElementById("brightnessValue");
const contrastValue = document.getElementById("contrastValue");

const targetSize = document.getElementById("targetSize");
const customSize = document.getElementById("customSize");

const createBtn = document.getElementById("createBtn");

const result = document.getElementById("result");
const resultInfo = document.getElementById("resultInfo");

const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");


/* =========================================
   CAMERA
========================================= */

cameraInput.addEventListener("change", function () {

    if (this.files.length > 0) {
        addFiles(this.files);
    }

    this.value = "";
});


/* =========================================
   GALLERY
========================================= */

galleryInput.addEventListener("change", function () {

    if (this.files.length > 0) {
        addFiles(this.files);
    }

    this.value = "";
});


/* =========================================
   ADD PHOTOS
========================================= */

function addFiles(files) {

    const imageFiles = Array.from(files)
        .filter(file => file.type.startsWith("image/"));

    imageFiles.forEach(file => {

        const reader = new FileReader();

        reader.onload = function (event) {

            photos.push({
                src: event.target.result,
                name: file.name
            });

            renderPhotos();

        };

        reader.readAsDataURL(file);
    });
}


/* =========================================
   SHOW PHOTOS
========================================= */

function renderPhotos() {

    photoList.innerHTML = "";

    photoCount.textContent = photos.length;

    if (photos.length === 0) {

        photoList.appendChild(emptyMessage);

        return;
    }

    photos.forEach((photo, index) => {

        const item = document.createElement("div");

        item.className = "photo-item";

        item.draggable = true;

        item.dataset.index = index;


        const img = document.createElement("img");

        img.src = photo.src;


        const number = document.createElement("div");

        number.className = "page-number";

        number.textContent = "Page " + (index + 1);


        const deleteBtn = document.createElement("button");

        deleteBtn.className = "delete-photo";

        deleteBtn.textContent = "×";

        deleteBtn.title = "Delete";


        deleteBtn.addEventListener("click", function (event) {

            event.stopPropagation();

            photos.splice(index, 1);

            renderPhotos();

        });


        item.appendChild(img);

        item.appendChild(number);

        item.appendChild(deleteBtn);


        item.addEventListener("click", function () {

            openEditor(index);

        });


        /* DRAG & DROP */

        item.addEventListener("dragstart", function (event) {

            event.dataTransfer.setData(
                "text/plain",
                index
            );

        });


        item.addEventListener("dragover", function (event) {

            event.preventDefault();

        });


        item.addEventListener("drop", function (event) {

            event.preventDefault();

            const oldIndex =
                Number(event.dataTransfer.getData("text/plain"));

            const newIndex = index;

            if (oldIndex === newIndex) return;


            const movedPhoto = photos.splice(oldIndex, 1)[0];

            photos.splice(newIndex, 0, movedPhoto);

            renderPhotos();

        });


        photoList.appendChild(item);

    });
}


/* =========================================
   CLEAR ALL
========================================= */

clearAllBtn.addEventListener("click", function () {

    if (photos.length === 0) return;

    const confirmClear =
        confirm("Remove all selected photos?");

    if (confirmClear) {

        photos = [];

        editor.classList.add("hidden");

        result.classList.add("hidden");

        renderPhotos();

    }
});


/* =========================================
   OPEN EDITOR
========================================= */

function openEditor(index) {

    currentEditIndex = index;

    brightness = 100;
    contrast = 100;
    blackWhite = false;
    rotation = 0;

    brightnessSlider.value = 100;
    contrastSlider.value = 100;

    brightnessValue.textContent = "100%";
    contrastValue.textContent = "100%";

    editor.classList.remove("hidden");

    drawEditorImage();

    editor.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================================
   DRAW EDITOR
========================================= */

function drawEditorImage() {

    if (currentEditIndex === null) return;

    const photo = photos[currentEditIndex];

    const img = new Image();

    img.onload = function () {

        const ctx = editCanvas.getContext("2d");

        let width = img.width;
        let height = img.height;


        if (rotation === 90 || rotation === 270) {

            editCanvas.width = height;
            editCanvas.height = width;

        } else {

            editCanvas.width = width;
            editCanvas.height = height;

        }


        ctx.save();

        ctx.translate(
            editCanvas.width / 2,
            editCanvas.height / 2
        );


        if (rotation === 90) {

            ctx.rotate(Math.PI / 2);

        }

        if (rotation === 180) {

            ctx.rotate(Math.PI);

        }

        if (rotation === 270) {

            ctx.rotate(3 * Math.PI / 2);

        }


        ctx.filter =
            "brightness(" + brightness + "%) " +
            "contrast(" + contrast + "%)";


        if (blackWhite) {

            ctx.filter += " grayscale(100%)";

        }


        ctx.drawImage(
            img,
            -width / 2,
            -height / 2,
            width,
            height
        );


        ctx.restore();

    };

    img.src = photo.src;
}


/* =========================================
   BRIGHTNESS
========================================= */

brightnessSlider.addEventListener("input", function () {

    brightness = Number(this.value);

    brightnessValue.textContent =
        brightness + "%";

    drawEditorImage();

});


/* =========================================
   CONTRAST
========================================= */

contrastSlider.addEventListener("input", function () {

    contrast = Number(this.value);

    contrastValue.textContent =
        contrast + "%";

    drawEditorImage();

});


/* =========================================
   ROTATE LEFT
========================================= */

rotateLeft.addEventListener("click", function () {

    rotation -= 90;

    if (rotation < 0) {
        rotation = 270;
    }

    drawEditorImage();

});


/* =========================================
   ROTATE RIGHT
========================================= */

rotateRight.addEventListener("click", function () {

    rotation += 90;

    if (rotation >= 360) {
        rotation = 0;
    }

    drawEditorImage();

});


/* =========================================
   BLACK & WHITE
========================================= */

bwBtn.addEventListener("click", function () {

    blackWhite = !blackWhite;

    drawEditorImage();

});


/* =========================================
   CROP
========================================= */

cropBtn.addEventListener("click", function () {

    if (currentEditIndex === null) return;

    const canvas = editCanvas;

    const ctx = canvas.getContext("2d");

    const cropWidth = Math.floor(canvas.width * 0.9);

    const cropHeight = Math.floor(canvas.height * 0.9);

    const startX =
        Math.floor((canvas.width - cropWidth) / 2);

    const startY =
        Math.floor((canvas.height - cropHeight) / 2);


    const imageData =
        ctx.getImageData(
            startX,
            startY,
            cropWidth,
            cropHeight
        );


    canvas.width = cropWidth;

    canvas.height = cropHeight;

    ctx.putImageData(
        imageData,
        0,
        0
    );

});


/* =========================================
   APPLY EDIT
========================================= */

applyEditBtn.addEventListener("click", function () {

    if (currentEditIndex === null) return;

    const finalImage =
        editCanvas.toDataURL(
            "image/jpeg",
            0.92
        );


    photos[currentEditIndex].src =
        finalImage;


    renderPhotos();

    editor.classList.add("hidden");

    currentEditIndex = null;

});


/* =========================================
   TARGET SIZE
========================================= */

targetSize.addEventListener("change", function () {

    if (this.value === "custom") {

        customSize.classList.remove("hidden");

    } else {

        customSize.classList.add("hidden");

    }

});


/* =========================================
   CREATE DOCUMENT
========================================= */

createBtn.addEventListener("click", function () {

    if (photos.length === 0) {

        alert("Please select at least one photo.");

        return;
    }


    const format =
        document.getElementById("formatSelect").value;


    let selectedSize =
        targetSize.value;


    if (selectedSize === "custom") {

        selectedSize =
            Number(customSize.value);

        if (!selectedSize || selectedSize < 10) {

            alert("Please enter a valid target size.");

            return;
        }

    }


    /*
       PDF/JPG/PNG generation engine
       will be added in the next step.
    */

    result.classList.remove("hidden");

    resultInfo.textContent =
        photos.length +
        " photo(s) ready. Format: " +
        format.toUpperCase() +
        ". Target: " +
        (selectedSize === "best"
            ? "Best Quality"
            : selectedSize + " KB");

    result.scrollIntoView({
        behavior: "smooth"
    });

});


/* =========================================
   DOWNLOAD
========================================= */

downloadBtn.addEventListener("click", function () {

    alert(
        "Download engine will be connected in the PDF/JPG/PNG step."
    );

});


/* =========================================
   SHARE
========================================= */

shareBtn.addEventListener("click", function () {

    alert(
        "Share engine will be connected in the PDF/JPG/PNG step."
    );

});


/* =========================================
   INITIAL DISPLAY
========================================= */

renderPhotos();