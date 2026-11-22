# Operaciones con Números Complejos

Aplicación web interactiva desarrollada con **React**, **TypeScript**, **Tailwind CSS** y **Vite** para el aprendizaje, cálculo paso a paso y visualización geométrica de operaciones con números complejos en el **Plano de Argand**.

## Características

- **Operaciones soportadas**:
  - **Suma** $(Z_1 + Z_2)$ con representación geométrica mediante la ley del paralelogramo.
  - **Resta** $(Z_1 - Z_2)$ con visualización del vector opuesto $(-Z_2)$.
  - **Multiplicación** $(Z_1 \cdot Z_2)$ explicada tanto en forma rectangular como en forma polar.
  - **División** $(Z_1 / Z_2)$ mediante el conjugado en forma rectangular y cociente/resta de ángulos en forma polar.
- **Conversión automática**: Muestra en tiempo real la forma polar $(r, \theta)$ de cada número complejo ingresado.
- **Plano Complejo (Argand)**: Gráfico vectorial SVG interactivo para visualizar $Z_1$, $Z_2$ y el vector resultante.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- `npm`

## Ejecución en Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Luego abre en tu navegador la dirección indicada en la consola (normalmente `http://localhost:5173`).

3. **Generar versión de producción:**
   ```bash
   npm run build
   ```
