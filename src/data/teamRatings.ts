import { TeamRatings } from '@/types'

// Team strength ratings (0–99) at each World Cup, based on World Football Elo ratings.
// Tuned for gameplay feel — great teams in great years are correctly terrifying.

export const TEAM_RATINGS: TeamRatings = {
  1966: {
    'England': 87,
    'West Germany': 87,
    'Portugal': 84,
    'USSR': 83,
    'Brazil': 84,
    'Argentina': 78,
    'Hungary': 80,
    'Uruguay': 76,
    'Spain': 77,
    'France': 74,
    'Italy': 82,
    'North Korea': 68,
    'Mexico': 67,
    'Chile': 72,
    'Bulgaria': 70,
    'Switzerland': 69,
  },
  1970: {
    'Brazil': 95,      // Pelé, Jairzinho, Tostão, Rivelino — arguably the greatest WC team ever
    'West Germany': 88,
    'Italy': 85,
    'Uruguay': 82,
    'England': 84,
    'USSR': 79,
    'Mexico': 74,
    'Peru': 77,
    'Romania': 70,
    'Sweden': 71,
    'Bulgaria': 68,
    'Czechoslovakia': 72,
    'Belgium': 66,
    'Israel': 64,
    'Morocco': 62,
    'El Salvador': 60,
  },
  1974: {
    'Netherlands': 92,  // Total Football — Cruyff, Neeskens, Rep
    'West Germany': 90, // won it — Beckenbauer, Müller, Breitner
    'Poland': 83,       // Lato, Szarmach — bronze medal
    'Brazil': 83,       // transitional post-Pelé
    'Argentina': 77,
    'Sweden': 76,
    'Yugoslavia': 76,
    'East Germany': 74,
    'Chile': 70,
    'Scotland': 74,
    'Australia': 60,
    'Italy': 79,
    'Zaire': 55,
    'Uruguay': 72,
    'Haiti': 60,
    'Bulgaria': 68,
  },
  1978: {
    'Argentina': 88,   // Kempes, Ardiles, home advantage — won it
    'Netherlands': 88, // Cruyff-less but still superb — Rep, Neeskens, Rensenbrink
    'Brazil': 84,      // Zico era beginning
    'West Germany': 82,
    'Italy': 82,       // strong Italy
    'Poland': 78,
    'Scotland': 74,
    'Austria': 74,
    'Sweden': 73,
    'France': 72,
    'Tunisia': 65,
    'Iran': 62,
    'Mexico': 63,
    'Hungary': 68,
    'Spain': 70,
    'Peru': 73,
  },
  1982: {
    'Italy': 89,       // won it — Rossi, Tardelli, Zoff, Scirea, Gentile, Cabrini
    'West Germany': 87,
    'France': 84,      // Platini, Giresse, Tigana — beautiful football
    'Brazil': 88,      // Zico, Sócrates — unlucky not to win
    'Poland': 82,
    'England': 83,
    'Spain': 77,
    'Argentina': 83,   // defending champions
    'USSR': 78,
    'Belgium': 76,
    'Yugoslavia': 74,
    'Northern Ireland': 72,
    'Scotland': 73,
    'Hungary': 71,
    'Austria': 74,
    'Cameroon': 69,
    'Algeria': 67,
    'Chile': 69,
    'Czechoslovakia': 72,
    'Kuwait': 61,
    'Honduras': 62,
    'New Zealand': 59,
    'Peru': 69,
  },
  1986: {
    'Argentina': 93,   // Maradona at absolute peak — won it
    'West Germany': 86,
    'France': 84,      // Platini, Giresse, Tigana — semi-final
    'Brazil': 85,      // Zico, Sócrates, Careca
    'Belgium': 79,
    'England': 82,
    'Spain': 78,
    'Mexico': 77,      // home tournament
    'USSR': 78,
    'Denmark': 80,     // golden generation emerging — Laudrup, Elkjær
    'Morocco': 71,
    'Portugal': 73,
    'Uruguay': 75,
    'Poland': 76,
    'Paraguay': 70,
    'Italy': 81,       // defending champs
    'Bulgaria': 70,
    'Hungary': 68,
    'Canada': 61,
    'Algeria': 69,
    'Northern Ireland': 68,
    'Iraq': 61,
    'Scotland': 72,
    'South Korea': 63,
  },
  1990: {
    'West Germany': 91, // won it — Matthäus, Klinsmann, Völler, Brehme, Kohler
    'Argentina': 83,    // older Maradona, battle-scarred
    'Italy': 87,        // home advantage, Schillaci, Maldini, Baresi
    'England': 84,      // Gazza, Lineker, Pearce, Butcher
    'Brazil': 82,       // Careca, Romário (injury)
    'Netherlands': 84,  // Van Basten, Gullit, Rijkaard — R16 loss to West Germany
    'Czechoslovakia': 77,
    'Yugoslavia': 80,   // Stojković, Savičević, Šuker — talent
    'Republic of Ireland': 76,
    'Spain': 77,
    'Belgium': 79,
    'Romania': 76,      // Hagi era beginning
    'Colombia': 73,
    'Cameroon': 75,     // Milla magic, beat Argentina
    'USSR': 77,
    'Sweden': 73,
    'Scotland': 70,
    'Egypt': 67,
    'South Korea': 67,
    'USA': 63,
    'Austria': 70,
    'UAE': 58,
    'Costa Rica': 68,
    'Uruguay': 74,
  },
  1994: {
    'Brazil': 90,      // won it — Romário, Bebeto, Mauro Silva, Leonardo, Aldair
    'Italy': 83,       // Baggio, Maldini, Baresi — lost on penalties to Brazil
    'Sweden': 80,      // Dahlin, Larsson, Brolin — bronze medal
    'Bulgaria': 78,    // Stoichkov golden generation
    'Germany': 82,
    'Romania': 79,     // Hagi peak — Dumitrescu, Raducioiu
    'Netherlands': 82, // Bergkamp, Davids, De Boer brothers, R.Koeman
    'Spain': 78,
    'Argentina': 79,   // Maradona doping ban
    'Nigeria': 74,     // Okocha, Kanu, Amokachi — golden generation
    'Mexico': 72,
    'Republic of Ireland': 73,
    'Belgium': 72,
    'USA': 70,         // host
    'Switzerland': 70,
    'Colombia': 71,
    'Russia': 72,
    'Greece': 63,
    'South Korea': 66,
    'Saudi Arabia': 65,
    'Bolivia': 62,
    'Morocco': 66,
    'Cameroon': 68,
    'Norway': 71,
  },
  1998: {
    'France': 93,      // Zidane, Henry, Desailly, Vieira, Thuram, Blanc, Barthez — won it at home
    'Brazil': 88,      // Ronaldo, Roberto Carlos, Rivaldo, Cafu, Bebeto
    'Croatia': 82,     // Šuker, Boban, Prosinečki — bronze medal
    'Netherlands': 87, // Bergkamp, Davids, Kluivert, Seedorf, De Boer brothers
    'Germany': 82,
    'Italy': 83,       // Del Piero, Baggio, Maldini
    'England': 81,
    'Argentina': 86,   // Batistuta, Verón, Ortega — QF (penalties vs Netherlands)
    'Spain': 79,
    'Denmark': 78,     // Laudrup brothers, Schmeichel
    'Yugoslavia': 78,
    'Romania': 77,     // Hagi still going
    'Nigeria': 74,
    'Norway': 73,
    'Belgium': 73,
    'Paraguay': 72,
    'Mexico': 72,
    'Chile': 73,
    'South Korea': 69,
    'Japan': 65,
    'Cameroon': 71,
    'Jamaica': 62,
    'Morocco': 70,
    'Saudi Arabia': 65,
    'Austria': 70,
    'Tunisia': 65,
    'South Africa': 66,
    'Scotland': 70,
    'USA': 70,
    'Bulgaria': 68,
    'Iran': 64,
    'Colombia': 70,
  },
  2002: {
    'Brazil': 91,      // Ronaldo, Ronaldinho, Roberto Carlos, Cafu, Rivaldo — won it
    'Germany': 83,
    'Turkey': 79,      // Şükür, İlhan — 3rd place surprise
    'South Korea': 78, // host nation surprise run — Park Ji-sung, Ahn Jung-hwan
    'England': 82,
    'Senegal': 76,     // debut — beat France in groups
    'Spain': 80,
    'USA': 76,
    'Japan': 72,       // co-host
    'Sweden': 77,
    'Denmark': 77,
    'Mexico': 73,
    'Republic of Ireland': 74,
    'Italy': 82,       // strong but controversial exit
    'France': 87,      // defending champions, crashed out in groups!
    'Argentina': 83,   // also crashed out in groups
    'Portugal': 79,
    'Poland': 70,
    'Russia': 73,
    'Ecuador': 67,
    'Nigeria': 72,
    'Cameroon': 72,
    'Belgium': 72,
    'Croatia': 74,
    'Slovenia': 65,
    'Saudi Arabia': 62,
    'Costa Rica': 67,
    'China': 61,
    'Tunisia': 66,
    'South Africa': 66,
    'Paraguay': 69,
    'Uruguay': 71,
  },
  2006: {
    'Italy': 88,       // won it — Buffon, Cannavaro, Pirlo, Totti, Grosso
    'France': 86,      // Zidane\'s last WC — Ribéry, Henry, Vieira
    'Germany': 85,     // host — Klose, Lahm, Ballack, Lehmann
    'Portugal': 84,    // Ronaldo emerging, Figo, Deco, Maniche — Pauleta
    'Brazil': 85,      // Ronaldinho peak, Kaká, Adriano, Ronaldo, Roberto Carlos
    'England': 82,     // Rooney 20, Gerrard, Lampard, Beckham, Terry, Ferdinand
    'Argentina': 83,   // Messi emerging, Riquelme, Tevez, Crespo
    'Spain': 79,
    'Netherlands': 81, // van Nistelrooy, Sneijder, Robben, van der Sar
    'Ukraine': 77,     // Shevchenko
    'Switzerland': 76,
    'Ecuador': 70,
    'Ghana': 74,       // Essien, Boateng, Appiah
    'Mexico': 74,
    'USA': 73,
    'Australia': 71,
    'Czech Republic': 75,
    'Ivory Coast': 74, // Drogba, Kalou
    'South Korea': 70,
    'Japan': 68,
    'Poland': 69,
    'Sweden': 76,      // Ljungberg, Larsson
    'Croatia': 72,
    'Angola': 63,
    'Iran': 64,
    'Serbia': 70,
    'Saudi Arabia': 62,
    'Togo': 63,
    'Trinidad & Tobago': 62,
    'Tunisia': 65,
    'Costa Rica': 65,
    'Paraguay': 70,
  },
  2010: {
    'Spain': 94,       // WON IT — Xavi, Iniesta, Villa, Puyol, Ramos, Casillas — peak tiki-taka
    'Netherlands': 88, // Robben, Sneijder, van Persie — RVP in form
    'Germany': 86,     // Müller (golden boot), Klose, Özil, Neuer, Lahm
    'Uruguay': 80,     // Suárez, Forlán — Forlán won Golden Ball
    'Argentina': 85,   // Messi, Tevez, Higuaín — QF loss to Germany 4-0
    'Brazil': 84,      // Kaká, Robinho, Nilmar — 'attacking but lost QF
    'Ghana': 75,       // Gyan, Essien, Kevin-Prince Boateng
    'Paraguay': 74,
    'England': 80,     // Gerrard, Lampard, Rooney — below expectations
    'Chile': 76,       // Alexis Sánchez emerging
    'Mexico': 74,
    'USA': 73,
    'Australia': 70,
    'South Korea': 73,
    'Japan': 71,
    'Portugal': 83,    // Ronaldo peak, Nani
    'Serbia': 70,
    'Slovakia': 68,
    'Slovenia': 67,
    'Denmark': 72,
    'Ivory Coast': 75, // Drogba, Touré brothers
    'Cameroon': 67,
    'Algeria': 66,
    'New Zealand': 62,
    'France': 77,      // Anelka drama — internal collapse
    'Nigeria': 69,
    'Greece': 71,
    'Honduras': 62,
    'Switzerland': 74,
    'Italy': 77,       // defending champs, went out in groups
    'North Korea': 59,
    'South Africa': 67,
  },
  2014: {
    'Germany': 92,     // WON IT 7-1 vs Brazil — Müller, Klose, Özil, Kroos, Neuer, Lahm, Boateng
    'Argentina': 86,   // Messi, Higuaín, Mascherano, Di María, Agüero
    'Netherlands': 85, // Robben, van Persie, Sneijder
    'Brazil': 80,      // host but Neymar carried them — 7-1 horror
    'France': 83,      // Benzema, Ribéry, Pogba, Giroud, Matuidi
    'Colombia': 81,    // Rodríguez (golden boot), Falcao, Cuadrado
    'Belgium': 80,     // Hazard, Lukaku, De Bruyne, Courtois
    'Costa Rica': 74,  // massive overachievers — QF
    'England': 75,
    'Uruguay': 80,     // Suárez, Cavani, Godín — Suárez suspension
    'Italy': 79,       // Pirlo, Balotelli, Buffon
    'Chile': 79,       // Alexis, Vidal, Medel
    'Mexico': 74,
    'Algeria': 72,
    'Switzerland': 77,
    'USA': 73,
    'Greece': 69,
    'Nigeria': 72,
    'Ecuador': 68,
    'Bosnia': 71,
    'Cameroon': 65,
    'Honduras': 62,
    'Ivory Coast': 72,
    'Japan': 69,
    'South Korea': 69,
    'Portugal': 79,    // Ronaldo but poor team
    'Spain': 79,       // defending champs, crashed out in groups
    'Australia': 66,
    'Croatia': 72,
    'Iran': 66,
    'Ghana': 68,
    'Russia': 73,
  },
  2018: {
    'France': 91,      // WON IT — Mbappé, Griezmann, Pogba, Kanté, Lloris, Varane
    'Croatia': 84,     // Modrić (Ballon d\'Or), Rakitić, Mandžukić, Perišić, Subašić
    'Belgium': 87,     // Hazard, De Bruyne, Lukaku, Courtois, Kompany
    'England': 82,     // Kane (golden boot), Trippier, Pickford, Maguire, Sterling
    'Uruguay': 79,     // Suárez, Cavani, Godín
    'Russia': 72,      // host — overperformed
    'Sweden': 74,
    'Brazil': 84,      // Neymar, Coutinho, Firmino, Alisson, Thiago Silva
    'Argentina': 79,   // Messi but poor supporting cast
    'Portugal': 81,    // Ronaldo, Pepe, Bruno Fernandes
    'Spain': 82,       // Ramos, Piqué, Iniesta last WC, David Silva
    'Colombia': 75,    // Rodríguez, James, Falcao
    'Mexico': 73,
    'Japan': 72,       // overachieved (lost on yellow cards)
    'South Korea': 68,
    'Denmark': 74,
    'Germany': 80,     // defending champs — crashed out in groups
    'Serbia': 70,
    'Switzerland': 76,
    'Australia': 65,
    'Iceland': 69,
    'Panama': 59,
    'Costa Rica': 67,
    'Egypt': 65,
    'Nigeria': 70,
    'Peru': 70,
    'Tunisia': 65,
    'Senegal': 72,
    'Morocco': 70,
    'Saudi Arabia': 62,
    'Iran': 67,
    'Poland': 71,
  },
  2022: {
    'Argentina': 93,   // WON IT — Messi finally, Martínez, Di María, Mac Allister, Fernández, Molina
    'France': 88,      // Mbappé, Griezmann, Giroud, Varane, Lloris
    'Morocco': 81,     // brilliant overachievers — En-Nesyri, Hakimi, Amrabet, Bounou
    'Croatia': 80,     // Modrić still elite, Gvardiol, Perišić
    'Netherlands': 80, // De Jong, Dumfries, Gakpo, van Dijk
    'Brazil': 84,      // Vinícius Jr, Neymar, Richarlison, Casemiro, Alisson
    'England': 83,     // Kane, Bellingham, Saka, Rashford, Pickford
    'Portugal': 84,    // Ronaldo, Bernardo Silva, João Félix, Pepe, Rúben Dias
    'Spain': 80,       // Pedri, Gavi, Morata, Busquets
    'USA': 74,
    'Australia': 72,
    'Japan': 76,       // beat Germany and Spain in groups!
    'Senegal': 74,     // Mané, Koulibaly, Dia
    'Switzerland': 76,
    'South Korea': 72, // Son, Lee — beat Portugal in groups
    'Poland': 72,      // Lewandowski
    'Germany': 78,     // Müller, Gnabry, Kimmich — crashed out again in groups
    'Mexico': 69,
    'Cameroon': 68,
    'Uruguay': 73,     // Valverde, Núñez, Araujo
    'Denmark': 75,     // Eriksen (comeback), Dolberg, Christensen
    'Belgium': 77,     // De Bruyne, Hazard declining, Lukaku injured
    'Serbia': 72,
    'Wales': 69,       // Bale, Ramsey
    'Ghana': 67,
    'Ecuador': 67,
    'Canada': 65,
    'Tunisia': 67,
    'Costa Rica': 64,
    'Saudi Arabia': 67, // beat Argentina in groups!
    'Iran': 65,
    'Qatar': 59,
  },
  2026: {
    'France': 89,      // Mbappé, Tchouaméni, Camavinga, Upamecano, Maignan
    'England': 87,     // Bellingham, Kane, Saka, Rice, Alexander-Arnold, Palmer
    'Spain': 88,       // Yamal (19), Pedri, Gavi, Morata, Rodri, Cucurella
    'Argentina': 88,   // Messi (last WC?), Álvarez, Lautaro, Mac Allister, De Paul, Martínez
    'Brazil': 87,      // Vinícius Jr, Endrick, Rodrygo, Militão, Alisson
    'Germany': 83,     // Musiala, Wirtz, Kimmich, Havertz, Ter Stegen
    'Portugal': 84,    // Bruno Fernandes, Bernardo Silva, Vitinha, Rúben Dias
    'Netherlands': 82, // Gakpo, Reijnders, De Jong, van Dijk, Verbruggen
    'Morocco': 79,
    'Colombia': 78,    // Díaz, Arias, Córdoba
    'USA': 77,         // co-host — Pulisic, Reyna, Adams, Turner
    'Canada': 75,      // Davies, Johnston — co-host
    'Japan': 78,       // Mitoma, Kubo, Endo, Tanaka
    'Senegal': 75,     // Mané, Dia, Sarr
    'Uruguay': 75,     // Valverde, Núñez, Araujo, De Arrascaeta
    'Mexico': 72,      // co-host
    'Nigeria': 72,
    'South Korea': 73, // Son, Lee, Hwang
    'Belgium': 74,     // post-golden gen — Tielemans, Doku, Openda, Courtois
    'Australia': 71,
    'Ecuador': 70,
    'Saudi Arabia': 70,
    'Serbia': 72,
    'Croatia': 77,     // Modrić still going, Gvardiol
    'Denmark': 75,
    'Switzerland': 76,
    'Turkey': 72,
    'Chile': 67,
    'Iran': 66,
    'Qatar': 62,       // defending Asian hosts
    'Poland': 71,      // Lewandowski declining
    'Scotland': 70,
  },
}

// ─── Generic fallback ratings for teams not in the lookup ────────────────────
export const FALLBACK_RATING = 65

export function getTeamRating(team: string, year: number): number {
  const yearRatings = TEAM_RATINGS[year]
  if (!yearRatings) return FALLBACK_RATING
  return yearRatings[team] ?? FALLBACK_RATING
}
