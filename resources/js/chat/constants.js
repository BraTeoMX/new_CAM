/**
 * Constantes del sistema de chat para tickets
 * Contiene las definiciones estáticas de máquinas y pasos de resolución
 */

/**
 * Lista de tipos de máquinas disponibles en el sistema
 * Cada índice corresponde a un tipo específico de máquina de costura
 */
export const MACHINES = [
    'RECTA 1 AGUJA',
    'RECTA 2 AGUJAS',
    'OVERLOCK',
    'COVERSTITCH',
    'PRESILLADORA',
    'ZZ',
    'OJAL',
    'BOTON',
    'SCHIPS',
    'ISEW',
    'FLAT SEAMER',
    'SUPREME'
];

/**
 * Definición de los pasos de resolución automática para cada máquina
 * Cada paso incluye:
 * - name: Nombre descriptivo del paso
 * - key: Identificador único del paso
 * - times: Array con tiempos estimados en minutos para cada máquina (índice corresponde a MACHINES)
 *   null indica que el paso no aplica para esa máquina
 */
export const STEPS = [
    { name: 'AJUSTE DE TENSIÓN', key: 'tension', times: [2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 5, 2] },
    { name: 'TIPO Y POSICIÓN DE AGUJAS', key: 'agujas', times: [1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1] },
    { name: 'ENHEBRADO HILO', key: 'enhebrado', times: [1, 0.5, 2, 2, 1, 1, 1, 1, 2, 2, 4, 4] },
    { name: 'PRESIÓN PRENSATELAS', key: 'prensatelas', times: [0.5, 1, 0.5, 0.5, null, 0.5, null, null, 0.5, 0.5, 1, null] },
    { name: 'PPP', key: 'ppp', times: [1, 1, 1, 1, null, 1, null, null, 1, 1, null, null] }
];