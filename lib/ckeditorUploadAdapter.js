export function uploadAdapter(loader) {
  return {
    upload: async () => {
      const file = await loader.file;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/question", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      return { default: data.url };
    },
  };
}

export function uploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return uploadAdapter(loader);
  };
}
