document.addEventListener("DOMContentLoaded", () => {
    const uploadedImageButton = document.getElementById("file-input-label");
    uploadedImageButton.addEventListener("click", function() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                const file = files[0];
                displayImage(file);
            }
        };
        input.click();
    });

    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "uploadedImage";
            const displayImageDiv = document.querySelector(".upload-container");
            displayImageDiv.innerHTML = "";
            displayImageDiv.appendChild(img);

            const submitButton = document.createElement("button");
            submitButton.innerHTML = "Submit";
            submitButton.className = "button-10";
            displayImageDiv.appendChild(submitButton);

            submitButton.addEventListener("click", () => {
                removeBackground(file);
            });
        };
        reader.readAsDataURL(file);
    }

    function removeBackground(file) {
        const formData = new FormData();
        formData.append("image_file", file);
        formData.append("size", "auto");

        fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                "X-Api-Key": "LezNndwitZg7BiJTRocRPQXC",
            },
            body: formData,
        })
        .then((response) => response.blob())
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            displayEditedImage(url);
        })
        .catch(error => {
            console.error("error:", error);
        });
    }

    function displayEditedImage(url) {
        const displayImageDiv = document.querySelector(".upload-container");
        displayImageDiv.innerHTML = "";

        const editedImg = document.createElement("img");
        editedImg.src = url;
        editedImg.alt = "Edited Image";
        editedImg.className = "uploaded-image";

        displayImageDiv.appendChild(editedImg);

        const downloadButton = document.createElement("a");
        downloadButton.href = url;
        downloadButton.download = "edited-image.png";
        downloadButton.innerHTML = "Download";
        downloadButton.className = "submit-button";
        downloadButton.style.textDecoration = "none";

        displayImageDiv.appendChild(downloadButton);

        const editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.className = "button-10";

        displayImageDiv.appendChild(editButton);

        editButton.addEventListener("click", () => {
            enableEditing(url, downloadButton);
        });
    }

    function enableEditing(url, downloadButton) {
        const displayImageDiv = document.querySelector(".upload-container");
        displayImageDiv.innerHTML = "";

        const canvasElement = document.createElement("canvas");
        canvasElement.id = "canvas";
        displayImageDiv.appendChild(canvasElement);
        displayImageDiv.appendChild(downloadButton);

        const submitCanvasButton = document.createElement("button");
        submitCanvasButton.innerHTML = "Submit";
        submitCanvasButton.className = "button-10";
        displayImageDiv.appendChild(submitCanvasButton);

        const fabricCanvas = new fabric.Canvas('canvas', { isDrawingMode: false });

        fabric.Image.fromURL(url, (img) => {
            fabricCanvas.setWidth(img.width);
            fabricCanvas.setHeight(img.height);
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));

            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.width = 25; // Set the brush width for erasing
            fabricCanvas.freeDrawingBrush.color = "rgba(144, 238, 144, 0.5)";
        });

        submitCanvasButton.addEventListener("click", () => {
            const editedImage = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1
            });
            removeBgFromCanvasImage(editedImage, downloadButton);
        });

        downloadButton.addEventListener("click", () => {
            const editedImage = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1
            });
            downloadButton.href = editedImage;
        });
    }

    function removeBgFromCanvasImage(imageData) {
        const apiKey = 'LezNndwitZg7BiJTRocRPQXC'; 
        const base64Data = imageData.split(',')[1];

        fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey
            },
            body: JSON.stringify({
                image_file_b64: base64Data
            })
        })
        .then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "Edited Image";

            const displayImageDiv = document.querySelector(".upload-container");
            displayImageDiv.innerHTML = "";
            displayImageDiv.appendChild(img);

            const downloadButton = document.createElement("a");
            downloadButton.href = imageUrl;
            downloadButton.download = "edited-image.png";
            downloadButton.innerHTML = "Download";
            downloadButton.className = "submit-button";
            downloadButton.style.textDecoration = "none";
            displayImageDiv.appendChild(downloadButton);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
