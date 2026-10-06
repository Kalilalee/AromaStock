export const INITIAL_PERFUMES = [
  {
    id: 'hawas-fire',
    name: 'Hawas Fire',
    brand: 'Rasasi',
    image: require('../../assets/perfumes/hawas-fire.jpg'),
    storePrice: 95000,
    presentation: 'Eau de Parfum · 100 ml',
    volume: '100 ML',
    family: 'Aromático · marino · ambarado',
    summary: 'Herbal y fresco al comienzo; después se vuelve floral, marino y cálido.',
  },
  {
    id: 'veneno-black',
    name: 'Veneno Black',
    brand: 'French Avenue',
    image: require('../../assets/perfumes/veneno-black.jpg'),
    storePrice: 122000,
    presentation: 'Eau de Parfum · 100 ml',
    volume: '100 ML',
    family: 'Aromático · frutal · ahumado',
    summary: 'Manzana especiada y humo sobre un fondo dulce de tabaco y vainilla.',
  },
  {
    id: 'club-de-nuit-iconic',
    name: 'Club de Nuit Iconic',
    brand: 'Armaf',
    image: require('../../assets/perfumes/club-de-nuit-iconic.jpg'),
    storePrice: 119000,
    presentation: 'Eau de Parfum · 105 ml',
    volume: '105 ML',
    family: 'Cítrico · aromático · amaderado',
    summary: 'Pomelo, limón y menta abren una salida fresca; evoluciona hacia jengibre y melón, con un fondo de maderas, ámbar e incienso.',
  },
  {
    id: 'invictus-victory-elixir',
    name: 'Invictus Victory Elixir',
    brand: 'Rabanne',
    image: require('../../assets/perfumes/invictus-victory-elixir.jpg'),
    storePrice: 223000,
    presentation: 'Parfum Intense · 100 ml',
    volume: '100 ML',
    family: 'Ambarado · especiado · amaderado',
    summary: 'Lavanda, cardamomo y pimienta negra dan paso al incienso y al pachuli, sobre una base de vainilla y haba tonka.',
  },
  {
    id: 'le-male-le-parfum',
    name: 'Le Male Le Parfum',
    brand: 'Jean Paul Gaultier',
    image: require('../../assets/perfumes/le-male-le-parfum.jpg'),
    storePrice: 216000,
    presentation: 'Eau de Parfum · 125 ml',
    volume: '125 ML',
    family: 'Oriental · amaderado · especiado',
    summary: 'El cardamomo abre una mezcla aromática de lavanda, con un fondo cálido de vainilla y maderas.',
  },
  {
    id: 'hawas-chrome',
    name: 'Hawas Chrome',
    brand: 'Rasasi',
    image: require('../../assets/perfumes/hawas-chrome.jpg'),
    storePrice: 139000,
    presentation: 'Eau de Parfum · 100 ml',
    volume: '100 ML',
    family: 'Frutal · acuático · ambarado',
    summary: 'Frutas amarillas, maracuyá y mango dan un giro tropical y acuático, sobre almizcle, ámbar y vainilla.',
  },
];

export function getImageSource(image) {
  return typeof image === 'number' ? image : null;
}

export function formatPrice(amount) {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${formatted}`;
}
