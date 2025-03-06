const Locale = {
  Copy: {
    Success: "复制成功",
    Failed: "复制失败"
  }
};

function showToast(message: string) {
  // 简单的 alert 实现，之后可以替换成更好的 toast 组件
  alert(message);
}

export async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(Locale.Copy.Success);
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        showToast(Locale.Copy.Success);
      } catch (error) {
        showToast(Locale.Copy.Failed);
      }
      document.body.removeChild(textArea);
    }
  }
  