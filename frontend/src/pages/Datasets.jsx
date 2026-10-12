import React, { useState } from 'react';
import { apiService } from '../services/api';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  ArrowRight,
  Download,
} from 'lucide-react';

export default function Datasets() {
  const [file, setFile] = useState(null);
  const [datasetType, setDatasetType] = useState('weather');
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setResultMessage(null);
    setErrorMessage(null);

    // Auto trigger preview
    const formData = new FormData();
    formData.append('file', selected);

    setLoadingPreview(true);
    try {
      const res = await apiService.previewCsv(formData);
      setPreviewData(res.data);
      if (res.data.detectedType && res.data.detectedType !== 'unknown') {
        setDatasetType(res.data.detectedType);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Failed to preview CSV. Ensure valid CSV formatting.'
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResultMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_type', datasetType);

    try {
      const res = await apiService.uploadCsv(formData);
      setResultMessage(res.data.message);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Failed to import CSV dataset into Cloud Firestore.'
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          CSV Dataset Management & Cloud Ingestion
        </h1>
        <p className="text-xs text-slate-500">
          Upload and validate historical timeseries CSV files to update Cloud Firestore virtual village twin (Zero IoT).
        </p>
      </div>

      {/* Upload & Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select or Drop CSV Dataset
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {file ? file.name : 'Click to Browse or Drag CSV Here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports weather, water consumption, power usage, or crop yield CSVs
              </p>
            </div>
          </div>

          {/* Dataset Type Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Digital Twin Subsystem
              </label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="weather">Weather History (weather collection)</option>
                <option value="water">Water Consumption (water_resources collection)</option>
                <option value="electricity">Electricity Load (electricity collection)</option>
                <option value="crop_yield">Crop Yield Records (crops collection)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">Pre-packaged CSV Samples</span>
              <p className="text-[11px] text-slate-500">
                You can upload any of the sample files located in the project's <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">sample_data/</code> folder:
              </p>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li>village_weather_history.csv</li>
                <li>village_water_consumption.csv</li>
                <li>village_electricity_usage.csv</li>
                <li>village_crop_yield_history.csv</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {resultMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{resultMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* CSV Preview Table */}
      {previewData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                CSV Schema Validation & Preview
              </h3>
              <p className="text-xs text-slate-500">
                Total Rows: {previewData.totalRows} • Detected Subsystem: <strong className="text-emerald-700 capitalize">{previewData.detectedType}</strong>
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Database className="w-4 h-4" />
              {importing ? 'Importing into Firestore...' : 'Confirm & Ingest into Cloud Twin'}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  {previewData.columns?.map((col, idx) => (
                    <th key={idx} className="p-3 border-b border-slate-200">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.preview?.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70">
                    {previewData.columns?.map((col, cIdx) => (
                      <td key={cIdx} className="p-3 font-medium text-slate-800">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
