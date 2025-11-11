"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, generateNextJs } from "../../services/PdfApi";

const PdfConverter: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please choose a PDF before submitting.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setStatus("Uploading file…");

      const uploadResponse = await uploadFile(selectedFile);
      const extractedText = uploadResponse.extracted_text;
      if (!extractedText) {
        throw new Error("Extraction returned empty text.");
      }

      setStatus("Generating component from extracted text…");
      const nextJsResponse = await generateNextJs(extractedText);
      const generatedCode = nextJsResponse.code?.code;
      if (!generatedCode) {
        throw new Error("Generation returned empty code.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("codePreview.initialCode", generatedCode);
        sessionStorage.setItem(
          "codePreview.warnings",
          JSON.stringify(nextJsResponse.validation_warnings || []),
        );
        sessionStorage.setItem(
          "codePreview.metadata",
          JSON.stringify({
            filename: uploadResponse.filename || selectedFile.name,
            uploadedAt: new Date().toISOString(),
          }),
        );
      }

      setStatus("Opening editor…");
      router.push("/pages/CodePreview");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100"
        >
          <h1 className="text-2xl font-semibold text-gray-900">
            Upload a PDF and generate its editable template
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We’ll extract the text, build the Tailwind-based Next.js component,
            and open it in the live editor for you.
          </p>

          <label className="mt-6 block text-sm font-medium text-gray-700">
            Select PDF
          </label>
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            className="mt-2 w-full cursor-pointer rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              Error: {error}
            </p>
          )}

          {status && (
            <p className="mt-3 text-sm text-indigo-600">{status}</p>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-6 inline-flex w-full items-center justify-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isProcessing ? "Processing…" : "Upload & Generate"}
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Need a fresh start? You can always tweak the generated code inside
            the editor once it opens.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PdfConverter;

