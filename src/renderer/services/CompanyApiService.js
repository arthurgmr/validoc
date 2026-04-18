async function callApi(promise) {
  const res = await promise;
  if (res && res.ok === false) {
    const err = new Error(res.message);
    err.code = res.code;
    throw err;
  }
  return res?.data ?? res;
}

export const CompanyApiService = {
  getAll:         ()          => callApi(window.api.getAllCompanies()),
  add:            (data)      => callApi(window.api.addCompany(data)),
  delete:         (id)        => callApi(window.api.deleteCompany(id)),
  update:         (id, data)  => callApi(window.api.updateCompany(id, data)),
  openFileDialog: ()          => window.api.openFileDialog(),
};
