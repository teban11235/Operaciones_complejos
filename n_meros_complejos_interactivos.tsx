import React, { useState, useEffect } from 'react';
import { Info, AlertTriangle, Calculator, Plus, Minus, X, Divide, RotateCcw } from 'lucide-react';

// --- Types ---

interface ComplexNumber {
  real: number;
  imag: number;
}

interface Point {
  x: number;
  y: number;
}

type OperationType = 'sum' | 'sub' | 'mult' | 'div';
type NoteType = 'note' | 'tip' | 'warning';

// --- Utility Functions ---

const toPolar = (real: number, imag: number) => {
  const r = Math.sqrt(real * real + imag * imag);
  const theta = Math.atan2(imag, real) * (180 / Math.PI); // Degrees
  return { r, theta };
};

const toRect = (r: number, theta: number): ComplexNumber => {
  const rad = theta * (Math.PI / 180);
  return { real: r * Math.cos(rad), imag: r * Math.sin(rad) };
};

const formatFloat = (n: number | undefined | null): number => {
  if (n === undefined || n === null || Number.isNaN(n)) return 0;
  return parseFloat(n.toFixed(2));
};

// --- Components ---

interface VectorGraphProps {
  z1: ComplexNumber;
  z2: ComplexNumber;
  result: ComplexNumber | null;
  operation: OperationType;
}

const VectorGraph: React.FC<VectorGraphProps> = ({ z1, z2, result, operation }) => {
  const range = 12; // Axis range -12 to 12
  const scale = 14; // Pixels per unit
  const center = 175; // Center of SVG (350x350)

  const getX = (val: number) => center + val * scale;
  const getY = (val: number) => center - val * scale; // SVG y is inverted

  const Arrow: React.FC<{ start: Point; end: Point; color: string; label: string }> = ({
    start,
    end,
    color,
    label,
  }) => {
    // Avoid drawing zero length arrows
    if (start.x === end.x && start.y === end.y) return null;

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLen = 8;

    const x1 = getX(start.x);
    const y1 = getY(start.y);
    const x2 = getX(end.x);
    const y2 = getY(end.y);

    // Arrowhead points
    const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const hy1 = y2 + headLen * Math.sin(angle - Math.PI / 6);
    const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const hy2 = y2 + headLen * Math.sin(angle + Math.PI / 6);

    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
        <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
        <text x={x2 + 5} y={y2 - 5} fill={color} fontSize="12" fontWeight="bold">
          {label}
        </text>
      </g>
    );
  };

  const DashedLine: React.FC<{ start: Point; end: Point }> = ({ start, end }) => (
    <line
      x1={getX(start.x)}
      y1={getY(start.y)}
      x2={getX(end.x)}
      y2={getY(end.y)}
      stroke="#9ca3af"
      strokeWidth="1"
      strokeDasharray="4"
    />
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-slate-500 mb-2">Plano Complejo (Argand)</h3>
      <svg width="350" height="350" className="bg-slate-50 rounded-lg border border-slate-100">
        {/* Grid and Axes */}
        <line x1="0" y1={center} x2="350" y2={center} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={center} y1="0" x2={center} y2="350" stroke="#cbd5e1" strokeWidth="1" />
        <text x="330" y={center + 15} className="text-xs text-slate-400">
          Re
        </text>
        <text x={center + 5} y="15" className="text-xs text-slate-400">
          Im
        </text>

        {/* Vectors */}
        <Arrow start={{ x: 0, y: 0 }} end={{ x: z1.real, y: z1.imag }} color="#3b82f6" label="Z1" />
        <Arrow start={{ x: 0, y: 0 }} end={{ x: z2.real, y: z2.imag }} color="#10b981" label="Z2" />

        {operation === 'sum' && result && (
          <>
            <DashedLine start={{ x: z1.real, y: z1.imag }} end={{ x: result.real, y: result.imag }} />
            <DashedLine start={{ x: z2.real, y: z2.imag }} end={{ x: result.real, y: result.imag }} />
            <Arrow start={{ x: 0, y: 0 }} end={{ x: result.real, y: result.imag }} color="#f59e0b" label="Z1+Z2" />
          </>
        )}

        {operation === 'sub' && result && (
          <>
            {/* Show -Z2 for visual aid */}
            <Arrow start={{ x: 0, y: 0 }} end={{ x: -z2.real, y: -z2.imag }} color="#d1d5db" label="-Z2" />
            <DashedLine start={{ x: z1.real, y: z1.imag }} end={{ x: result.real, y: result.imag }} />
            <Arrow start={{ x: 0, y: 0 }} end={{ x: result.real, y: result.imag }} color="#ef4444" label="Z1-Z2" />
          </>
        )}

        {/* For Mult/Div just show result vector without parallelogram lines to keep it clean */}
        {(operation === 'mult' || operation === 'div') && result && (
          <Arrow start={{ x: 0, y: 0 }} end={{ x: result.real, y: result.imag }} color="#8b5cf6" label="Res" />
        )}
      </svg>
      <p className="text-xs text-slate-400 mt-2">Escala fija: +/- {range} unidades</p>
    </div>
  );
};

const NoteBox: React.FC<{ children: React.ReactNode; type?: NoteType }> = ({ children, type = 'note' }) => {
  const styles: Record<NoteType, string> = {
    note: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    tip: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-red-50 border-red-200 text-red-800',
  };
  const icons: Record<NoteType, React.ReactNode> = {
    note: <Info className="w-5 h-5 mr-2" />,
    tip: <AlertTriangle className="w-5 h-5 mr-2" />,
    warning: <AlertTriangle className="w-5 h-5 mr-2" />,
  };

  return (
    <div className={`flex p-4 rounded-lg border my-4 ${styles[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
};

interface ComplexInputProps {
  label: string;
  value: ComplexNumber;
  onChange: (val: ComplexNumber) => void;
  color: string;
}

const ComplexInput: React.FC<ComplexInputProps> = ({ label, value, onChange, color }) => (
  <div className={`p-4 rounded-lg border-l-4 shadow-sm bg-white ${color}`}>
    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">{label}</h4>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-500">Parte Real</label>
        <input
          type="number"
          value={value.real}
          onChange={(e) => onChange({ ...value, real: parseFloat(e.target.value) || 0 })}
          className="w-full p-2 border rounded font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Parte Imag (i)</label>
        <input
          type="number"
          value={value.imag}
          onChange={(e) => onChange({ ...value, imag: parseFloat(e.target.value) || 0 })}
          className="w-full p-2 border rounded font-mono text-sm"
        />
      </div>
    </div>
    <div className="mt-2 text-xs text-gray-500 font-mono">
      Forma Polar: r ≈ {formatFloat(toPolar(value.real, value.imag).r)}, θ ≈{' '}
      {formatFloat(toPolar(value.real, value.imag).theta)}°
    </div>
  </div>
);

export default function ComplexNumbersLesson() {
  const [activeTab, setActiveTab] = useState<OperationType>('sum');
  const [z1, setZ1] = useState<ComplexNumber>({ real: 3, imag: 2 });
  const [z2, setZ2] = useState<ComplexNumber>({ real: 1, imag: -4 });
  const [result, setResult] = useState<ComplexNumber | null>({ real: 4, imag: -2 });

  const isDivisionByZero = activeTab === 'div' && z2.real === 0 && z2.imag === 0;

  // Calculate based on active tab
  useEffect(() => {
    let res: ComplexNumber | null = { real: 0, imag: 0 };
    if (activeTab === 'sum') {
      res = { real: z1.real + z2.real, imag: z1.imag + z2.imag };
    } else if (activeTab === 'sub') {
      res = { real: z1.real - z2.real, imag: z1.imag - z2.imag };
    } else if (activeTab === 'mult') {
      res = {
        real: z1.real * z2.real - z1.imag * z2.imag,
        imag: z1.real * z2.imag + z1.imag * z2.real,
      };
    } else if (activeTab === 'div') {
      const denominator = z2.real * z2.real + z2.imag * z2.imag;
      if (denominator !== 0) {
        res = {
          real: (z1.real * z2.real + z1.imag * z2.imag) / denominator,
          imag: (z1.imag * z2.real - z1.real * z2.imag) / denominator,
        };
      } else {
        res = null;
      }
    }
    setResult(res);
  }, [z1, z2, activeTab]);

  const p1 = toPolar(z1.real, z1.imag);
  const p2 = toPolar(z2.real, z2.imag);
  const pr = result ? toPolar(result.real, result.imag) : { r: 0, theta: 0 };

  const tabs: { id: OperationType; label: string; icon: React.ElementType }[] = [
    { id: 'sum', label: 'Suma', icon: Plus },
    { id: 'sub', label: 'Resta', icon: Minus },
    { id: 'mult', label: 'Multiplicación', icon: X },
    { id: 'div', label: 'División', icon: Divide },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans text-slate-800 bg-slate-50 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Operaciones con Números Complejos</h1>
        <p className="text-slate-600">Recurso interactivo para visualización y cálculo</p>
      </header>

      {/* Inputs Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">Datos de Entrada</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ComplexInput label="Número Complejo Z1" value={z1} onChange={setZ1} color="border-l-blue-500" />
          <ComplexInput label="Número Complejo Z2" value={z2} onChange={setZ2} color="border-l-emerald-500" />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Theory & Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
            {/* SUMA CONTENT */}
            {activeTab === 'sum' && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-slate-800">2.5.1 Suma de Complejos</h3>
                <p className="mb-4 text-slate-600">
                  La suma se realiza por componentes. Se suman las partes reales entre sí y las partes imaginarias entre
                  sí.
                </p>
                <div className="bg-slate-100 p-4 rounded font-mono text-sm mb-4">
                  (a + bi) + (c + di) = (a + c) + (b + d)i
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Cálculo paso a paso:</h4>
                  <p>
                    Re: {z1.real} + {z2.real} = <strong>{formatFloat(result?.real)}</strong>
                  </p>
                  <p>
                    Im: {z1.imag} + {z2.imag} = <strong>{formatFloat(result?.imag)}</strong>
                  </p>
                  <p className="mt-2 text-lg font-bold text-indigo-700">
                    Resultado: Z = {formatFloat(result?.real)} {result && result.imag >= 0 ? '+' : ''}{' '}
                    {formatFloat(result?.imag)}i
                  </p>
                </div>

                <NoteBox type="warning">
                  <strong>Nota Importante:</strong> La suma y resta no son realizables de forma directa en forma polar.
                  Es necesario convertir al formato rectangular antes.
                </NoteBox>

                <p className="text-sm text-slate-500 mt-4">
                  Geométricamente, esto sigue la ley del paralelogramo (ver gráfico), similar a la suma de vectores
                  física.
                </p>
              </div>
            )}

            {/* RESTA CONTENT */}
            {activeTab === 'sub' && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-slate-800">2.5.1 Resta de Complejos</h3>
                <p className="mb-4 text-slate-600">
                  La resta equivale a sumar el inverso aditivo. Se restan las partes reales y las imaginarias por
                  separado.
                </p>
                <div className="bg-slate-100 p-4 rounded font-mono text-sm mb-4">
                  (a + bi) - (c + di) = (a - c) + (b - d)i
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">Cálculo paso a paso:</h4>
                  <p>
                    Re: {z1.real} - {z2.real} = <strong>{formatFloat(result?.real)}</strong>
                  </p>
                  <p>
                    Im: {z1.imag} - ({z2.imag}) = <strong>{formatFloat(result?.imag)}</strong>
                  </p>
                  <p className="mt-2 text-lg font-bold text-red-700">
                    Resultado: Z = {formatFloat(result?.real)} {result && result.imag >= 0 ? '+' : ''}{' '}
                    {formatFloat(result?.imag)}i
                  </p>
                </div>

                <NoteBox type="warning">
                  <strong>Nota Importante:</strong> Al igual que la suma, evite operar directamente en polar. Convierta
                  a rectangular.
                </NoteBox>

                <p className="text-sm text-slate-500">Geométricamente, sumar el vector opuesto (rotado 180°).</p>
              </div>
            )}

            {/* MULTIPLICACION CONTENT */}
            {activeTab === 'mult' && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-slate-800">2.5.2 Multiplicación</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-indigo-600 border-b pb-1 mb-2">Forma Rectangular</h4>
                    <p className="text-sm text-slate-600 mb-2">Se aplica la propiedad distributiva:</p>
                    <div className="bg-slate-100 p-2 rounded font-mono text-xs mb-2">(ac - bd) + (ad + bc)i</div>
                    <div className="text-sm">
                      <p>
                        Re: ({z1.real}·{z2.real}) - ({z1.imag}·{z2.imag}) ={' '}
                        <strong>{formatFloat(result?.real)}</strong>
                      </p>
                      <p>
                        Im: ({z1.real}·{z2.imag}) + ({z1.imag}·{z2.real}) ={' '}
                        <strong>{formatFloat(result?.imag)}</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-pink-600 border-b pb-1 mb-2">Forma Polar</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Más sencilla: se multiplican magnitudes y suman ángulos.
                    </p>
                    <div className="bg-slate-100 p-2 rounded font-mono text-xs mb-2">
                      r = r1 · r2 <br /> θ = θ1 + θ2
                    </div>
                    <div className="text-sm">
                      <p>
                        r: {formatFloat(p1.r)} · {formatFloat(p2.r)} = <strong>{formatFloat(pr.r)}</strong>
                      </p>
                      <p>
                        θ: {formatFloat(p1.theta)}° + {formatFloat(p2.theta)}° ={' '}
                        <strong>{formatFloat(pr.theta)}°</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-lg font-bold text-indigo-700 text-center mb-4 border-t pt-4">
                  Resultado: {formatFloat(result?.real)} {result && result.imag >= 0 ? '+' : ''}{' '}
                  {formatFloat(result?.imag)}i
                </p>

                <NoteBox type="tip">
                  <strong>Recuerde:</strong> Tomar en cuenta los signos de los ángulos para realizar la suma algebraica
                  correctamente.
                </NoteBox>
              </div>
            )}

            {/* DIVISION CONTENT */}
            {activeTab === 'div' && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-slate-800">2.5.3 División</h3>

                {isDivisionByZero ? (
                  <NoteBox type="warning">
                    <strong>División por cero:</strong> El denominador Z2 no puede ser 0 + 0i. Ingrese un valor distinto
                    de cero para Z2.
                  </NoteBox>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-indigo-600 border-b pb-1 mb-2">Forma Rectangular</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Multiplicar numerador y denominador por el <strong>conjugado</strong> del denominador.
                        </p>
                        <div className="text-sm mt-2">
                          <p className="mb-1">
                            Conjugado Z2: {z2.real} {z2.imag >= 0 ? '-' : '+'} {Math.abs(z2.imag)}i
                          </p>
                          <p>
                            Denominador: {z2.real}² + {z2.imag}² = {(z2.real ** 2 + z2.imag ** 2).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-pink-600 border-b pb-1 mb-2">Forma Polar</h4>
                        <p className="text-sm text-slate-600 mb-2">Se dividen magnitudes y se restan ángulos.</p>
                        <div className="bg-slate-100 p-2 rounded font-mono text-xs mb-2">
                          r = r1 / r2 <br /> θ = θ1 - θ2
                        </div>
                        <div className="text-sm">
                          <p>
                            r: {formatFloat(p1.r)} / {formatFloat(p2.r)} = <strong>{formatFloat(pr.r)}</strong>
                          </p>
                          <p>
                            θ: {formatFloat(p1.theta)}° - {formatFloat(p2.theta)}° ={' '}
                            <strong>{formatFloat(pr.theta)}°</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-indigo-700 text-center mb-4 border-t pt-4">
                      Resultado: {formatFloat(result?.real)} {result && result.imag >= 0 ? '+' : ''}{' '}
                      {formatFloat(result?.imag)}i
                    </p>
                  </>
                )}

                <NoteBox type="tip">
                  <strong>Recuerde:</strong> Tomar en cuenta los signos de los ángulos para realizar la resta
                  correctamente.
                </NoteBox>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <VectorGraph z1={z1} z2={z2} result={result} operation={activeTab} />

            <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Resumen de Datos
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-blue-600 font-bold">Z1</span>
                  <span>
                    {z1.real} {z1.imag >= 0 ? '+' : ''} {z1.imag}i
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-emerald-600 font-bold">Z2</span>
                  <span>
                    {z2.real} {z2.imag >= 0 ? '+' : ''} {z2.imag}i
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className={`font-bold ${activeTab === 'sub' ? 'text-red-500' : 'text-amber-500'}`}>
                    Resultado
                  </span>
                  <span className="font-mono">
                    {result
                      ? `${formatFloat(result.real)} ${result.imag >= 0 ? '+' : ''}${formatFloat(result.imag)}i`
                      : 'Indefinido'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
