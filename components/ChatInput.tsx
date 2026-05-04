"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Mic, MicOff, ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { text: transcribed } = await res.json();
        if (transcribed) {
          setText((prev) => (prev ? prev + " " + transcribed : transcribed));
          textareaRef.current?.focus();
        }
      }
    } catch {
      // Transcription unavailable — user can type instead
    } finally {
      setIsTranscribing(false);
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl px-4 py-3 flex items-end gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 12px rgba(28,26,24,0.06)",
      }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={
          isTranscribing
            ? "Transcrevendo áudio..."
            : isRecording
            ? "Gravando... clique no microfone para parar."
            : "Compartilhe o que sente..."
        }
        disabled={disabled || isRecording || isTranscribing}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:opacity-50 py-1"
        style={{
          color: "var(--foreground)",
          fontFamily: "var(--font-inter)",
          maxHeight: "160px",
        }}
      />

      {/* Mic button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isTranscribing}
        title={isRecording ? "Parar gravação" : "Falar"}
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isRecording ? "recording-pulse" : ""
        }`}
        style={{
          background: isRecording ? "var(--accent)" : "var(--accent-light)",
          color: isRecording ? "#fff" : "var(--accent)",
          cursor: disabled || isTranscribing ? "not-allowed" : "pointer",
          opacity: disabled || isTranscribing ? 0.5 : 1,
        }}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        title="Enviar"
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: canSend ? "var(--accent)" : "var(--accent-light)",
          color: canSend ? "#fff" : "var(--accent)",
          cursor: canSend ? "pointer" : "not-allowed",
          opacity: canSend ? 1 : 0.4,
        }}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}
