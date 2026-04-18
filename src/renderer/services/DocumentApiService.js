async function callApi(promise) {
  const res = await promise;
  if (res && res.ok === false) {
    const err = new Error(res.message);
    err.code = res.code;
    throw err;
  }
  return res?.data ?? res;
}

export const DocumentApiService = {
  getAll:   ()          => callApi(window.api.getAll()),
  add:      (data)      => callApi(window.api.add(data)),
  delete:   (id)        => callApi(window.api.delete(id)),
  open:     (id)        => callApi(window.api.open(id)),
  saveCopy: (id)        => callApi(window.api.saveCopy(id)),
  update:   (id, data)  => callApi(window.api.update(id, data)),
  getById:  (id)        => callApi(window.api.getById(id)),
};
