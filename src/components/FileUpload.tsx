import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  } as any);

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border border-dashed border-zinc-300 rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 group",
            isDragActive ? "bg-amber-50/40 border-amber-500" : ""
          )}
        >
          <input {...getInputProps()} />
          <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Upload className="w-5 h-5 text-zinc-500 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="text-zinc-700 font-medium text-xs tracking-wide text-center">
            {isDragActive ? "Solte agora!" : "Arraste um PDF científico ou clique para enviar"}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1.5 font-normal">Formatos suportados: PDF ou TXT (até 10MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-800 truncate max-w-[180px]">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-zinc-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="p-1 px-1.5 bg-zinc-50 hover:bg-zinc-100 hover:text-red-600 border border-zinc-200 rounded-lg transition-all text-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
