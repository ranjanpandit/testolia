const STORAGE_KEY = "saved_forms";

export function getForms() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveForm(form) {
  const forms = getForms();

  // if editing, replace
  const index = forms.findIndex((f) => f.id === form.id);
  if (index >= 0) {
    forms[index] = form;
  } else {
    forms.push(form);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  return form;
}

export function deleteForm(id) {
  const updated = getForms().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getFormById(id) {
  return getForms().find((f) => f.id === id);
}
