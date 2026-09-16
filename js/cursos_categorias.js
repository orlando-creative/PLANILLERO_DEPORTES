/**
 * Módulo de Definición de Cursos y Categorías Escolares Institucionales
 * U.E. Luz del Mundo A - Planillero Deportivo
 *
 * Estructura Oficial:
 * - Primaria: 1ro a 6to de Primaria (Paralelos A, B, C, D) -> 24 Cursos
 * - Secundaria: 1ro a 6to de Secundaria (Paralelos A, B, C, D) -> 24 Cursos
 * Total: 48 Equipos Escolares
 *
 * Categorización Oficial de Competiciones:
 * 1) 1ro a 3ro de Primaria (Categoría Menores Primaria)
 * 2) 4to a 6to de Primaria (Categoría Mayores Primaria)
 * 3) 1ro a 3ro de Secundaria (Categoría Menores Secundaria)
 * 4) 4to a 6to de Secundaria (Categoría Mayores Secundaria)
 */

export const CATEGORIAS_COMPETICION = [
  {
    id: 'primaria_menores',
    nombre: '1ro a 3ro de Primaria',
    etiqueta: 'Primaria (1ro a 3ro)',
    descripcion: 'Cursos 1ro, 2do y 3ro de Primaria (Paralelos A, B, C, D)',
    nivel: 'Primaria',
    grados: ['1ro', '2do', '3ro']
  },
  {
    id: 'primaria_mayores',
    nombre: '4to a 6to de Primaria',
    etiqueta: 'Primaria (4to a 6to)',
    descripcion: 'Cursos 4to, 5to y 6to de Primaria (Paralelos A, B, C, D)',
    nivel: 'Primaria',
    grados: ['4to', '5to', '6to']
  },
  {
    id: 'secundaria_menores',
    nombre: '1ro a 3ro de Secundaria',
    etiqueta: 'Secundaria (1ro a 3ro)',
    descripcion: 'Cursos 1ro, 2do y 3ro de Secundaria (Paralelos A, B, C, D)',
    nivel: 'Secundaria',
    grados: ['1ro', '2do', '3ro']
  },
  {
    id: 'secundaria_mayores',
    nombre: '4to a 6to de Secundaria',
    etiqueta: 'Secundaria (4to a 6to)',
    descripcion: 'Cursos 4to, 5to y 6to de Secundaria (Paralelos A, B, C, D)',
    nivel: 'Secundaria',
    grados: ['4to', '5to', '6to']
  }
];

export const GRADOS_ESCOLARES = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
export const PARALELOS_ESCOLARES = ['A', 'B', 'C', 'D'];
export const NIVELES_ESCOLARES = ['Primaria', 'Secundaria'];

/**
 * Determina la categoría institucional para un curso dado
 */
export function obtenerCategoriaDeCurso(cursoTexto = '') {
  const texto = (cursoTexto || '').toLowerCase();

  const esSecundaria = texto.includes('secundaria') || texto.includes('sec');
  const esPrimaria = texto.includes('primaria') || texto.includes('prim');

  // Evaluar grado
  const es1a3 = texto.includes('1ro') || texto.includes('1°') || texto.includes('2do') || texto.includes('2°') || texto.includes('3ro') || texto.includes('3°');
  const es4a6 = texto.includes('4to') || texto.includes('4°') || texto.includes('5to') || texto.includes('5°') || texto.includes('6to') || texto.includes('6°');

  if (esSecundaria) {
    if (es4a6) return '4to a 6to de Secundaria';
    return '1ro a 3ro de Secundaria';
  }

  if (esPrimaria) {
    if (es4a6) return '4to a 6to de Primaria';
    return '1ro a 3ro de Primaria';
  }

  // Por defecto si no coincide
  return 'General';
}

/**
 * Genera el listado completo oficial de los 48 equipos de la U.E. Luz del Mundo A
 */
export function generarLista48Equipos() {
  const equipos = [];

  for (const nivel of NIVELES_ESCOLARES) {
    const prefijoNivel = nivel === 'Primaria' ? 'prim' : 'sec';

    for (let g = 0; g < GRADOS_ESCOLARES.length; g++) {
      const grado = GRADOS_ESCOLARES[g];
      const numeroGrado = g + 1;
      const categoria = (numeroGrado <= 3) 
        ? `1ro a 3ro de ${nivel}` 
        : `4to a 6to de ${nivel}`;

      for (const paralelo of PARALELOS_ESCOLARES) {
        const id = `eq-${prefijoNivel}-${numeroGrado}${paralelo.toLowerCase()}`;
        const nombreCurso = `${grado} ${nivel} ${paralelo}`;

        equipos.push({
          id,
          nombre_personalizado: nombreCurso,
          curso: nombreCurso,
          nivel,
          grado,
          paralelo,
          categoria,
          escudo_url: 'assets/escudo-luz-del-mundo.svg',
          activo: true,
          creado_en: new Date('2026-09-01T08:00:00.000Z').toISOString()
        });
      }
    }
  }

  return equipos;
}
