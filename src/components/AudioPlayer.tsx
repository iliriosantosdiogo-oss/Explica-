import React, { useRef, useState } from "react";
import { Download, Volume2, FileText, Music, Play, Pause, Clock, ListMusic, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AudioPlayerProps {
  audioUrl: string | null;
  isVisible: boolean;
  onDownloadPDF?: () => void;
  host1Name?: string;
  host2Name?: string;
}

export function AudioPlayer({ audioUrl, isVisible, onDownloadPDF, host1Name = "Jandira", host2Name = "Diogo" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(0);

  if (!audioUrl || !isVisible) return null;

  const chapters = [
    { time: "00:00", title: "Capítulo I • Paradoxos e Base Conceitual", desc: "Análise inicial dos principais mitos e mistérios do tema." },
    { time: "02:30", title: "Capítulo II • Engenharia de Funcionamento", desc: "Como funcionam as engrenagens e as mecânicas internas por trás dele." },
    { time: "05:15", title: "Capítulo III • Aplicações e Impacto no Mercado", desc: "Casos práticos de uso empresarial ou implicações materiais reais." },
    { time: "08:15", title: "Capítulo IV • Sabedoria Prática e Conclusão", desc: "Resumo executivo consolidado com analogias perfeitas de memorização." }
  ];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 p-8 rounded-3xl border border-zinc-800 shadow-2xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Upper Panel: Control & Meta */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-500">Masterclass Exclusiva</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <h3 className="font-serif text-2xl font-semibold tracking-tight text-white mt-0.5">Explica+ Podcast</h3>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1">Conduzido por <span className="text-zinc-200">{host1Name} & {host2Name}</span> • Formato Executivo de Estudo (10m+)</p>
          </div>
        </div>

        {/* Elegant Action Buttons */}
        <div className="flex items-center gap-3">
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-xl font-medium transition-colors text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dossier PDF</span>
            </button>
          )}
          <a
            href={audioUrl}
            download="masterclass-explica-plus.mp3"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-95 text-xs shadow-lg shadow-amber-500/10"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Baixar MP3</span>
          </a>
        </div>
      </div>

      {/* Audio Engine controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Audio Player Section (6 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD34D]/70 font-mono">Status: Pronto</span>
              <button 
                onClick={handleSpeedChange}
                className="px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-[9px] font-mono tracking-wider transition-colors"
              >
                Velocidade {playbackSpeed}x
              </button>
            </div>

            <audio 
              ref={audioRef}
              controls 
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-10 inverted-audio mt-2" 
              src={audioUrl}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>

            {/* Premium Volume Integration */}
            <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-zinc-900">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Tempo de Áudio Expandido (Full Lecture)
              </span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-18 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500 rounded-r-xl">
            <p className="text-xs italic text-zinc-300 leading-relaxed">
              "Para uma experiência de fixação profunda, recomendamos escutar a discussão completa de 10 minutos fazendo anotações no dossier gerado acima. As vozes neurais reproduzem pausas intelectuais reais e dinâmicas refinadas de ensino."
            </p>
          </div>
        </div>

        {/* Chapters Track Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-zinc-400 pb-1">
            <ListMusic className="w-4 h-4 text-amber-500" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-300">Sumário da Masterclass</h4>
          </div>
          <div className="space-y-2">
            {chapters.map((ch, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentChapter(idx)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer text-left text-xs",
                  currentChapter === idx 
                    ? "bg-zinc-800/60 border-amber-500/50 shadow-lg shadow-amber-500/5" 
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "font-medium",
                    currentChapter === idx ? "text-amber-500" : "text-zinc-200"
                  )}>
                    {ch.title}
                  </span>
                  <span className="text-[9px] font-mono font-black text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                    {ch.time}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] font-normal leading-relaxed mt-0.5">
                  {ch.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .inverted-audio::-webkit-media-controls-panel {
          background-color: transparent;
        }
        .inverted-audio::-webkit-media-controls-current-time-display,
        .inverted-audio::-webkit-media-controls-time-remaining-display {
          color: #FBBF24;
          font-family: var(--font-mono);
          font-weight: 500;
          font-size: 11px;
        }
        .inverted-audio::-webkit-media-controls-play-button,
        .inverted-audio::-webkit-media-controls-mute-button,
        .inverted-audio::-webkit-media-controls-timeline {
           filter: invert(1) hue-rotate(180deg) brightness(1.2);
        }
      `}</style>
    </div>
  );
}
