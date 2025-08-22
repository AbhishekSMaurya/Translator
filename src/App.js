import React, { useState, useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

const TRANSLATE_ENDPOINT = "https://text-translator2.p.rapidapi.com/translate"
const TRANSLATE_API_HOST = "text-translator2.p.rapidapi.com"




function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg">LinguaForge</Link>
        <div className="space-x-3">
          <NavLink to="/">Translator</NavLink>
          <NavLink to="/random">Random Generator</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-1 rounded-md hover:bg-white/20 transition-colors text-sm"
    >
      {children}
    </Link>
  )
}

function Footer() {
  return (
    <footer className="mt-12 py-8 text-center text-sm text-gray-500">
      Translate to connect <code className="bg-gray-100 px-1 rounded">everywhere</code>
    </footer>
  )
}

function Home() {
  const [input, setInput] = useState('Hello, how are you?')
  const [target, setTarget] = useState('es')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)
  const debounceRef = useRef(null)

  const translate = useCallback(async () => {
    setError(null);
    if (!input.trim()) {
      setResult('');
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    try {
      const body = new URLSearchParams({
        source_language: "en",
        target_language: target,
        text: input
      });

      const res = await fetch(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY,
          "X-RapidAPI-Host": TRANSLATE_API_HOST,
        },
        body: new URLSearchParams({
          source_language: "en",
          target_language: target,
          text: input
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`API error: ${res.status} ${t}`);
      }

      const json = await res.json();
      setResult(json?.data?.translatedText ?? JSON.stringify(json));
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setResult("");
    } finally {
      setLoading(false);
    }
  }, [input, target]);



  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      translate()
    }, 700)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (controllerRef.current) controllerRef.current.abort()
    }
  }, [input, target, translate])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-3">Text Translator</h2>
        <p className="text-sm text-gray-600 mb-4">Type in English (or any language) and pick your target language.</p>

        <label className="block mb-2 text-sm font-medium">Input text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border rounded-lg resize-y min-h-[120px] mb-4"
        />

        <div className="flex gap-3 items-center mb-4">
          <label className="text-sm">Target language</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="p-2 border rounded-md">
            <option value="es">Spanish (es)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
            <option value="zh">Chinese (zh)</option>
            <option value="ar">Arabic (ar)</option>
            <option value="ja">Japanese (ja)</option>
            <option value="ru">Russian (ru)</option>
          </select>

          <button onClick={() => translate()} className="ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Translate now</button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Result</label>
          <div className="min-h-[80px] p-3 border rounded-lg bg-gray-50">
            {loading ? <em>Translating...</em> : (error ? <span className="text-red-500">{error}</span> : <pre className="whitespace-pre-wrap">{result}</pre>)}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(result).catch(() => { }) }} className="px-4 py-2 rounded-md border">Copy</button>
          <button onClick={() => { setInput(''); setResult(''); }} className="px-4 py-2 rounded-md border">Clear</button>
        </div>

      </div>

      
    </div>
  )
}

function Randomizer() {
  const [length, setLength] = useState(12)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [result, setResult] = useState('')

  const generate = useCallback(() => {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const pool = alpha + (includeSymbols ? symbols : '')
    if (!pool.length) return setResult('')
    const n = Math.max(1, Number(length) || 1)
    let s = ''
    for (let i = 0; i < n; i++) {
      s += pool.charAt(Math.floor(Math.random() * pool.length))
    }
    setResult(s)
  }, [length, includeSymbols])

  useEffect(() => {
    generate()
  }, [generate])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white/90 rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-3">Random String Generator</h2>
      

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-sm block mb-1">Length</label>
            <input type="number" min={1} value={length} onChange={e => setLength(Number(e.target.value) || 1)} className="w-full p-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm block mb-1">Include symbols</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setIncludeSymbols(s => !s)} className={`px-3 py-2 rounded ${includeSymbols ? 'bg-green-500 text-white' : 'border'}`}>
                {includeSymbols ? 'YES' : 'NO'}
              </button>
              <button onClick={generate} className="px-3 py-2 rounded bg-indigo-600 text-white">Generate</button>
              <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(result).catch(() => { }) }} className="px-3 py-2 rounded border">Copy</button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded font-mono break-words">{result}</div>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-700">
      <div className="bg-white/90 rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-3">About this project</h2>
        <p className="mb-3">This small demo shows:</p>
        <ul className="list-disc ml-5 text-sm space-y-1">
          <li>Client-side routing with <code>react-router-dom</code></li>
          <li>Translator using RapidAPI</li>
          <li>A random string generator demonstrating hooks (useState, useCallback, useEffect)</li>
        </ul>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800">
        <Navbar />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/random" element={<Randomizer />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<div className="p-6 text-center">Page not found — <Link to="/" className="text-indigo-600">Go home</Link></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
