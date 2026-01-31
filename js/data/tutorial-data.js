/**
 * Tutorial Level Data
 * A simple introductory level to teach players the game mechanics
 */

export const TUTORIAL_LEVEL = {
  deadZones: [23, 12, 4, 3],
  flags: [6, 7, 11, 14, 16, 22, 24],
};

export const TUTORIAL_STEPS = [
  {
    title: 'Willkommen zu Capture the Flags! 🚩',
    text: 'Ziel des Spiels: Erfasse alle Flaggen, indem du L-förmige Blöcke aus je 3 Feldern bildest. Jeder L-Block muss genau eine Flagge enthalten.',
  },
  {
    title: 'Die Spielelemente',
    text: '🚩 = Flaggen (müssen erfasst werden)\n⬛ = Tote Zonen (können nicht verwendet werden)\n⬜ = Freie Felder (können verwendet werden)',
  },
  {
    title: 'L-Block formen',
    text: 'Ziehe mit dem Finger (oder der Maus) über 3 benachbarte Felder, um einen L-Block zu bilden. Der Block muss eine L-Form haben und genau eine Flagge enthalten.',
  },
  {
    title: 'Probiere es aus!',
    text: 'Erfasse jetzt alle 3 Flaggen, indem du 3 L-Blöcke bildest. Jeder Block braucht genau eine Flagge. Viel Erfolg!',
  },
];
