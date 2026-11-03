/**
 * Safe universal clipboard copy utility.
 * Works across HTTPS, localhost, iframes, mobile, and legacy browsers.
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // 1. Try modern navigator.clipboard API if available in secure context
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, using fallback:", err);
    }
  }

  // 2. Reliable fallback using hidden textarea + execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error("execCommand fallback failed:", fallbackErr);
    return false;
  }
}

