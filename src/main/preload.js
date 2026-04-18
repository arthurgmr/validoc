'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAll:          ()         => ipcRenderer.invoke('documents:getAll'),
  add:             (formData) => ipcRenderer.invoke('documents:add', formData),
  delete:          (id)       => ipcRenderer.invoke('documents:delete', id),
  open:            (id)       => ipcRenderer.invoke('documents:open', id),
  saveCopy:        (id)       => ipcRenderer.invoke('documents:saveCopy', id),
  update:          (id, data) => ipcRenderer.invoke('documents:update', id, data),
  getById:         (id)       => ipcRenderer.invoke('documents:getById', id),
  openFileDialog:  ()         => ipcRenderer.invoke('dialog:openFile'),
  getAllCompanies:  ()             => ipcRenderer.invoke('companies:getAll'),
  addCompany:      (data)         => ipcRenderer.invoke('companies:add', data),
  deleteCompany:   (id)           => ipcRenderer.invoke('companies:delete', id),
  updateCompany:   (id, data)     => ipcRenderer.invoke('companies:update', id, data),

  checkForUpdates: ()   => ipcRenderer.invoke('updater:check'),
  installUpdate:   ()   => ipcRenderer.invoke('updater:install'),
  onUpdateStatus:  (cb) => ipcRenderer.on('update:status', (_e, data) => cb(data)),
});
