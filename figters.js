// fighters.js - 6 уникальных персонажей
export const FIGHTERS = [
  {
    id: "dominic",
    name: "Доминик Торетто",
    hp: 1200,
    speed: 2,
    power: 8,
    weapon: "Кулаки",
    moves: {
      q: { name: "Кросс", damage: 25, animation: "cross" },
      w: { name: "Хук", damage: 35, animation: "hook" },
      e: { name: "Апперкот", damage: 45, animation: "uppercut" },
      r: { name: "Удар ногой", damage: 30, animation: "kick" },
      combo: {
        "qw": { name: "Кросс+Хук", damage: 60 },
        "we": { name: "Хук+Аппер", damage: 70 },
        "qwe": { name: "Кросс+Хук+Аппер", damage: 95 }
      }
    },
    fatality: "Подкидывает ногой → удар в грудь → добив ногой"
  },
  {
    id: "brian",
    name: "Брайан О'Коннер",
    hp: 1000,
    speed: 4,
    power: 6,
    weapon: "Пистолет (6 патронов)",
    moves: {
      q: { name: "Джеб", damage: 20, animation: "jab" },
      w: { name: "Тычок", damage: 25, animation: "poke" },
      e: { name: "Выстрел", damage: 40, animation: "shot" },
      r: { name: "Удар с разворота", damage: 35, animation: "spin" },
      combo: {
        "qe": { name: "Джеб+Выстрел", damage: 60 },
        "we": { name: "Тычок+Выстрел", damage: 65 }
      }
    },
    fatality: "Выстрел в колено → удар в челюсть → контрольный выстрел"
  },
  {
    id: "hobbs",
    name: "Люк Хоббс",
    hp: 1400,
    speed: 1.5,
    power: 10,
    weapon: "Дробовик (2 патрона)",
    moves: {
      q: { name: "Таран", damage: 30, animation: "ram" },
      w: { name: "Захват", damage: 20, animation: "grab" },
      e: { name: "Дробь", damage: 50, animation: "shotgun" },
      r: { name: "Слэм", damage: 40, animation: "slam" },
      combo: {
        "qw": { name: "Таран+Захват", damage: 55 },
        "wer": { name: "Захват+Дробь+Слэм", damage: 90 }
      }
    },
    fatality: "Хватает за горло → бьёт головой об пол → добивает ногой"
  },
  {
    id: "shaw",
    name: "Деккард Шоу",
    hp: 1100,
    speed: 3,
    power: 7,
    weapon: "Нож (бесконечно)",
    moves: {
      q: { name: "Тычок", damage: 25, animation: "stab" },
      w: { name: "Порез", damage: 20, animation: "cut" },
      e: { name: "Бросок", damage: 35, animation: "throw" },
      r: { name: "Удар рукоятью", damage: 30, animation: "pommel" },
      combo: {
        "qw": { name: "Тычок+Порез", damage: 50 },
        "eq": { name: "Бросок+Тычок", damage: 60 }
      }
    },
    fatality: "Бросает нож в ногу → перехват → перерезает горло"
  },
  {
    id: "ramsey",
    name: "Рамзи",
    hp: 950,
    speed: 3.5,
    power: 5,
    weapon: "Электрошокер",
    moves: {
      q: { name: "Разряд", damage: 20, animation: "zap" },
      w: { name: "Тычок", damage: 15, animation: "stab" },
      e: { name: "Заряженный удар", damage: 40, animation: "charged" },
      r: { name: "Подсечка", damage: 25, animation: "sweep" },
      combo: {
        "qe": { name: "Разряд+Заряженный", damage: 60 },
        "wer": { name: "Тычок+Заряд+Подсечка", damage: 85 }
      }
    },
    fatality: "Парализует → бьёт током в грудь → ногой в голову"
  },
  {
    id: "letti",
    name: "Летти",
    hp: 1050,
    speed: 3,
    power: 7,
    weapon: "Цепи",
    moves: {
      q: { name: "Удар цепью", damage: 25, animation: "whip" },
      w: { name: "Захват", damage: 20, animation: "grab" },
      e: { name: "Круговой удар", damage: 35, animation: "spin" },
      r: { name: "Бросок", damage: 30, animation: "throw" },
      combo: {
        "qwe": { name: "Цепь+Захват+Круг", damage: 80 },
        "er": { name: "Круг+Бросок", damage: 65 }
      }
    },
    fatality: "Цепью по лицу → бросок → добивание ногой"
  }
];
