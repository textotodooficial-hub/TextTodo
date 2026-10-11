import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  FONT_STYLES,
  FONT_FRAMES,
  summarizeTextDetailed,
  SummaryDetailedResult,
  improveText,
  cleanTextAdvanced,
  analyzeText,
  convertTextFormat,
  SummaryFormat,
  ImproveLevel,
  ConvertMode
} from './utils/textTools';
import {
  findRhymes,
  analyzeVerseMeter,
  analyzeStanzaScheme,
  lookupSpanishDictionaryWord,
  DICTIONARY_TOTAL_WORDS,
  FREESTYLE_PROMPTS
} from './utils/rhymeTools';
import { WordCategory } from './data/spanishDictionary';
import {
  runAutopilotPipeline,
  compareTextsDetailed,
  generateAcademicCitations,
  EXECUTIVE_TEMPLATES,
  ExecutiveTemplateId,
  generateSongBlueprint,
  DrumBeatStyle,
  playSynthesizedDrumStep,
  buildSerpPreview,
  encodeWorkspaceShareHash,
  decodeWorkspaceShareHash
} from './utils/enterpriseTools';
import { LEGAL_TABS, LEGAL_CONTENT, LegalTabId } from './data/legalData';
import { UNIVERSAL_PRESETS, DONATION_TIERS } from './data/presetsData';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  Type,
  Languages,
  AlignLeft,
  Sparkles,
  Eraser,
  BarChart3,
  CaseSensitive,
  Music,
  History,
  Search,
  Heart,
  Sun,
  Moon,
  Command,
  Copy,
  Download,
  Bookmark,
  Trash2,
  ArrowRight,
  ArrowLeftRight,
  Volume2,
  Check,
  X,
  Play,
  Square,
  Menu,
  Smartphone,
  Dices,
  Timer,
  Mail,
  Briefcase,
  Gift,
  ClipboardPaste,
  Wand2,
  Crown,
  Lock,
  ShieldCheck,
  Mic
} from 'lucide-react';

interface HistoryItem {
  id: string;
  type: string;
  input: string;
  output: string;
  date: string;
}

interface ToastMsg {
  id: number;
  text: string;
  kind: 'ok' | 'error';
}

const TOOL_CATALOG = [
  {
    id: 'fuente',
    index: '01',
    href: '#fuente',
    title: 'Fuentes Unicode Pro',
    subtitle: '44 familias + 14 marcos para redes, bios y titulares',
    sample: '𝐓𝐞𝐱𝐭𝐨𝐓𝐨𝐝𝐨 · 𝔊ó𝔱𝔦𝔠𝔬 · 𝒜𝓇𝓉ℯ',
    search: 'fuentes unicode tipografias instagram whatsapp tiktok linkedin bios negrita cursiva gotico vaporwave marcos',
    featured: true,
    icon: Type
  },
  {
    id: 'traductor',
    index: '02',
    href: '#traductor',
    title: 'Traductor Multilingüe',
    subtitle: '6 idiomas con pronunciación, velocidad de voz y descarga',
    sample: 'ES ⇄ EN · FR · DE · PT · IT',
    search: 'traducir traduccion idiomas ingles frances aleman portugues italiano voz',
    icon: Languages
  },
  {
    id: 'resumidor',
    index: '03',
    href: '#resumidor',
    title: 'Resumidor Extractivo',
    subtitle: '6 formatos (ejecutivo, viñetas, plan de acción, test, hilo)',
    sample: 'Ejecutivo · Viñetas · Plan · Test · Hilo',
    search: 'resumir resumen estudio apuntes universidad oficina texto largo ideas principales hilo preguntas',
    icon: AlignLeft
  },
  {
    id: 'mejorador',
    index: '04',
    href: '#mejorador',
    title: 'Corrector de Estilo',
    subtitle: '4 niveles editoriales + diagnóstico de cambios aplicados',
    sample: 'Correos · Informes · Sin muletillas',
    search: 'mejorar redactar correccion puntuacion estilo muletillas redundancias correos',
    icon: Sparkles
  },
  {
    id: 'limpiador',
    index: '05',
    href: '#limpiador',
    title: 'Limpiador Profundo',
    subtitle: '8 filtros combinables + Buscar y Reemplazar al instante',
    sample: 'Sin HTML · Sin URLs · Sin duplicados',
    search: 'limpiar espacios formato texto pdf excel html markdown urls emails duplicados ordenar',
    icon: Eraser
  },
  {
    id: 'analizador',
    index: '06',
    href: '#analizador',
    title: 'Analizador & SEO',
    subtitle: 'Legibilidad Huerta, simulador SERP Google y límites de redes',
    sample: 'Huerta 84/100 · SERP · X/IG/SEO',
    search: 'analizar estadisticas palabras lectura keywords legibilidad huerta densidad seo serp',
    icon: BarChart3
  },
  {
    id: 'convertidor',
    index: '07',
    href: '#convertidor',
    title: 'Convertidor & Formatos',
    subtitle: '20 transformaciones de mayúsculas, tablas Markdown, slugs y código',
    sample: 'MAYÚSCULAS · Tabla MD · url-slug · #tags',
    search: 'convertir mayusculas minusculas titulo frase camel pascal snake slug hashtags base64 tabla markdown enlaces',
    icon: CaseSensitive
  },
  {
    id: 'rimar',
    index: '08',
    href: '#rimar',
    title: 'Rimar & Diccionario Español',
    subtitle: `${DICTIONARY_TOTAL_WORDS.toLocaleString('es-ES')}+ palabras, diccionario normal, métrica y BPM`,
    sample: '[A · 11 síl.] +15.000 voces y rimas',
    search: 'rimar rimas diccionario espanol definiciones sinonimos musica poesia rap cantante compositor letras cancion versos barras metronomo multisilabicas',
    featuredMusic: true,
    icon: Music
  },
  {
    id: 'autopilot',
    index: '09',
    href: '#autopilot',
    title: 'Autopilot 1-Clic (5 en 1)',
    subtitle: 'Limpia + Corrige + Resume + Analiza SEO + Crea Titular en 1 clic',
    sample: 'Dossier Ejecutivo · 5 Motores Simultáneos',
    search: 'autopilot automatico todo en uno limpiar corregir resumir seo dossier informe',
    featured: true,
    icon: Wand2
  },
  {
    id: 'laboratorio',
    index: '10',
    href: '#laboratorio',
    title: 'Comparador, Citas APA & Plantillas',
    subtitle: 'Diff de versiones, citas APA 7 / MLA / ISO y plantillas B2B',
    sample: 'APA 7 · Diff A/B · Emails & WhatsApp',
    search: 'comparar textos diff versiones citas bibliograficas apa mla harvard iso plantillas correos whatsapp',
    icon: Briefcase
  }
];

const COMMAND_ITEMS = [
  { title: 'Centro de herramientas (10 Suites)', desc: 'Explorar todas las suites Pro de TextoTodo', target: '#centro', tag: '⌘' },
  { title: 'Fuentes Unicode Pro', desc: '44 estilos + 14 marcos decorativos para redes y titulares', target: '#fuente', tag: 'Aa' },
  { title: 'Traducir Pro', desc: '6 idiomas con pronunciación y velocidad de voz', target: '#traductor', tag: '文' },
  { title: 'Resumir Pro', desc: '6 formatos: Ejecutivo, Viñetas, Párrafo, Plan, Hilo y Test', target: '#resumidor', tag: '≡' },
  { title: 'Mejorar y Corregir Pro', desc: 'Corrector ortográfico y fonético profundo + 4 niveles de edición', target: '#mejorador', tag: '✦' },
  { title: 'Limpiar Pro', desc: 'Repara PDF, HTML, Markdown, URLs, emails, duplicados y reemplazo', target: '#limpiador', tag: '⌁' },
  { title: 'Analizar Pro & SEO', desc: 'Legibilidad Huerta, SERP Google y límites de redes', target: '#analizador', tag: '▥' },
  { title: 'Convertir Pro (20 en 1)', desc: '20 transformaciones + Tablas Markdown y Extractor de enlaces', target: '#convertidor', tag: 'A↔a' },
  { title: 'Rimar & Diccionario Español (+15.000 palabras)', desc: 'Diccionario completo de rimas y definiciones, métrica poética y BPM', target: '#rimar', tag: '♪' },
  { title: 'Autopilot 1-Clic (5 en 1)', desc: 'Limpia, corrige, resume, audita SEO y crea titular al instante', target: '#autopilot', tag: '⚡' },
  { title: 'Comparador Diff, Citas APA 7 y Plantillas', desc: 'Comparar versiones A/B, bibliografía APA/MLA/ISO y correos B2B', target: '#laboratorio', tag: '⚖' },
  { title: 'Historial local', desc: 'Ver y descargar textos guardados', target: 'history', tag: '↺' },
  { title: 'Apoyar TextoTodo (PayPal)', desc: 'Agradecer el ahorro de tiempo con una donación voluntaria', target: 'support', tag: '♥' },
  { title: 'Información legal y privacidad', desc: 'Aviso legal, RGPD, términos y cookies', target: 'legal', tag: '§' }
];

export default function App() {
  // Theme management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const attr = document.documentElement.dataset.theme;
    return attr === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('textotodo-theme', theme);
    } catch {
      // ignore
    }
    const meta = document.getElementById('dynamic-theme-color');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#05070E' : '#F6F8FC');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Splash Screen (always shown on page load & refresh, plus manual replay button)
  const [showSplash, setShowSplash] = useState(true);
  const [splashClosing, setSplashClosing] = useState(false);

  const dismissSplash = useCallback(() => {
    setSplashClosing(true);
    setTimeout(() => {
      setShowSplash(false);
      setSplashClosing(false);
    }, 380);
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      dismissSplash();
    }, 1850);
    return () => clearTimeout(timer);
  }, [showSplash, dismissSplash]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const addToast = useCallback((text: string, kind: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3400);
  }, []);

  // Clipboard & Download helpers
  const copyText = useCallback(
    async (text: string, label = 'Copiado al portapapeles') => {
      if (!text) {
        addToast('No hay contenido para copiar', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        addToast(label, 'ok');
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand('copy');
          addToast(label, 'ok');
        } catch {
          addToast('No se pudo copiar el texto', 'error');
        }
        area.remove();
      }
    },
    [addToast]
  );

  const downloadTxt = useCallback(
    (filename: string, content: string) => {
      if (!content) {
        addToast('No hay contenido para descargar', 'error');
        return;
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast(`Descargado: ${filename}`);
    },
    [addToast]
  );

  // 1-Click Paste from Clipboard & Native Share / WhatsApp helpers
  const pasteFromClipboard = useCallback(
    async (setter: (val: string) => void, label = 'Texto pegado desde tu portapapeles') => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = await navigator.clipboard.readText();
          if (clipText) {
            setter(clipText);
            addToast(label, 'ok');
            return;
          }
        }
        addToast('Mantén pulsado dentro del cuadro y elige Pegar (o Ctrl+V)', 'error');
      } catch {
        addToast('Mantén pulsado dentro del cuadro y elige Pegar (o Ctrl+V)', 'error');
      }
    },
    [addToast]
  );

  // Native Web Speech API Voice Dictation (Speech-to-Text)
  const [dictatingTarget, setDictatingTarget] = useState<string | null>(null);
  const startVoiceDictation = useCallback(
    (targetKey: string, setter: React.Dispatch<React.SetStateAction<string>>, lang = 'es-ES') => {
      const SpeechRec =
        (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
      if (!SpeechRec) {
        addToast('Tu navegador no soporta dictado por voz directo (usa Chrome, Edge o Safari)', 'error');
        return;
      }
      if (dictatingTarget === targetKey) {
        setDictatingTarget(null);
        return;
      }
      try {
        const rec = new SpeechRec();
        rec.lang = lang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        setDictatingTarget(targetKey);
        addToast('🎙️ Escuchando… Habla ahora para dictar tu texto', 'ok');
        rec.onresult = (event: any) => {
          const transcript = event?.results?.[0]?.[0]?.transcript || '';
          if (transcript.trim()) {
            setter(prev => (prev.trim() ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
            addToast('Texto dictado añadido con éxito', 'ok');
          }
        };
        rec.onerror = () => {
          setDictatingTarget(null);
          addToast('No se detectó voz o permiso de micrófono', 'error');
        };
        rec.onend = () => {
          setDictatingTarget(null);
        };
        rec.start();
      } catch {
        setDictatingTarget(null);
        addToast('No se pudo iniciar el micrófono', 'error');
      }
    },
    [addToast, dictatingTarget]
  );

  const shareResultText = useCallback(
    async (title: string, text: string) => {
      if (!text.trim()) {
        addToast('Genera o escribe un resultado antes de compartir', 'error');
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({ title, text });
          return;
        } catch {
          // user cancelled or fallback
        }
      }
      await copyText(text, 'Copiado listo para compartir en WhatsApp o redes');
    },
    [addToast, copyText]
  );

  // 1-Click Document File Loader (.txt, .md, .csv, .json, .srt, .html) & Printable PDF Report
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, maxLen = 20000) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const raw = typeof ev.target?.result === 'string' ? ev.target.result : '';
        if (raw.trim()) {
          setter(raw.slice(0, maxLen));
          addToast(`Archivo cargado: ${file.name}`, 'ok');
        }
      };
      reader.readAsText(file, 'utf-8');
      e.target.value = '';
    },
    [addToast]
  );

  const printFormattedReport = useCallback(
    (title: string, content: string, subtitle = 'Informe generado con TextoTodo Pro') => {
      if (!content.trim()) {
        addToast('Genera primero un resultado para imprimir o guardar en PDF', 'error');
        return;
      }
      window.print();
      addToast(`Vista de impresión / PDF lista: ${title} (${subtitle})`);
    },
    [addToast]
  );

  // Local History & Recents
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('textotodo-history') || '[]');
    } catch {
      return [];
    }
  });
  const [historyFilter, setHistoryFilter] = useState('');

  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('textotodo-recents') || '[]');
    } catch {
      return [];
    }
  });

  const recordRecentTool = useCallback((toolId: string) => {
    setRecentTools(prev => {
      const next = [toolId, ...prev.filter(x => x !== toolId)].slice(0, 5);
      try {
        localStorage.setItem('textotodo-recents', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const saveToHistory = useCallback(
    (type: string, input: string, output: string) => {
      if (!output.trim()) {
        addToast('Genera un resultado antes de guardar', 'error');
        return;
      }
      const entry: HistoryItem = {
        id: String(Date.now() + Math.random()),
        type,
        input: input.slice(0, 5000),
        output: output.slice(0, 10000),
        date: new Date().toISOString()
      };
      setHistory(prev => {
        const next = [entry, ...prev].slice(0, 35);
        try {
          localStorage.setItem('textotodo-history', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      addToast('Guardado en tu historial local');
    },
    [addToast]
  );

  // Modals & Drawers state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabId | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandIdx, setCommandIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#centro');
  const [toolSearch, setToolSearch] = useState('');

  // 100% Free Mode — All tools and batch downloads execute directly; donations are optional
  const openSupportModal = useCallback((defaultAmount = '5') => {
    setDonationAmount(defaultAmount);
    setIsSupportOpen(true);
  }, []);

  // Interactive Hero Live Preview State (Universal for everyone)
  const [heroDemoText, setHeroDemoText] = useState('Escribe mejor, ahorra tiempo y destaca en cualquier lugar');
  const [heroDemoTab, setHeroDemoTab] = useState<'fuentes' | 'correccion' | 'metricas' | 'rimas'>('fuentes');

  const heroLiveFonts = useMemo(() => {
    return FONT_STYLES.slice(0, 4).map(f => ({
      name: f.name,
      output: f.transform(heroDemoText || 'TextoTodo Pro')
    }));
  }, [heroDemoText]);

  const heroLiveAnalysis = useMemo(() => analyzeText(heroDemoText), [heroDemoText]);
  const heroLiveMeter = useMemo(() => analyzeVerseMeter(heroDemoText), [heroDemoText]);
  const heroLiveRhymes = useMemo(
    () => findRhymes(heroLiveMeter.endingWord !== '—' ? heroLiveMeter.endingWord : 'lugar', 'consonante', 6),
    [heroLiveMeter.endingWord]
  );

  // ---------------------------------------------------------------------------
  // 1. FUENTES UNICODE PRO STATE (36 Styles + 9 Frames)
  // ---------------------------------------------------------------------------
  const [fontInput, setFontInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-font') || 'Transforma tus textos, títulos y perfiles profesionales ✨';
    } catch {
      return 'Transforma tus textos, títulos y perfiles profesionales ✨';
    }
  });
  const [fontCategory, setFontCategory] = useState<'todas' | 'redes' | 'elegantes' | 'urbano' | 'decorativas'>('todas');
  const [activeFrameId, setActiveFrameId] = useState<string>('none');
  const [copiedFontId, setCopiedFontId] = useState<string | null>(null);
  const [favoriteFonts, setFavoriteFonts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('textotodo-fav-fonts') || '["bold","sansBold","script","smallCaps"]');
    } catch {
      return ['bold', 'sansBold', 'script', 'smallCaps'];
    }
  });

  const activeFrame = useMemo(
    () => FONT_FRAMES.find(f => f.id === activeFrameId) || FONT_FRAMES[0],
    [activeFrameId]
  );

  const toggleFavFont = (id: string) => {
    setFavoriteFonts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('textotodo-fav-fonts', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const displayedFonts = useMemo(() => {
    const filtered = FONT_STYLES.filter(f => fontCategory === 'todas' || f.category === fontCategory);
    return [...filtered].sort((a, b) => {
      const aFav = favoriteFonts.includes(a.id) ? 1 : 0;
      const bFav = favoriteFonts.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [fontCategory, favoriteFonts]);

  // ---------------------------------------------------------------------------
  // 2. TRADUCTOR PRO STATE
  // ---------------------------------------------------------------------------
  const [transInput, setTransInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-trans') || '';
    } catch {
      return '';
    }
  });
  const [transOutput, setTransOutput] = useState('');
  const [transFrom, setTransFrom] = useState('es');
  const [transTo, setTransTo] = useState('en');
  const [ttsRate, setTtsRate] = useState<number>(1);
  const [transLoading, setTransLoading] = useState(false);
  const [transStatus, setTransStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });

  const handleTranslate = async () => {
    const clean = transInput.trim();
    if (!clean) {
      setTransStatus({ msg: 'Escribe algo para traducir.', type: 'error' });
      return;
    }
    if (transFrom === transTo) {
      setTransStatus({ msg: 'Elige idiomas distintos.', type: 'error' });
      return;
    }
    recordRecentTool('traductor');
    setTransLoading(true);
    setTransStatus({ msg: 'Traduciendo…', type: '' });

    try {
      try {
        const res = await fetch('./api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, from: transFrom, to: transTo })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data?.translation) {
            setTransOutput(data.translation);
            setTransStatus({ msg: 'Traducción completada al detalle.', type: 'ok' });
            return;
          }
        }
      } catch {
        // Static GitHub Pages fallback below
      }

      // Split into paragraph chunks (up to 900 chars each) so long documents translate cleanly without truncation
      const paragraphs = clean.split(/\n+/);
      const chunks: string[] = [];
      let current = '';
      for (const p of paragraphs) {
        if ((current + '\n' + p).length > 900 && current) {
          chunks.push(current);
          current = p;
        } else {
          current = current ? `${current}\n${p}` : p;
        }
      }
      if (current) chunks.push(current);

      try {
        const translatedParts: string[] = [];
        for (const chunk of chunks) {
          const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(transFrom)}&tl=${encodeURIComponent(transTo)}&dt=t&q=${encodeURIComponent(chunk)}`;
          const gtxRes = await fetch(gtxUrl);
          if (gtxRes.ok) {
            const gtxData = await gtxRes.json();
            if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
              const partText = gtxData[0].map((part: unknown[]) => (Array.isArray(part) ? part[0] : '')).join('');
              if (partText.trim()) translatedParts.push(partText.trim());
            }
          }
        }
        if (translatedParts.length > 0) {
          setTransOutput(translatedParts.join('\n\n'));
          setTransStatus({ msg: 'Traducción completada al detalle.', type: 'ok' });
          return;
        }
      } catch {
        // Fallback to MyMemory below
      }

      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 500))}&langpair=${encodeURIComponent(transFrom)}|${encodeURIComponent(transTo)}`;
      const mmRes = await fetch(mmUrl);
      if (mmRes.ok) {
        const mmData = await mmRes.json();
        if (mmData?.responseData?.translatedText) {
          setTransOutput(mmData.responseData.translatedText);
          setTransStatus({ msg: 'Traducción completada.', type: 'ok' });
          return;
        }
      }

      throw new Error('No se pudo completar la traducción en este momento.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al traducir.';
      setTransStatus({ msg: message, type: 'error' });
    } finally {
      setTransLoading(false);
    }
  };

  const speakText = (text: string, langCode: string) => {
    if (!text.trim()) {
      addToast('No hay texto para escuchar', 'error');
      return;
    }
    if (!('speechSynthesis' in window)) {
      addToast('Tu navegador no soporta lectura por voz', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      es: 'es-ES',
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      pt: 'pt-PT',
      it: 'it-IT'
    };
    utter.lang = langMap[langCode] || 'es-ES';
    utter.rate = ttsRate;
    window.speechSynthesis.speak(utter);
  };

  // ---------------------------------------------------------------------------
  // 3. RESUMIDOR PRO STATE (GOD-MODE REACTIVE + DIAGNOSTICS)
  // ---------------------------------------------------------------------------
  const [sumInput, setSumInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-sum') || UNIVERSAL_PRESETS[0].sampleText;
    } catch {
      return UNIVERSAL_PRESETS[0].sampleText;
    }
  });
  const [sumOutput, setSumOutput] = useState('');
  const [sumDetails, setSumDetails] = useState<SummaryDetailedResult | null>(null);
  const [sumLength, setSumLength] = useState(5);
  const [sumFormat, setSumFormat] = useState<SummaryFormat>('executive');
  const [sumFocusKeyword, setSumFocusKeyword] = useState('');
  const [sumStatus, setSumStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });

  // Automatically re-compute summary whenever input, format, length or focus keyword changes
  useEffect(() => {
    if (!sumInput.trim()) {
      setSumOutput('');
      setSumDetails(null);
      return;
    }
    try {
      const detailed = summarizeTextDetailed(sumInput, sumLength, sumFormat, sumFocusKeyword);
      setSumOutput(detailed.output);
      setSumDetails(detailed);
    } catch {
      // ignore empty
    }
  }, [sumInput, sumLength, sumFormat, sumFocusKeyword]);

  const handleSummarize = (customText?: string) => {
    const sourceText = customText !== undefined ? customText : sumInput;
    try {
      recordRecentTool('resumidor');
      const detailed = summarizeTextDetailed(sourceText, sumLength, sumFormat, sumFocusKeyword);
      setSumOutput(detailed.output);
      setSumDetails(detailed);
      setSumStatus({
        msg: `Resumen Pro generado al detalle: de ${detailed.originalWords} a ${detailed.summaryWords} palabras (ahorro del ${detailed.savedPercentage}%).`,
        type: 'ok'
      });
    } catch (e: unknown) {
      setSumStatus({ msg: e instanceof Error ? e.message : 'Error al resumir', type: 'error' });
    }
  };

  // ---------------------------------------------------------------------------
  // 4. MEJORADOR PRO STATE (REACTIVE + ORTHOGRAPHIC & STYLE ENGINE)
  // ---------------------------------------------------------------------------
  const [impInput, setImpInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-imp') || UNIVERSAL_PRESETS[1].sampleText;
    } catch {
      return UNIVERSAL_PRESETS[1].sampleText;
    }
  });
  const [impOutput, setImpOutput] = useState('');
  const [impLevel, setImpLevel] = useState<ImproveLevel>('editorial');
  const [impNotes, setImpNotes] = useState<string[]>([]);
  const [impStatus, setImpStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });

  useEffect(() => {
    if (!impInput.trim()) {
      setImpOutput('');
      setImpNotes([]);
      return;
    }
    try {
      const { result, appliedNotes } = improveText(impInput, impLevel);
      setImpOutput(result);
      setImpNotes(appliedNotes);
    } catch {
      // ignore
    }
  }, [impInput, impLevel]);

  const handleImprove = (customText?: string) => {
    const sourceText = customText !== undefined ? customText : impInput;
    try {
      recordRecentTool('mejorador');
      const { result, changesCount, appliedNotes } = improveText(sourceText, impLevel);
      setImpOutput(result);
      setImpNotes(appliedNotes);
      setImpStatus({
        msg: `Texto perfeccionado al detalle (${changesCount} mejoras aplicadas).`,
        type: 'ok'
      });
    } catch (e: unknown) {
      setImpStatus({ msg: e instanceof Error ? e.message : 'Error al mejorar', type: 'error' });
    }
  };

  // ---------------------------------------------------------------------------
  // 5. LIMPIADOR PRO STATE (REACTIVE + PDF HYPHEN REPAIR)
  // ---------------------------------------------------------------------------
  const [cleanInput, setCleanInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-clean') || UNIVERSAL_PRESETS[2].sampleText;
    } catch {
      return UNIVERSAL_PRESETS[2].sampleText;
    }
  });
  const [cleanOutput, setCleanOutput] = useState('');
  const [cleanMode, setCleanMode] = useState<'balanced' | 'aggressive'>('balanced');
  const [stripHtml, setStripHtml] = useState(true);
  const [stripMarkdown, setStripMarkdown] = useState(false);
  const [stripUrls, setStripUrls] = useState(true);
  const [stripEmails, setStripEmails] = useState(false);
  const [stripEmojis, setStripEmojis] = useState(false);
  const [stripTimestamps, setStripTimestamps] = useState(true);
  const [stripLeadingNumbers, setStripLeadingNumbers] = useState(false);
  const [dedupeLines, setDedupeLines] = useState(true);
  const [sortLines, setSortLines] = useState<'none' | 'asc' | 'desc' | 'length'>('none');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [cleanStatus, setCleanStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });

  useEffect(() => {
    if (!cleanInput.trim()) {
      setCleanOutput('');
      return;
    }
    try {
      const out = cleanTextAdvanced(cleanInput, {
        mode: cleanMode,
        stripHtml,
        stripMarkdown,
        stripUrls,
        stripEmails,
        stripEmojis,
        stripTimestamps,
        stripLeadingNumbers,
        dedupeLines,
        sortLines,
        findText,
        replaceText
      });
      setCleanOutput(out);
    } catch {
      // ignore
    }
  }, [
    cleanInput,
    cleanMode,
    stripHtml,
    stripMarkdown,
    stripUrls,
    stripEmails,
    stripEmojis,
    stripTimestamps,
    stripLeadingNumbers,
    dedupeLines,
    sortLines,
    findText,
    replaceText
  ]);

  const handleClean = (customText?: string) => {
    const sourceText = customText !== undefined ? customText : cleanInput;
    try {
      recordRecentTool('limpiador');
      const out = cleanTextAdvanced(sourceText, {
        mode: cleanMode,
        stripHtml,
        stripMarkdown,
        stripUrls,
        stripEmails,
        stripEmojis,
        stripTimestamps,
        stripLeadingNumbers,
        dedupeLines,
        sortLines,
        findText,
        replaceText
      });
      setCleanOutput(out);
      const diffChars = Math.max(0, sourceText.length - out.length);
      setCleanStatus({
        msg: `Limpieza completada (${diffChars} caracteres residuales eliminados).`,
        type: 'ok'
      });
    } catch (e: unknown) {
      setCleanStatus({ msg: e instanceof Error ? e.message : 'Error al limpiar', type: 'error' });
    }
  };

  // ---------------------------------------------------------------------------
  // 6. ANALIZADOR PRO STATE + SERP & SOCIAL PREVIEW
  // ---------------------------------------------------------------------------
  const [anInput, setAnInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-an') || UNIVERSAL_PRESETS[0].sampleText;
    } catch {
      return UNIVERSAL_PRESETS[0].sampleText;
    }
  });
  const [serpCustomTitle, setSerpCustomTitle] = useState('');
  const [serpCustomDesc, setSerpCustomDesc] = useState('');
  const [serpDomain, setSerpDomain] = useState('textotodo.pages.dev');
  const analysisMetrics = useMemo(() => analyzeText(anInput), [anInput]);
  const serpPreview = useMemo(
    () => buildSerpPreview(anInput, serpCustomTitle, serpCustomDesc, serpDomain),
    [anInput, serpCustomTitle, serpCustomDesc, serpDomain]
  );

  // ---------------------------------------------------------------------------
  // 7. CONVERTIDOR PRO STATE (REACTIVE + 18 MODES)
  // ---------------------------------------------------------------------------
  const [convInput, setConvInput] = useState<string>(() => {
    try {
      return localStorage.getItem('tt-draft-conv') || 'Guía definitiva de productividad, diseño web y marketing digital 2026';
    } catch {
      return 'Guía definitiva de productividad, diseño web y marketing digital 2026';
    }
  });
  const [convOutput, setConvOutput] = useState('');
  const [convMode, setConvMode] = useState<ConvertMode>('title');
  const [convStatus, setConvStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });

  useEffect(() => {
    if (!convInput.trim()) {
      setConvOutput('');
      return;
    }
    setConvOutput(convertTextFormat(convInput, convMode));
  }, [convInput, convMode]);

  // Auto-save active drafts so the customer never loses work on refresh
  useEffect(() => {
    try {
      localStorage.setItem('tt-draft-font', fontInput);
      localStorage.setItem('tt-draft-trans', transInput);
      localStorage.setItem('tt-draft-sum', sumInput);
      localStorage.setItem('tt-draft-imp', impInput);
      localStorage.setItem('tt-draft-clean', cleanInput);
      localStorage.setItem('tt-draft-an', anInput);
      localStorage.setItem('tt-draft-conv', convInput);
    } catch {
      // ignore storage quota
    }
  }, [fontInput, transInput, sumInput, impInput, cleanInput, anInput, convInput]);

  const handleConvert = (customMode?: ConvertMode) => {
    const activeMode = customMode || convMode;
    if (customMode) setConvMode(customMode);
    if (!convInput.trim()) {
      setConvStatus({ msg: 'Escribe un texto para convertir.', type: 'error' });
      return;
    }
    recordRecentTool('convertidor');
    const out = convertTextFormat(convInput, activeMode);
    setConvOutput(out);
    setConvStatus({ msg: `Formato aplicado: ${activeMode}.`, type: 'ok' });
  };

  const [rhymeWord, setRhymeWord] = useState('corazón');
  const [rhymeType, setRhymeType] = useState<'consonante' | 'asonante' | 'multisilabica'>('consonante');
  const [rhymeCount, setRhymeCount] = useState(48);
  const [rhymeSyllableFilter, setRhymeSyllableFilter] = useState(0);
  const [rhymeCategoryFilter, setRhymeCategoryFilter] = useState<'todas' | WordCategory>('todas');

  const rhymeResults = useMemo(
    () => findRhymes(rhymeWord, rhymeType, rhymeCount, rhymeSyllableFilter, rhymeCategoryFilter),
    [rhymeWord, rhymeType, rhymeCount, rhymeSyllableFilter, rhymeCategoryFilter]
  );

  const dictionaryReport = useMemo(
    () => lookupSpanishDictionaryWord(rhymeWord),
    [rhymeWord]
  );

  const [schemeInput, setSchemeInput] = useState(
    'Subo al escenario con la fuerza del motor\nBuscando una salida dentro de mi corazón\nTransformo cada herida en una nueva canción\nDejando en cada barra todo mi valor'
  );
  const [schemeMode, setSchemeMode] = useState<'consonante' | 'asonante'>('consonante');
  const schemeResult = useMemo(() => analyzeStanzaScheme(schemeInput, schemeMode), [schemeInput, schemeMode]);

  const [selectedVerseIdx, setSelectedVerseIdx] = useState(0);
  const activeVerseLine = useMemo(() => {
    const lines = schemeInput
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    return lines[selectedVerseIdx] || lines[0] || 'Subo al escenario con la fuerza del motor';
  }, [schemeInput, selectedVerseIdx]);
  const meterResult = useMemo(() => analyzeVerseMeter(activeVerseLine), [activeVerseLine]);

  const [freestyleIdx, setFreestyleIdx] = useState(0);
  const currentPrompt = FREESTYLE_PROMPTS[freestyleIdx % FREESTYLE_PROMPTS.length];

  const [bpm, setBpm] = useState(92);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [rhythmMode, setRhythmMode] = useState<'click' | DrumBeatStyle>('boombap');
  const drumBeatStyle = rhythmMode === 'click' ? 'metronome' : rhythmMode;
  const setDrumBeatStyle = (val: DrumBeatStyle | 'metronome') => {
    setRhythmMode(val === 'metronome' ? 'click' : val);
  };
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const loadFromHash = () => {
      const decoded = decodeWorkspaceShareHash(window.location.hash);
      if (!decoded) return;
      const { tool, text } = decoded;
      if (tool === 'fuente') setFontInput(text);
      else if (tool === 'traductor') setTransInput(text);
      else if (tool === 'resumidor') setSumInput(text);
      else if (tool === 'mejorador') setImpInput(text);
      else if (tool === 'limpiador') setCleanInput(text);
      else if (tool === 'analizador') setAnInput(text);
      else if (tool === 'convertidor') setConvInput(text);
      else if (tool === 'rimar') setSchemeInput(text);
      else if (tool === 'autopilot') setAutoInput(text);

      setTimeout(() => {
        const el = document.getElementById(tool);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
      addToast(`Sesión compartida cargada en ${tool.toUpperCase()}`);
    };
    loadFromHash();
    window.addEventListener('hashchange', loadFromHash);
    return () => window.removeEventListener('hashchange', loadFromHash);
  }, [addToast]);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter(t => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;
    if (taps.length >= 2) {
      let totalDiff = 0;
      for (let i = 1; i < taps.length; i++) {
        totalDiff += taps[i] - taps[i - 1];
      }
      const avgMs = totalDiff / (taps.length - 1);
      const calculatedBpm = Math.round(60000 / avgMs);
      if (calculatedBpm >= 50 && calculatedBpm <= 190) {
        setBpm(calculatedBpm);
      }
    }
  };

  useEffect(() => {
    if (!isMetronomePlaying) {
      setCurrentBeat(0);
      return;
    }
    // 16th-note step interval for full drum machine patterns (4 steps per beat)
    const stepMs = ((60 / bpm) * 1000) / 4;
    let step16 = 0;

    const playStep = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        if (rhythmMode === 'click') {
          if (step16 % 4 === 0) {
            const beatIdx = Math.floor(step16 / 4) % 4;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = beatIdx === 0 ? 980 : 620;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.065);
          }
        } else {
          playSynthesizedDrumStep(ctx, rhythmMode, step16);
        }

        if (step16 % 4 === 0) {
          setCurrentBeat((Math.floor(step16 / 4) % 4) + 1);
        }
        step16 = (step16 + 1) % 16;
      } catch {
        // ignore audio context block
      }
    };

    playStep();
    const id = setInterval(playStep, stepMs);
    return () => clearInterval(id);
  }, [isMetronomePlaying, bpm, rhythmMode]);

  // ---------------------------------------------------------------------------
  // 9. AUTOPILOT 1-CLICK PIPELINE & ENTERPRISE LAB STATE (SUITES 09 & 10)
  // ---------------------------------------------------------------------------
  const [autoInput, setAutoInput] = useState<string>(
    'Ayer abi en la tarde yo fui al supermercao porq abia ke comprar barias kosas que me faltavan en la kasa. Ademas, la inteligencia artificial generativa y la automatizacion de flujos de trabajo estan transformando la productividad de estudiantes, empresas y creadores digitales en un 42% anual. Sin embargo, el 68% de los equipos pierde mas de 4 horas semanales limpiando documentos PDF mal formateados, redactando correos repetitivos y preparando informes ejecutivos.'
  );
  const autopilotReport = useMemo(() => runAutopilotPipeline(autoInput), [autoInput]);

  const [labTab, setLabTab] = useState<'diff' | 'citas' | 'plantillas'>('diff');

  // Diff Comparator State
  const [diffTextA, setDiffTextA] = useState<string>(
    'Propuesta inicial: El proyecto se entregará en el plazo de 30 días naturales con soporte básico por correo electrónico y una revisión mensual.'
  );
  const [diffTextB, setDiffTextB] = useState<string>(
    'Propuesta definitiva: El proyecto completo se entregará en el plazo de 15 días laborables con soporte prioritario 24/7, auditoría SEO y dos revisiones semanales.'
  );
  const diffReport = useMemo(() => compareTextsDetailed(diffTextA, diffTextB), [diffTextA, diffTextB]);

  // Academic Citation Generator State
  const [citeAuthorFirst, setCiteAuthorFirst] = useState('Rafael');
  const [citeAuthorLast, setCiteAuthorLast] = useState('Moreno Roman');
  const [citeYear, setCiteYear] = useState(String(new Date().getFullYear()));
  const [citeTitle, setCiteTitle] = useState('Arquitectura de herramientas lingüísticas y productividad en el navegador');
  const [citeSource, setCiteSource] = useState('TextoTodo Pro Editorial');
  const [citeUrl, setCiteUrl] = useState('https://textotodo.pages.dev/');
  const citationsOutput = useMemo(
    () =>
      generateAcademicCitations({
        authorFirst: citeAuthorFirst,
        authorLast: citeAuthorLast,
        year: citeYear,
        title: citeTitle,
        publisherOrSite: citeSource,
        url: citeUrl,
        accessDate: new Date().toLocaleDateString('es-ES')
      }),
    [citeAuthorFirst, citeAuthorLast, citeYear, citeTitle, citeSource, citeUrl]
  );

  // Executive Templates State
  const [tplSelected, setTplSelected] = useState<ExecutiveTemplateId>('email-propuesta');
  const [tplTopic, setTplTopic] = useState('Automatización de contenidos y auditoría SEO');
  const [tplSender, setTplSender] = useState('Rafael Moreno');
  const [tplRecipient, setTplRecipient] = useState('Dirección de Marketing');
  const [tplCta, setTplCta] = useState('¿Tienes 10 minutos este jueves a las 11:00h para verlo en una llamada rápida?');
  const tplGenerated = useMemo(() => {
    const found = EXECUTIVE_TEMPLATES.find(t => t.id === tplSelected) || EXECUTIVE_TEMPLATES[0];
    return found.build(tplTopic, tplSender, tplRecipient, tplCta);
  }, [tplSelected, tplTopic, tplSender, tplRecipient, tplCta]);

  // Song Blueprint Generator State inside Rimar Studio
  const [songStyle, setSongStyle] = useState<'urbano' | 'pop' | 'balada' | 'epico'>('urbano');

  // ---------------------------------------------------------------------------
  // ZERO-CONFIG FEEDBACK TO TEXTOTODO.OFICIAL@GMAIL.COM (FormSubmit AJAX + Mailto)
  // ---------------------------------------------------------------------------
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Sugerencia de mejora');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ msg: string; type: '' | 'ok' | 'error' }>({ msg: '', type: '' });
  const [donationAmount, setDonationAmount] = useState('5');

  const handleFeedbackSubmit = async () => {
    if (!rating) {
      setFeedbackStatus({ msg: 'Por favor, selecciona primero una valoración de 1 a 5 estrellas.', type: 'error' });
      return;
    }

    setFeedbackSending(true);
    setFeedbackStatus({ msg: 'Enviando tu valoración a textotodo.oficial@gmail.com…', type: '' });

    const starsVisual = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const cleanMsg = feedbackText.trim() || 'Valoración enviada sin comentario adicional.';

    try {
      // 1. Send directly to textotodo.oficial@gmail.com via FormSubmit AJAX (works on GitHub Pages without backend)
      let sentViaFormSubmit = false;
      try {
        const fsRes = await fetch('https://formsubmit.co/ajax/textotodo.oficial@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            _subject: `TextoTodo Valoración: ${starsVisual} (${rating}/5) - ${feedbackCategory}`,
            Valoracion: `${rating} de 5 estrellas (${starsVisual})`,
            Tipo: feedbackCategory,
            Comentario: cleanMsg,
            Fecha: new Date().toLocaleString('es-ES'),
            Origen: window.location.href
          })
        });
        if (fsRes.ok) {
          sentViaFormSubmit = true;
        }
      } catch {
        // Fallback below
      }

      // 2. Also send to local backend if running Express
      try {
        await fetch('./api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, message: `[${feedbackCategory}] ${cleanMsg}` })
        });
      } catch {
        // ignore on static hosting
      }

      // 3. Save locally in browser record
      try {
        const prev = JSON.parse(localStorage.getItem('textotodo-feedback') || '[]');
        prev.unshift({
          rating,
          category: feedbackCategory,
          message: cleanMsg,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('textotodo-feedback', JSON.stringify(prev.slice(0, 50)));
      } catch {
        // ignore
      }

      setFeedbackStatus({
        msg: sentViaFormSubmit
          ? '¡Muchas gracias! Tu valoración se ha enviado directamente al correo de Rafa.'
          : '¡Gracias! Tu valoración ha quedado registrada. Si quieres, también puedes pulsar "Enviar por Correo Directo".',
        type: 'ok'
      });
      setFeedbackText('');
      setRating(0);
    } finally {
      setFeedbackSending(false);
    }
  };

  // Send output of any tool to another tool
  const sendToTool = (targetId: string, textToPass: string) => {
    if (!textToPass.trim()) {
      addToast('No hay texto de salida para enviar', 'error');
      return;
    }
    recordRecentTool(targetId);
    if (targetId === 'fuente') setFontInput(textToPass.slice(0, 500));
    if (targetId === 'traductor') setTransInput(textToPass.slice(0, 1000));
    if (targetId === 'resumidor') setSumInput(textToPass.slice(0, 15000));
    if (targetId === 'mejorador') setImpInput(textToPass.slice(0, 8000));
    if (targetId === 'limpiador') setCleanInput(textToPass.slice(0, 15000));
    if (targetId === 'analizador') setAnInput(textToPass.slice(0, 20000));
    if (targetId === 'convertidor') setConvInput(textToPass.slice(0, 10000));

    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    addToast(`Texto enviado a ${targetId.charAt(0).toUpperCase() + targetId.slice(1)}`);
  };

  // Command palette filtering & keyboard shortcuts
  const filteredCommands = useMemo(() => {
    const q = commandQuery.toLowerCase().trim();
    if (!q) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter(item => `${item.title} ${item.desc}`.toLowerCase().includes(q));
  }, [commandQuery]);

  const executeCommandTarget = useCallback((target: string) => {
    setIsCommandOpen(false);
    if (target === 'history') {
      setIsHistoryOpen(true);
      return;
    }
    if (target === 'support') {
      setIsSupportOpen(true);
      return;
    }
    if (target === 'legal') {
      setLegalModalTab('privacy');
      return;
    }
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
        setCommandQuery('');
        setCommandIdx(0);
        return;
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
        setIsSupportOpen(false);
        setLegalModalTab(null);
        setIsHistoryOpen(false);
        setIsMobileMenuOpen(false);
      }
      if (isCommandOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setCommandIdx(prev => (filteredCommands.length ? (prev + 1) % filteredCommands.length : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setCommandIdx(prev =>
            filteredCommands.length ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0
          );
        } else if (e.key === 'Enter' && filteredCommands[commandIdx]) {
          e.preventDefault();
          executeCommandTarget(filteredCommands[commandIdx].target);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCommandOpen, filteredCommands, commandIdx, executeCommandTarget]);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  useEffect(() => {
    const sectionIds = ['autopilot', 'centro', 'fuente', 'traductor', 'resumidor', 'mejorador', 'limpiador', 'analizador', 'convertidor', 'rimar', 'laboratorio', 'faq'];
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-10% 0px -55% 0px' }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const filteredTools = useMemo(() => {
    const q = toolSearch.toLowerCase().trim();
    if (!q) return TOOL_CATALOG;
    return TOOL_CATALOG.filter(t => `${t.title} ${t.subtitle} ${t.search}`.toLowerCase().includes(q));
  }, [toolSearch]);

  const parsedDonation = Number(donationAmount.replace(',', '.'));
  const validDonation = Number.isFinite(parsedDonation) && parsedDonation >= 1 && parsedDonation <= 10000;
  const paypalHref = validDonation
    ? `https://www.paypal.com/paypalme/Rafa930paypal/${encodeURIComponent(String(Math.round(parsedDonation * 100) / 100))}`
    : 'https://www.paypal.com/paypalme/Rafa930paypal/5';

  const mailtoFeedbackHref = useMemo(() => {
    const stars = rating ? `${rating}/5 estrellas` : '5/5 estrellas';
    const subject = encodeURIComponent(`Valoración TextoTodo (${stars}) - ${feedbackCategory}`);
    const body = encodeURIComponent(
      `Hola equipo de TextoTodo,\n\nMi valoración para TextoTodo: ${stars}\nCategoría: ${feedbackCategory}\n\nComentario:\n${feedbackText.trim() || '¡Me ha resultado muy útil la web!'}\n`
    );
    return `mailto:textotodo.oficial@gmail.com?subject=${subject}&body=${body}`;
  }, [rating, feedbackCategory, feedbackText]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/25">
      {/* =====================================================================
          SPLASH SCREEN — SOLO EL LOGO
          ===================================================================== */}
      {showSplash && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="TextoTodo"
          onClick={dismissSplash}
          className={`fixed inset-0 z-[100] grid place-items-center bg-[#05070e] transition-opacity duration-350 ${
            splashClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] grid place-items-center bg-gradient-to-br from-[#5147dc] via-[#756aff] to-[#c9a75c] border border-white/25 shadow-[0_0_70px_rgba(117,106,255,0.45)] splash-logo-anim">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M5 6.5h14M5 11.5h10M5 16.5h7" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}

      {/* TOPBAR — STRICT 3-ZONE LUXURY CONTRACT & CLEAN MOBILE HEADER */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-2xl relative">
        {/* BARRA DE PROGRESO DE SCROLL CON EL MORADO CARACTERÍSTICO DEL LOGO */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent pointer-events-none overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5147dc] via-[#756aff] to-[#9d8cff] shadow-[0_0_14px_rgba(117,106,255,0.85)] transition-[width] duration-75 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="max-w-[1260px] mx-auto px-3.5 sm:px-5 h-[62px] sm:h-[70px] flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark (clicking replays Splash or scrolls top) */}
          <a
            href="#inicio"
            onClick={() => setShowSplash(true)}
            title="TextoTodo Pro — Ver pantalla de bienvenida"
            className="flex items-center gap-2.5 font-display font-extrabold tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl grid place-items-center bg-gradient-to-br from-[#5147dc] via-[#756aff] to-[#c9a75c] border border-white/25 shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 6.5h14M5 11.5h10M5 16.5h7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-base sm:text-xl text-[var(--text)]">TextoTodo</span>
          </a>

          {/* Zone 2: Clean 5-Link Typography Nav */}
          <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-6 text-sm font-bold text-[var(--muted)]">
            {[
              ['#centro', 'Suites (10)'],
              ['#fuente', 'Fuentes'],
              ['#resumidor', 'Resumir'],
              ['#mejorador', 'Corrector'],
              ['#rimar', 'Rimas & Diccionario']
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeSection === href
                    ? 'border-[var(--brand2)] text-[var(--text)]'
                    : 'border-transparent hover:text-[var(--text)]'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Quick Utilities & Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsCommandOpen(true);
                setCommandQuery('');
                setCommandIdx(0);
              }}
              title="Buscador rápido de herramientas (Ctrl/Cmd + K)"
              aria-label="Abrir buscador de herramientas"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--brand)] transition whitespace-nowrap shrink-0"
            >
              <Command className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span className="tabular-nums">⌘K</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              title="Historial guardado"
              aria-label="Abrir historial"
              className="hidden sm:grid w-9 h-9 rounded-xl place-items-center border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand)] transition shrink-0"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 rounded-xl grid place-items-center border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand)] transition shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--gold)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--brand)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => openSupportModal('5')}
              aria-label="Donar voluntariamente por PayPal"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#c92573] via-[#ee4f98] to-[#c9a75c] shadow-md hover:brightness-110 transition whitespace-nowrap shrink-0"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Donar</span>
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1 pb-24 lg:pb-0">
        {/* =====================================================================
            HERO SECTION — CLEAN VALUE PROPOSITION + LIVE INTERACTIVE DEMO
            ===================================================================== */}
        <section id="inicio" className="pt-7 pb-10 sm:pt-12 sm:pb-14">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5 grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Universal Value Proposition */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-[var(--gold)] tracking-wide mb-2.5">
                  ESTUDIANTES · PROFESIONALES · CREADORES · ESCRITORES
                </div>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.06] text-balance">
                  Todo lo que necesitas hacer con tu texto,{' '}
                  <span className="bg-gradient-to-r from-[var(--brand)] via-[var(--brand2)] to-[var(--gold)] bg-clip-text text-transparent">
                    resuelto en segundos.
                  </span>
                </h1>
                <p className="mt-4 text-sm sm:text-base text-[var(--muted)] max-w-[58ch] leading-relaxed">
                  Resume apuntes o informes, corrige la ortografía, limpia formato de PDFs, traduce en 6 idiomas, audita el SEO, cambia fuentes Unicode o busca rimas en más de 15.000 palabras del español.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#centro"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)] shadow-lg hover:brightness-110 transition whitespace-nowrap"
                  >
                    Ver las 10 Suites <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#autopilot"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl font-extrabold text-sm border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brand2)] transition whitespace-nowrap"
                  >
                    <Wand2 className="w-4 h-4 text-[var(--brand2)]" /> Autopilot 5 en 1
                  </a>
                </div>
              </div>

              {/* Quantitative Architecture Bar */}
              <div className="mt-6 pt-5 border-t border-[var(--line)] grid grid-cols-3 gap-3">
                <div>
                  <strong className="block font-display text-xl sm:text-2xl font-extrabold tabular-nums text-[var(--text)]">
                    10 Suites
                  </strong>
                  <span className="text-[11px] sm:text-xs font-semibold text-[var(--muted)] block">
                    Integradas en 1 web
                  </span>
                </div>
                <div>
                  <strong className="block font-display text-xl sm:text-2xl font-extrabold tabular-nums text-[var(--brand2)]">
                    {DICTIONARY_TOTAL_WORDS.toLocaleString('es-ES')}+
                  </strong>
                  <span className="text-[11px] sm:text-xs font-semibold text-[var(--muted)] block">
                    Voces y rimas en español
                  </span>
                </div>
                <div>
                  <strong className="block font-display text-xl sm:text-2xl font-extrabold tabular-nums text-[var(--gold)]">
                    100% Gratis
                  </strong>
                  <span className="text-[11px] sm:text-xs font-semibold text-[var(--muted)] block">
                    Sin registro ni límites
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Studio Console in Hero */}
            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-[24px] sm:rounded-[28px] studio-console p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[var(--line)]">
                    <div>
                      <span className="section-number">PRUEBA RÁPIDA EN VIVO</span>
                      <h2 className="text-base font-extrabold text-[var(--text)]">
                        Transforma cualquier frase al instante
                      </h2>
                    </div>

                    {/* Interactive Mode Switch */}
                    <div className="grid grid-cols-4 sm:flex items-center gap-1 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                      {(
                        [
                          ['fuentes', 'Fuentes'],
                          ['correccion', 'Formatos'],
                          ['metricas', 'Métricas'],
                          ['rimas', 'Rimas']
                        ] as const
                      ).map(([tabId, label]) => (
                        <button
                          key={tabId}
                          type="button"
                          onClick={() => setHeroDemoTab(tabId)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                            heroDemoTab === tabId
                              ? 'bg-[var(--brand)] text-white'
                              : 'text-[var(--muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Input */}
                  <div className="mt-4">
                    <label htmlFor="hero-live-input" className="block text-xs font-bold text-[var(--muted)] mb-1.5">
                      Escribe una frase, titular o verso:
                    </label>
                    <input
                      id="hero-live-input"
                      type="text"
                      value={heroDemoText}
                      onChange={e => setHeroDemoText(e.target.value)}
                      maxLength={120}
                      placeholder="Escribe cualquier texto para transformarlo…"
                      className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-sm font-semibold text-[var(--text)]"
                    />
                  </div>

                  {/* Live Output based on selected tab */}
                  <div className="mt-4">
                    {heroDemoTab === 'fuentes' && (
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {heroLiveFonts.map(f => (
                          <div
                            key={f.name}
                            onClick={() => copyText(f.output, `Copiado: ${f.name}`)}
                            className="cursor-pointer p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/70 hover:border-[var(--brand2)] transition flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold">
                              <span>{f.name}</span>
                              <span className="text-[var(--brand2)]">Copiar</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[var(--text)] truncate">{f.output}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {heroDemoTab === 'correccion' && (
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {[
                          { label: 'MAYÚSCULAS', val: convertTextFormat(heroDemoText, 'upper') },
                          { label: 'Tipo Título Editorial', val: convertTextFormat(heroDemoText, 'title') },
                          { label: 'URL Slug SEO', val: convertTextFormat(heroDemoText, 'slug') },
                          { label: 'Hashtags Automáticos', val: convertTextFormat(heroDemoText, 'hashtags') }
                        ].map(item => (
                          <div
                            key={item.label}
                            onClick={() => copyText(item.val, `Copiado: ${item.label}`)}
                            className="cursor-pointer p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/70 hover:border-[var(--brand2)] transition"
                          >
                            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold">
                              <span>{item.label}</span>
                              <span className="text-[var(--brand2)]">Copiar</span>
                            </div>
                            <p className="mt-1 text-xs font-mono text-[var(--text)] truncate">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {heroDemoTab === 'metricas' && (
                      <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/70 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                            <strong className="block text-lg font-extrabold tabular-nums text-[var(--brand2)]">
                              {heroLiveAnalysis.words}
                            </strong>
                            <span className="text-[10px] font-bold text-[var(--muted)]">Palabras</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                            <strong className="block text-lg font-extrabold tabular-nums text-[var(--text)]">
                              {heroLiveAnalysis.chars}
                            </strong>
                            <span className="text-[10px] font-bold text-[var(--muted)]">Caracteres</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                            <strong className="block text-sm font-extrabold text-[var(--gold)] mt-1">
                              {heroLiveAnalysis.huertaLabel}
                            </strong>
                            <span className="text-[10px] font-bold text-[var(--muted)]">
                              Legibilidad ({heroLiveAnalysis.huertaReadability}/100)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {heroDemoTab === 'rimas' && (
                      <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/70">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs mb-2">
                          <span className="font-bold text-[var(--muted)]">
                            Rimas para «<strong className="text-[var(--brand2)]">{heroLiveMeter.endingWord}</strong>» ({heroLiveMeter.metricSyllables} síl.):
                          </span>
                          <a href="#rimar" className="text-xs font-bold text-[var(--brand2)] hover:underline">
                            Ir a Rimar →
                          </a>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {heroLiveRhymes.length > 0 ? (
                            heroLiveRhymes.map(r => (
                              <button
                                key={r.word}
                                type="button"
                                onClick={() => copyText(r.word, `Rima copiada: ${r.word}`)}
                                className="p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-left hover:border-[var(--brand2)] transition"
                              >
                                <strong className="block text-xs font-extrabold text-[var(--text)] truncate">{r.word}</strong>
                                <span className="text-[10px] font-mono text-[var(--muted)] truncate block">{r.syllableBreakdown}</span>
                              </button>
                            ))
                          ) : (
                            <span className="col-span-full text-xs text-[var(--muted)]">
                              Escribe otra palabra final para explorar rimas instantáneas.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span>Haz clic en cualquier tarjeta para copiar</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFontInput(heroDemoText);
                      setImpInput(heroDemoText);
                      setAnInput(heroDemoText);
                      const el = document.getElementById('fuente');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="font-extrabold text-[var(--brand2)] hover:underline"
                  >
                    Abrir en suite completa →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            BENTO TOOL CENTER — ARCHITECTURAL SHOWCASE
            ===================================================================== */}
        <section id="centro" className="py-12 sm:py-14 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 mb-7 sm:mb-8">
              <div>
                <span className="section-number">CENTRO DE OPERACIONES</span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
                  Las 10 Suites de TextoTodo Pro
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
                  Elige cualquier herramienta o usa el buscador rápido <kbd className="px-1.5 py-0.5 rounded border border-[var(--line)] text-[10px]">Ctrl+K</kbd>.
                </p>
              </div>

              <label
                htmlFor="tool-search"
                className="flex items-center gap-2.5 h-12 px-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] w-full md:w-auto md:min-w-[300px] focus-within:border-[var(--brand2)]"
              >
                <Search className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <input
                  id="tool-search"
                  type="text"
                  value={toolSearch}
                  onChange={e => setToolSearch(e.target.value)}
                  placeholder="Buscar herramienta (ej. resumir, correo, fuentes)…"
                  className="w-full bg-transparent border-0 outline-none text-sm text-[var(--text)]"
                />
                {toolSearch && (
                  <button
                    type="button"
                    onClick={() => setToolSearch('')}
                    aria-label="Limpiar búsqueda"
                    className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    ×
                  </button>
                )}
              </label>
            </div>

            {/* Recents Bar in Tool Center */}
            {recentTools.length > 0 && (
              <div className="mb-6 p-3.5 sm:px-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-3.5 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[var(--muted)] mr-1">Recientes:</span>
                  {recentTools.map(rId => {
                    const found = TOOL_CATALOG.find(t => t.id === rId);
                    if (!found) return null;
                    return (
                      <a
                        key={rId}
                        href={found.href}
                        className="px-2.5 py-1 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold text-[var(--text)] hover:border-[var(--brand)] transition"
                      >
                        {found.title}
                      </a>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setRecentTools([]);
                      localStorage.removeItem('textotodo-recents');
                    }}
                    className="ml-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {filteredTools.map(tool => {
                const IconComp = tool.icon;
                return (
                  <a
                    key={tool.id}
                    href={tool.href}
                    onClick={() => recordRecentTool(tool.id)}
                    className={`p-6 rounded-[24px] flex flex-col justify-between min-h-[196px] ${
                      tool.featuredMusic ? 'bento-card-music' : 'bento-card'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="section-number">{tool.index}</span>
                      <span
                        className={`w-11 h-11 rounded-2xl grid place-items-center border ${
                          tool.featuredMusic
                            ? 'bg-[var(--brand2)]/15 text-[var(--brand2)] border-[var(--brand2)]/30'
                            : 'bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand)]/25'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </span>
                    </div>

                    <div className="my-3">
                      <strong className="font-display text-lg font-extrabold text-[var(--text)] block">
                        {tool.title}
                      </strong>
                      <span className="mt-1 text-xs text-[var(--muted)] block leading-snug">
                        {tool.subtitle}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-[var(--line)]/70 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                      <span className="truncate">{tool.sample}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[var(--brand2)]" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* 1. FUENTES UNICODE PRO WORKSPACE */}
        <section id="fuente" className="py-10 sm:py-16 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 01 · TIPOGRAFÍA PARA REDES, BIOS Y TITULARES</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Generador de Fuentes Unicode Pro
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              44 estilos tipográficos combinables con 14 marcos decorativos para LinkedIn, Instagram, TikTok, WhatsApp, YouTube y presentaciones.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                  {(
                    [
                      ['todas', `Todas (${FONT_STYLES.length})`],
                      ['redes', 'Redes y Bios'],
                      ['elegantes', 'Elegantes'],
                      ['urbano', 'Modernas'],
                      ['decorativas', 'Decorativas']
                    ] as const
                  ).map(([catId, label]) => (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => setFontCategory(catId)}
                      className={`h-8 sm:h-9 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                        fontCategory === catId
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        displayedFonts
                          .map(s => `${s.name}:\n${activeFrame.wrap(s.transform(fontInput || 'TextoTodo'))}`)
                          .join('\n\n'),
                        'Todos los estilos copiados'
                      )
                    }
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[11px] sm:text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" /> Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTxt(
                        'textotodo-fuentes-pro.txt',
                        displayedFonts
                          .map(s => `${s.name}:\n${activeFrame.wrap(s.transform(fontInput || 'TextoTodo'))}`)
                          .join('\n\n')
                      )
                    }
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[11px] sm:text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" /> TXT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveToHistory(
                        'Fuentes Unicode Pro',
                        fontInput,
                        displayedFonts
                          .slice(0, 8)
                          .map(s => `${s.name}: ${activeFrame.wrap(s.transform(fontInput))}`)
                          .join('\n')
                      )
                    }
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[11px] sm:text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" /> Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTxt(
                        'textotodo-pack-44-fuentes.txt',
                        FONT_STYLES.map(
                          s =>
                            `=== ${s.name.toUpperCase()} ===\n` +
                            FONT_FRAMES.slice(0, 5)
                              .map(fr => fr.wrap(s.transform(fontInput || 'TextoTodo Pro')))
                              .join('\n')
                        ).join('\n\n')
                      )
                    }
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-[11px] sm:text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" /> Pack 44 Fuentes
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)]">
                <div className="lg:col-span-5 p-4 sm:p-6 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-[var(--muted)]">Tu texto, titular o biografía</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => pasteFromClipboard(setFontInput)}
                          className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                        >
                          <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                        </button>
                        <span className="text-xs text-[var(--muted)] tabular-nums">{fontInput.length} / 500</span>
                      </div>
                    </div>
                    <textarea
                      value={fontInput}
                      onChange={e => setFontInput(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Escribe cualquier frase para transformarla…"
                      className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y leading-relaxed"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-extrabold text-[var(--muted)] mb-2">
                      Marco decorativo opcional (desliza →)
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {FONT_FRAMES.map(frame => (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => setActiveFrameId(frame.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                            activeFrameId === frame.id
                              ? 'border-[var(--brand2)] bg-[var(--brand2)]/15 text-[var(--brand2)]'
                              : 'border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          {frame.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFontInput('')}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontInput('Especialista en Marketing Digital, Diseño & Estrategia 🚀')}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Bio Profesional
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontInput('Oferta especial disponible solo por tiempo limitado ✨')}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Anuncio / Post
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-[var(--muted)]">
                      Toca cualquier tarjeta para copiar al instante o marca favoritas con ★
                    </span>
                    <span className="text-xs text-[var(--muted)] tabular-nums">{displayedFonts.length} estilos</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[420px] sm:max-h-[560px] overflow-y-auto pr-0.5 sm:pr-1">
                    {displayedFonts.map(style => {
                      const transformed = style.transform(fontInput || 'TextoTodo');
                      const preview = activeFrame.wrap(transformed);
                      const isFav = favoriteFonts.includes(style.id);
                      const isJustCopied = copiedFontId === style.id;
                      return (
                        <article
                          key={style.id}
                          onClick={() => {
                            copyText(preview, `Copiado: ${style.name}`);
                            setCopiedFontId(style.id);
                            setTimeout(() => setCopiedFontId(prev => (prev === style.id ? null : prev)), 1400);
                          }}
                          className={`cursor-pointer p-3 sm:p-3.5 rounded-2xl border transition flex flex-col justify-between gap-1.5 ${
                            isJustCopied
                              ? 'border-[var(--green)] bg-[var(--green)]/10'
                              : 'border-[var(--line)] bg-[var(--surface2)]/70 hover:border-[var(--brand2)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleFavFont(style.id);
                              }}
                              title="Fijar estilo favorito"
                              className={`text-xs font-bold flex items-center gap-1 truncate ${
                                isFav ? 'text-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
                              }`}
                            >
                              <span>{isFav ? '★' : '☆'}</span>
                              <span className="truncate">{style.name}</span>
                            </button>
                            <span
                              className={`h-7 px-2.5 rounded-lg border text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 ${
                                isJustCopied
                                  ? 'border-[var(--green)] bg-[var(--green)] text-[#04120a]'
                                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text)]'
                              }`}
                            >
                              {isJustCopied ? '✓ Copiado' : 'Copiar'}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base break-words leading-snug text-[var(--text)] select-all">
                            {preview}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRADUCTOR PRO WORKSPACE */}
        <section id="traductor" className="py-10 sm:py-16 border-t border-[var(--line)] bg-[var(--surface)]/35">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 02 · IDIOMAS & VOZ NEURAL</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Traductor Multilingüe Pro
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              Traduce entre 6 idiomas con control de velocidad de pronunciación por voz (TTS) y descarga bilingüe para estudio o trabajo.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center gap-1.5 sm:gap-2">
                  <select
                    aria-label="Idioma de origen"
                    value={transFrom}
                    onChange={e => setTransFrom(e.target.value)}
                    className="h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="fr">Francés</option>
                    <option value="de">Alemán</option>
                    <option value="pt">Portugués</option>
                    <option value="it">Italiano</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTransFrom(transTo);
                      setTransTo(transFrom);
                      setTransInput(transOutput);
                      setTransOutput(transInput);
                    }}
                    aria-label="Intercambiar idiomas"
                    className="w-9 h-9 rounded-xl grid place-items-center border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)] shrink-0"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                  <select
                    aria-label="Idioma de destino"
                    value={transTo}
                    onChange={e => setTransTo(e.target.value)}
                    className="h-9 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                  >
                    <option value="en">Inglés</option>
                    <option value="es">Español</option>
                    <option value="fr">Francés</option>
                    <option value="de">Alemán</option>
                    <option value="pt">Portugués</option>
                    <option value="it">Italiano</option>
                  </select>

                  <select
                    aria-label="Velocidad de lectura por voz"
                    value={ttsRate}
                    onChange={e => setTtsRate(Number(e.target.value))}
                    className="col-span-3 sm:col-span-1 h-9 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                  >
                    <option value={0.8}>Voz 0.8x (Lenta)</option>
                    <option value={1}>Voz 1.0x (Normal)</option>
                    <option value={1.2}>Voz 1.2x (Rápida)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTxt(`traduccion-${transFrom}-${transTo}.txt`, `${transInput}\n\n---\n\n${transOutput}`)}
                    className="h-8 sm:h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Bilingüe TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => saveToHistory(`Traducción (${transFrom}→${transTo})`, transInput, transOutput)}
                    className="h-8 sm:h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const srcLines = (transInput || 'Hola equipo, revisamos objetivos.')
                        .split(/(?<=[.!?])\s+|\n+/)
                        .filter(Boolean);
                      const dstLines = (transOutput || 'Hello team, we review goals.')
                        .split(/(?<=[.!?])\s+|\n+/)
                        .filter(Boolean);
                      const max = Math.max(srcLines.length, dstLines.length);
                      const rows: string[] = [];
                      for (let i = 0; i < max; i++) {
                        rows.push(
                          `[${i + 1}] ORIGINAL (${transFrom.toUpperCase()}): ${srcLines[i] || '—'}\n    TRADUCCIÓN (${transTo.toUpperCase()}): ${dstLines[i] || '—'}`
                        );
                      }
                      downloadTxt(
                        `textotodo-espejo-bilingue-${transFrom}-${transTo}.txt`,
                        `DOSSIER BILINGÜE ESPEJO FRASE A FRASE · TEXTOTODO\n=================================================\nIdiomas: ${transFrom.toUpperCase()} → ${transTo.toUpperCase()}\n\n${rows.join('\n\n')}`
                      );
                    }}
                    className="col-span-2 sm:col-span-1 h-8 sm:h-9 px-3 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Espejo Bilingüe
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Texto original</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => pasteFromClipboard(setTransInput)}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                      >
                        <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTransInput(
                            'Hola equipo, os comparto el resumen del proyecto de esta semana para revisar los próximos objetivos antes del viernes.'
                          )
                        }
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-[var(--gold)]" /> Ejemplo
                      </button>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{transInput.length} / 4000</span>
                    </div>
                  </div>
                  <textarea
                    value={transInput}
                    onChange={e => setTransInput(e.target.value)}
                    maxLength={4000}
                    rows={5}
                    placeholder="Escribe o pega tu texto para traducir (hasta 4.000 caracteres por bloque)…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={transLoading}
                      onClick={handleTranslate}
                      className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)] disabled:opacity-50"
                    >
                      {transLoading ? 'Traduciendo…' : 'Traducir ahora'}
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(transInput, transFrom)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Escuchar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTransInput('');
                        setTransOutput('');
                        setTransStatus({ msg: '', type: '' });
                      }}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      Limpiar
                    </button>
                  </div>
                  {transStatus.msg && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-bold ${
                        transStatus.type === 'ok'
                          ? 'text-[var(--green)]'
                          : transStatus.type === 'error'
                            ? 'text-[var(--danger)]'
                            : 'text-[var(--muted)]'
                      }`}
                    >
                      {transStatus.msg}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Traducción</span>
                    <span className="text-xs text-[var(--muted)]">Salida</span>
                  </div>
                  <textarea
                    value={transOutput}
                    readOnly
                    rows={5}
                    placeholder="Aquí aparecerá la traducción…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60 text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(transOutput, 'Traducción copiada')}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Copiar traducción
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(transOutput, transTo)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Escuchar
                    </button>
                    <button
                      type="button"
                      onClick={() => sendToTool('fuente', transOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      A Fuentes →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. RESUMIDOR PRO WORKSPACE */}
        <section id="resumidor" className="py-10 sm:py-16 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 03 · SÍNTESIS INTELIGENTE, APUNTES & EJECUTIVOS</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Resumidor y Sintetizador Pro al Detalle
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              6 modos de síntesis en vivo (*Ficha Ejecutiva con Cifras, Viñetas Temáticas, Párrafo Continuo, Test de Examen, Plan de Acción y Hilo Social*) con compresión de relleno, anti-redundancia y filtro por palabra foco.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                  <div className="grid grid-cols-2 sm:flex items-center gap-2 flex-wrap w-full lg:w-auto">
                    <select
                      aria-label="Longitud del resumen"
                      value={sumLength}
                      onChange={e => setSumLength(Number(e.target.value))}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                    >
                      <option value={2}>Ultracorto · 2 ideas</option>
                      <option value={3}>Corto · 3 ideas</option>
                      <option value={5}>Equilibrado · 5 ideas</option>
                      <option value={7}>Detallado · 7 ideas</option>
                      <option value={10}>Completo · 10 ideas</option>
                    </select>
                    <select
                      aria-label="Formato del resumen"
                      value={sumFormat}
                      onChange={e => setSumFormat(e.target.value as SummaryFormat)}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                    >
                      <option value="executive">📌 Ficha ejecutiva + datos + conclusión</option>
                      <option value="bullets">• Viñetas temáticas de estudio</option>
                      <option value="paragraph">¶ Párrafo fluido sintetizado</option>
                      <option value="studyQuestions">❓ Preguntas y respuestas de examen</option>
                      <option value="actionPlan">⚡ Plan de acción paso a paso</option>
                      <option value="socialThread">🧵 Hilo numerado para redes (1/N)</option>
                    </select>
                    <input
                      type="text"
                      value={sumFocusKeyword}
                      onChange={e => setSumFocusKeyword(e.target.value)}
                      placeholder="Filtrar por tema o palabra…"
                      className="col-span-2 sm:col-span-1 h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold w-full sm:w-48"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => downloadTxt('textotodo-resumen-pro.txt', sumOutput)}
                      className="flex-1 sm:flex-none justify-center h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => printFormattedReport('Resumen Ejecutivo TextoTodo Pro', sumOutput)}
                      className="hidden sm:inline-flex justify-center h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--gold)] items-center gap-1.5"
                    >
                      PDF / Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={() => saveToHistory('Resumen Pro', sumInput, sumOutput)}
                      className="flex-1 sm:flex-none justify-center h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Guardar
                    </button>
                  </div>
                </div>

                {/* Interactive Concept Pills to Focus Summary in 1 Click */}
                {sumDetails && sumDetails.topKeywords.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[var(--line)]/60">
                    <span className="text-[11px] font-extrabold text-[var(--muted)] shrink-0">
                      Priorizar tema en 1 clic:
                    </span>
                    {sumFocusKeyword && (
                      <button
                        type="button"
                        onClick={() => setSumFocusKeyword('')}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30 shrink-0"
                      >
                        × Quitar filtro ({sumFocusKeyword})
                      </button>
                    )}
                    {sumDetails.topKeywords.map(kw => {
                      const active = sumFocusKeyword.toLowerCase() === kw.toLowerCase();
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => setSumFocusKeyword(active ? '' : kw)}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition whitespace-nowrap shrink-0 ${
                            active
                              ? 'border-[var(--brand2)] bg-[var(--brand2)]/15 text-[var(--brand2)]'
                              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          #{kw}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Documento, temario o artículo</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <label className="cursor-pointer h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand)] inline-flex items-center gap-1">
                        <span>Subir .TXT/.MD</span>
                        <input
                          type="file"
                          accept=".txt,.md,.csv,.html,.json,.srt"
                          onChange={e => handleFileUpload(e, setSumInput, 20000)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => startVoiceDictation('sum', setSumInput)}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition ${
                          dictatingTarget === 'sum'
                            ? 'border-[var(--danger)] bg-[var(--danger)]/15 text-[var(--danger)]'
                            : 'border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--brand2)]'
                        }`}
                      >
                        <Mic className="w-3 h-3 text-[var(--brand2)]" /> {dictatingTarget === 'sum' ? 'Escuchando…' : 'Dictar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => pasteFromClipboard(setSumInput)}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                      >
                        <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = UNIVERSAL_PRESETS[0].sampleText;
                          setSumInput(sample);
                          handleSummarize(sample);
                        }}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-[var(--gold)]" /> Ejemplo
                      </button>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{sumInput.length} / 20000</span>
                    </div>
                  </div>
                  <textarea
                    value={sumInput}
                    onChange={e => setSumInput(e.target.value)}
                    maxLength={20000}
                    rows={9}
                    placeholder="Pega un artículo, apuntes de clase, contrato o informe extenso…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y leading-relaxed"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSummarize()}
                      className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)]"
                    >
                      Actualizar resumen al detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSumInput('');
                        setSumOutput('');
                        setSumDetails(null);
                        setSumFocusKeyword('');
                        setSumStatus({ msg: '', type: '' });
                      }}
                      className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      Limpiar
                    </button>
                  </div>
                  {sumStatus.msg && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-bold ${
                        sumStatus.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--danger)]'
                      }`}
                    >
                      {sumStatus.msg}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-[var(--muted)]">Síntesis generada en vivo</span>
                      {sumDetails ? (
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          <span className="text-[var(--muted)] tabular-nums">
                            {sumDetails.originalWords} → <strong className="text-[var(--text)]">{sumDetails.summaryWords} pal.</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[var(--green-soft)] text-[var(--green)] tabular-nums">
                            -{sumDetails.savedPercentage}% ahorro
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">0 palabras</span>
                      )}
                    </div>

                    <textarea
                      value={sumOutput}
                      readOnly
                      rows={9}
                      placeholder="Tu síntesis detallada aparecerá aquí automáticamente…"
                      className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60 text-[var(--text)] resize-y leading-relaxed"
                    />

                    {/* Diagnostic Metadata Bar: Key Figures & Key Entities */}
                    {sumDetails && (sumDetails.keyFigures.length > 0 || sumDetails.keyEntities.length > 0) && (
                      <div className="mt-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/60 space-y-1.5 text-xs">
                        {sumDetails.keyFigures.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-[var(--gold)]">📊 Cifras clave:</span>
                            <span className="text-[var(--text)] font-mono text-[11px]">
                              {sumDetails.keyFigures.join(' · ')}
                            </span>
                          </div>
                        )}
                        {sumDetails.keyEntities.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-[var(--brand2)]">🏛️ Entidades/Nombres:</span>
                            <span className="text-[var(--text)] font-semibold text-[11px]">
                              {sumDetails.keyEntities.join(' · ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(sumOutput, 'Resumen copiado')}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Copiar resumen
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(sumOutput, 'es')}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Escuchar
                    </button>
                    <button
                      type="button"
                      onClick={() => sendToTool('traductor', sumOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Traducir →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const exec = summarizeTextDetailed(sumInput, 5, 'executive', sumFocusKeyword).output;
                        const test = summarizeTextDetailed(sumInput, 5, 'studyQuestions', sumFocusKeyword).output;
                        const plan = summarizeTextDetailed(sumInput, 5, 'actionPlan', sumFocusKeyword).output;
                        const thread = summarizeTextDetailed(sumInput, 5, 'socialThread', sumFocusKeyword).output;
                        downloadTxt(
                          'textotodo-dossier-estudio-4en1.txt',
                          `DOSSIER COMPLETO 4 EN 1 · TEXTOTODO\n===================================\n\n1. FICHA EJECUTIVA:\n${exec}\n\n2. TEST DE EXAMEN:\n${test}\n\n3. PLAN DE ACCIÓN:\n${plan}\n\n4. HILO PARA REDES:\n${thread}`
                        );
                      }}
                      className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar Pack 4 en 1
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MEJORADOR PRO WORKSPACE */}
        <section id="mejorador" className="py-10 sm:py-16 border-t border-[var(--line)] bg-[var(--surface)]/35">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 04 · CORRECTOR ORTOGRÁFICO PROFUNDO, GRAMÁTICA & ESTILO</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Corrector Ortográfico y Mejorador de Estilo Pro
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              Corrige faltas ortográficas y fonéticas reales (*b/v, c/s/z, k/qu, h omitidas, ll/y, -ao → -ado, tildes, nombres propios y signos `¿?` / `¡!` sin cerrar*), además de pulir muletillas y redundancias al instante.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <select
                  aria-label="Nivel de mejora del texto"
                  value={impLevel}
                  onChange={e => setImpLevel(e.target.value as ImproveLevel)}
                  className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                >
                  <option value="basic">Básico · Ortografía, tildes y signos de puntuación</option>
                  <option value="full">Completo · + Mayúsculas, nombres propios y muletillas</option>
                  <option value="editorial">Editorial Pro · + Fluidez, concordancia y giros</option>
                  <option value="directo">Directo y Conciso · + Recorte de adverbios débiles</option>
                </select>

                <button
                  type="button"
                  onClick={() => saveToHistory('Texto mejorado Pro', impInput, impOutput)}
                  className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Borrador con faltas o texto a pulir</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => startVoiceDictation('imp', setImpInput)}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition ${
                          dictatingTarget === 'imp'
                            ? 'border-[var(--danger)] bg-[var(--danger)]/15 text-[var(--danger)]'
                            : 'border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--brand2)]'
                        }`}
                      >
                        <Mic className="w-3 h-3 text-[var(--brand2)]" /> {dictatingTarget === 'imp' ? 'Escuchando…' : 'Dictar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => pasteFromClipboard(setImpInput)}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                      >
                        <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const extremeSample =
                            'Ayer abi en la tarde yo fui al supermercao porq abia ke comprar barias kosas que me faltavan en la kasa. Iba con mi amigo juan, el kual abia yegado kasi ase una ora de biajar. Cuando yegamos al parkeo, abia un carro mal estacionado ke nos kito el espasio. Juan se enojo mucho y empeso a ablar vien fuerte, disiendo: «¡ay no puede ser, esto es un desastre!».\nAl entrar, fuimos direktamente a la sersion de frutas. Yo keria saver cuamto costavan las manzanas, pero no abia presio por ningun lado. Al final agarramos dos kilo de platano, una bolsa de patajas y un bote de lele que estava caducao desde el mes pasao. ¿Por que la jente no revisa la fec.';
                          setImpInput(extremeSample);
                          handleImprove(extremeSample);
                        }}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-[var(--gold)]" /> Probar texto con errores
                      </button>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{impInput.length} / 8000</span>
                    </div>
                  </div>
                  <textarea
                    value={impInput}
                    onChange={e => setImpInput(e.target.value)}
                    maxLength={8000}
                    rows={7}
                    placeholder="Pega aquí tu correo, trabajo o mensaje para pulirlo…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleImprove()}
                      className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)]"
                    >
                      Perfeccionar texto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImpInput('');
                        setImpOutput('');
                        setImpNotes([]);
                        setImpStatus({ msg: '', type: '' });
                      }}
                      className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      Limpiar
                    </button>
                  </div>
                  {impStatus.msg && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-bold ${
                        impStatus.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--danger)]'
                      }`}
                    >
                      {impStatus.msg}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Versión perfeccionada</span>
                    <span className="text-xs text-[var(--muted)]">Salida local</span>
                  </div>
                  <textarea
                    value={impOutput}
                    readOnly
                    rows={7}
                    placeholder="El texto pulido aparecerá aquí…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60 text-[var(--text)] resize-y"
                  />
                  {impNotes.length > 0 && (
                    <div className="mt-2.5 text-[11px] text-[var(--muted)] flex flex-wrap gap-x-3 gap-y-1">
                      {impNotes.map((note, idx) => (
                        <span key={idx}>✓ {note}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(impOutput, 'Texto mejorado copiado')}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Copiar texto
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTxt('textotodo-corregido.txt', impOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => sendToTool('analizador', impOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Analizar SEO →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadTxt(
                          'textotodo-auditoria-editorial.txt',
                          `AUDITORÍA EDITORIAL TEXTOTODO\n=============================\nNivel aplicado: ${impLevel.toUpperCase()}\nMejoras detectadas: ${impNotes.join(', ') || 'Revisión general'}\n\n--- TEXTO ORIGINAL ---\n${impInput}\n\n--- VERSIÓN PERFECCIONADA ---\n${impOutput}`
                        )
                      }
                      className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Informe Antes/Después
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LIMPIADOR PRO WORKSPACE */}
        <section id="limpiador" className="py-10 sm:py-16 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 05 · SANEAMIENTO DE DOCUMENTOS & LISTAS</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Limpiador y Normalizador Pro
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              Elimina etiquetas HTML, formato Markdown, enlaces, correos, marcas de tiempo `[00:12]`, numeración de listas, duplicados y aplica buscar/reemplazar instantáneo.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold w-full lg:w-auto">
                    <select
                      aria-label="Modo de limpieza"
                      value={cleanMode}
                      onChange={e => setCleanMode(e.target.value as 'balanced' | 'aggressive')}
                      className="col-span-2 sm:col-span-1 h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] w-full sm:w-auto"
                    >
                      <option value="balanced">Modo equilibrado</option>
                      <option value="aggressive">Limpieza profunda (1 línea/párrafo)</option>
                    </select>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripHtml} onChange={e => setStripHtml(e.target.checked)} />
                      <span>Sin HTML</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripMarkdown} onChange={e => setStripMarkdown(e.target.checked)} />
                      <span>Sin Markdown</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripUrls} onChange={e => setStripUrls(e.target.checked)} />
                      <span>Sin URLs</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripEmails} onChange={e => setStripEmails(e.target.checked)} />
                      <span>Sin Emails</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripEmojis} onChange={e => setStripEmojis(e.target.checked)} />
                      <span>Sin Emojis</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={stripTimestamps} onChange={e => setStripTimestamps(e.target.checked)} />
                      <span>Sin tiempos [00:00]</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stripLeadingNumbers}
                        onChange={e => setStripLeadingNumbers(e.target.checked)}
                      />
                      <span>Sin viñetas/núm.</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={dedupeLines} onChange={e => setDedupeLines(e.target.checked)} />
                      <span>Sin repetidas</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveToHistory('Texto limpio Pro', cleanInput, cleanOutput)}
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1 border-t border-[var(--line)]/60">
                  <input
                    type="text"
                    value={findText}
                    onChange={e => setFindText(e.target.value)}
                    placeholder="Buscar texto…"
                    className="h-9 sm:h-8 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs w-full sm:w-40"
                  />
                  <input
                    type="text"
                    value={replaceText}
                    onChange={e => setReplaceText(e.target.value)}
                    placeholder="Reemplazar por…"
                    className="h-9 sm:h-8 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs w-full sm:w-40"
                  />
                  <select
                    aria-label="Ordenar líneas"
                    value={sortLines}
                    onChange={e => setSortLines(e.target.value as 'none' | 'asc' | 'desc' | 'length')}
                    className="col-span-2 sm:col-span-1 h-9 sm:h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold w-full sm:w-auto"
                  >
                    <option value="none">Orden original</option>
                    <option value="asc">Ordenar A → Z</option>
                    <option value="desc">Ordenar Z → A</option>
                    <option value="length">Ordenar por longitud</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Texto sucio o desordenado</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => pasteFromClipboard(setCleanInput)}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                      >
                        <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = UNIVERSAL_PRESETS[2].sampleText;
                          setCleanInput(sample);
                          setStripHtml(true);
                          setStripUrls(true);
                          setStripTimestamps(true);
                          setDedupeLines(true);
                          handleClean(sample);
                        }}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-[var(--gold)]" /> Ejemplo
                      </button>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{cleanInput.length} / 15000</span>
                    </div>
                  </div>
                  <textarea
                    value={cleanInput}
                    onChange={e => setCleanInput(e.target.value)}
                    maxLength={15000}
                    rows={7}
                    placeholder="Pega contenido desde PDFs, subtítulos, Excels, webs o correos…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleClean()}
                      className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)]"
                    >
                      Ejecutar limpieza Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCleanInput('');
                        setCleanOutput('');
                        setCleanStatus({ msg: '', type: '' });
                      }}
                      className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      Limpiar campo
                    </button>
                  </div>
                  {cleanStatus.msg && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-bold ${
                        cleanStatus.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--danger)]'
                      }`}
                    >
                      {cleanStatus.msg}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Texto limpio</span>
                    <span className="text-xs text-[var(--muted)] tabular-nums">{cleanOutput.length} caract.</span>
                  </div>
                  <textarea
                    value={cleanOutput}
                    readOnly
                    rows={7}
                    placeholder="Tu texto normalizado aparecerá aquí…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60 text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(cleanOutput, 'Texto limpio copiado')}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Copiar texto
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTxt('textotodo-limpio.txt', cleanOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => sendToTool('mejorador', cleanOutput)}
                      className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Enviar a Mejorar →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const lines = (cleanOutput || cleanInput)
                          .split(/\r?\n/)
                          .map(l => l.trim())
                          .filter(Boolean);
                        const csv = ['"Indice","Linea_Limpia"', ...lines.map((l, i) => `"${i + 1}","${l.replace(/"/g, '""')}"`)].join('\n');
                        const json = JSON.stringify({ totalLines: lines.length, items: lines }, null, 2);
                        downloadTxt(
                          'textotodo-datos-estructurados.txt',
                          `PACK DE DATOS LIMPIOS (CSV + JSON) · TEXTOTODO\n==============================================\nTotal registros limpios: ${lines.length}\n\n--- FORMATO CSV PARA EXCEL / SHEETS ---\n${csv}\n\n--- FORMATO JSON PARA DESARROLLO ---\n${json}`
                        );
                      }}
                      className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar CSV + JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ANALIZADOR PRO WORKSPACE */}
        <section id="analizador" className="py-10 sm:py-16 border-t border-[var(--line)] bg-[var(--surface)]/35">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 06 · AUDITORÍA LÉXICA, LEGIBILIDAD & SIMULADOR SERP GOOGLE</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Analizador de Texto, Densidad SEO y Simulador SERP
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              Mide legibilidad Fernández Huerta, tono predominante, densidad porcentual de palabras clave y previsualiza tu resultado en Google Search y redes sociales en vivo.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold text-[var(--muted)]">Texto a inspeccionar</span>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => pasteFromClipboard(setAnInput)}
                    className="h-8 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-[var(--brand2)]" /> Pegar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnInput(UNIVERSAL_PRESETS[0].sampleText)}
                    className="h-8 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[var(--gold)]" /> Ejemplo
                  </button>
                  <span className="text-xs text-[var(--muted)] tabular-nums">{anInput.length} / 20000</span>
                  <button
                    type="button"
                    onClick={() => {
                      const report = [
                        `Palabras: ${analysisMetrics.words} · Caracteres: ${analysisMetrics.chars} (sin espacios: ${analysisMetrics.charsNoSpaces})`,
                        `Frases: ${analysisMetrics.sentences} (más larga: ${analysisMetrics.longestSentenceWords} pal.) · Párrafos: ${analysisMetrics.paragraphs}`,
                        `Tiempo de lectura: ${analysisMetrics.readingTimeMin} min · Locución: ${analysisMetrics.speakingTimeSec} s`,
                        `Legibilidad Fernández Huerta: ${analysisMetrics.huertaReadability}/100 (${analysisMetrics.huertaLabel}) · Tono: ${analysisMetrics.toneIndicator}`,
                        `Palabras clave: ${analysisMetrics.keywords.map(k => `${k.word} (${k.count} - ${k.densityPct}%)`).join(', ')}`
                      ].join('\n');
                      copyText(report, 'Informe completo copiado');
                    }}
                    className="h-8 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                  >
                    Copiar informe
                  </button>
                </div>
              </div>

              <textarea
                value={anInput}
                onChange={e => setAnInput(e.target.value)}
                maxLength={20000}
                rows={5}
                placeholder="Pega o escribe tu texto para auditar todas sus métricas en tiempo real…"
                className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y"
              />

              <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-lg sm:text-xl font-extrabold tabular-nums">{analysisMetrics.words}</strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold">Palabras</span>
                </div>
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-lg sm:text-xl font-extrabold tabular-nums">{analysisMetrics.chars}</strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold">
                    Caract. ({analysisMetrics.charsNoSpaces})
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-lg sm:text-xl font-extrabold tabular-nums">{analysisMetrics.sentences}</strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold">
                    Frases ({analysisMetrics.avgWordsPerSentence} p/f)
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-lg sm:text-xl font-extrabold tabular-nums">
                    {analysisMetrics.readingTimeMin} min
                  </strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold">
                    Lectura ({analysisMetrics.speakingTimeSec}s)
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-lg sm:text-xl font-extrabold tabular-nums text-[var(--brand2)]">
                    {analysisMetrics.huertaReadability}
                  </strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold truncate block">
                    {analysisMetrics.huertaLabel}
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                  <strong className="block text-xs sm:text-sm font-extrabold truncate text-[var(--gold)] mt-1">
                    {analysisMetrics.toneIndicator}
                  </strong>
                  <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-bold">
                    Variedad: {analysisMetrics.uniquePercentage}%
                  </span>
                </div>
              </div>

              <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {[
                  { name: 'X / Post', limit: 280 },
                  { name: 'Instagram Bio', limit: 150 },
                  { name: 'Meta Description SEO', limit: 160 },
                  { name: 'LinkedIn Post', limit: 3000 }
                ].map(plat => {
                  const pct = Math.min(100, Math.round((analysisMetrics.chars / plat.limit) * 100));
                  const over = analysisMetrics.chars > plat.limit;
                  return (
                    <div key={plat.name} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/60">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{plat.name}</span>
                        <span className={`tabular-nums ${over ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}`}>
                          {analysisMetrics.chars}/{plat.limit}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                        <div
                          className={`h-full ${over ? 'bg-[var(--danger)]' : 'bg-[var(--brand2)]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--line)] space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[var(--muted)] mr-1">Densidad de palabras clave:</span>
                  {analysisMetrics.keywords.length > 0 ? (
                    analysisMetrics.keywords.map((kw, idx) => (
                      <React.Fragment key={kw.word}>
                        {idx > 0 && <span className="text-[var(--muted)] opacity-50">·</span>}
                        <span className="text-xs font-bold text-[var(--text)]">
                          {kw.word}{' '}
                          <span className="tabular-nums text-[var(--brand2)]">
                            ({kw.count} · {kw.densityPct}%)
                          </span>
                        </span>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--muted)]">
                      Escribe para calcular densidad léxica.
                    </span>
                  )}
                </div>

                {analysisMetrics.bigrams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[var(--muted)] mr-1">Expresiones frecuentes (2 pal.):</span>
                    {analysisMetrics.bigrams.map((bg, idx) => (
                      <React.Fragment key={bg.phrase}>
                        {idx > 0 && <span className="text-[var(--muted)] opacity-50">·</span>}
                        <span className="text-xs font-bold text-[var(--gold)]">
                          “{bg.phrase}” ({bg.count})
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {analysisMetrics.trigrams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[var(--muted)] mr-1">Frases SEO (3 pal.):</span>
                    {analysisMetrics.trigrams.map((tg, idx) => (
                      <React.Fragment key={tg.phrase}>
                        {idx > 0 && <span className="text-[var(--muted)] opacity-50">·</span>}
                        <span className="text-xs font-bold text-[var(--brand2)]">
                          “{tg.phrase}” ({tg.count})
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* SIMULADOR EN VIVO DE GOOGLE SERP + OPENGRAPH + META TAGS */}
              <div className="mt-5 pt-5 border-t border-[var(--line)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-extrabold text-[var(--brand)] uppercase tracking-wider">
                      NUEVO · SIMULADOR VISUAL GOOGLE SERP & OPENGRAPH SOCIAL
                    </span>
                    <h3 className="font-display text-sm sm:text-base font-extrabold text-[var(--text)]">
                      Previsualización de Snippet en Buscadores, Tarjeta Social y Código Meta HTML
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={serpDomain}
                      onChange={e => setSerpDomain(e.target.value)}
                      placeholder="Dominio (ej. textotodo.es)"
                      className="h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold w-36"
                    />
                    <button
                      type="button"
                      onClick={() => copyText(serpPreview.htmlMetaSnippet, 'Etiquetas Meta HTML y OpenGraph copiadas')}
                      className="h-8 px-3 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand)]/40 text-[var(--brand)] text-xs font-extrabold hover:bg-[var(--brand)] hover:text-white transition"
                    >
                      Copiar Meta Tags HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const schemaJson = JSON.stringify(
                          {
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: serpPreview.title,
                            description: serpPreview.description,
                            wordCount: analysisMetrics.words,
                            inLanguage: 'es-ES',
                            mainEntityOfPage: `https://${serpPreview.domain}/${serpPreview.slug}`
                          },
                          null,
                          2
                        );
                        downloadTxt(
                          'textotodo-auditoria-seo.txt',
                          `AUDITORÍA TÉCNICA SEO & CÓDIGO WEB · TEXTOTODO\n==============================================\nURL Objetivo: https://${serpPreview.domain}/${serpPreview.slug}\nPalabras: ${analysisMetrics.words} · Caracteres: ${analysisMetrics.chars}\nLegibilidad Fernández Huerta: ${analysisMetrics.huertaReadability}/100 (${analysisMetrics.huertaLabel})\nTono detectado: ${analysisMetrics.toneIndicator}\n\n1. TOP PALABRAS CLAVE (DENSIDAD):\n${analysisMetrics.keywords.map(k => `- ${k.word}: ${k.count} apariciones (${k.densityPct}%)`).join('\n')}\n\n2. ETIQUETAS META HTML & OPENGRAPH:\n${serpPreview.htmlMetaSnippet}\n\n3. DATOS ESTRUCTURADOS SCHEMA.ORG (JSON-LD):\n<script type="application/ld+json">\n${schemaJson}\n</script>`
                        );
                      }}
                      className="h-8 px-3 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar Auditoría SEO + Schema
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
                  <input
                    type="text"
                    value={serpCustomTitle}
                    onChange={e => setSerpCustomTitle(e.target.value)}
                    placeholder={`Título SEO opcional (auto: ${serpPreview.title.slice(0, 42)}…)`}
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--text)]"
                  />
                  <input
                    type="text"
                    value={serpCustomDesc}
                    onChange={e => setSerpCustomDesc(e.target.value)}
                    placeholder="Meta Description opcional (por defecto se extrae de tu texto)…"
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--text)]"
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-3.5">
                  {/* Google Search Result Card */}
                  <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] mb-2">
                      <span>Vista previa en Google Search (Desktop / Mobile)</span>
                      <span
                        className={
                          serpPreview.titleStatus === 'optimal' && serpPreview.descStatus === 'optimal'
                            ? 'text-[var(--green)]'
                            : 'text-[var(--gold)]'
                        }
                      >
                        Título: {serpPreview.titleLength}/60 · Desc: {serpPreview.descLength}/155
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      https://{serpPreview.domain}/{serpPreview.slug}
                    </div>
                    <div className="mt-1 text-base font-bold text-[#8ab4f8] hover:underline truncate">
                      {serpPreview.title}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {serpPreview.description}
                    </p>
                  </div>

                  {/* Social OpenGraph Card (LinkedIn / X) */}
                  <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] mb-2">
                      <span>Tarjeta OpenGraph (LinkedIn / X / WhatsApp)</span>
                      <span className="text-[var(--brand2)] uppercase font-mono text-[10px]">og:card</span>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                      <div className="text-[10px] font-extrabold text-[var(--brand)] uppercase tracking-wider">
                        {serpPreview.domain}
                      </div>
                      <div className="font-display text-xs sm:text-sm font-extrabold text-[var(--text)] truncate mt-0.5">
                        {serpPreview.title}
                      </div>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1">
                        {serpPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CONVERTIDOR PRO WORKSPACE */}
        <section id="convertidor" className="py-10 sm:py-16 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <span className="section-number">SUITE 07 · TRANSFORMACIÓN, LISTAS & CÓDIGO</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
              Convertidor de Formatos Pro
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
              18 transformaciones en tiempo real: mayúsculas, título inteligente, `camelCase`, `PascalCase`, `snake_case`, `CONSTANTE_MAYUS`, `url-slug`, quitar tildes, generar `#hashtags`, numerar líneas, checklist `[ ]`, fila CSV, Base64 y URL Encode.
            </p>

            <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] studio-console overflow-hidden">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--line)] bg-[var(--surface2)]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap no-scrollbar pb-1 sm:pb-0">
                  {(
                    [
                      ['upper', 'MAYÚSCULAS'],
                      ['lower', 'minúsculas'],
                      ['sentence', 'Tipo frase'],
                      ['title', 'Tipo Título Pro'],
                      ['alternating', 'aLtErNaDo'],
                      ['noAccents', 'Sin tildes'],
                      ['camel', 'camelCase'],
                      ['pascal', 'PascalCase'],
                      ['snake', 'snake_case'],
                      ['screamingSnake', 'SCREAMING_SNAKE'],
                      ['slug', 'url-slug'],
                      ['hashtags', '#hashtags'],
                      ['numbered', '1. Numerar'],
                      ['bullets', '• Viñetas'],
                      ['checklist', '[ ] Tareas'],
                      ['csvRow', 'Fila CSV'],
                      ['markdownTable', 'Tabla Markdown'],
                      ['extractLinks', 'Extraer Enlaces'],
                      ['base64Encode', 'Base64'],
                      ['urlEncode', 'URL Encode'],
                      ['reverse', 'Invertir']
                    ] as const
                  ).map(([mId, label]) => (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => handleConvert(mId)}
                      className={`h-8 px-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                        convMode === mId
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => saveToHistory('Conversión Pro', convInput, convOutput)}
                  className="h-8 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--brand)] inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Texto de entrada</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => pasteFromClipboard(setConvInput)}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                      >
                        <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = 'Guía definitiva de productividad, diseño web y marketing digital 2026';
                          setConvInput(sample);
                          setConvOutput(convertTextFormat(sample, convMode));
                        }}
                        className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--gold)] inline-flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3 text-[var(--gold)]" /> Ejemplo
                      </button>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{convInput.length} / 10000</span>
                    </div>
                  </div>
                  <textarea
                    value={convInput}
                    onChange={e => setConvInput(e.target.value)}
                    maxLength={10000}
                    rows={6}
                    placeholder="Escribe o pega tu texto aquí…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleConvert()}
                      className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)]"
                    >
                      Convertir ahora
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConvInput('');
                        setConvOutput('');
                        setConvStatus({ msg: '', type: '' });
                      }}
                      className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      Limpiar
                    </button>
                  </div>
                  {convStatus.msg && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-bold ${
                        convStatus.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--danger)]'
                      }`}
                    >
                      {convStatus.msg}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[var(--muted)]">Resultado convertido</span>
                    <span className="text-xs text-[var(--muted)]">Salida</span>
                  </div>
                  <textarea
                    value={convOutput}
                    readOnly
                    rows={6}
                    placeholder="El texto convertido aparecerá aquí…"
                    className="w-full p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60 text-[var(--text)] resize-y"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(convOutput, 'Resultado copiado')}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Copiar resultado
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTxt('textotodo-convertido.txt', convOutput)}
                      className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                    >
                      Descargar TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allModes: Array<[ConvertMode, string]> = [
                          ['upper', 'MAYÚSCULAS'],
                          ['lower', 'minúsculas'],
                          ['sentence', 'Tipo frase'],
                          ['title', 'Tipo Título Pro'],
                          ['camel', 'camelCase'],
                          ['pascal', 'PascalCase'],
                          ['snake', 'snake_case'],
                          ['screamingSnake', 'SCREAMING_SNAKE'],
                          ['slug', 'URL Slug SEO'],
                          ['hashtags', 'Hashtags'],
                          ['numbered', 'Lista numerada'],
                          ['checklist', 'Checklist de tareas'],
                          ['csvRow', 'Fila CSV'],
                          ['base64Encode', 'Base64'],
                          ['urlEncode', 'URL Encode']
                        ];
                        const bundle = allModes
                          .map(([m, lbl]) => `=== ${lbl.toUpperCase()} ===\n${convertTextFormat(convInput || 'TextoTodo Pro', m)}`)
                          .join('\n\n');
                        downloadTxt('textotodo-18-formatos.txt', bundle);
                      }}
                      className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar los 18 Formatos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. RIMAR · MÚSICA ESTUDIO PRO WORKSPACE */}
        <section id="rimar" className="py-10 sm:py-16 border-t border-[var(--line)] bg-[var(--surface)]/35">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-7">
              <div>
                <span className="section-number">
                  SUITE 08 · DICCIONARIO ESPAÑOL COMPLETO ({DICTIONARY_TOTAL_WORDS.toLocaleString('es-ES')}+ PALABRAS), RIMAS & MÉTRICA
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-balance mt-1">
                  Diccionario de Rimas, Léxico Español y Métrica Poética
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
                  Busca rimas consonantes, asonantes y multisilábicas en <strong>{DICTIONARY_TOTAL_WORDS.toLocaleString('es-ES')} voces reales</strong>, consulta definiciones y sinónimos, y mide tus estrofas con sinalefas y caja de ritmos BPM.
                </p>
              </div>

              <div className="w-full lg:w-auto p-3.5 sm:p-4 rounded-2xl studio-console flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 shrink-0">
                <div>
                  <span className="block text-[11px] font-extrabold text-[var(--muted)]">
                    Caja de Ritmos & Metrónomo
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <strong className="text-base sm:text-lg font-extrabold tabular-nums text-[var(--brand2)]">{bpm} BPM</strong>
                    <div className="flex items-center gap-1 ml-1">
                      {[1, 2, 3, 4].map(beat => (
                        <span
                          key={beat}
                          className={`w-2.5 h-2.5 rounded-sm transition-transform ${
                            isMetronomePlaying && currentBeat === beat
                              ? beat === 1
                                ? 'bg-[var(--brand2)] scale-125'
                                : 'bg-[var(--brand)] scale-110'
                              : 'bg-[var(--line)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <select
                  aria-label="Estilo de base rítmica o metrónomo"
                  value={drumBeatStyle}
                  onChange={e => setDrumBeatStyle(e.target.value as DrumBeatStyle)}
                  className="h-9 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-extrabold text-[var(--text)]"
                >
                  <option value="boombap">Beat Boom-Bap (90s)</option>
                  <option value="trap">Beat Trap / Drill 808</option>
                  <option value="reggaeton">Beat Reggaetón Dembow</option>
                  <option value="pop">Beat Pop / Indie</option>
                  <option value="metronome">Solo Pulso Clásico</option>
                </select>

                <input
                  type="range"
                  min={60}
                  max={175}
                  value={bpm}
                  onChange={e => setBpm(Number(e.target.value))}
                  aria-label="Ajustar tempo en BPM"
                  className="flex-1 sm:flex-none min-w-[80px] sm:w-24 accent-[var(--brand2)]"
                />

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleTapTempo}
                    title="Pulsa varias veces al ritmo para detectar los BPM"
                    className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-extrabold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                  >
                    <Timer className="w-3.5 h-3.5 text-[var(--brand2)]" /> Tap
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMetronomePlaying(prev => !prev)}
                    className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition ${
                      isMetronomePlaying
                        ? 'bg-[var(--danger)] text-white'
                        : 'bg-[var(--brand2)] text-[#061018]'
                    }`}
                  >
                    {isMetronomePlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Parar
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> {drumBeatStyle === 'metronome' ? 'Pulso' : 'Base'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
              {/* Left Column: Dictionary + Rhymes */}
              <article className="lg:col-span-7 p-4 sm:p-6 rounded-[22px] sm:rounded-[26px] studio-console flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold">
                        1. Buscador de Rimas y Diccionario ({DICTIONARY_TOTAL_WORDS.toLocaleString('es-ES')} voces)
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Filtra por sílabas, categoría gramatical y tipo de rima.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[var(--brand2)] tabular-nums">
                      {rhymeResults.length} resultados
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <label className="col-span-2 block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Palabra a rimar o definir</span>
                      <input
                        type="text"
                        value={rhymeWord}
                        onChange={e => setRhymeWord(e.target.value)}
                        maxLength={40}
                        placeholder="corazón, libertad, cantaremos…"
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--text)]"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Modo de rima</span>
                      <select
                        value={rhymeType}
                        onChange={e => setRhymeType(e.target.value as 'consonante' | 'asonante' | 'multisilabica')}
                        className="w-full h-10 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs sm:text-sm text-[var(--text)]"
                      >
                        <option value="consonante">Consonante</option>
                        <option value="asonante">Asonante</option>
                        <option value="multisilabica">Multisilábica</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Categoría</span>
                      <select
                        value={rhymeCategoryFilter}
                        onChange={e => setRhymeCategoryFilter(e.target.value as 'todas' | WordCategory)}
                        className="w-full h-10 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs sm:text-sm text-[var(--text)]"
                      >
                        <option value="todas">Todas</option>
                        <option value="sustantivo">Sustantivos</option>
                        <option value="verbo">Verbos</option>
                        <option value="adjetivo">Adjetivos</option>
                        <option value="adverbio">Adverbios</option>
                      </select>
                    </label>
                    <label className="col-span-2 sm:col-span-1 block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Sílabas</span>
                      <select
                        value={rhymeSyllableFilter}
                        onChange={e => setRhymeSyllableFilter(Number(e.target.value))}
                        className="w-full h-10 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs sm:text-sm text-[var(--text)]"
                      >
                        <option value={0}>Todas</option>
                        <option value={2}>2 sílabas</option>
                        <option value={3}>3 sílabas</option>
                        <option value={4}>4 sílabas</option>
                        <option value={5}>5 sílabas</option>
                        <option value={6}>6+ sílabas</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 overflow-x-auto sm:flex-wrap no-scrollbar pb-1 sm:pb-0">
                    {['corazón', 'libertad', 'esperanza', 'silencio', 'calle', 'noche', 'camino', 'fuego', 'verdad', 'universo'].map(sample => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setRhymeWord(sample)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                          rhymeWord.toLowerCase() === sample
                            ? 'border-[var(--brand2)] bg-[var(--brand2)]/15 text-[var(--brand2)]'
                            : 'border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        {sample}
                      </button>
                    ))}
                    <select
                      aria-label="Cantidad de resultados"
                      value={rhymeCount}
                      onChange={e => setRhymeCount(Number(e.target.value))}
                      className="ml-auto px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold shrink-0"
                    >
                      <option value={24}>24 rimas</option>
                      <option value={48}>48 rimas</option>
                      <option value={96}>96 rimas</option>
                      <option value={160}>160 rimas</option>
                    </select>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {rhymeResults.length > 0 ? (
                      rhymeResults.map(item => (
                        <div
                          key={item.word}
                          onClick={() => copyText(item.word, `Rima copiada: ${item.word}`)}
                          className="cursor-pointer p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--brand2)] transition flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <strong className="text-xs sm:text-sm font-extrabold text-[var(--text)] truncate">{item.word}</strong>
                            <span className="text-[10px] text-[var(--brand2)] font-bold shrink-0">
                              {item.category.slice(0, 4)}.
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] font-mono text-[var(--muted)] truncate">
                            {item.syllableBreakdown}
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--muted)]">
                            <span className="tabular-nums truncate">{item.syllables} síl. · {item.stress}</span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setSchemeInput(prev => (prev.trim() ? `${prev}\n${item.word}` : item.word));
                                addToast(`"${item.word}" añadida a tu estrofa`);
                              }}
                              className="text-[var(--brand2)] hover:underline font-bold shrink-0 ml-1"
                            >
                              + Verso
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full p-4 rounded-xl border border-dashed border-[var(--line)] text-xs text-[var(--muted)]">
                        No encontramos coincidencias con ese filtro. Prueba cambiando la categoría a «Todas» o el modo a rima asonante.
                      </div>
                    )}
                  </div>
                </div>

                {/* FICHA DEL DICCIONARIO NORMAL DEL ESPAÑOL Y FAMILIA LÉXICA */}
                <div className="mt-4 p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--line)]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-extrabold text-[var(--brand)] uppercase">
                        Diccionario Español:
                      </span>
                      <strong className="font-display text-sm sm:text-base font-extrabold text-[var(--text)]">
                        «{dictionaryReport.word}»
                      </strong>
                      <span className="text-xs font-mono text-[var(--brand2)]">
                        [{dictionaryReport.syllableBreakdown}]
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--gold)]">
                      {dictionaryReport.category} · {dictionaryReport.stressType}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                    {dictionaryReport.definition}
                  </p>

                  <div className="mt-3 grid sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-extrabold text-[var(--muted)] uppercase mb-1">
                        Sinónimos (clic para buscar):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dictionaryReport.synonyms.map(syn => (
                          <button
                            key={syn}
                            type="button"
                            onClick={() => setRhymeWord(syn)}
                            className="px-2 py-0.5 rounded-md bg-[var(--surface2)] border border-[var(--line)] text-[11px] font-bold text-[var(--brand2)] hover:border-[var(--brand2)]"
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold text-[var(--muted)] uppercase mb-1">
                        Familia léxica:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dictionaryReport.morphologicalFamily.slice(0, 6).map(fam => (
                          <button
                            key={fam}
                            type="button"
                            onClick={() => setRhymeWord(fam)}
                            className="px-2 py-0.5 rounded-md bg-[var(--surface2)] border border-[var(--line)] text-[11px] font-bold text-[var(--text)] hover:border-[var(--brand)]"
                          >
                            {fam}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Right Column: Unified Stanza & Verse Meter Studio */}
              <article className="lg:col-span-5 p-4 sm:p-6 rounded-[22px] sm:rounded-[26px] studio-console flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold">
                        2. Estudio de Estrofas, Esquema A/B y Métrica
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Mide sílabas con sinalefas y detecta el patrón de rima en vivo.
                      </p>
                    </div>
                    <select
                      aria-label="Modo de rima del esquema"
                      value={schemeMode}
                      onChange={e => setSchemeMode(e.target.value as 'consonante' | 'asonante')}
                      className="h-8 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                    >
                      <option value="consonante">Consonante</option>
                      <option value="asonante">Asonante</option>
                    </select>
                  </div>

                  {/* Quick Inspiration & Song Structure Toolbar */}
                  <div className="mb-3 p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Estilo musical de la estructura"
                        value={songStyle}
                        onChange={e => setSongStyle(e.target.value as 'urbano' | 'pop' | 'balada' | 'epico')}
                        className="h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--text)]"
                      >
                        <option value="urbano">Estructura Urbana</option>
                        <option value="pop">Estructura Pop</option>
                        <option value="balada">Estructura Balada</option>
                        <option value="epico">Estructura Rap</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const blueprint = generateSongBlueprint(rhymeWord, songStyle, bpm);
                          setSchemeInput(blueprint);
                          setSelectedVerseIdx(0);
                          addToast('Maqueta generada en el editor');
                        }}
                        className="h-8 px-3 rounded-lg bg-[var(--brand)] text-white text-xs font-extrabold inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <Wand2 className="w-3 h-3" /> Crear Maqueta
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFreestyleIdx(prev => prev + 1);
                        setSchemeInput(prev => (prev.trim() ? `${prev}\n${currentPrompt.opener}` : currentPrompt.opener));
                        addToast('Verso de inspiración añadido');
                      }}
                      className="h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-bold hover:border-[var(--gold)] inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Dices className="w-3.5 h-3.5 text-[var(--gold)]" /> + Idea
                    </button>
                  </div>

                  <textarea
                    value={schemeInput}
                    onChange={e => setSchemeInput(e.target.value)}
                    rows={5}
                    maxLength={4000}
                    placeholder="Escribe tus versos aquí (uno por línea)…"
                    className="w-full p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--text)] leading-relaxed resize-y"
                  />

                  {/* Interactive Stanza Breakdown */}
                  <div className="mt-3 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/60">
                    {schemeResult.rows.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--line)]">
                          <span className="text-xs font-extrabold text-[var(--gold)]">
                            {schemeResult.stanzaPatternName} ({schemeResult.avgSyllables} síl. media)
                          </span>
                          <span className="text-[11px] text-[var(--muted)]">
                            Toca un verso para auditar sinalefas y rimar
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-0.5">
                          {schemeResult.rows.map((row, idx) => {
                            const isSelected = idx === selectedVerseIdx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedVerseIdx(idx);
                                  if (row.endingWord && row.endingWord !== '—') {
                                    setRhymeWord(row.endingWord);
                                  }
                                }}
                                className={`cursor-pointer flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-xl border transition ${
                                  isSelected
                                    ? 'bg-[var(--brand-soft)] border-[var(--brand2)]'
                                    : 'bg-[var(--surface)] border-[var(--line)]/60 hover:border-[var(--brand2)]'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-md grid place-items-center font-extrabold bg-[var(--brand2)]/15 text-[var(--brand2)] shrink-0 text-[11px]">
                                  {row.letter}
                                </span>
                                <span className="tabular-nums font-bold text-[var(--muted)] shrink-0">
                                  {row.metricSyllables}s
                                </span>
                                <span className="flex-1 truncate text-[var(--text)]">{row.text}</span>
                                <span className="text-[10px] font-mono text-[var(--gold)] shrink-0">-{row.rhymeKey}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--muted)] py-6 text-center">
                        Escribe tus líneas arriba para ver el patrón A/B/C y medir cada verso.
                      </div>
                    )}
                  </div>

                  {/* Detailed Syllable & Sinalefa Breakdown for Selected Verse */}
                  {meterResult.syllableTokens.length > 0 && (
                    <div className="mt-3 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[var(--muted)] mb-1.5">
                        <span>Escansión del verso activo ({meterResult.artType}):</span>
                        <span className="text-[var(--brand2)] tabular-nums">
                          {meterResult.phoneticSyllables} fonéticas · {meterResult.sinalefas} sinalefas · {meterResult.stressType} ({meterResult.stressAdjustment >= 0 ? `+${meterResult.stressAdjustment}` : meterResult.stressAdjustment}) = {meterResult.metricSyllables} síl.
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs font-mono text-[var(--brand2)]">
                        {meterResult.syllableTokens.map((tok, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface2)] border border-[var(--line)]">
                            {tok}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        schemeResult.rows.map(r => `[${r.letter} · ${r.metricSyllables} síl.] ${r.text}`).join('\n'),
                        'Estrofa y métrica copiadas'
                      )
                    }
                    className="flex-1 h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                  >
                    Copiar letra
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTxt(
                        'textotodo-letra.txt',
                        `${schemeResult.stanzaPatternName}\n\n` +
                          schemeResult.rows.map(r => `[${r.letter} - ${r.metricSyllables} síl.] ${r.text}`).join('\n')
                      )
                    }
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                  >
                    TXT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveToHistory(
                        'Letra y Esquema',
                        schemeInput,
                        `${schemeResult.stanzaPatternName}\n\n` +
                          schemeResult.rows.map(r => `[${r.letter} - ${r.metricSyllables} síl.] ${r.text}`).join('\n')
                      )
                    }
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:border-[var(--brand)]"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchemeInput('')}
                    className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    Vaciar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTxt(
                        'textotodo-libreto-musical.txt',
                        `LIBRETO DE COMPOSICIÓN · TEXTOTODO\n==================================\nTempo: ${bpm} BPM (${drumBeatStyle})\nPatrón estrófico: ${schemeResult.stanzaPatternName} (${schemeResult.avgSyllables} síl. media)\nPalabra clave: ${rhymeWord} (${rhymeResults.slice(0, 15).map(r => r.word).join(', ')})\n\n--- LETRA ESCANDIDA ---\n` +
                          schemeResult.rows.map(r => `[${r.letter} · ${r.metricSyllables} síl.] ${r.text}`).join('\n')
                      )
                    }
                    className="h-9 px-3 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar Libreto Completo
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SUITE 09 · AUTOPILOT 1-CLIC (FLUJO ENCADENADO DE 5 MOTORES SIMULTÁNEOS)
            ===================================================================== */}
        <section id="autopilot" className="py-12 sm:py-16 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <div>
                <span className="section-number">SUITE 09 · FLUJO INTELIGENTE 5 EN 1 (AUTOPILOT PRO)</span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
                  Piloto Automático de Documentos en 1 Clic
                </h2>
                <p className="mt-1.5 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
                  Pega cualquier borrador sucio, apunte o informe: Autopilot lo limpia, corrige su ortografía, extrae el resumen ejecutivo, genera preguntas de examen y crea el titular SEO con hashtags de una sola vez.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyText(autopilotReport.markdownBundle, 'Dossier Autopilot completo copiado')}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Dossier Completo
                </button>
                <button
                  type="button"
                  onClick={() => downloadTxt('textotodo-dossier-autopilot.md', autopilotReport.markdownBundle)}
                  className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-extrabold hover:border-[var(--brand2)] inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--brand2)]" /> Exportar .MD / .TXT
                </button>
                <button
                  type="button"
                  onClick={() => printFormattedReport('Dossier Ejecutivo Autopilot', autopilotReport.markdownBundle)}
                  className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/50 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Imprimir / Guardar PDF
                </button>
              </div>
            </div>

            <div className="rounded-[24px] sm:rounded-[28px] studio-console p-4 sm:p-6 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-extrabold text-[var(--muted)]">
                    Texto bruto de entrada (se procesa automáticamente en los 5 motores)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startVoiceDictation('auto', setAutoInput)}
                      className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition ${
                        dictatingTarget === 'auto'
                          ? 'border-[var(--danger)] bg-[var(--danger)]/15 text-[var(--danger)]'
                          : 'border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--brand2)]'
                      }`}
                    >
                      <Mic className="w-3 h-3 text-[var(--brand2)]" /> {dictatingTarget === 'auto' ? 'Escuchando…' : 'Dictar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => pasteFromClipboard(setAutoInput)}
                      className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold hover:border-[var(--brand2)] inline-flex items-center gap-1"
                    >
                      <ClipboardPaste className="w-3 h-3 text-[var(--brand2)]" /> Pegar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoInput('')}
                      className="h-7 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[11px] font-bold"
                    >
                      Vaciar
                    </button>
                  </div>
                </div>
                <textarea
                  value={autoInput}
                  onChange={e => setAutoInput(e.target.value)}
                  rows={4}
                  maxLength={15000}
                  placeholder="Pega aquí tu texto sin revisar para que Autopilot ejecute los 5 pasos al instante…"
                  className="w-full p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--text)]"
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/70 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--brand2)] uppercase">
                      PASO 1 & 2 · LIMPIEZA + ORTOGRAFÍA ({autopilotReport.correctionsCount} MEJORAS)
                    </span>
                    <p className="mt-2 text-xs text-[var(--text)] leading-relaxed line-clamp-6 whitespace-pre-wrap">
                      {autopilotReport.correctedText || 'Escribe un texto arriba…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(autopilotReport.correctedText, 'Texto corregido copiado')}
                    className="mt-3 text-xs font-extrabold text-[var(--brand2)] hover:underline text-left"
                  >
                    Copiar texto corregido →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/70 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--gold)] uppercase">
                      PASO 3 · RESUMEN EJECUTIVO & PUNTOS CLAVE
                    </span>
                    <p className="mt-2 text-xs text-[var(--text)] leading-relaxed line-clamp-6 whitespace-pre-wrap">
                      {autopilotReport.executiveSummary || 'Esperando texto…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(autopilotReport.executiveSummary, 'Resumen ejecutivo copiado')}
                    className="mt-3 text-xs font-extrabold text-[var(--gold)] hover:underline text-left"
                  >
                    Copiar resumen ejecutivo →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/70 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--green)] uppercase">
                      PASO 4 · PREGUNTAS DE AUTOEVALUACIÓN
                    </span>
                    <div className="mt-2 space-y-1.5 text-xs text-[var(--text)] max-h-[135px] overflow-y-auto">
                      {autopilotReport.studyQuestions.slice(0, 4).map((q, i) => (
                        <p key={i} className="leading-snug">{q}</p>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(autopilotReport.studyQuestions.join('\n'), 'Test de estudio copiado')}
                    className="mt-3 text-xs font-extrabold text-[var(--green)] hover:underline text-left"
                  >
                    Copiar test completo →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/70 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-[#ee4f98] uppercase">
                      PASO 5 · KIT SEO, SLUG & MÉTRICA HUERTA
                    </span>
                    <div className="text-xs">
                      <strong className="block text-[var(--muted)] text-[10px]">Titular SEO:</strong>
                      <span className="font-bold text-[var(--text)] block truncate">{autopilotReport.seoHeadline}</span>
                    </div>
                    <div className="text-xs">
                      <strong className="block text-[var(--muted)] text-[10px]">URL Slug:</strong>
                      <code className="text-[11px] text-[var(--brand2)] block truncate">/{autopilotReport.urlSlug}</code>
                    </div>
                    <div className="text-xs">
                      <strong className="block text-[var(--muted)] text-[10px]">Legibilidad:</strong>
                      <span className="font-bold text-[var(--gold)]">
                        {autopilotReport.metrics.huertaScore}/100 ({autopilotReport.metrics.huertaLabel})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(`${autopilotReport.seoHeadline}\n/${autopilotReport.urlSlug}\n${autopilotReport.hashtags}`, 'Kit SEO copiado')}
                    className="mt-3 text-xs font-extrabold text-[#ee4f98] hover:underline text-left"
                  >
                    Copiar titular, slug y #tags →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SUITE 10 · LABORATORIO DOCUMENTAL, CITAS APA 7 & PLANTILLAS B2B
            ===================================================================== */}
        <section id="laboratorio" className="py-12 sm:py-16 border-t border-[var(--line)] bg-[var(--surface)]/35">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="section-number">SUITE 10 · AUDITORÍA DE VERSIONES, BIBLIOGRAFÍA & PLANTILLAS</span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
                  Comparador Diff A/B, Citas APA 7 y Plantillas Ejecutivas
                </h2>
                <p className="mt-1.5 text-xs sm:text-base text-[var(--muted)] max-w-2xl">
                  Compara dos versiones de un contrato o ensayo palabra por palabra, genera referencias bibliográficas oficiales (APA 7, MLA 9, ISO 690, Harvard, BibTeX) o redacta comunicaciones comerciales en segundos.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] self-start">
                {(
                  [
                    ['diff', 'Comparador A/B (Diff)'],
                    ['citas', 'Citas APA 7 / ISO / MLA'],
                    ['plantillas', 'Plantillas B2B & WhatsApp']
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLabTab(id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                      labTab === id
                        ? 'bg-[var(--brand)] text-white shadow'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {labTab === 'diff' && (
              <div className="rounded-[24px] sm:rounded-[28px] studio-console p-4 sm:p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--muted)] mb-1.5">
                      Versión Original (Texto A)
                    </label>
                    <textarea
                      value={diffTextA}
                      onChange={e => setDiffTextA(e.target.value)}
                      rows={4}
                      placeholder="Pega aquí la versión original…"
                      className="w-full p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--text)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--muted)] mb-1.5">
                      Versión Modificada (Texto B)
                    </label>
                    <textarea
                      value={diffTextB}
                      onChange={e => setDiffTextB(e.target.value)}
                      rows={4}
                      placeholder="Pega aquí la versión nueva para detectar qué ha cambiado…"
                      className="w-full p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                    <strong className="block text-lg font-extrabold text-[var(--brand2)] tabular-nums">
                      {diffReport.similarityPct}%
                    </strong>
                    <span className="text-[11px] font-bold text-[var(--muted)]">Similitud textual</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                    <strong className="block text-lg font-extrabold text-[var(--green)] tabular-nums">
                      +{diffReport.addedWords}
                    </strong>
                    <span className="text-[11px] font-bold text-[var(--muted)]">Palabras añadidas</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                    <strong className="block text-lg font-extrabold text-[var(--danger)] tabular-nums">
                      -{diffReport.removedWords}
                    </strong>
                    <span className="text-[11px] font-bold text-[var(--muted)]">Palabras eliminadas</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-center">
                    <strong className="block text-lg font-extrabold text-[var(--text)] tabular-nums">
                      {diffReport.lengthDeltaChars >= 0 ? `+${diffReport.lengthDeltaChars}` : diffReport.lengthDeltaChars}
                    </strong>
                    <span className="text-[11px] font-bold text-[var(--muted)]">Diferencia caract.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/70">
                  <span className="block text-xs font-extrabold text-[var(--muted)] mb-2">
                    Mapa visual de cambios (Rojo tachado = eliminado · Verde = añadido):
                  </span>
                  <div className="text-sm leading-relaxed flex flex-wrap gap-1">
                    {diffReport.tokens.map((tok, i) => (
                      <span
                        key={i}
                        className={
                          tok.type === 'added'
                            ? 'px-1.5 py-0.5 rounded bg-[var(--green-soft)] text-[var(--green)] font-bold'
                            : tok.type === 'removed'
                              ? 'px-1.5 py-0.5 rounded bg-[var(--danger)]/15 text-[var(--danger)] line-through opacity-80'
                              : 'text-[var(--text)]'
                        }
                      >
                        {tok.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {labTab === 'citas' && (
              <div className="rounded-[24px] sm:rounded-[28px] studio-console p-4 sm:p-6 space-y-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <label className="block">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">Nombre del autor/a</span>
                    <input
                      type="text"
                      value={citeAuthorFirst}
                      onChange={e => setCiteAuthorFirst(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">Apellidos del autor/a</span>
                    <input
                      type="text"
                      value={citeAuthorLast}
                      onChange={e => setCiteAuthorLast(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">Año de publicación</span>
                    <input
                      type="text"
                      value={citeYear}
                      onChange={e => setCiteYear(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                  <label className="block sm:col-span-2 lg:col-span-1">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">Título de la obra, artículo o web</span>
                    <input
                      type="text"
                      value={citeTitle}
                      onChange={e => setCiteTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">Editorial, Universidad o Sitio Web</span>
                    <input
                      type="text"
                      value={citeSource}
                      onChange={e => setCiteSource(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-[var(--muted)] mb-1">URL o DOI</span>
                    <input
                      type="text"
                      value={citeUrl}
                      onChange={e => setCiteUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-3.5">
                  {[
                    { name: 'Formato APA (7.ª Edición)', value: citationsOutput.apa7 },
                    { name: 'Formato MLA (9.ª Edición)', value: citationsOutput.mla9 },
                    { name: 'Norma ISO 690 (España / UE)', value: citationsOutput.iso690 },
                    { name: 'Estilo Harvard', value: citationsOutput.harvard },
                    { name: 'Estilo Chicago', value: citationsOutput.chicago },
                    { name: 'Código BibTeX (LaTeX / Overleaf)', value: citationsOutput.bibtex }
                  ].map(item => (
                    <div
                      key={item.name}
                      onClick={() => copyText(item.value, `${item.name} copiado`)}
                      className="cursor-pointer p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/75 hover:border-[var(--brand2)] transition flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-extrabold text-[var(--brand2)]">{item.name}</strong>
                        <span className="text-[11px] font-bold text-[var(--muted)]">Copiar</span>
                      </div>
                      <pre className="text-xs font-mono text-[var(--text)] whitespace-pre-wrap break-words">
                        {item.value}
                      </pre>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                  <span className="text-xs text-[var(--muted)]">
                    Haz clic en cualquier norma para copiarla individualmente o exporta la hoja bibliográfica completa:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTxt(
                        'textotodo-bibliografia-6-normas.txt',
                        `REFERENCIA BIBLIOGRÁFICA OFICIAL (6 NORMAS) · TEXTOTODO\n=======================================================\n\n1. APA 7.ª EDICIÓN:\n${citationsOutput.apa7}\n\n2. MLA 9.ª EDICIÓN:\n${citationsOutput.mla9}\n\n3. NORMA ISO 690:\n${citationsOutput.iso690}\n\n4. ESTILO HARVARD:\n${citationsOutput.harvard}\n\n5. ESTILO CHICAGO:\n${citationsOutput.chicago}\n\n6. BIBTEX (LATEX):\n${citationsOutput.bibtex}`
                      )
                    }
                    className="h-9 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar las 6 Normas (.TXT)
                  </button>
                </div>
              </div>
            )}

            {labTab === 'plantillas' && (
              <div className="rounded-[24px] sm:rounded-[28px] studio-console p-4 sm:p-6 space-y-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {EXECUTIVE_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTplSelected(tpl.id)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        tplSelected === tpl.id
                          ? 'border-[var(--brand2)] bg-[var(--brand-soft)]'
                          : 'border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--brand)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-extrabold text-[var(--text)]">{tpl.label}</strong>
                        <span className="text-[10px] font-bold text-[var(--gold)]">{tpl.badge}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--muted)] leading-snug">{tpl.description}</p>
                    </button>
                  ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5 space-y-3">
                    <label className="block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Tema, proyecto o motivo</span>
                      <input
                        type="text"
                        value={tplTopic}
                        onChange={e => setTplTopic(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="block">
                        <span className="block text-xs font-bold text-[var(--muted)] mb-1">Destinatario</span>
                        <input
                          type="text"
                          value={tplRecipient}
                          onChange={e => setTplRecipient(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-bold text-[var(--muted)] mb-1">Tu nombre / firma</span>
                        <input
                          type="text"
                          value={tplSender}
                          onChange={e => setTplSender(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="block text-xs font-bold text-[var(--muted)] mb-1">Llamada a la acción (CTA)</span>
                      <input
                        type="text"
                        value={tplCta}
                        onChange={e => setTplCta(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold"
                      />
                    </label>
                  </div>

                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <textarea
                      value={tplGenerated}
                      readOnly
                      rows={8}
                      className="w-full p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] text-xs sm:text-sm text-[var(--text)] leading-relaxed"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyText(tplGenerated, 'Plantilla copiada al portapapeles')}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar mensaje listo
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadTxt('textotodo-comunicado.txt', tplGenerated)}
                        className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
                      >
                        Descargar TXT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const allTpls = EXECUTIVE_TEMPLATES.map(
                            t => `=== ${t.label.toUpperCase()} (${t.badge}) ===\n${t.build(tplTopic, tplSender, tplRecipient, tplCta)}`
                          ).join('\n\n----------------------------------------\n\n');
                          downloadTxt('textotodo-pack-6-plantillas-b2b.txt', allTpls);
                        }}
                        className="h-10 px-3.5 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar las 6 Plantillas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            VOLUNTARY DONATION SECTION — 100% FREE PLATFORM
            ===================================================================== */}
        <section id="donar" className="py-10 sm:py-12 border-t border-[var(--line)] bg-gradient-to-r from-[var(--surface)] via-[var(--brand-soft)]/35 to-[var(--surface)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5">
            <div className="p-5 sm:p-7 rounded-[26px] studio-console border border-[var(--line)] space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#ee4f98]">
                    <Gift className="w-3.5 h-3.5" />
                    <span>100% GRATIS Y ABIERTO · APOYO VOLUNTARIO</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[var(--text)]">
                    Todas las herramientas y descargas son gratis. Si te resulta útil, puedes apoyar con una donación.
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    En TextoTodo no hay muros de pago, ni suscripciones ni funciones bloqueadas. Todo está abierto gratis para todo el mundo. Si te ahorra tiempo y te apetece invitar a un café a Rafa, puedes donar libremente por PayPal.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openSupportModal('5')}
                    className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#c92573] via-[#ee4f98] to-[#c9a75c] text-white text-xs font-extrabold shadow-lg hover:brightness-110 inline-flex items-center gap-2 transition"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Donar voluntariamente en PayPal</span>
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-[var(--line)]">
                {DONATION_TIERS.map(tier => (
                  <a
                    key={tier.amount}
                    href={`https://www.paypal.com/paypalme/Rafa930paypal/${tier.amount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                      tier.featured
                        ? 'border-[#ee4f98]/60 bg-[#c92573]/10 shadow-md'
                        : 'border-[var(--line)] bg-[var(--surface2)]/85 hover:border-[#ee4f98]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-xl font-extrabold tabular-nums text-[var(--text)]">
                          {tier.amount} €
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--line)] text-[10px] font-extrabold uppercase text-[#ee4f98]">
                          {tier.badge}
                        </span>
                      </div>
                      <strong className="block text-xs sm:text-sm font-extrabold text-[var(--text)] mt-1.5">
                        {tier.title}
                      </strong>
                      <p className="mt-1 text-[11px] text-[var(--muted)] leading-snug">{tier.desc}</p>
                    </div>

                    <span
                      className={`mt-4 w-full h-9 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
                        tier.featured
                          ? 'bg-gradient-to-r from-[#c92573] via-[#ee4f98] to-[#c9a75c] text-white shadow-sm hover:brightness-110'
                          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[#ee4f98]'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5 text-[#ee4f98]" /> Donar {tier.amount} €
                    </span>
                  </a>
                ))}
              </div>

              {/* Explicit Non-Liability Disclaimer Box */}
              <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/90 text-[11px] text-[var(--muted)] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-[var(--text)] font-extrabold">⚠️ Aviso importante y exención de responsabilidad:</strong>{' '}
                  Todas las herramientas de TextoTodo son gratuitas y se ofrecen «tal cual» (<em>as-is</em>). <strong>El creador NO se hace responsable si alguna herramienta, descarga, traducción o función no llega a funcionar</strong> en tu navegador o dispositivo. Contacto oficial: <a href="mailto:textotodo.oficial@gmail.com" className="text-[var(--brand2)] font-bold hover:underline">textotodo.oficial@gmail.com</a>.
                </div>
                <button
                  type="button"
                  onClick={() => setLegalModalTab('legal')}
                  className="shrink-0 text-xs font-extrabold text-[var(--brand2)] hover:underline self-start sm:self-center"
                >
                  Ver cláusula legal →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            FAQ, SUPPORT & FEEDBACK SECTION (CLEAN & UNIFIED)
            ===================================================================== */}
        <section id="faq" className="py-10 sm:py-14 border-t border-[var(--line)]">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-5 grid lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Concise FAQ */}
            <div className="lg:col-span-6">
              <span className="section-number">GUÍA RÁPIDA & DUDAS FRECUENTES</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Preguntas frecuentes
              </h2>
              <div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {[
                  [
                    '¿Cómo cambiar el tipo de letra para Instagram, TikTok, WhatsApp o LinkedIn?',
                    'Escribe tu frase en Fuentes Unicode Pro (#fuente), elige entre los 44 estilos tipográficos y 14 marcos decorativos y pulsa Copiar. Al usar estándares Unicode oficiales, el formato se mantiene en biografías, comentarios y publicaciones.'
                  ],
                  [
                    '¿Cómo funciona el Resumidor de Textos y Apuntes?',
                    'Analiza la densidad léxica y posición de cada frase para sintetizar textos largos en 6 formatos: ficha ejecutiva, viñetas de estudio, párrafo fluido, preguntas tipo test, plan de acción o hilo para redes.'
                  ],
                  [
                    '¿Cómo mide las sílabas poéticas y encuentra rimas en más de 15.000 palabras?',
                    'El estudio Rimar (#rimar) indexa el diccionario español completo con definiciones y sinónimos, y divide cada verso aplicando sinalefas y la ley del acento final (+1 aguda, -1 esdrújula).'
                  ],
                  [
                    '¿Hay suscripción, registro o costes ocultos?',
                    'No. Todas las herramientas funcionan gratis y al instante sin crear cuenta. Si te ahorra tiempo, puedes apoyar el proyecto voluntariamente por PayPal.'
                  ]
                ].map(([q, a]) => (
                  <details key={q} className="py-3.5 group">
                    <summary className="cursor-pointer font-extrabold text-sm text-[var(--text)] leading-snug">
                      {q}
                    </summary>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Right 6 cols: Direct Feedback + Optional Coffee Support */}
            <div id="valoracion" className="lg:col-span-6 space-y-4">
              <div className="p-5 sm:p-6 rounded-[24px] studio-console">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="section-number">CONTACTO Y VALORACIONES</span>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold mt-0.5">
                      Envía tu sugerencia o valoración a Rafa
                    </h3>
                  </div>
                  <div className="flex gap-1" role="group" aria-label="Valoración de 1 a 5 estrellas">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} de 5 estrellas`}
                        className={`w-9 h-9 rounded-xl border text-base transition ${
                          star <= rating
                            ? 'border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold)] font-bold'
                            : 'border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {['Sugerencia de mejora', 'Me ha ahorrado tiempo', 'Nueva herramienta', 'Reporte de fallo'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                        feedbackCategory === cat
                          ? 'border-[var(--brand2)] bg-[var(--brand2)]/15 text-[var(--brand2)]'
                          : 'border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  maxLength={1500}
                  rows={2}
                  placeholder="Escribe tu comentario o sugerencia para textotodo.oficial@gmail.com…"
                  className="mt-2.5 w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs sm:text-sm text-[var(--text)]"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={feedbackSending}
                      onClick={handleFeedbackSubmit}
                      className="h-9 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[var(--brand)] to-[var(--brand2)] disabled:opacity-50"
                    >
                      {feedbackSending ? 'Enviando…' : 'Enviar valoración'}
                    </button>
                    <a
                      href={mailtoFeedbackHref}
                      className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-[var(--brand2)]" /> Correo directo
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSupportOpen(true)}
                    className="h-9 px-3.5 rounded-xl border border-[#c92573]/50 bg-[#c92573]/10 text-[#ee4f98] text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-[#c92573]/20 transition"
                  >
                    <Gift className="w-3.5 h-3.5" /> Apoyar en PayPal
                  </button>
                </div>

                {feedbackStatus.msg && (
                  <p
                    role="status"
                    className={`mt-2.5 text-xs font-bold ${
                      feedbackStatus.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--danger)]'
                    }`}
                  >
                    {feedbackStatus.msg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER WITH INTERNAL SEO ANCHOR DIRECTORY */}
      <footer className="py-10 border-t border-[var(--line)] bg-[var(--surface)] pb-24 lg:pb-10">
        <div className="max-w-[1260px] mx-auto px-5">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 font-display font-extrabold">
                <span className="w-8 h-8 rounded-xl grid place-items-center bg-gradient-to-br from-[#5147dc] via-[#756aff] to-[#c9a75c]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 6.5h14M5 11.5h10M5 16.5h7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-base">TextoTodo Pro</span>
              </div>
              <p className="mt-2.5 text-xs text-[var(--muted)] max-w-md leading-relaxed">
                Plataforma gratuita 10 en 1 para cambiar fuentes Unicode, traducir con voz, resumir apuntes, corregir estilo, limpiar formato, auditar SEO, comparar versiones, generar citas APA 7 y buscar rimas en el diccionario español.
              </p>
              <p className="mt-2.5 text-xs text-[var(--muted)]">
                © {new Date().getFullYear()} TextoTodo · Creado por Rafael Moreno Roman.
              </p>
            </div>

            <nav aria-label="Directorio de herramientas de texto" className="md:col-span-4">
              <strong className="block text-xs font-extrabold uppercase tracking-wider text-[var(--gold)] mb-2">
                10 Suites Directas
              </strong>
              <ul className="grid grid-cols-2 gap-1.5 text-xs font-bold text-[var(--muted)]">
                <li><a href="#fuente" className="hover:text-[var(--brand2)] transition">01 · Fuentes Unicode</a></li>
                <li><a href="#traductor" className="hover:text-[var(--brand2)] transition">02 · Traductor con Voz</a></li>
                <li><a href="#resumidor" className="hover:text-[var(--brand2)] transition">03 · Resumidor Online</a></li>
                <li><a href="#mejorador" className="hover:text-[var(--brand2)] transition">04 · Corrector Estilo</a></li>
                <li><a href="#limpiador" className="hover:text-[var(--brand2)] transition">05 · Limpiador Texto</a></li>
                <li><a href="#analizador" className="hover:text-[var(--brand2)] transition">06 · Contador & SEO</a></li>
                <li><a href="#convertidor" className="hover:text-[var(--brand2)] transition">07 · Convertidor Caso</a></li>
                <li><a href="#rimar" className="hover:text-[var(--brand2)] transition">08 · Rimas & Diccionario</a></li>
                <li><a href="#autopilot" className="hover:text-[var(--brand2)] transition">09 · Autopilot 5 en 1</a></li>
                <li><a href="#laboratorio" className="hover:text-[var(--brand2)] transition">10 · Citas APA & Diff</a></li>
              </ul>
            </nav>

            <div className="md:col-span-3 flex flex-col md:items-end justify-between">
              <div className="flex flex-wrap md:justify-end gap-2.5 text-xs font-bold text-[var(--muted)]">
                {LEGAL_TABS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLegalModalTab(t.id)}
                    className="hover:text-[var(--brand2)] transition"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 md:text-right space-y-1">
                {!isInstalled && (isInstallable || isIOS) && (
                  <button
                    type="button"
                    onClick={() => (isInstallable ? install() : setShowIOSGuide(true))}
                    className="text-xs font-bold text-[var(--brand2)] hover:underline inline-flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Instalar como App (PWA)
                  </button>
                )}
                <p className="text-xs text-[var(--muted)]">
                  Contacto:{' '}
                  <a href="mailto:textotodo.oficial@gmail.com" className="text-[var(--brand2)] font-bold hover:underline">
                    textotodo.oficial@gmail.com
                  </a>
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Apoyar:{' '}
                  <a
                    href="https://www.paypal.com/paypalme/Rafa930paypal/5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ee4f98] font-extrabold hover:underline"
                  >
                    PayPal.Me/Rafa930paypal
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--line)] text-[11px] text-[var(--muted)] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong>Nota legal de responsabilidad:</strong> TextoTodo se ofrece «tal cual» (<em>as-is</em>). El titular no se hace responsable si alguna herramienta, traducción, descarga o función no llega a funcionar o presenta fallos en tu dispositivo.
            </span>
            <a href="mailto:textotodo.oficial@gmail.com" className="text-[var(--brand2)] font-bold hover:underline shrink-0">
              textotodo.oficial@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {/* PERMANENT MOBILE & TABLET BOTTOM NAVIGATION BAR + UPWARD SHEET */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/55 backdrop-blur-xs"
        />
      )}

      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú completo de herramientas"
          className="lg:hidden fixed left-2.5 right-2.5 bottom-[74px] z-50 rounded-3xl studio-console p-4 space-y-3 shadow-2xl max-h-[72dvh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <strong className="font-display text-sm font-extrabold text-[var(--text)]">
              Las 10 Suites de TextoTodo Pro
            </strong>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="w-7 h-7 rounded-lg grid place-items-center border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TOOL_CATALOG.map(tool => {
              const ToolIcon = tool.icon;
              const active = activeSection === tool.href;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                    active
                      ? 'border-[var(--brand2)] bg-[var(--brand-soft)] text-[var(--brand2)]'
                      : 'border-[var(--line)] bg-[var(--surface2)] text-[var(--text)]'
                  }`}
                >
                  <ToolIcon className="w-4 h-4 shrink-0 text-[var(--brand2)]" />
                  <span className="truncate">{tool.title}</span>
                </a>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCommandOpen(true);
              }}
              className="h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-[var(--brand2)]" /> Buscador rápido
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsHistoryOpen(true);
              }}
              className="h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-[var(--gold)]" /> Historial ({history.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSupportOpen(true);
              }}
              className="flex-1 h-10 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#c92573] to-[#ee4f98]"
            >
              ♥ Apoyar en PayPal
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setLegalModalTab('privacy');
              }}
              className="h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold"
            >
              Legal
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="Menú inferior fijo en móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.35)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
          {[
            { href: '#fuente', label: 'Fuentes', icon: Type },
            { href: '#traductor', label: 'Traducir', icon: Languages },
            { href: '#resumidor', label: 'Resumir', icon: AlignLeft },
            { href: '#rimar', label: 'Rimar', icon: Music }
          ].map(item => {
            const IconComp = item.icon;
            const isActive = activeSection === item.href && !isMobileMenuOpen;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition ${
                  isActive
                    ? 'bg-[var(--brand-soft)] text-[var(--brand2)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <IconComp className="w-4 h-4 mb-0.5 shrink-0" />
                <span className="truncate max-w-full">{item.label}</span>
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-expanded={isMobileMenuOpen}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition ${
              isMobileMenuOpen
                ? 'bg-[var(--brand)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 mb-0.5 shrink-0" />
            ) : (
              <Menu className="w-4 h-4 mb-0.5 shrink-0" />
            )}
            <span className="truncate max-w-full">Menú (10)</span>
          </button>
        </div>
      </nav>

      {/* COMMAND PALETTE MODAL */}
      {isCommandOpen && (
        <div
          onClick={() => setIsCommandOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start justify-center pt-[6vh] sm:pt-[10vh] p-3 sm:p-4"
        >
          <section
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Buscador de herramientas"
            className="w-full max-w-xl rounded-[24px] sm:rounded-[26px] studio-console overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <strong className="font-display text-base font-extrabold">¿Qué quieres hacer?</strong>
              <button
                type="button"
                onClick={() => setIsCommandOpen(false)}
                className="w-8 h-8 rounded-lg grid place-items-center border border-[var(--line)]"
              >
                ×
              </button>
            </div>
            <div className="p-3 border-b border-[var(--line)] bg-[var(--surface2)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={e => {
                  setCommandQuery(e.target.value);
                  setCommandIdx(0);
                }}
                placeholder="Buscar una herramienta o acción…"
                className="w-full bg-transparent border-0 outline-none text-sm"
              />
              <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] rounded border border-[var(--line)]">Esc</kbd>
            </div>
            <div className="max-h-[55vh] sm:max-h-[340px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.title}
                  type="button"
                  onClick={() => executeCommandTarget(cmd.target)}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition ${
                    idx === commandIdx ? 'bg-[var(--brand-soft)] text-[var(--brand2)]' : 'hover:bg-[var(--surface2)]'
                  }`}
                >
                  <span className="w-9 h-9 rounded-lg grid place-items-center border border-[var(--line)] bg-[var(--surface2)] text-xs font-extrabold shrink-0">
                    {cmd.tag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-xs font-extrabold truncate">{cmd.title}</strong>
                    <small className="block text-[11px] text-[var(--muted)] truncate">{cmd.desc}</small>
                  </div>
                  <span className="text-xs text-[var(--muted)]">↵</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* VOLUNTARY DONATION / PAYPAL MODAL */}
      {isSupportOpen && (
        <div
          onClick={() => setIsSupportOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-3 sm:p-4 overflow-y-auto"
        >
          <section
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-[24px] sm:rounded-[26px] studio-console"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-[var(--line)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#ee4f98] shrink-0" />
                <h2 id="support-modal-title" className="font-display text-base sm:text-lg font-extrabold">
                  Apoyar TextoTodo con una donación voluntaria
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                className="w-9 h-9 rounded-xl grid place-items-center border border-[var(--line)]"
              >
                ×
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Todas las herramientas, suites y descargas de TextoTodo son <strong>100% gratuitas para siempre</strong>. Si te ayudan en tu estudio o trabajo, puedes hacer una donación voluntaria por PayPal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DONATION_TIERS.map(opt => (
                  <a
                    key={opt.amount}
                    href={`https://www.paypal.com/paypalme/Rafa930paypal/${opt.amount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      opt.featured
                        ? 'border-[#ee4f98]/60 bg-[#c92573]/10 shadow-md'
                        : 'border-[var(--line)] bg-[var(--surface2)] hover:border-[#ee4f98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-extrabold tabular-nums text-[var(--text)]">{opt.amount} €</span>
                        <span className="text-[10px] font-extrabold text-[#ee4f98] uppercase">{opt.badge}</span>
                      </div>
                      <strong className="text-xs font-extrabold text-[var(--text)] mt-1 block">{opt.title}</strong>
                      <small className="text-[11px] text-[var(--muted)] mt-0.5 block leading-snug">{opt.desc}</small>
                    </div>
                    <span className="mt-3 w-full h-8 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[11px] font-extrabold text-[#ee4f98] grid place-items-center">
                      Donar {opt.amount} € →
                    </span>
                  </a>
                ))}
              </div>

              <div className="pt-1">
                <label htmlFor="custom-donation" className="block text-xs font-extrabold mb-1.5">
                  O elige cualquier otro importe libre en PayPal (€)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    id="custom-donation"
                    type="number"
                    min="1"
                    step="1"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    className="w-full sm:w-28 h-11 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-sm font-bold tabular-nums"
                  />
                  <a
                    href={paypalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#c92573] via-[#ee4f98] to-[#c9a75c] grid place-items-center shadow-md text-center"
                  >
                    Donar en PayPal ({validDonation ? `${donationAmount} €` : '5 €'})
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[11px] text-[var(--muted)] leading-relaxed">
                <strong>⚠️ Exención de responsabilidad:</strong> El servicio es gratuito y se ofrece «tal cual» (<em>as-is</em>). El creador no se hace responsable si alguna herramienta o función no llega a funcionar en tu dispositivo. Contacto oficial:{' '}
                <a href="mailto:textotodo.oficial@gmail.com" className="text-[var(--brand2)] font-bold hover:underline">
                  textotodo.oficial@gmail.com
                </a>
                .
              </div>
            </div>
          </section>
        </div>
      )}

      {/* LEGAL INFORMATION MODAL */}
      {legalModalTab && (
        <div
          onClick={() => setLegalModalTab(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-3 sm:p-4"
        >
          <section
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Información legal"
            className="w-full max-w-2xl max-h-[85dvh] flex flex-col rounded-[22px] sm:rounded-[26px] studio-console overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
              <h2 className="font-display text-base sm:text-lg font-extrabold">{LEGAL_CONTENT[legalModalTab].title}</h2>
              <button
                type="button"
                onClick={() => setLegalModalTab(null)}
                className="w-9 h-9 rounded-xl grid place-items-center border border-[var(--line)] shrink-0"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
              <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap no-scrollbar pb-1 sm:pb-0">
                {LEGAL_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLegalModalTab(tab.id)}
                    className={`h-8 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                      legalModalTab === tab.id
                        ? 'bg-[var(--brand)] text-white'
                        : 'bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {LEGAL_CONTENT[legalModalTab].sections.map(sec => (
                  <div key={sec.heading} className="p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/50">
                    <h3 className="text-sm font-extrabold text-[var(--text)]">{sec.heading}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* LOCAL HISTORY DRAWER */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
        >
          <aside
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Historial local"
            className="w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--line)] flex flex-col shadow-2xl"
          >
            <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
              <div>
                <strong className="font-display text-base font-extrabold block">Historial local</strong>
                <span className="text-xs text-[var(--muted)]">
                  Guardado en este navegador ({history.length} elementos)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="w-9 h-9 rounded-xl grid place-items-center border border-[var(--line)] shrink-0"
              >
                ×
              </button>
            </div>

            <div className="p-3.5 sm:p-4 border-b border-[var(--line)] bg-[var(--surface2)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <input
                type="text"
                value={historyFilter}
                onChange={e => setHistoryFilter(e.target.value)}
                placeholder="Filtrar historial…"
                className="w-full bg-transparent border-0 outline-none text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-8 text-center">
                  Todavía no hay resultados guardados. Usa el botón “Guardar” en cualquier herramienta.
                </p>
              ) : (
                history
                  .filter(item =>
                    `${item.type} ${item.input} ${item.output}`.toLowerCase().includes(historyFilter.toLowerCase())
                  )
                  .map(item => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <strong className="font-extrabold text-[var(--brand2)] truncate">{item.type}</strong>
                        <span className="text-[10px] text-[var(--muted)] tabular-nums shrink-0">
                          {new Date(item.date).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text)] line-clamp-3 whitespace-pre-wrap break-words">{item.output}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => copyText(item.output, 'Resultado copiado')}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[11px] font-bold"
                        >
                          Copiar
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadTxt(`textotodo-${item.id.slice(0, 6)}.txt`, item.output)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[11px] font-bold"
                        >
                          TXT
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = history.filter(x => x.id !== item.id);
                            setHistory(next);
                            localStorage.setItem('textotodo-history', JSON.stringify(next));
                          }}
                          className="ml-auto px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-[var(--line)] space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => {
                    const content = history
                      .map(
                        (h, idx) =>
                          `#${idx + 1} [${h.type}] (${new Date(h.date).toLocaleString('es-ES')})\nENTRADA:\n${h.input}\n\nSALIDA:\n${h.output}`
                      )
                      .join('\n\n========================================\n\n');
                    downloadTxt('textotodo-backup-historial.txt', content);
                  }}
                  className="w-full h-10 rounded-xl border border-[var(--brand2)]/45 bg-[var(--brand-soft)] text-xs font-extrabold text-[var(--brand2)] hover:brightness-110 inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Todo el Historial (.TXT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('textotodo-history');
                    addToast('Historial eliminado');
                  }}
                  className="w-full h-10 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold hover:text-[var(--danger)]"
                >
                  Borrar todo el historial
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* iOS PWA GUIDE MODAL */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl studio-console p-5 sm:p-6"
          >
            <h3 className="font-display text-base font-extrabold">Instalar TextoTodo en iPhone / iPad</h3>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              1. Toca el botón <strong>Compartir</strong> en la barra de Safari.<br />
              2. Desliza hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full h-10 rounded-xl bg-[var(--brand)] text-white text-xs font-extrabold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div aria-live="polite" aria-atomic="true" className="fixed left-3 right-3 sm:left-auto sm:right-4 bottom-20 lg:bottom-5 z-50 space-y-2 pointer-events-none flex flex-col items-center sm:items-end">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-full px-4 py-2.5 rounded-xl border text-xs font-extrabold shadow-xl flex items-center gap-2.5 ${
              t.kind === 'error'
                ? 'bg-[var(--danger)] text-white border-white/20'
                : 'bg-[var(--surface)] text-[var(--text)] border-[var(--brand2)]/45'
            }`}
          >
            {t.kind === 'ok' ? <Check className="w-3.5 h-3.5 shrink-0 text-[var(--green)]" /> : null}
            <span className="truncate">{t.text}</span>
            {t.kind === 'ok' && (
              <button
                type="button"
                onClick={() => openSupportModal('2')}
                className="ml-1 pl-2.5 border-l border-[var(--line)] text-[11px] font-extrabold text-[#ee4f98] hover:underline shrink-0 inline-flex items-center gap-1"
              >
                ☕ Apoyar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
