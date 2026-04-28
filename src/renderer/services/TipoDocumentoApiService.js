async function callApi(promise) {
  const res = await promise;
  if (res && res.ok === false) {
    const err = new Error(res.message);
    err.code = res.code;
    throw err;
  }
  return res?.data ?? res;
}

export const TipoDocumentoApiService = {
  getAll:  ()          => callApi(window.api.getTipos()),
  add:     (data)      => callApi(window.api.addTipo(data)),
  update:  (id, data)  => callApi(window.api.updateTipo(id, data)),
  delete:  (id)        => callApi(window.api.deleteTipo(id)),
};
