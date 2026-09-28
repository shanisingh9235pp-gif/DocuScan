// =====================================
// DOCUSCAN - GKP-S
// =====================================

let photos = [];
let currentEditIndex = -1;
let generatedBlob = null;
let generatedFileName = "";

let brightness = 100;
let contrast = 100;
let blackWhite = false;
let rotation = 0;

// =====================================
// GET ELEMENTS
// =====================================

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");

const photoList = document.getElementById("photoList");
const photoCount = document.getElementById("photoCount");
const clearAllBtn = document.getElementById("clearAllBtn");

const editor = document.getElementById("editor");
const editCanvas = document.getElementById("editCanvas");
const ctx = editCanvas ? editCanvas.getContext("2d") : null;

const rotateLeft = document.getElementById("rotateLeft");
const rotateRight = document.getElementById("rotateRight");
const cropBtn = document.getElementById("cropBtn");
const bwBtn = document.getElementById("bwBtn");

const brightnessRange = document.getElementById("brightness");
const contrastRange = document.getElementById("contrast");

const brightnessValue = document.getElementById("brightnessValue");
const contrastValue = document.getElementById("contrastValue");

const applyEditBtn = document.getElementById("applyEditBtn");

const formatSelect = document.getElementById("formatSelect");
const pageSize = document.getElementById("pageSize");
const targetSize = document.getElementById("targetSize");
const customSize = document.getElementById("customSize");

const createBtn = document.getElementById("createBtn");


const result = document.getElementById("result");
const resultInfo = document.getElementById("resultInfo");

const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

// =====================================
// FILE INPUT
// =====================================

if (cameraInput) {

cameraInput.addEventListener("change", function () {  

    addFiles(this.files);  

    this.value = "";  

});

}

if (galleryInput) {

galleryInput.addEventListener("change", function () {  

    addFiles(this.files);  

    this.value = "";  

});

}

// =====================================
// ADD FILES
// =====================================

function addFiles(fileList) {

if (!fileList || fileList.length === 0) {  
    return;  
}  

const files = Array.from(fileList);  

files.forEach(function (file) {  

    if (!file.type || !file.type.startsWith("image/")) {  
        return;  
    }  

    const reader = new FileReader();  

    reader.onload = function (event) {  

        photos.push({  

            src: event.target.result,  

            name: file.name  

        });  

        renderPhotos();  

    };  

    reader.onerror = function () {  

        console.log("Could not read file:", file.name);  

    };  

    reader.readAsDataURL(file);  

});

}

// =====================================
// RENDER PHOTOS
// =====================================

function renderPhotos() {

if (!photoList) {  
    return;  
}  

photoList.innerHTML = "";  

if (photoCount) {  
    photoCount.textContent = photos.length;  
}  


if (photos.length === 0) {  

    photoList.innerHTML = `  
        <div class="empty-message">  

            <div>📄</div>  

            <h3>No photos yet</h3>  

            <p>  
                Capture a document with camera or select photos from gallery.  
            </p>  

        </div>  
    `;  

    return;  

}  


photos.forEach(function (photo, index) {  

    const item = document.createElement("div");  

    item.className = "photo-item";  

    item.innerHTML = `  

        <div class="photo-number">  
            ${index + 1}  
        </div>  

        <img  
            src="${photo.src}"  
            alt="Page ${index + 1}"  
            class="document-photo">  

        <button  
            type="button"  
            class="delete-photo">  
            ✕  
        </button>  

    `;  


    const image = item.querySelector(".document-photo");  

    const deleteButton =  
        item.querySelector(".delete-photo");  


    if (image) {  

        image.addEventListener("click", function () {  

            openEditor(index);  

        });  

    }  


    if (deleteButton) {  

        deleteButton.addEventListener("click", function () {  

            photos.splice(index, 1);  

            renderPhotos();  

        });  

    }  


    photoList.appendChild(item);  

});

}

// =====================================
// CLEAR ALL
// =====================================

if (clearAllBtn) {

clearAllBtn.addEventListener("click", function () {  

    photos = [];  

    currentEditIndex = -1;  

    generatedBlob = null;  

    renderPhotos();  


    if (result) {  
        result.classList.add("hidden");  
    }  

});

}

// =====================================
// OPEN EDITOR
// =====================================

function openEditor(index) {

if (!photos[index] || !editCanvas) {  
    return;  
}  

currentEditIndex = index;  

brightness = 100;  

contrast = 100;  

blackWhite = false;  

rotation = 0;  


if (brightnessRange) {  
    brightnessRange.value = 100;  
}  

if (contrastRange) {  
    contrastRange.value = 100;  
}  


if (brightnessValue) {  
    brightnessValue.textContent = "100%";  
}  

if (contrastValue) {  
    contrastValue.textContent = "100%";  
}  


if (editor) {  
    editor.classList.remove("hidden");  
}  


drawEditorImage();

}

// =====================================
// LOAD IMAGE
// =====================================

function loadImage(src) {

return new Promise(function (resolve, reject) {  

    const img = new Image();  

    img.onload = function () {  

        resolve(img);  

    };  

    img.onerror = function () {  

        reject(  
            new Error("Image could not be loaded")  
        );  

    };  

    img.src = src;  

});

}

// =====================================
// DRAW EDITOR IMAGE
// =====================================

async function drawEditorImage() {

if (  
    currentEditIndex < 0 ||  
    !photos[currentEditIndex] ||  
    !editCanvas ||  
    !ctx  
) {  
    return;  
}  


try {  

    const img =  
        await loadImage(  
            photos[currentEditIndex].src  
        );  


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


    ctx.clearRect(  
        0,  
        0,  
        editCanvas.width,  
        editCanvas.height  
    );  


    ctx.filter =  
        `brightness(${brightness}%)  
         contrast(${contrast}%)  
         ${blackWhite ? "grayscale(100%)" : ""}`;  


    if (rotation === 90) {  

        ctx.translate(height, 0);  

        ctx.rotate(Math.PI / 2);  

    }  

    else if (rotation === 180) {  

        ctx.translate(width, height);  

        ctx.rotate(Math.PI);  

    }  

    else if (rotation === 270) {  

        ctx.translate(0, width);  

        ctx.rotate(-Math.PI / 2);  

    }  


    ctx.drawImage(  
        img,  
        0,  
        0,  
        width,  
        height  
    );  


    ctx.restore();  


} catch (error) {  

    console.error(error);  

}

}

// =====================================
// ROTATE LEFT
// =====================================

if (rotateLeft) {

rotateLeft.addEventListener("click", function () {  

    rotation -= 90;  

    if (rotation < 0) {  
        rotation = 270;  
    }  

    drawEditorImage();  

});

}

// =====================================
// ROTATE RIGHT
// =====================================

if (rotateRight) {

rotateRight.addEventListener("click", function () {  

    rotation += 90;  

    if (rotation >= 360) {  
        rotation = 0;  
    }  

    drawEditorImage();  

});

}

// =====================================
// BLACK & WHITE
// =====================================

if (bwBtn) {

bwBtn.addEventListener("click", function () {  

    blackWhite = !blackWhite;  

    drawEditorImage();  

});

}

// =====================================
// BRIGHTNESS
// =====================================

if (brightnessRange) {

brightnessRange.addEventListener("input", function () {  

    brightness =  
        Number(this.value);  

    if (brightnessValue) {  

        brightnessValue.textContent =  
            brightness + "%";  

    }  

    drawEditorImage();  

});

}

// =====================================
// CONTRAST
// =====================================

if (contrastRange) {

contrastRange.addEventListener("input", function () {  

    contrast =  
        Number(this.value);  

    if (contrastValue) {  

        contrastValue.textContent =  
            contrast + "%";  

    }  

    drawEditorImage();  

});

}

// =====================================
// CROP
// =====================================

if (cropBtn) {

cropBtn.addEventListener("click", function () {  

    if (  
        !editCanvas ||  
        currentEditIndex < 0  
    ) {  
        return;  
    }  


    const imageData =  
        ctx.getImageData(  
            0,  
            0,  
            editCanvas.width,  
            editCanvas.height  
        );  


    const data = imageData.data;  

    let minX = editCanvas.width;  
    let minY = editCanvas.height;  
    let maxX = 0;  
    let maxY = 0;  


    for (  
        let y = 0;  
        y < editCanvas.height;  
        y++  
    ) {  

        for (  
            let x = 0;  
            x < editCanvas.width;  
            x++  
        ) {  

            const i =  
                (y * editCanvas.width + x) * 4;  

            const r = data[i];  
            const g = data[i + 1];  
            const b = data[i + 2];  


            if (  
                r < 245 ||  
                g < 245 ||  
                b < 245  
            ) {  

                minX = Math.min(minX, x);  

                minY = Math.min(minY, y);  

                maxX = Math.max(maxX, x);  

                maxY = Math.max(maxY, y);  

            }  

        }  

    }  


    if (  
        maxX <= minX ||  
        maxY <= minY  
    ) {  

        return;  

    }  


    const cropWidth =  
        maxX - minX + 1;  

    const cropHeight =  
        maxY - minY + 1;  


    const croppedCanvas =  
        document.createElement("canvas");  


    croppedCanvas.width =  
        cropWidth;  

    croppedCanvas.height =  
        cropHeight;  


    const cropCtx =  
        croppedCanvas.getContext("2d");  


    cropCtx.drawImage(  
        editCanvas,  
        minX,  
        minY,  
        cropWidth,  
        cropHeight,  
        0,  
        0,  
        cropWidth,  
        cropHeight  
    );  


    editCanvas.width =  
        cropWidth;  

    editCanvas.height =  
        cropHeight;  


    ctx.drawImage(  
        croppedCanvas,  
        0,  
        0  
    );  

});

}

// =====================================
// APPLY EDIT
// =====================================

if (applyEditBtn) {

applyEditBtn.addEventListener("click", function () {  

    if (  
        currentEditIndex < 0 ||  
        !editCanvas  
    ) {  
        return;  
    }  


    photos[currentEditIndex].src =  
        editCanvas.toDataURL(  
            "image/jpeg",  
            0.92  
        );  


    renderPhotos();  


    if (editor) {  
        editor.classList.add("hidden");  
    }  

});

}

// =====================================
// TARGET SIZE
// =====================================

if (targetSize && customSize) {

targetSize.addEventListener("change", function () {  

    if (this.value === "custom") {  

        customSize.classList.remove("hidden");  

    } else {  

        customSize.classList.add("hidden");  

    }  

});

}

// =====================================
// CREATE DOCUMENT
// =====================================

if (createBtn) {

createBtn.addEventListener("click", function () {  

    if (photos.length === 0) {  

        alert(  
            "Please select at least one photo."  
        );  

        return;  

    }  


    const format =  
        formatSelect  
            ? formatSelect.value  
            : "jpg";  


    if (format === "png") {  

        createPNG();  

    }  

    else if (format === "jpg") {  

        createJPG();  

    }  

    else {  

        createPDF();  

    }  

});

}
// =====================================
// GET TARGET SIZE
// =====================================

function getTargetSizeKB() {

    if (!targetSize) {
        return 0;
    }

    if (targetSize.value === "best") {
        return 0;
    }

    if (targetSize.value === "custom") {

        const custom =
            Number(customSize ? customSize.value : 0);

        return custom > 0 ? custom : 0;
    }

    const selected =
        Number(targetSize.value);

    return selected > 0 ? selected : 0;
}


// =====================================
// MAKE JPG NEAR TARGET SIZE
// =====================================

async function makeJPGTarget(canvas, targetKB) {

    // Best quality mode
    if (!targetKB || targetKB <= 0) {

        return await canvasToBlob(
            canvas,
            0.92
        );
    }

    const targetBytes =
        targetKB * 1024;

    let bestBlob = null;
    let bestDifference = Infinity;

    // Different resolutions
    const scales = [
        1,
        0.90,
        0.80,
        0.70,
        0.60,
        0.50,
        0.40,
        0.32,
        0.25
    ];

    // Different JPEG qualities
    const qualities = [
        0.95,
        0.90,
        0.85,
        0.80,
        0.75,
        0.70,
        0.65,
        0.60,
        0.55,
        0.50,
        0.45,
        0.40,
        0.35,
        0.30
    ];

    for (const scale of scales) {

        let workingCanvas = canvas;

        if (scale !== 1) {

            workingCanvas =
                document.createElement("canvas");

            workingCanvas.width =
                Math.max(
                    1,
                    Math.round(canvas.width * scale)
                );

            workingCanvas.height =
                Math.max(
                    1,
                    Math.round(canvas.height * scale)
                );

            const c =
                workingCanvas.getContext("2d");

            c.drawImage(
                canvas,
                0,
                0,
                workingCanvas.width,
                workingCanvas.height
            );
        }

        for (const quality of qualities) {

            const blob =
                await canvasToBlob(
                    workingCanvas,
                    quality
                );

            if (!blob) {
                continue;
            }

            const difference =
                Math.abs(
                    blob.size - targetBytes
                );

            if (
                difference <
                bestDifference
            ) {

                bestDifference =
                    difference;

                bestBlob =
                    blob;
            }
        }
    }

    return bestBlob;
}


// =====================================
// CANVAS TO BLOB
// =====================================

function canvasToBlob(canvas, quality) {

    return new Promise(function(resolve) {

        canvas.toBlob(
            function(blob) {
                resolve(blob);
            },
            "image/jpeg",
            quality
        );

    });
}

// =====================================
// CREATE JPG - TARGET SIZE
// =====================================

async function createJPG() {

    try {

        const img = await loadImage(photos[0].src);

        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const context = canvas.getContext("2d");

        context.drawImage(img, 0, 0);

        const targetKB = getTargetSizeKB();

        const blob = await makeJPGTarget(canvas, targetKB);

        if (!blob) {
            alert("Could not create JPG.");
            return;
        }

        generatedBlob = blob;

        generatedFileName = "DocuScan-GKPS.jpg";

        showResult();

    } catch (error) {

        console.error(error);

        alert("Could not create JPG.");
    }
}

// =====================================
// CREATE PNG
// =====================================

async function createPNG() {

try {  

    const img =  
        await loadImage(  
            photos[0].src  
        );  


    const canvas =  
        document.createElement("canvas");  


    canvas.width =  
        img.width;  

    canvas.height =  
        img.height;  


    const context =  
        canvas.getContext("2d");  


    context.drawImage(  
        img,  
        0,  
        0  
    );  


    canvas.toBlob(  
        function (blob) {  

            if (!blob) {  

                alert("Could not create PNG.");  

                return;  

            }  


            generatedBlob = blob;  

            generatedFileName =  
                "DocuScan-GKPS.png";  


            showResult();  

        },  
        "image/png"  
    );  


} catch (error) {  

    console.error(error);  

    alert("Could not create PNG.");  

}

}

// =====================================
// PDF TARGET SIZE HELPERS
// =====================================

function createJPEGBlob(canvas, quality) {

    return new Promise(function(resolve) {

        canvas.toBlob(
            function(blob) {
                resolve(blob);
            },
            "image/jpeg",
            quality
        );

    });
}


async function makePDFWithSettings(
    jsPDF,
    selectedPageSize,
    imageQuality,
    scale
) {

    let pdf;

    if (selectedPageSize === "letter") {

        pdf = new jsPDF(
            "p",
            "mm",
            "letter"
        );

    } else {

        pdf = new jsPDF(
            "p",
            "mm",
            "a4"
        );
    }


    for (
        let i = 0;
        i < photos.length;
        i++
    ) {

        const img =
            await loadImage(
                photos[i].src
            );


        // Resize image for compression
        const canvas =
            document.createElement("canvas");


        canvas.width =
            Math.max(
                1,
                Math.round(img.width * scale)
            );


        canvas.height =
            Math.max(
                1,
                Math.round(img.height * scale)
            );


        const c =
            canvas.getContext("2d");


        c.fillStyle = "#ffffff";

        c.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        c.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
        );


        const jpegBlob =
            await createJPEGBlob(
                canvas,
                imageQuality
            );


        if (!jpegBlob) {
            continue;
        }


        const imageData =
            await blobToDataURL(
                jpegBlob
            );


        const pageWidth =
            pdf.internal.pageSize.getWidth();


        const pageHeight =
            pdf.internal.pageSize.getHeight();


        const margin = 10;


        let imageWidth =
            pageWidth - margin * 2;


        let imageHeight =
            (canvas.height / canvas.width)
            * imageWidth;


        if (
            imageHeight >
            pageHeight - margin * 2
        ) {

            imageHeight =
                pageHeight - margin * 2;


            imageWidth =
                (canvas.width / canvas.height)
                * imageHeight;
        }


        const x =
            (pageWidth - imageWidth) / 2;


        const y =
            (pageHeight - imageHeight) / 2;


        if (i > 0) {
            pdf.addPage();
        }


        pdf.addImage(
            imageData,
            "JPEG",
            x,
            y,
            imageWidth,
            imageHeight,
            undefined,
            "NONE"
        );
    }


    return pdf.output("blob");
}


function blobToDataURL(blob) {

    return new Promise(function(resolve, reject) {

        const reader =
            new FileReader();

        reader.onloadend =
            function() {
                resolve(reader.result);
            };

        reader.onerror =
            reject;

        reader.readAsDataURL(blob);

    });
}


// =====================================
// CREATE PDF - TARGET SIZE
// =====================================

async function createPDF() {

    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "PDF engine is not loaded. Please add jsPDF to GKP.html."
        );

        return;
    }


    try {

        const {
            jsPDF
        } = window.jspdf;


        const selectedPageSize =
            pageSize
                ? pageSize.value
                : "a4";


        const targetKB =
            getTargetSizeKB();


        // =================================
        // BEST QUALITY
        // =================================

        if (
            !targetKB ||
            targetKB <= 0
        ) {

            generatedBlob =
                await makePDFWithSettings(
                    jsPDF,
                    selectedPageSize,
                    1.00,
                    1
                );


            generatedFileName =
                "DocuScan-GKPS.pdf";


            showResult();

            return;
        }


        const targetBytes =
            targetKB * 1024;


        let bestBlob = null;

        let bestDifference =
            Infinity;


        // =================================
        // COMPRESSION LEVELS
        // =================================

        const settings = [

            // High quality
            {
                quality: 0.90,
                scale: 1.00
            },

            {
                quality: 0.80,
                scale: 0.90
            },

            {
                quality: 0.70,
                scale: 0.80
            },

            {
                quality: 0.60,
                scale: 0.70
            },

            {
                quality: 0.50,
                scale: 0.60
            },

            {
                quality: 0.45,
                scale: 0.50
            },

            {
                quality: 0.40,
                scale: 0.42
            },

            {
                quality: 0.35,
                scale: 0.35
            },

            {
                quality: 0.30,
                scale: 0.28
            },

            {
                quality: 0.25,
                scale: 0.22
            },

            {
                quality: 0.20,
                scale: 0.18
            },

            {
                quality: 0.15,
                scale: 0.14
            }
        ];


        // =================================
        // FIND CLOSEST SIZE
        // =================================

        for (
            const setting of settings
        ) {

            const blob =
                await makePDFWithSettings(
                    jsPDF,
                    selectedPageSize,
                    setting.quality,
                    setting.scale
                );


            if (!blob) {
                continue;
            }


            const difference =
                Math.abs(
                    blob.size -
                    targetBytes
                );


            if (
                difference <
                bestDifference
            ) {

                bestDifference =
                    difference;

                bestBlob =
                    blob;
            }


            // Once we are below target,
            // this is a valid result.
            if (
                blob.size <=
                targetBytes
            ) {

                break;
            }
        }


        if (!bestBlob) {

            alert(
                "Could not create PDF."
            );

            return;
        }


        generatedBlob =
            bestBlob;


        generatedFileName =
            "DocuScan-GKPS.pdf";


        showResult();


    } catch (error) {

        console.error(error);

        alert(
            "Could not create PDF."
        );
    }
}

// =====================================
// SHOW RESULT
// =====================================

function showResult() {

if (!result || !resultInfo) {  
    return;  
}  


const sizeKB =  
    generatedBlob  
        ? (generatedBlob.size / 1024)  
            .toFixed(1)  
        : "0";  


resultInfo.textContent =  
    `${generatedFileName} • ${sizeKB} KB`;  


result.classList.remove("hidden");

}

// =====================================
// DOWNLOAD
// =====================================

if (downloadBtn) {

downloadBtn.addEventListener("click", function () {  

    if (!generatedBlob) {  
        return;  
    }  


    const url =  
        URL.createObjectURL(  
            generatedBlob  
        );  


    const a =  
        document.createElement("a");  


    a.href = url;  

    a.download =  
        generatedFileName;  


    document.body.appendChild(a);  

    a.click();  

    a.remove();  


    setTimeout(function () {  

        URL.revokeObjectURL(url);  

    }, 1000);  

});

}

// =====================================
// SHARE
// =====================================

if (shareBtn) {

shareBtn.addEventListener("click", async function () {  

    if (!generatedBlob) {  
        return;  
    }  


    const file =  
        new File(  
            [generatedBlob],  
            generatedFileName,  
            {  
                type:  
                    generatedBlob.type  
            }  
        );  


    if (  
        navigator.share &&  
        navigator.canShare &&  
        navigator.canShare({  
            files: [file]  
        })  
    ) {  

        try {  

            await navigator.share({  

                files: [file],  

                title: "DocuScan",  

                text:  
                    "Created with DocuScan by GKP-S"  

            });  

        } catch (error) {  

            console.log(  
                "Share cancelled."  
            );  

        }  

    } else {  

        alert(  
            "Sharing is not supported on this browser."  
        );  

    }  

});

}

// =====================================
// INITIAL DISPLAY
// =====================================

renderPhotos();
