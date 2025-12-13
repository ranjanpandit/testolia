const STORAGE_KEY = "form_builder_schema";

export const saveSchema = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadSchema = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearSchema = () => {
  localStorage.removeItem(STORAGE_KEY);
};
