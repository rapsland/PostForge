document.addEventListener("DOMContentLoaded", () => {
  const captureBtn = document.getElementById("capture-btn");
  const copyBtn = document.getElementById("copy-btn");
  const canvas = document.getElementById("screenshot-canvas");
  const bgColorInput = document.getElementById("bg-color");
  const paddingSlider = document.getElementById("padding-slider");
  const radiusSlider = document.getElementById("radius-slider");

  let originalImage = null;

  function renderCanvas() {
    if (!originalImage) return;

    const ctx = canvas.getContext("2d");
    const padding = parseInt(paddingSlider.value);
    const radius = parseInt(radiusSlider.value);
    const bgColor = bgColorInput.value;

    const imgWidth = originalImage.width;
    const imgHeight = originalImage.height;

    canvas.width = imgWidth + (padding * 2);
    canvas.height = imgHeight + (padding * 2);

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw rounded image with shadow
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(padding, padding, imgWidth, imgHeight, radius);
    ctx.clip();
    ctx.drawImage(originalImage, padding, padding);
    ctx.restore();
  }

  captureBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "CAPTURE_TAB" }, (res) => {
      if (res && res.success) {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          renderCanvas();
          copyBtn.disabled = false;
        };
        img.src = res.dataUrl;
      }
    });
  });

  bgColorInput.addEventListener("input", renderCanvas);
  paddingSlider.addEventListener("input", renderCanvas);
  radiusSlider.addEventListener("input", renderCanvas);

  copyBtn.addEventListener("click", () => {
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        copyBtn.textContent = "Kopiert! ✓";
        setTimeout(() => copyBtn.textContent = "Kopieren", 2000);
      } catch (err) {
        alert("Kopieren fehlgeschlagen: " + err);
      }
    });
  });
});
