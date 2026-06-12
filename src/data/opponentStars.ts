import { rand } from '@/lib/rng'

// ─── Opponent star players ────────────────────────────────────────────────────
// A handful of REAL, era-appropriate players for the nations England face, so
// goals, saves and big defensive moments carry a recognisable name — and the
// tournament's golden-boot race reads like the real thing (Lewandowski top
// scorer, Mbappé winning it). Curated, not exhaustive.

export type OppRole = 'GK' | 'DEF' | 'MID' | 'FWD'
export interface OppStar { name: string; role: OppRole }

interface EraSet { from: number; to: number; stars: OppStar[] }

// Compact builder: one keeper, then defenders / midfielders / forwards.
const era = (from: number, to: number, gk: string, def: string[], mid: string[], fwd: string[]): EraSet => ({
  from, to,
  stars: [
    { name: gk, role: 'GK' as const },
    ...def.map(n => ({ name: n, role: 'DEF' as const })),
    ...mid.map(n => ({ name: n, role: 'MID' as const })),
    ...fwd.map(n => ({ name: n, role: 'FWD' as const })),
  ],
})

const NATION_STARS: Record<string, EraSet[]> = {
  Brazil: [
    era(1958, 1962, 'Gilmar', ['Djalma Santos'], ['Didi', 'Zito'], ['Pelé', 'Garrincha', 'Vavá']),
    era(1970, 1970, 'Félix', ['Carlos Alberto'], ['Gérson', 'Rivelino', 'Clodoaldo'], ['Pelé', 'Jairzinho', 'Tostão']),
    era(1982, 1986, 'Waldir Peres', ['Júnior'], ['Zico', 'Sócrates', 'Falcão'], ['Éder', 'Careca']),
    era(1994, 1998, 'Taffarel', ['Jorginho', 'Aldair'], ['Dunga', 'Mauro Silva', 'Rivaldo'], ['Romário', 'Bebeto', 'Ronaldo']),
    era(2002, 2006, 'Marcos', ['Cafu', 'Roberto Carlos', 'Lúcio'], ['Ronaldinho', 'Rivaldo', 'Kaká'], ['Ronaldo', 'Adriano']),
    era(2010, 2018, 'Júlio César', ['Thiago Silva', 'David Luiz', 'Dani Alves'], ['Oscar', 'Paulinho', 'Coutinho'], ['Neymar', 'Hulk', 'Fred']),
    era(2019, 2026, 'Alisson', ['Marquinhos', 'Danilo'], ['Casemiro', 'Lucas Paquetá', 'Bruno Guimarães'], ['Neymar', 'Vinícius Júnior', 'Richarlison', 'Rodrygo']),
  ],
  Argentina: [
    era(1978, 1978, 'Fillol', ['Passarella', 'Olguín'], ['Ardiles', 'Gallego'], ['Kempes', 'Luque', 'Bertoni']),
    era(1986, 1990, 'Pumpido', ['Ruggeri', 'Brown'], ['Burruchaga', 'Giusti'], ['Maradona', 'Valdano', 'Caniggia']),
    era(1994, 2002, 'Goycochea', ['Ayala', 'Sensini'], ['Verón', 'Simeone', 'Ortega'], ['Batistuta', 'Crespo']),
    era(2006, 2010, 'Romero', ['Heinze', 'Zanetti'], ['Riquelme', 'Mascherano', 'Verón'], ['Messi', 'Crespo', 'Tévez', 'Higuaín']),
    era(2014, 2018, 'Romero', ['Otamendi', 'Garay', 'Rojo'], ['Mascherano', 'Di María', 'Banega'], ['Messi', 'Higuaín', 'Agüero']),
    era(2019, 2026, 'Emiliano Martínez', ['Otamendi', 'Cuti Romero', 'Molina'], ['De Paul', 'Enzo Fernández', 'Mac Allister', 'Di María'], ['Messi', 'Julián Álvarez', 'Lautaro Martínez']),
  ],
  France: [
    era(1982, 1986, 'Bats', ['Bossis', 'Battiston'], ['Platini', 'Giresse', 'Tigana'], ['Rocheteau', 'Stopyra']),
    era(1998, 2002, 'Barthez', ['Thuram', 'Desailly', 'Blanc', 'Lizarazu'], ['Zidane', 'Deschamps', 'Petit', 'Pirès'], ['Henry', 'Trezeguet', 'Anelka']),
    era(2006, 2006, 'Barthez', ['Thuram', 'Gallas', 'Sagnol'], ['Zidane', 'Vieira', 'Makélélé', 'Ribéry'], ['Henry', 'Trezeguet']),
    era(2018, 2026, 'Lloris', ['Varane', 'Koundé', 'Pavard', 'Hernández'], ['Pogba', 'Kanté', 'Tchouaméni', 'Griezmann'], ['Mbappé', 'Giroud', 'Dembélé', 'Thuram']),
  ],
  'West Germany': [
    era(1966, 1970, 'Maier', ['Beckenbauer', 'Schnellinger'], ['Overath', 'Netzer'], ['Gerd Müller', 'Seeler', 'Held']),
    era(1972, 1976, 'Maier', ['Beckenbauer', 'Vogts', 'Breitner'], ['Overath', 'Hoeneß', 'Netzer'], ['Gerd Müller', 'Heynckes']),
    era(1980, 1986, 'Schumacher', ['Förster', 'Briegel'], ['Magath', 'Matthäus'], ['Rummenigge', 'Allofs', 'Völler']),
    era(1988, 1990, 'Illgner', ['Augenthaler', 'Kohler', 'Brehme'], ['Matthäus', 'Hässler', 'Littbarski'], ['Klinsmann', 'Völler']),
  ],
  Germany: [
    era(1994, 1998, 'Köpke', ['Sammer', 'Kohler'], ['Matthäus', 'Hässler', 'Möller'], ['Klinsmann', 'Bierhoff']),
    era(2002, 2008, 'Kahn', ['Mertesacker', 'Lahm', 'Metzelder'], ['Ballack', 'Schweinsteiger', 'Frings'], ['Klose', 'Podolski']),
    era(2010, 2018, 'Neuer', ['Lahm', 'Boateng', 'Hummels'], ['Kroos', 'Schweinsteiger', 'Özil', 'Khedira'], ['Müller', 'Klose', 'Gómez']),
    era(2019, 2026, 'Neuer', ['Rüdiger', 'Kimmich', 'Tah'], ['Kroos', 'Gündoğan', 'Musiala', 'Wirtz'], ['Havertz', 'Füllkrug', 'Sané']),
  ],
  Spain: [
    era(1982, 1994, 'Zubizarreta', ['Camacho', 'Sanchís'], ['Señor', 'Michel', 'Guardiola'], ['Butragueño', 'Salinas']),
    era(1998, 2006, 'Casillas', ['Hierro', 'Puyol', 'Salgado'], ['Raúl', 'Xavi', 'Baraja', 'Valerón'], ['Morientes', 'Torres', 'Villa']),
    era(2008, 2014, 'Casillas', ['Puyol', 'Piqué', 'Ramos'], ['Xavi', 'Iniesta', 'Busquets', 'Silva'], ['Villa', 'Torres', 'Fàbregas']),
    era(2018, 2026, 'Unai Simón', ['Carvajal', 'Laporte', 'Cucurella'], ['Rodri', 'Pedri', 'Gavi', 'Fabián'], ['Morata', 'Nico Williams', 'Lamine Yamal', 'Olmo']),
  ],
  Italy: [
    era(1970, 1978, 'Zoff', ['Facchetti', 'Burgnich'], ['Mazzola', 'Rivera', 'Benetti'], ['Riva', 'Bettega']),
    era(1982, 1982, 'Zoff', ['Gentile', 'Scirea', 'Cabrini'], ['Tardelli', 'Conti'], ['Paolo Rossi', 'Graziani']),
    era(1986, 1994, 'Zenga', ['Baresi', 'Maldini', 'Bergomi'], ['Donadoni', 'Albertini'], ['Schillaci', 'Roberto Baggio', 'Vialli']),
    era(2000, 2006, 'Buffon', ['Cannavaro', 'Nesta', 'Maldini', 'Zambrotta'], ['Pirlo', 'Gattuso', 'Totti'], ['Del Piero', 'Toni', 'Vieri']),
    era(2012, 2026, 'Donnarumma', ['Bonucci', 'Chiellini', 'Di Lorenzo'], ['Jorginho', 'Barella', 'Verratti', 'Tonali'], ['Immobile', 'Chiesa', 'Retegui']),
  ],
  Netherlands: [
    era(1974, 1978, 'Jongbloed', ['Krol', 'Suurbier'], ['Neeskens', 'Van Hanegem'], ['Cruyff', 'Rep', 'Rensenbrink']),
    era(1988, 1998, 'Van der Sar', ['Koeman', 'Frank de Boer'], ['Rijkaard', 'Davids', 'Bergkamp'], ['Van Basten', 'Gullit', 'Kluivert']),
    era(2010, 2014, 'Cillessen', ['Van Bronckhorst', 'Vlaar', 'De Vrij'], ['Sneijder', 'Van Bommel', 'Wesley Sneijder'], ['Robben', 'Van Persie', 'Huntelaar']),
    era(2019, 2026, 'Verbruggen', ['Van Dijk', 'De Ligt', 'Aké'], ['Frenkie de Jong', 'Wijnaldum', 'Gakpo'], ['Depay', 'Weghorst', 'Simons']),
  ],
  Portugal: [
    era(1966, 1966, 'Pereira', ['Germano'], ['Coluna', 'Graça'], ['Eusébio', 'Torres', 'Augusto']),
    era(2004, 2008, 'Ricardo', ['Carvalho', 'Miguel'], ['Figo', 'Deco', 'Maniche'], ['Cristiano Ronaldo', 'Pauleta', 'Nuno Gomes']),
    era(2012, 2026, 'Rui Patrício', ['Pepe', 'Rúben Dias', 'Cancelo'], ['Bruno Fernandes', 'Bernardo Silva', 'João Moutinho'], ['Cristiano Ronaldo', 'João Félix', 'Gonçalo Ramos', 'Nani']),
  ],
  Uruguay: [
    era(1950, 1962, 'Máspoli', ['Andrade'], ['Varela', 'Schiaffino'], ['Míguez', 'Ghiggia']),
    era(2010, 2018, 'Muslera', ['Godín', 'Lugano', 'Giménez'], ['Forlán', 'Valverde'], ['Suárez', 'Cavani', 'Stuani']),
    era(2019, 2026, 'Rochet', ['Godín', 'Giménez', 'Araújo'], ['Valverde', 'Bentancur', 'De la Cruz'], ['Suárez', 'Núñez', 'Pellistri']),
  ],
  Belgium: [
    era(1982, 1990, 'Pfaff', ['Gerets'], ['Scifo', 'Vercauteren'], ['Ceulemans', 'Claesen']),
    era(2014, 2026, 'Courtois', ['Alderweireld', 'Vertonghen', 'Vermaelen'], ['De Bruyne', 'Witsel', 'Tielemans'], ['Lukaku', 'Hazard', 'Mertens', 'Doku']),
  ],
  Croatia: [
    era(1998, 1998, 'Ladić', ['Štimac', 'Bilić'], ['Prosinečki', 'Asanović', 'Boban'], ['Davor Šuker', 'Vlaović']),
    era(2018, 2026, 'Livaković', ['Lovren', 'Gvardiol'], ['Modrić', 'Rakitić', 'Brozović', 'Kovačić'], ['Mandžukić', 'Perišić', 'Kramarić']),
  ],
  Poland: [
    era(1974, 1982, 'Tomaszewski', ['Żmuda', 'Gorgoń'], ['Deyna', 'Boniek'], ['Lato', 'Szarmach', 'Smolarek']),
    era(2016, 2026, 'Szczęsny', ['Glik', 'Bednarek', 'Cash'], ['Zieliński', 'Krychowiak', 'Grosicki'], ['Lewandowski', 'Milik', 'Świderski']),
  ],
  USSR: [
    era(1966, 1972, 'Yashin', ['Shesternyov'], ['Voronin', 'Muntyan'], ['Banishevskiy', 'Blokhin']),
    era(1986, 1990, 'Dasayev', ['Demianenko'], ['Mikhailichenko', 'Aleinikov'], ['Belanov', 'Protasov', 'Zavarov']),
  ],
  Russia: [
    era(2008, 2018, 'Akinfeev', ['Berezutski', 'Ignashevich'], ['Arshavin', 'Golovin', 'Zhirkov'], ['Dzyuba', 'Cheryshev', 'Pavlyuchenko']),
  ],
  Denmark: [
    era(1986, 1998, 'Schmeichel', ['Olsen', 'Rieper'], ['Brian Laudrup', 'Jensen'], ['Michael Laudrup', 'Elkjær', 'Vilfort']),
    era(2018, 2026, 'Kasper Schmeichel', ['Kjær', 'Christensen'], ['Eriksen', 'Højbjerg', 'Hjulmand'], ['Dolberg', 'Højlund', 'Braithwaite']),
  ],
  Sweden: [
    era(1990, 2006, 'Ravelli', ['Björklund'], ['Brolin', 'Mjällby'], ['Larsson', 'Dahlin', 'Ibrahimović']),
    era(2010, 2018, 'Olsen', ['Lindelöf', 'Granqvist'], ['Forsberg', 'Ekdal'], ['Ibrahimović', 'Berg', 'Toivonen']),
  ],
  Mexico: [
    era(1986, 2026, 'Ochoa', ['Márquez', 'Salcido'], ['Guardado', 'Herrera', 'Lozano'], ['Hernández', 'Blanco', 'Jiménez']),
  ],
  USA: [
    era(1994, 2026, 'Howard', ['Cherundolo', 'Dest'], ['Reyna', 'Pulisic', 'McKennie'], ['Donovan', 'Dempsey', 'Weah']),
  ],
  Colombia: [
    era(1990, 2026, 'Higuita', ['Yepes', 'Mina'], ['Valderrama', 'James Rodríguez', 'Cuadrado'], ['Falcao', 'Asprilla', 'Luis Díaz']),
  ],
  Nigeria: [
    era(1994, 2026, 'Rufai', ['West', 'Troost-Ekong'], ['Okocha', 'Ndidi'], ['Kanu', 'Yekini', 'Osimhen']),
  ],
  Ghana: [
    era(2006, 2026, 'Kingson', ['Mensah', 'Boateng'], ['Essien', 'Appiah', 'Partey'], ['Gyan', 'Kudus']),
  ],
  Morocco: [
    era(1986, 2026, 'Bono', ['Saïss', 'Hakimi'], ['Amrabat', 'Ziyech'], ['En-Nesyri', 'Ziyech', 'Boufal']),
  ],
  Senegal: [
    era(2002, 2026, 'Mendy', ['Koulibaly', 'Diatta'], ['Diouf', 'Gueye'], ['Mané', 'Diao', 'Dia']),
  ],
}

// Nation aliases so historical and modern names resolve to one star set.
const ALIAS: Record<string, string> = {
  'CIS': 'USSR',
  'Czechoslovakia': 'Czech Republic',
}

function setsFor(nation: string): EraSet[] | undefined {
  return NATION_STARS[nation] ?? NATION_STARS[ALIAS[nation] ?? '']
}

export function starsFor(nation: string, year: number): OppStar[] {
  const sets = setsFor(nation)
  if (!sets || sets.length === 0) return []
  const covering = sets.find(s => year >= s.from && year <= s.to)
  if (covering) return covering.stars
  // No exact era — use the nearest set so a recognisable name still appears.
  return sets.reduce((best, s) => {
    const d = Math.min(Math.abs(year - s.from), Math.abs(year - s.to))
    const bd = Math.min(Math.abs(year - best.from), Math.abs(year - best.to))
    return d < bd ? s : best
  }).stars
}

function pickByRole(stars: OppStar[], roles: OppRole[]): string | null {
  const pool = stars.filter(s => roles.includes(s.role))
  if (pool.length === 0) return null
  return pool[Math.floor(rand() * pool.length)].name
}

// A likely goalscorer — forwards first, attacking mids as backup.
export function oppScorer(nation: string, year: number): string | null {
  const stars = starsFor(nation, year)
  return pickByRole(stars, ['FWD']) ?? pickByRole(stars, ['MID'])
}

// A likely assist provider — midfielders, occasionally a forward.
export function oppCreator(nation: string, year: number): string | null {
  const stars = starsFor(nation, year)
  return pickByRole(stars, ['MID']) ?? pickByRole(stars, ['FWD'])
}

export function oppKeeper(nation: string, year: number): string | null {
  return pickByRole(starsFor(nation, year), ['GK'])
}

export function oppDefender(nation: string, year: number): string | null {
  return pickByRole(starsFor(nation, year), ['DEF'])
}
