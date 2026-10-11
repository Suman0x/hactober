"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, fileName: string) => void;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser. Please use Chrome, Edge, or Safari.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please enable camera access in your browser settings."
          : err.message || "Failed to initialize camera."
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    const fileName = `bench-capture-${Date.now()}.jpg`;

    stopCamera();
    onCapture(dataUrl, fileName);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0c1019] shadow-2xl overflow-hidden font-sans">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#07090f] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-mono text-xs font-bold text-zinc-100">
                Live Circuit Viewfinder
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">
                Align breadboard / PCB under direct lighting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono transition-colors"
              title="Flip Camera (Front / Rear)"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Flip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Viewport Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-zinc-400 max-w-md space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-200">Camera Unavailable</h4>
              <p className="text-xs text-zinc-400">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Permission</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="h-full w-full object-cover"
              />

              {/* Viewfinder Reticle Overlays */}
              <div className="absolute inset-6 border border-sky-400/30 rounded-xl pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-400" />
              </div>

              {/* Crosshair Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 border border-sky-400/40 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-mono text-zinc-300">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2 text-sky-400" />
                  Activating optical sensor...
                </div>
              )}
            </>
          )}
        </div>

        {/* Shutter Action Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-[#07090f] px-6 py-4">
          <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
            Mode: <span className="text-zinc-300">{facingMode === "environment" ? "Rear Lens" : "User Webcam"}</span>
          </div>

          <button
            type="button"
            disabled={Boolean(cameraError || isInitializing)}
            onClick={handleTakePhoto}
            className="mx-auto sm:mx-0 flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-zinc-950 px-6 py-2.5 text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            <span>Snap Circuit Photo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
