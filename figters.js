export const FIGHTERS = [
  {
    id: "dominic",
    name: "Доминик Торетто",
    hp: 1200,
    speed: 2,
    power: 8,
    weapon: "Кулаки",
    moves: {
      q: { name: "Кросс", damage: 25 },
      w: { name: "Хук", damage: 35 },
      e: { name: "Апперкот", damage: 45 },
      r: { name: "Удар ногой", damage: 30 }
    },
    combos: {
      "qw": { name: "Кросс + Хук", damage: 60 },
      "we": { name: "Хук + Апперкот", damage: 70 },
      "qwe": { name: "Кросс + Хук + Апперкот", damage: 95 }
    },
    fatality: "Подкидывает ногой → удар в грудь → добив ногой"
  },
  {
    id: "brian",
    name: "Брайан О'Коннер",
    hp: 1000,
    speed: 4,
    power: 6,
    weapon: "Пистолет",
    moves: {
      q: { name: "Джеб", damage: 20 },
      w: { name: "Тычок", damage: 25 },
      e: { name: "Выстрел", damage: 40 },
      r: { name: "Удар с разворота", damage: 35 }
    },
    combos: {
      "qe": { name: "Джеб + Выстрел", damage: 60 },
      "we": { name: "Тычок + Выстрел", damage: 65 }
    },
    fatality: "Выстрел в колено → удар в челюсть → контрольный выстрел"
  },
  {
    id: "hobbs",
    name: "Люк Хоббс",
    hp: 1400,
    speed: 1.5,
    power: 10,
    weapon: "Дробовик",
    moves: {
      q: { name: "Таран", damage: 30 },
      w: { name: "Захват", damage: 20 },
      e: { name: "Дробь", damage: 50 },
      r: { name: "Слэм", damage: 40 }
    },
    combos: {
      "qw": { name: "Таран + Захват", damage: 55 },
      "wer": { name: "Захват + Дробь + Слэм", damage: 90 }
    },
    fatality: "Хватает за горло → бьёт головой об пол → добивает ногой"
  },
  {
    id: "shaw",
    name: "Деккард Шоу",
    hp: 1100,
    speed: 3,
    power: 7,
    weapon: "Нож",
    moves: {
      q: { name: "Тычок", damage: 25 },
      w: { name: "Порез", damage: 20 },
      e: { name: "Бросок", damage: 35 },
      r: { name: "Удар рукоятью", damage: 30 }
    },
    combos: {
      "qw": { name: "Тычок + Порез", damage: 50 },
      "eq": { name: "Бросок + Тычок", damage: 60 }
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
      q: { name: "Разряд", damage: 20 },
      w: { name: "Тычок", damage: 15 },
      e: { name: "Заряженный удар", damage: 40 },
      r: { name: "Подсечка", damage: 25 }
    },
    combos: {
      "qe": { name: "Разряд + Заряженный", damage: 60 },
      "wer": { name: "Тычок + Заряд + Подсечка", damage: 85 }
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
      q: { name: "Удар цепью", damage: 25 },
      w: { name: "Захват", damage: 20 },
      e: { name: "Круговой удар", damage: 35 },
      r: { name: "Бросок", damage: 30 }
    },
    combos: {
      "qwe": { name: "Цепь + Захват + Круг", damage: 80 },
      "er": { name: "Круг + Бросок", damage: 65 }
    },
    fatality: "Цепью по лицу → бросок → добивание ногой"
  }
];
