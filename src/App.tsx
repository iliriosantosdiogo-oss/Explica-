import React, { useState } from "react";
import { Book, GraduationCap, Sparkles, Mic2, Download, RefreshCw, AlertCircle, Smile, Music, Code } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { FileUpload } from "./components/FileUpload";
import { AudioPlayer } from "./components/AudioPlayer";
import { LoadingExperience } from "./components/LoadingExperience";
import { generateExplanationAndScript, generatePodcastAudio, PodcastScriptEntry } from "./lib/gemini";
import { pcmToWav } from "./lib/audioUtils";
import { cn } from "./lib/utils";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [script, setScript] = useState<PodcastScriptEntry[] | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "explaining" | "scripting" | "audio" | "ready">("idle");
  const [host1Name, setHost1Name] = useState("Jandira");
  const [host2Name, setHost2Name] = useState("Diogo");
  const [jandiraVoice, setJandiraVoice] = useState("Kore");
  const [diogoVoice, setDiogoVoice] = useState("Zephyr");

  const voices = [
    { name: "Kore", label: "Kore (Feminina)" },
    { name: "Leda", label: "Leda (Feminina)" },
    { name: "Aoede", label: "Aoede (Feminina)" },
    { name: "Zephyr", label: "Zephyr (Masculina)" },
    { name: "Charon", label: "Charon (Masculina)" },
    { name: "Icarus", label: "Icarus (Masculina)" },
    { name: "Puck", label: "Puck (Masculina)" },
    { name: "Fenrir", label: "Fenrir (Masculina)" },
  ];

  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [history, setHistory] = useState<{id: string, title: string, content: string, audioUrl?: string}[]>(() => {
    const saved = localStorage.getItem("explica_history");
    return saved ? JSON.parse(saved) : [];
  });

  const saveToHistory = (title: string, content: string, audioUrl?: string) => {
    const newItem = { id: Date.now().toString(), title, content, audioUrl };
    const newHistory = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(newHistory);
    localStorage.setItem("explica_history", JSON.stringify(newHistory));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!inputText && !file) {
      setError("Por favor, escreva algo ou envie um arquivo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setScript(null);
    setAudioUrl(null);
    setFeedback(null);
    
    try {
      let contentInput: string | { data: string; mimeType: string };
      
      if (file) {
        setStep("explaining");
        const base64Data = await fileToBase64(file);
        contentInput = { data: base64Data, mimeType: file.type };
      } else {
        setStep("explaining");
        contentInput = inputText;
      }

      // Step 1: Unified Generation (Explanation + Script)
      setStep("explaining");
      const { explanation: exp, script: podcastScript } = await generateExplanationAndScript(contentInput, host1Name, host2Name);
      
      if (!exp) throw new Error("Não foi possível gerar a explicação.");
      setExplanation(exp);
      setScript(podcastScript);

      const shortTitle = inputText.slice(0, 30) || (file ? file.name : "Novo Estudo");

      // Step 2: Audio Generation
      setStep("audio");
      const audioBytes = await generatePodcastAudio(podcastScript, host1Name, jandiraVoice, host2Name, diogoVoice);
      const wavBlob = pcmToWav(audioBytes);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

      saveToHistory(shortTitle, exp, url);
      setStep("ready");
    } catch (err: any) {
      console.error(err);
      setError("Ocorreu um erro ao processar sua solicitação. Tente novamente.");
      setStep("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!explanation) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header & Logo Style (Refined & Minimalist Academic style)
    doc.setFillColor(24, 24, 27); // Charcoal Slate
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EXPLICA+", margin, 24);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(161, 161, 170);
    doc.text("SÍNTESE ACADÊMICA ATIVA • MÉTODO INTELECTUAL EXPANDIDO", margin, 31);

    let y = 55;

    // Main Explanation
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Síntese Explicativa Integrada", margin, y);
    y += 10;
    
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(63, 63, 70);
    const splitExplanation = doc.splitTextToSize(explanation, pageWidth - (margin * 2));
    doc.text(splitExplanation, margin, y);
    y += (splitExplanation.length * 5.5) + 15;

    // Check for page overflow
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 30;
    }

    // Mental Map / Key Points
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. Axiomas e Estrutura de Fixação", margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 82, 91);
    const bulletPoints = explanation.split(".").slice(0, 4).map(s => `• ${s.trim()}`);
    bulletPoints.forEach(point => {
      if (point.length < 10) return;
      const splitPoint = doc.splitTextToSize(point, pageWidth - (margin * 2) - 5);
      doc.text(splitPoint, margin, y);
      y += (splitPoint.length * 5.5) + 2;
    });
    y += 12;

    if (y > pageHeight - 65) {
      doc.addPage();
      y = 30;
    }

    // How to Understand Better
    doc.setFillColor(250, 249, 246); // Bone White bg
    doc.rect(margin - 5, y - 5, pageWidth - (margin * 2) + 10, 32, "F");
    doc.setDrawColor(228, 228, 231);
    doc.rect(margin - 5, y - 5, pageWidth - (margin * 2) + 10, 32, "S");
    
    doc.setTextColor(217, 119, 6); // Warm amber
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Metodologia de Estudo Recomendada", margin, y + 4);
    
    doc.setTextColor(63, 63, 70);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("1. Recomenda-se escutar o episódio do Podcast completo fazendo anotações em papel.", margin, y + 12);
    doc.text("2. Debata o assunto mentalmente através das analogias do dossier para fixação imediata.", margin, y + 19);
    y += 42;

    // Personal Definitions Section
    if (y > pageHeight - 75) {
      doc.addPage();
      y = 30;
    }

    doc.setTextColor(24, 24, 27);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Notas de Consolidação e Auto-Definição", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(113, 113, 122);
    doc.text("Escreva abaixo com suas próprias palavras qual é a tese principal abordada nesta aula:", margin, y);
    y += 12;
    
    // Draw lines for user notes
    doc.setDrawColor(212, 212, 216);
    for (let i = 0; i < 5; i++) {
      doc.line(margin, y, pageWidth - margin, y);
      y += 9;
    }

    // Podcast Script on new page
    if (script) {
      doc.addPage();
      doc.setFillColor(24, 24, 27); // Dark background for script header
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Transcrição Acadêmica: Jandira & Diogo", margin, 18);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(161, 161, 170);
      doc.text("Discussão e Expansão Analítica Integrada do Tema", margin, 24);
      
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(9.5);
      let scriptY = 45;
      script.forEach((line) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${line.speaker}:`, margin, scriptY);
        doc.setFont("helvetica", "normal");
        const splitLine = doc.splitTextToSize(line.text, pageWidth - (margin * 2) - 25);
        doc.text(splitLine, margin + 20, scriptY);
        scriptY += (splitLine.length * 4.5) + 5;
        if (scriptY > pageHeight - 20) {
          doc.addPage();
          scriptY = 20;
        }
      });
    }
    
    doc.save("explica-plus-dossier-estudo.pdf");
  };

  const handleDownloadHTML = () => {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "explica-plus-capture.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFeedback = (type: "like" | "dislike") => {
    setFeedback(type);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans selection:bg-amber-500/20 pb-28 overflow-x-hidden">
      {/* Premium Glass-Molded Translucent Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80 z-50 h-20 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-zinc-900 leading-none">
              Explica<span className="text-amber-600 font-sans font-light">+</span>
              <span className="text-[9px] font-sans font-black bg-zinc-900 text-amber-400 border border-zinc-850 rounded px-2 py-0.5 ml-2.5 align-middle tracking-wider">
                PRO
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setExplanation(null);
                setAudioUrl(null);
                setStep("idle");
                setInputText("");
                setFile(null);
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 animate-in fade-in duration-300"
            >
              Novo Estudo
            </button>
            <div className="w-8 h-8 rounded-full border border-zinc-200 bg-amber-500/15 flex items-center justify-center">
              <Smile className="w-4 h-4 text-amber-700" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive Tips Section */}
          <section className="p-5 bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-sm">
            <h3 className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Axioma de Ensino
            </h3>
            <p className="text-xs font-serif italic text-zinc-300 leading-relaxed font-light">
              "A verdadeira sofisticação intelectual reside na máxima habilidade de tornar o difícil em algo natural e memorável."
            </p>
          </section>

          {/* Form Card */}
          <section className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            {history.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-dashed border-zinc-200">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Dossiers Recentes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setExplanation(item.content);
                        setAudioUrl(item.audioUrl || null);
                        setStep("ready");
                      }}
                      className="px-2.5 py-1 bg-zinc-50 hover:bg-amber-50 hover:text-amber-800 border border-zinc-200/80 hover:border-amber-500/30 rounded-lg text-[10px] font-medium transition-all truncate max-w-[120px] text-zinc-600"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <span className="text-zinc-650 bg-zinc-100 w-5 h-5 flex items-center justify-center rounded-md border border-zinc-200 text-xs font-semibold">01</span> 
                Desafio Teórico do Dia
              </h2>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Qual tese, matéria acadêmica ou assunto técnico complexo deseja que o Explica+ descomplique hoje?"
                className="w-full h-36 p-4 bg-zinc-50 border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500/60 transition-all font-sans text-xs leading-relaxed text-zinc-800"
              />
              
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.2em] text-zinc-400 bg-white px-3 mx-auto w-fit">
                  OU COLETE DE ATIVOS
                </div>
              </div>

              <FileUpload onFileSelect={setFile} selectedFile={file} />
            </div>

            {/* Voices Configuration */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Mic2 className="w-3.5 h-3.5 text-amber-700" />
                Configurar Sala de Mentoria
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-zinc-500">Voz do Curioso</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text"
                      value={host1Name}
                      onChange={(e) => setHost1Name(e.target.value)}
                      placeholder="Nome"
                      className="w-1/3 p-1.5 bg-white border border-zinc-200 focus:outline-none rounded-lg text-[11px] font-semibold text-zinc-805"
                    />
                    <select 
                      value={jandiraVoice}
                      onChange={(e) => setJandiraVoice(e.target.value)}
                      className="w-2/3 p-1.5 bg-white border border-zinc-200 focus:outline-none rounded-lg text-[11px] font-semibold text-zinc-805 cursor-pointer"
                    >
                      {voices.map(v => <option key={v.name} value={v.name}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-zinc-500">Voz do Mentor</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text"
                      value={host2Name}
                      onChange={(e) => setHost2Name(e.target.value)}
                      placeholder="Nome"
                      className="w-1/3 p-1.5 bg-white border border-zinc-200 focus:outline-none rounded-lg text-[11px] font-semibold text-zinc-805"
                    />
                    <select 
                      value={diogoVoice}
                      onChange={(e) => setDiogoVoice(e.target.value)}
                      className="w-2/3 p-1.5 bg-white border border-zinc-200 focus:outline-none rounded-lg text-[11px] font-semibold text-zinc-805 cursor-pointer"
                    >
                      {voices.map(v => <option key={v.name} value={v.name}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={cn(
                "w-full py-3.5 rounded-xl text-zinc-950 font-bold text-xs bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer transform active:scale-[0.98] group flex items-center justify-center gap-2 uppercase tracking-wider",
                isLoading ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : ""
              )}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-400 font-bold" />
              ) : (
                <>
                  <span>Descomplicar Tema</span>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-950 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </section>
        </div>

        {/* Right Column: Output dossiers */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!isLoading && !explanation ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[520px] flex flex-col items-center justify-center text-center p-8 bg-white border border-zinc-200/80 rounded-2xl shadow-sm"
              >
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-5 shrink-0 animate-pulse">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-serif font-semibold text-zinc-900 tracking-tight">O Conhecimento Começa Aqui</h3>
                <p className="text-zinc-500 font-normal max-w-sm mt-3 text-xs leading-relaxed">
                  Insira um tema complexo ou anexe seu material de leitura à esquerda. Nossa mentoria de elite destrinchará o abstrato em clareza profunda e memorável.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Explanation Card */}
                <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 pb-6 border-b border-zinc-100">
                    <div>
                      <span className="bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full text-[9px] font-bold text-amber-700 uppercase tracking-widest mb-3 inline-block">
                        Dossier Acadêmico Ativo
                      </span>
                      <h3 className="text-2xl lg:text-3xl font-serif text-zinc-900 mt-1 font-semibold leading-snug max-w-2xl">
                        {explanation ? "Análise Consolidada" : "Gerando Síntese..."}
                      </h3>
                    </div>
                    {explanation && (
                      <div className="p-1 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-wrap gap-2 items-center">
                        <button 
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-zinc-750 hover:text-zinc-900 rounded-lg font-semibold text-xs transition-colors shadow-xs hover:bg-zinc-50 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Dossier PDF</span>
                        </button>
                        {audioUrl && (
                          <a 
                            href={audioUrl}
                            download={`explica-plus-${host1Name}-${host2Name}.mp3`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg font-bold text-xs transition-colors shadow-xs"
                          >
                            <Music className="w-3.5 h-3.5" />
                            <span>Baixar MP3</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {explanation ? (
                      <div className="space-y-6 text-zinc-800">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans border-l-4 border-amber-500 pl-6 bg-zinc-50/50 py-5 px-5 rounded-r-xl mb-6">
                          {explanation}
                        </div>
                        
                        {/* Summary / Mind Map style visual for ELI12 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                          <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-left">
                            <h4 className="font-bold text-zinc-700 uppercase text-[9px] tracking-wider mb-1.5">Axioma de Base</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed font-light">"A verdadeira sofisticação reside na máxima habilidade de tornar o díficil em algo natural e compreensível."</p>
                          </div>
                          <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl text-left">
                            <h4 className="font-bold text-amber-800 uppercase text-[9px] tracking-wider mb-1.5">Metodologia de Estudo</h4>
                            <p className="text-xs text-zinc-650 leading-relaxed font-light">Utilize o dossier PDF gerado acima para fazer anotações de auto-explicação enquanto ouve os capítulos do Podcast.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <LoadingExperience step={step as "explaining" | "scripting" | "audio"} />
                    )}
                  </div>

                  {/* Audio Player Integrated here */}
                  <div className="mt-8">
                    <AudioPlayer 
                      audioUrl={audioUrl} 
                      isVisible={!!audioUrl} 
                      onDownloadPDF={handleDownloadPDF}
                      host1Name={host1Name}
                      host2Name={host2Name}
                    />
                  </div>
                </div>

                {/* Feedback Section */}
                {explanation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs"
                  >
                    <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Avaliação do Dossier</h5>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleFeedback("like")}
                        className={cn(
                          "flex items-center gap-1.5 px-5 py-2 border border-zinc-200 rounded-xl font-semibold transition-all text-xs cursor-pointer",
                          feedback === "like" ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" : "bg-white hover:bg-zinc-50 text-zinc-600"
                        )}
                      >
                        👍 Útil
                      </button>
                      <button
                        onClick={() => handleFeedback("dislike")}
                        className={cn(
                          "flex items-center gap-1.5 px-5 py-2 border border-zinc-200 rounded-xl font-semibold transition-all text-xs cursor-pointer",
                          feedback === "dislike" ? "bg-rose-50 border-rose-500 text-rose-700 font-bold" : "bg-white hover:bg-zinc-50 text-zinc-600"
                        )}
                      >
                        👎 Precisa Melhorar
                      </button>
                    </div>
                    {feedback && (
                      <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 animate-pulse mt-1">Agradecemos pelo feedback construtivo! 🚀</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-20 h-16 bg-zinc-950 text-zinc-400 border-t border-zinc-900 flex items-center justify-between px-8 text-[9px] uppercase font-bold tracking-[0.2em] fixed bottom-0 w-full z-40">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-amber-500"></span>
          <span>EXPLICA+ PREMIUM LEARNING</span>
        </div>
        <div className="hidden md:block text-zinc-500 text-center px-4">CONTATO: <span className="text-zinc-350 hover:underline cursor-pointer">ILIRIODIOGOOFICIAL@GMAIL.COM</span></div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleDownloadHTML}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors text-zinc-300 font-medium cursor-pointer"
            title="Baixar Versão HTML"
          >
            <Code className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">HTML</span>
          </button>
          <span>NEURAL CORE v4</span>
        </div>
      </footer>
    </div>
  );
}
