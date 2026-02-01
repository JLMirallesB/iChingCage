const SHEET = {
  width: 2834.65,
  height: 2834.65,
  cellW: 280.63,
  cellH: 284.88,
  margin: 14.17,
  cols: [204.09, 513.07, 822.05, 1131.03, 1440.0, 1748.98, 2057.96, 2366.93],
  rows: [206.93, 515.91, 824.88, 1133.86, 1444.25, 1751.81, 2060.79, 2371.18],
};

const WEN_PATTERNS = [
  "111111", "000000", "010001", "100010", "010111", "111010", "000010", "010000",
  "110111", "111011", "000111", "111000", "111101", "101111", "000100", "001000",
  "011001", "100110", "000011", "110000", "101001", "100101", "100000", "000001",
  "111001", "100111", "100001", "011110", "010010", "101101", "011100", "001110",
  "111100", "001111", "101000", "000101", "110101", "101011", "010100", "001010",
  "100011", "110001", "011111", "111110", "011000", "000110", "011010", "010110",
  "011101", "101110", "001001", "100100", "110100", "001011", "001101", "101100",
  "110110", "011011", "110010", "010011", "110011", "001100", "010101", "101010",
];

const PATTERN_TO_INDEX = new Map(WEN_PATTERNS.map((pattern, index) => [pattern, index]));

const HEXES = [];
for (let r = 0; r < 8; r += 1) {
  for (let c = 0; c < 8; c += 1) {
    HEXES.push({
      id: r * 8 + c + 1,
      x: SHEET.cols[c] - SHEET.margin,
      y: SHEET.rows[r] - SHEET.margin,
    });
  }
}

const grid = document.getElementById("grid");
const modeSelect = document.getElementById("modeSelect");
const rollBtn = document.getElementById("rollBtn");
const modeLabel = document.getElementById("modeLabel");
const rollLabel = document.getElementById("rollLabel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const rowSelect = document.getElementById("rowSelect");
const completeSelect = document.getElementById("completeSelect");
const autoplaySelect = document.getElementById("autoplaySelect");
const designHex = document.getElementById("designHex");
const designLabel = document.getElementById("designLabel");
const designInfo = document.getElementById("designInfo");
const designToggle = document.getElementById("designToggle");
const designSymbol = document.getElementById("designSymbol");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const controlGroups = Array.from(document.querySelectorAll("[data-controls]"));
const lineButtons = Array.from(document.querySelectorAll(".line-btn"));

let currentCount = 1;
let currentView = "random";
let completeMode = "shuffle";
let completeOrder = [];
let completeIndex = 0;
let manualLines = Array(6).fill(1);
let rolling = false;
let autoplayMs = 3000;
let autoplayTimer = null;

const WEN_RAW = `
Hexagrama 1

El Hexagrama 1 es llamado 乾 (ch'ien), "Lo Creativo". Otras variaciones podrían ser "El Cielo", "El Principio Activo", "El Movimiento" y "Dios".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y el superior también es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

Lo Creativo obra elevado logro,
propiciando por la perseverancia.
Hexagrama 2

El Hexagrama 2 es llamado 坤 (k'un), "Lo Receptivo". Otras variaciones podrían ser "La Tierra", "La Protección" y "El Flujo".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y el superior también es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

Lo Receptivo obra elevado éxito,
Propiciante por la perseverancia de una yegua.
Cuando el noble ha de emprender algo y quiere avanzar,
se extravía; más si va en seguimiento encuentra conducción.
Es propicio encontrar amigos al Oeste y al Sur;
evitar los amigos al Este y al Norte.

Una tranquila perseverancia trae ventura.
Hexagrama 3

El Hexagrama 3 el llamado 屯 (chun), "La Dificultad Inicial". Otras variaciones podrían ser "Brotar", "Empezar Algo Nuevo" y "Acumular".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

La Dificultad Inicial obra elevado éxito.
Propicio en virtud de la perseverancia.
No debe emprenderse nada.

Es propicio designar ayudantes.
Hexagrama 4

El Hexagrama 4 es llamado 蒙 (meng), "La Necedad Juvenil". Otras variaciones podrían ser "El Aprendiz", "La Inexperiencia Juvenil" y "Descubrir".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

La Necedad Juvenil tiene éxito.
No soy yo quien busca al joven necio,
el joven necio me busca a mí.
Al primer oráculo doy razón.
Si pregunta dos, tres veces, es molestia.
Cuando molesta no doy información.

Es propicia la perseverancia
Hexagrama 5

El Hexagrama 5 es llamado 需 (hsü), "La Espera". Otras variaciones podrían ser "La Paciencia", "La Resistencia a las Fuerzas Perjudiciales" y "La Inactividad".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

La Espera.
Si eres veraz, tendrás luz y éxito.
La perseverancia trae ventura.

Es propicio atravesar las grandes aguas.
Hexagrama 6

El hexagrama 6 es llamado 訟 (sung), "El Conflicto". Otras variaciones podrían ser "El Desacuerdo" y "El Pleito".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

El Conflicto: eres veraz y te frenan.
Detenerse con cautela a mitad del
camino trae ventura.
Ir hasta el fin trae desventura.
Es propicio ver al Gran Hombre.

No es propicio atravesar las grandes aguas.
Hexagrama 7

El hexagrama 7 es llamado 師 (shih), "El Ejército". Otras variaciones podrían ser "El Líder" y "Las Masas".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

El Ejército requiere perseverancia y un hombre fuerte.
Ventura sin falla.
Hexagrama 8

El hexagrama 8 es llamado 比 (pi), "La Solidaridad". Otras variaciones podrían ser "La Reunión" y "La Alianza".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

La Solidaridad trae ventura.
Indaga el oráculo una vez más,
ve si tienes elevación, duración y
perseverancia;
Si es así no habría defecto.
Los inseguros se allegan poco a poco.

El que llega tarde tiene desventura.
Hexagrama 9

El hexagrama 9 es llamado 小畜 (ch'u), "La Fuerza Domesticadora de lo Pequeño". Otras variaciones podrían ser "Débil Influencia" y "Suave Progreso".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

La Fuerza Domesticadora de lo Pequeño
tiene éxito.
Densas nubes, ninguna lluvia de

nuestra región del Oeste.
Hexagrama 10

El hexagrama 10 es llamado 履 (lü), "El Porte". Otras variaciones podrían ser "La Pisada" y "El Comportamiento".

Su trigrama inferior es ☱ (兌 tui -el lago-), y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

Pisar la cola al tigre.
Éste no muerde al hombre. Éxito.
Hexagrama 11

El hexagrama 11 es llamado 泰 (t'ai), "La Paz". Otras variaciones podrían ser "La Abundancia" y "La Prosperidad".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

La Paz. Lo pequeño se va, llega lo grande.
¡Ventura! ¡Éxito!
Hexagrama 12

El hexagrama 12 es llamado 否 (p'i), "El Estancamiento". Otras variaciones podrían ser "La Desunión" y "La Separación".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

El Estancamiento.
Hombres vulgares no favorecen
la perseverancia del noble.

Lo grande se va, llega lo pequeño.
Hexagrama 13

El hexagrama 13 es llamado 同人 (t'ung jen), "Comunidad con los Hombres". Otras variaciones podrían ser "La Comunidad" y "La Amistad".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

Comunidad con los hombres en lo libre: éxito.
Es propicio atravesar las grandes aguas.

Propicia es la perseverancia del noble.
Hexagrama 14

El hexagrama 14 es llamado 大有 (ta yu), "La Posesión de lo Grande". Otras variaciones podrían ser "El Dominio" y "La Gran Posesión".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

La Posesión de lo Grande. Elevado logro.
Hexagrama 15

El hexagrama 15 es llamado 謙 (ch'ien), "La Modestia". Otras variaciones podrían ser "El Recato" y "El Respeto".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

La Modestia va creando el éxito.
El noble lleva a buen término.
Hexagrama 16

El hexagrama 16 es llamado 豫 (yü), "El Entusiasmo". Otras variaciones podrían ser "La Felicidad" y "El Fervor".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

El Entusiasmo. Es propicio.
designar ayudantes y hacer marchar

ejércitos.
Hexagrama 17

El hexagrama 17 es llamado 隨 (sui), "El Seguimiento". Otras variaciones podrían ser "El Seguimiento" y "La Huella"

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

El seguimiento tiene elevado éxito.
Es propicia la perseverancia.

No hay defecto.
Hexagrama 18

El hexagrama 18 es llamado '蠱' (ku), "El Trabajo en lo Echado a Perder". Otras variaciones podrían ser "La Decadencia", "La Descomposición" y "La Restauración".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

El Trabajo en lo Echado a Perder tiene
elevado éxito.
Es propicio atravesar las grandes aguas.
Antes del punto inicial tres días,

después del punto inicial tres días.
Hexagrama 19

El hexagrama 19 es llamado 臨 (lin), "El Acercamiento". Otras variaciones podrían ser "Vigilar" y "Incentivar".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

El Acercamiento tiene elevado éxito.
Es propicia la perseverancia.

Al llegar el octavo mes habrá desventura.
Hexagrama 20

El hexagrama 20 es llamado 觀 (kuan), "La Contemplación". Otras variaciones podrían ser "Mirar hacia Arriba" y "Analizar".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

La Contemplación.
Se ha cumplido la ablución,
pero aún no la ofrenda.
Plenos de confianza levantan

la mirada hacia él.
Hexagrama 21

El hexagrama 21 es llamado 噬嗑 (shih ho), "La Mordedura Tajante". Otras variaciones podrían ser "Eliminar Obstáculos" y "Quebrar Drásticamente".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

La Mordedura Tajante tiene éxito.
Es propicio administrar justicia.
Hexagrama 22

El hexagrama 22 es llamado 賁 (pi), "La Gracia". Otras variaciones podrían ser "La Apariencia" y "La Elegancia".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

La Gracia tiene éxito.
En lo pequeño es propicio emprender algo.
Hexagrama 23

El hexagrama 23 es llamado 剝 (po), "La Desintegración". Otras variaciones podrían ser "La Opresión" y "El Resquebrajamiento".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

La Desintegración.
No es propicio ir a parte alguna.
Hexagrama 24

El hexagrama 24 es llamado 復 (fu), "El Retorno". Otras variaciones podrían ser "La Vuelta".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

El Retorno. éxito.
Salida y entrada sin falla.
Llegan amigos sin tacha.
Va y viene el camino.
Al séptimo día llega el retorno.

Es propicio tener adonde ir.
Hexagrama 25

El hexagrama 25 es llamado 無妄 (wu wang), "La Inocencia". Otras variaciones podrían ser "Inexperiencia" y "La Espontaneidad".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

La Inocencia. Elevado éxito.
Es propicia la perseverancia.
Si alguien no es recto tendrá desdicha,

y no será propicio emprender algo.
Hexagrama 26

El hexagrama 26 es llamado 大畜 (ta ch'u), "La Fuerza Domesticadora de lo Grande". Otras variaciones podrían ser "Gran Dedicación", "El Desarrollo de la Personalidad" y "Energía Potencial".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

La Fuerza Domesticadora de lo Grande.
Es propicia la perseverancia.
Trae ventura no comer en casa.

Es propicio atravesar las grandes aguas.
Hexagrama 27

El hexagrama 27 es llamado 頤 (I), "Las Comisuras de la Boca". Otras variaciones podrían ser "Tragar", "La Salud" y "Actitudes Moderadas".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

Las Comisuras de la Boca.
Perseverancia trae ventura.
Presta atención a la nutrición, y a aquello

con que trata de llenar su boca uno mismo.
Hexagrama 28

El hexagrama 28 es llamado 大過 (ta kuo), "La Preponderancia de lo Grande". Otras variaciones podrían ser "La Sobrecarga" y "La Ruptura".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

La Preponderancia de lo Grande.
La viga maestra se dobla por el medio.
Es propicio tener a dónde ir.

Logro.
Hexagrama 29

El hexagrama 29 es llamado 坎 (k'an), "Lo Abismal". Otras variaciones podrían ser "El Precipicio" y "Aguas Peligrosas".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

Lo Abismal repetido.
Si eres veraz, tendrás logro en tu corazón,

y lo que hicieres tendrá éxito.
Hexagrama 30

El hexagrama 30 es llamado 離 (Lí), "Lo Adherente". Otras variaciones podrían ser "El Discernimiento" y "La Red".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

Lo Adherente.
Es propicia la perseverancia,
pues aporta el éxito.

Dedicarse al cuidado de la vaca trae ventura.
Hexagrama 31

El hexagrama 31 es llamado 咸 (hsien), "El Influjo". Otras variaciones podrían ser "La Influencia" y "La Atracción Mutua".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

El Influjo. Logro.
Es Propicia la perseverancia.

Tomar una muchacha trae ventura.
Hexagrama 32

El hexagrama 32 es llamado 恆 (heng), "La Duración". Otras variaciones podrían ser "La Estabilidad" y "La Constancia".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

Éxito. No hay falla.
Es propicia la perseverancia.

Es propicio que uno tenga a dónde ir.
Hexagrama 33

El hexagrama 33 es llamado 遯 (tun), "La Retirada". Otras variaciones podrían ser "Retroceder" y "Eludir".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

La Retirada. Éxito.
En lo pequeño es propicia la perseverancia.
Hexagrama 34

El hexagrama 34 es llamado 大壯 (ta chuang), "El Poder de lo Grande". Otras variaciones podrían ser "El Gran Poder" y "La Iniciativa".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

El Poder de lo Grande.
Es propicia la perseverancia.
Hexagrama 35

El hexagrama 35 es llamado 晉 (chin), "El Progreso". Otras variaciones podrían ser "El Avance" y "Prosperar".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

El Progreso. Honran al fuerte príncipe
con caballos en gran cantidad. En un solo

día es recibido tres veces.
Hexagrama 36

El hexagrama 36 es llamado 明夷 (ming I), “El Oscurecimiento de la Luz”. Otras variaciones podrían ser "El Perjuicio" y "El Eclipsamiento".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

El Oscurecimiento de la Luz.
Es propicio ser perseverante en la emergencia.
Hexagrama 37

El hexagrama 37 es llamado 家人 (chian jen), "El Clan". Otras variaciones podrían ser "La Familia" y "El Hogar".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

El Clan. Es propicia la perseverancia de la mujer.
Hexagrama 38

El hexagrama 38 es llamado 睽 (k'uei), "El Antagonismo". Otras variaciones podrían ser "La Oposición" y "El Desarraigo".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

El Antagonismo. En cosas pequeñas, ventura.
Hexagrama 39

El hexagrama 39 es llamado 蹇 (chien), "El Impedimento". Otras variaciones podrían ser "La Obstrucción" y "Afrontando un Problema".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

El Impedimento. Es propicio el sudoeste.
No es propicio el nordeste.
Es propicio ver al gran hombre.

La perseverancia trae ventura.
Hexagrama 40

El hexagrama 40 es llamado 解 (hsieh), "La Liberación". Otras variaciones podrían ser "El Alivio" y "El Desahogo".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

La Liberación. Es propicio el Sudoeste.
Si ya no queda nada a donde uno debiera ir,
es venturoso el regreso.
Si todavía hay algo a donde uno debiera ir,

entonces es venturosa la prontitud.
Hexagrama 41

El hexagrama 41 es llamado 損 (sun), "La Merma". Otras variaciones podrían ser "El Decrecimiento" y "La Limitación".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

La Merma unida a la veracidad
obra elevada ventura sin tacha.
Puede perseverarse en ello.
Es propicio emprender algo.
¿Cómo se pone esto en práctica?
Dos escudillas pequeñas pueden

usarse para el sacrificio.
Hexagrama 42

El hexagrama 42 es llamado 益 (I), "El Aumento". Otras variaciones podrían ser "El Incremento" y "La Acumulación".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

El Aumento. Es propicio emprender algo.
Es propicio atravesar las grandes aguas.
Hexagrama 43

El hexagrama 43 es llamado 夬 (kuai), "El Desbordamiento" Otras variaciones podrían ser "La Revolución" y "Ordenar Definitivamente".

Su trigrama inferior es ☰ (乾 ch'ien -el cielo-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

El Desbordamiento.
Resueltamente el asunto ha de darse
a conocer en la corte del rey.
Ha de proclamarse conforme a la verdad. ¡Peligro!
Hay que dar aviso a la propia ciudad.
No es propicio tomar las armas.

Es propicio emprender algo.
Hexagrama 44

El hexagrama 44 es llamado 姤 (kou), "El Ir al Encuentro". Otras variaciones podrían ser "El Encuentro Inesperado" y "La Complacencia".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☰ (乾 ch'ien -el cielo-).

El Dictamen dice:

El Ir al Encuentro. La muchacha es poderosa.
No debe uno casarse con semejante muchacha.
Hexagrama 45

El hexagrama 45 es llamado 萃 (ts'ui), "La Reunión". Otras variaciones podrían ser "La Unidad" y "Agruparse".

Su trigrama inferior es ☷ (坤 k'un -la tierra-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

La Reunión. Éxito.
El rey se acerca a su templo.
Es propicio ver al Gran Hombre.
Esto trae éxito. Es propicia la perseverancia.
Ofrendar grandes sacrificios engendra ventura.

Es propicio emprender algo.
Hexagrama 46

El hexagrama 46 es llamado 升 (sheng), "La Subida". Otras variaciones podrían ser "Empujando hacia Arriba".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☷ (坤 k'un -la tierra-).

El Dictamen dice:

La Subida tiene elevado éxito.
Hay que ver al Gran Hombre.
¡No temas!

La partida hacia el Sur trae ventura.
Hexagrama 47

El hexagrama 47 es llamado 困 (k'un), "La Desazón". Otras variaciones podrían ser "La Opresión" y "La Adversidad".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

La Desazón. Logro. Perseverancia.
El gran hombre logra ventura. Ningún defecto.

Si uno tiene algo que decir, no se le cree.
Hexagrama 48

El hexagrama 48 es llamado 井 (ching), "El Pozo". Otras variaciones podrían ser "La Fuente".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

El Pozo.
Puede cambiarse de ciudad,
mas no puede cambiarse de pozo.
Este no disminuye y no aumenta.
Ellos vienen y van y recogen del pozo.
Cuando casi se ha alcanzado el agua del
pozo, pero todavía no se llega abajo con
la cuerda o se rompe el cántaro, eso

trae desventura.
Hexagrama 49

El hexagrama 49 es llamado 革 (ko), "La Revolución". Otras variaciones podrían ser "La Muda" y "La Renovación".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

La Revolución.
En tu propio día encontraré fe.
Elevado éxito, propicio por la perseverancia.

Se desvanece el arrepentimiento.
Hexagrama 50

El hexagrama 50 es llamado 鼎 (ting), "El Caldero". Otras variaciones podrían ser "La Marmita" y "El Recipiente Sacrificial".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

El Caldero.
Elevada ventura.

éxito.
Hexagrama 51

El hexagrama 51 es llamado 震 (chen), "La Conmoción". Otras variaciones podrían ser "Lo Suscitativo" y "Tiempos Agitados".

Su trigrama inferior es ☳ (震 chen -el trueno-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

La Conmoción trae éxito.
Llega la conmoción: ¡ju, ju!
Palabras rientes: ¡ja, ja!
La Conmoción aterra a cien millas,

y él no deja caer el cucharón sacrificial, ni el cáliz.
Hexagrama 52

El hexagrama 52 es llamado 艮 (ken), "El Aquietamiento". Otras variaciones podrían ser "La Inmovilidad" y "El Reposo".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☶ (艮 ken -la montaña-).

El Dictamen dice:

Aquietamiento de su espalda,
de modo que él ya no siente su cuerpo.
Va a su patio y no ve a su gente.

Ningún defecto.
Hexagrama 53

El hexagrama 53 es llamado 漸 (chien), "La Evolución". Otras variaciones podrían ser "El Progreso Paulatino" y "El Avance".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

La Evolución. Casan a la muchacha. Ventura.
Es propicia la perseverancia.
Hexagrama 54

El hexagrama 54 es llamado 歸妹 (kuei mei), "La Desposada". Otras variaciones podrían ser "La Muchacha que se casa" y "La Concubina".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

La Desposanda.
Las empresas traen desventura.

Nada que fuese propicio.
Hexagrama 55

El hexagrama 55 es llamado 豐 (feng), "La Plenitud". Otras variaciones podrían ser "La Riqueza" y "La Plenitud".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

La Plenitud tiene éxito.
El rey la alcanza.
No estés triste; debes ser como el

sol al mediodía.
Hexagrama 56

El hexagrama 56 es llamado 旅 (lü), "El Andariego". Otras variaciones podrían ser "El Viaje" y "El Vagabundo".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

El Andariego. éxito por lo pequeño.
Al Andariego la perseverancia le trae ventura.
Hexagrama 57

El hexagrama 57 es llamado 巽 (sun), "Lo Suave". Otras variaciones podrían ser "Lo Penetrante" y "La Persistencia".

Su trigrama inferior es ☴ (巽 sun -el viento-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

Lo Suave. Éxito por lo pequeño.
Es propicio tener a dónde ir.

Es propicio ver al Gran Hombre.
Hexagrama 58

El hexagrama 58 es llamado 兌 (tui), "Lo Sereno". Otras variaciones podrían ser "El Lago" y "Recogerse".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☱ (兌 tui -el lago-).

El Dictamen dice:

Lo Sereno. Éxito. Es propicia la perseverancia.
Hexagrama 59

El hexagrama 59 es llamado 渙 (huan), "La Disolución". Otras variaciones podrían ser "La Dispersión" y "El Desbande".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

La Disolución. Éxito.
El rey se acerca a su templo.
Es propicio atravesar las grandes aguas.

Es propicia la perseverancia.
Hexagrama 60

El hexagrama 60 es llamado 節 (chieh), "La Restricción". Otras variaciones podrían ser "La Limitación" y "La Moderación".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

La Restricción. Éxito.
No se debe ejercer con persistencia

una restricción amarga.
Hexagrama 61

El hexagrama 61 es llamado 中孚 (chung fu), "La Verdad Interior". Otras variaciones podrían ser "El Retorno al Centro" y "Fe Interior".

Su trigrama inferior es ☱ (兌 tui -el lago-) y su trigrama superior es ☴ (巽 sun -el viento-).

El Dictamen dice:

Verdad Interior. Cerdos y peces. ¡Ventura!
Es propicio cruzar las grandes aguas.

Es propicia la perseverancia.
Hexagrama 62

El hexagrama 62 es llamado 小過 (hsiao kuo), "Preponderancia de lo Pequeño". Otras variaciones podrían ser "Pequeños Logros" y "La Importancia de lo Pequeño".

Su trigrama inferior es ☶ (艮 ken -la montaña-) y su trigrama superior es ☳ (震 chen -el trueno-).

El Dictamen dice:

Preponderancia de lo Pequeño. Éxito.
Es propicia la perseverancia.
Pueden hacerse cosas pequeñas, no deben
hacerse cosas grandes.
El pájaro volador trae el mensaje:
no es bueno aspirar hacia lo alto,

es bueno permanecer abajo. ¡Gran ventura!
Hexagrama 63

El hexagrama 63 es llamado 既濟 (chi chi), "Después de la Consumación". Otras variaciones podrían ser "El Punto de Retorno" y "Cerrar un Ciclo".

Su trigrama inferior es ☲ (離 Lí -el fuego-) y su trigrama superior es ☵ (坎 k'an -el agua-).

El Dictamen dice:

Éxito en lo pequeño. Es propicia la perseverancia.
Al principio ventura, al cabo confusiones.
Hexagrama 64

El hexagrama 64 es llamado 未濟 (wei chi), "Antes de la consumación". Otras variaciones podrían ser "Volver a Comenzar" y "El Porvenir".

Su trigrama inferior es ☵ (坎 k'an -el agua-) y su trigrama superior es ☲ (離 Lí -el fuego-).

El Dictamen dice:

Antes de la consumación. Logro.
Pero si al pequeño zorro,
cuando casi ha consumado la travesía,
se le hunde la cola en el agua,

no hay nada que sea propicio.
`;

function parseWenRaw(raw) {
  const map = {};
  const regex = /Hexagrama\\s+(\\d+)\\s*\\n([\\s\\S]*?)(?=\\nHexagrama\\s+\\d+|$)/gi;
  let match = null;
  while ((match = regex.exec(raw)) !== null) {
    const num = Number(match[1]);
    const body = match[2].trim();
    const parts = body.split(/El Dictamen dice:\\s*/i);
    const descripcion = parts[0].trim();
    const dictamen = parts[1] ? parts[1].trim() : "";
    const symbolMatch = descripcion.match(/[\\u3400-\\u9FFF]+/);
    const simbolo = symbolMatch ? symbolMatch[0] : "";
    const nameMatch = descripcion.match(/[\"“]([^\"”]+)[\"”]/);
    const nombre = nameMatch ? nameMatch[1] : "";
    map[num] = { nombre, simbolo, descripcion, dictamen };
  }
  return map;
}

const WEN_INFO = parseWenRaw(WEN_RAW);

function randInt(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    let value = 0;
    do {
      window.crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function pickRandom(count) {
  const pool = HEXES.map((_, index) => index);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function render(indices) {
  grid.innerHTML = "";
  grid.dataset.count = String(indices.length);

  const fragment = document.createDocumentFragment();
  indices.forEach((index, i) => {
    const hex = HEXES[index];
    const item = document.createElement("div");
    item.className = "hex-item";
    item.style.animationDelay = `${i * 60}ms`;

    const glyph = document.createElement("div");
    glyph.className = "hex";
    glyph.style.setProperty("--bx", `-${hex.x}px`);
    glyph.style.setProperty("--by", `-${hex.y}px`);
    glyph.setAttribute("role", "img");
    glyph.setAttribute("aria-label", `Hexagrama ${hex.id}`);
    glyph.dataset.hex = String(hex.id);
    glyph.dataset.index = String(index);

    const label = document.createElement("div");
    label.className = "hex-label";
    label.textContent = `Hexagrama ${hex.id}`;

    item.append(glyph, label);
    fragment.append(item);
  });

  grid.append(fragment);
}

function formatModeLabel() {
  const labels = {
    random: "Aleatorio",
    rows: "Filas de 8",
    design: "Diseña",
    complete: "Completo",
  };
  return `Modo: ${labels[currentView] || "Aleatorio"}`;
}

function formatTime(date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setMode(count, doRoll = true) {
  currentCount = count;
  modeLabel.textContent = formatModeLabel();
  modeButtons.forEach((btn) => {
    const isActive = Number(btn.dataset.count) === count;
    btn.setAttribute("aria-pressed", String(isActive));
  });
  if (doRoll) {
    roll(count);
  }
}

function roll(count) {
  if (rolling) return;
  rolling = true;
  rollBtn.disabled = true;

  const ticks = 10;
  let currentTick = 0;

  const interval = setInterval(() => {
    render(pickRandom(count));
    currentTick += 1;

    if (currentTick >= ticks) {
      clearInterval(interval);
      render(pickRandom(count));
      rollLabel.textContent = `Ultima tirada: ${formatTime(new Date())}`;
      rollBtn.disabled = false;
      rolling = false;
    }
  }, 80);
}

function renderRow(rowIndex) {
  const start = rowIndex * 8;
  const indices = Array.from({ length: 8 }, (_, i) => start + i);
  render(indices);
  rollLabel.textContent = `Fila ${rowIndex + 1}`;
}

function renderDesign() {
  const pattern = manualLines.map((bit) => (bit ? "1" : "0")).join("");
  const index = PATTERN_TO_INDEX.get(pattern);
  if (index === undefined) {
    return;
  }
  const hex = HEXES[index];
  const row = Math.floor(index / 8) + 1;
  const col = (index % 8) + 1;
  const binary = pattern;
  designHex.style.setProperty("--bx", `-${hex.x}px`);
  designHex.style.setProperty("--by", `-${hex.y}px`);
  designHex.dataset.hex = String(hex.id);
  designHex.dataset.index = String(index);
  const info = WEN_INFO[hex.id];
  const title = info && info.nombre ? ` · ${info.nombre}` : "";
  designLabel.textContent = `Hexagrama ${hex.id}${title} · Fila ${row} Col ${col} · ${binary}`;
  rollLabel.textContent = `Hexagrama ${hex.id}`;
  updateDesignInfo(hex.id);
}

function buildCompleteOrder(mode) {
  if (mode === "sequence") {
    return HEXES.map((_, i) => i);
  }
  const pool = HEXES.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function renderComplete() {
  const index = completeOrder[completeIndex];
  render([index]);
  const current = completeIndex + 1;
  progressBar.style.width = `${(current / 64) * 100}%`;
  progressText.textContent = `${current} / 64`;
  rollLabel.textContent = `Hexagrama ${index + 1}`;
}

function stepComplete(delta) {
  if (completeMode === "circular") {
    if (delta > 0 && completeIndex === completeOrder.length - 1) {
      completeOrder = buildCompleteOrder("shuffle");
      completeIndex = 0;
    } else {
      completeIndex = (completeIndex + delta + completeOrder.length) % completeOrder.length;
    }
  } else {
    completeIndex = (completeIndex + delta + completeOrder.length) % completeOrder.length;
  }
  renderComplete();
}

function updateAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  if (currentView === "complete" && autoplayMs > 0) {
    autoplayTimer = setInterval(() => {
      stepComplete(1);
    }, autoplayMs);
  }
}

function updateDesignInfo(hexNumber) {
  const info = WEN_INFO[hexNumber];
  if (!info) {
    designInfo.textContent = "Texto pendiente de carga.";
    designSymbol.textContent = "";
    designSymbol.classList.remove("is-visible");
    designToggle.textContent = "Ver caracter chino";
    return;
  }
  const description = info.descripcion ? `Descripción: ${info.descripcion}` : "";
  const dictamen = info.dictamen ? `Dictamen: ${info.dictamen}` : "";
  designInfo.textContent = [description, dictamen].filter(Boolean).join("\n\n");
  designSymbol.textContent = info.simbolo || "";
  designSymbol.classList.remove("is-visible");
  designToggle.textContent = "Ver caracter chino";
}

function setView(view, doRender = true) {
  currentView = view;
  grid.dataset.view = view;
  modeLabel.textContent = formatModeLabel();
  modeSelect.value = view;
  controlGroups.forEach((group) => {
    const isActive = group.dataset.controls === view;
    group.classList.toggle("is-active", isActive);
  });

  if (!doRender) return;
  if (view === "random") {
    roll(currentCount);
  }
  if (view === "rows") {
    renderRow(Number(rowSelect.value) - 1);
  }
  if (view === "design") {
    renderDesign();
  }
  if (view === "complete") {
    completeOrder = buildCompleteOrder(completeMode === "circular" ? "shuffle" : completeMode);
    completeIndex = 0;
    renderComplete();
    updateAutoplay();
  } else {
    updateAutoplay();
  }
}

modeSelect.addEventListener("change", () => {
  setView(modeSelect.value, true);
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const count = Number(button.dataset.count);
    setMode(count, true);
  });
});

rollBtn.addEventListener("click", () => roll(currentCount));
prevBtn.addEventListener("click", () => {
  stepComplete(-1);
});
nextBtn.addEventListener("click", () => {
  stepComplete(1);
});

rowSelect.addEventListener("change", () => {
  if (currentView === "rows") {
    renderRow(Number(rowSelect.value) - 1);
  }
});

completeSelect.addEventListener("change", () => {
  completeMode = completeSelect.value;
  if (currentView === "complete") {
    completeOrder = buildCompleteOrder(completeMode === "circular" ? "shuffle" : completeMode);
    completeIndex = 0;
    renderComplete();
  }
});

autoplaySelect.addEventListener("change", () => {
  autoplayMs = Math.round(Number(autoplaySelect.value) * 1000);
  updateAutoplay();
});

lineButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.line);
    manualLines[index] = manualLines[index] ? 0 : 1;
    button.textContent = manualLines[index] ? "—" : "-- --";
    renderDesign();
  });
});

designToggle.addEventListener("click", () => {
  const isVisible = designSymbol.classList.toggle("is-visible");
  designToggle.textContent = isVisible ? "Ocultar caracter chino" : "Ver caracter chino";
});

setMode(1, false);
setView("random", true);
