// Nomes para exibição, sem alterar a cidade usada na consulta geográfica.
const CANONICAL_CITIES = {
  'sao paulo': 'São Paulo',
  'sao jose dos campos': 'São José dos Campos',
  'sao jose do rio preto': 'São José do Rio Preto',
  'sao bernardo do campo': 'São Bernardo do Campo',
  'sao caetano do sul': 'São Caetano do Sul',
  'sao luis': 'São Luís',
  'sao goncalo': 'São Gonçalo',
  'santo andre': 'Santo André',
  'santarem': 'Santarém',
  'ribeirao preto': 'Ribeirão Preto',
  'joao pessoa': 'João Pessoa',
  'foz do iguacu': 'Foz do Iguaçu',
  'brasilia': 'Brasília',
  'goiania': 'Goiânia',
  'vitoria': 'Vitória',
  'florianopolis': 'Florianópolis',
  'maceio': 'Maceió',
  'belem': 'Belém',
  'cuiaba': 'Cuiabá',
  'teresopolis': 'Teresópolis',
  'petropolis': 'Petrópolis',
  'uberlandia': 'Uberlândia',
  'marilia': 'Marília',
  'criciuma': 'Criciúma',
  'balneario camboriu': 'Balneário Camboriú',
  'campos do jordao': 'Campos do Jordão',
  'pocos de caldas': 'Poços de Caldas',
  'sao sebastiao': 'São Sebastião',
}

const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export function formatCityName(city) {
  if (typeof city !== 'string') return ''
  const clean = city.trim().replace(/\s+/g, ' ')
  if (!clean) return ''

  const normalized = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  if (CANONICAL_CITIES[normalized]) return CANONICAL_CITIES[normalized]

  return clean.toLocaleLowerCase('pt-BR').split(' ').map((word, index) =>
    index > 0 && LOWERCASE_WORDS.has(word)
      ? word
      : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1)
  ).join(' ')
}
