import React from "react";
import { motion } from "motion/react";
import { BookOpen, Mic, Sparkles, Headphones } from "lucide-react";

interface LoadingExperienceProps {
  step: "explaining" | "scripting" | "audio";
}

export function LoadingExperience({ step }: LoadingExperienceProps) {
  const steps = {
    explaining: {
      sub: "Fase 01 • Análise e Decomposição",
      title: "Decodificando a Complexidade",
      description: "Nosso motor de linguagem está destrinchando as nuances teóricas para formular uma explicação pura, livre de termos inacessíveis.",
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      color: "bg-amber-50 border-amber-200/80"
    },
    scripting: {
      sub: "Fase 02 • Estruturação Pedagógica",
      title: "Roteirizando a Discussão",
      description: "Desenhando os capítulos explicativos. Jandira e Diogo debatem as melhores analogias práticas e conexões cotidianas para seu estudo.",
      icon: <Mic className="w-8 h-8 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200/80"
    },
    audio: {
      sub: "Fase 03 • Síntese de Voz de Alta Fidelidade",
      title: "Eles estão entrando no estúdio...",
      description: "Nossas vozes neurais avançadas de estúdio estão gerando o fluxo de áudio final, simulando um debate de nível executivo de mais de 10 minutos.",
      icon: <Headphones className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-200/80"
    }
  };

  const current = steps[step];

  return (
    <div className="flex flex-col items-center justify-center p-8 py-16 text-center h-full min-h-[460px] max-w-xl mx-auto">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-10 flex flex-col items-center"
      >
        {/* Sleek Concentric Pulse Circles */}
        <div className="absolute inset-0 flex items-center justify-center -m-16 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.03, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-44 h-44 border border-amber-300 rounded-full"
          />
          <motion.div
            animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.08, 0, 0.08] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 border border-zinc-200 rounded-full"
          />
        </div>

        {/* Elegant Minimal Icon Box */}
        <div className={`relative w-20 h-20 ${current.color} border rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-100 z-10 overflow-hidden`}>
          <motion.div
            animate={{ 
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {current.icon}
          </motion.div>
          
          {/* Subtle live recording bars if audio */}
          {step === "audio" && (
            <div className="absolute inset-x-0 bottom-2 flex items-end justify-center gap-1 h-3 pointer-events-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-indigo-500 rounded-full"
                  animate={{ height: ["4px", "12px", "6px", "14px", "4px"] }}
                  transition={{ 
                    duration: 0.9, 
                    repeat: Infinity, 
                    delay: i * 0.12,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        key={step + "-text"}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <p className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
          {current.sub}
        </p>
        <h3 className="text-3xl font-serif text-zinc-900 leading-tight">
          {current.title}
        </h3>
        <p className="text-zinc-500 font-normal text-sm leading-relaxed max-w-md mx-auto">
          {current.description}
        </p>
        
        {/* Masterclass elegant dot steps progress track */}
        <div className="pt-8 flex justify-center items-center gap-2">
          {Object.keys(steps).map((s, index) => {
            const isSelected = s === step;
            return (
              <React.Fragment key={s}>
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isSelected ? "w-6 bg-amber-600" : "w-2.5 bg-zinc-200"
                  }`} 
                />
                {index < 2 && <div className="w-4 h-[1px] bg-zinc-200" />}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
