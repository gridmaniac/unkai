export const useFileUpload = (uploadFile: (content: string) => void) => {
  const onFileUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        uploadFile(content);
      }
    };

    reader.readAsDataURL(file);
  };

  return {
    onFileUpload,
  };
};
