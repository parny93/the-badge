// ─── Tournament lore ──────────────────────────────────────────────────────────
// Nostalgic, England-flavoured scene-setting for every World Cup & Euro.
//   • nickname    — how fans actually refer to it ("Italia '90", "France '98")
//   • host        — clean host label for display
//   • tagline     — one-line scene-setter, the way you'd reminisce about it
//   • englandTale — England's specific story / the iconic headlines of that year
//                   (shown on the tournament intro card before the campaign)
//   • atmosphere  — spoiler-free, era/host-appropriate flavour lines that get
//                   woven into the live match feed. No results, just the feeling.
//
// WC years and Euro years never overlap, so a single year → lore map is safe.

export interface TournamentLore {
  nickname: string
  host: string
  tagline: string
  englandTale: string
  atmosphere: string[]
}

export const TOURNAMENT_LORE: Record<number, TournamentLore> = {
  // ─── World Cups ─────────────────────────────────────────────────────────────
  1966: {
    nickname: "World Cup '66",
    host: 'England',
    tagline: 'Home soil, the Twin Towers, and the one and only time.',
    englandTale:
      "Hurst's hat-trick, Bobby Moore lifting the Jules Rimet, and \"they think it's all over.\" The afternoon English football reached the summit — and has spent every year since trying to get back.",
    atmosphere: [
      "Wembley's Twin Towers stand against a grey London sky.",
      'The old Wembley roar rolls down from the packed terraces.',
      'Red shirts, a Russian linesman, and a nation that believes.',
      'This is England’s tournament — and everyone here knows it.',
    ],
  },
  1970: {
    nickname: "Mexico '70",
    host: 'Mexico',
    tagline: 'Searing heat, thin air, and the greatest Brazil side ever lying in wait.',
    englandTale:
      "Gordon Banks' impossible save from Pelé, the holders defending their crown in the sun — until a 2-0 lead slipped away in León and poor Bonetti carried the blame home.",
    atmosphere: [
      'The Guadalajara sun is brutal — shirts soaked by the half-hour.',
      'Players gulp at the thin mountain air up at altitude.',
      'Heat shimmers off the pitch in the Mexican afternoon.',
      "Brazil's golden shirts are the talk of the whole tournament.",
    ],
  },
  1974: {
    nickname: "West Germany '74",
    host: 'West Germany',
    tagline: "Total Football, Cruyff's Holland, and an England watching from the sofa.",
    englandTale:
      "Jan Tomaszewski — the 'clown' who wasn't — kept England out at Wembley. No Three Lions in West Germany. All you've got is a wildcard ticket and a grudge.",
    atmosphere: [
      'Cruyff and the Dutch are rewriting how football is played.',
      'Beckenbauer prowls out from the back like no one before him.',
      'The grand old stadiums of West Germany await.',
      'England are here on a wildcard — with everything to prove.',
    ],
  },
  1978: {
    nickname: "Argentina '78",
    host: 'Argentina',
    tagline: 'Ticker-tape, a watching junta, and Kempes under the Buenos Aires lights.',
    englandTale:
      "Failed to qualify, again. While Argentina danced through the ticker-tape, England's names watched on television. Here's your reprieve.",
    atmosphere: [
      'Ticker-tape rains down on the Monumental.',
      'The Buenos Aires night crackles with feverish noise.',
      'Kempes and the hosts have a whole nation roaring behind them.',
      'England arrive as uninvited guests, ready to gatecrash.',
    ],
  },
  1982: {
    nickname: "España '82",
    host: 'Spain',
    tagline: "Bryan Robson's 27-second thunderbolt and a tournament England never lost.",
    englandTale:
      "Robson scored after 27 seconds against France. England didn't lose a single game — and still flew home. The cruellest exit of them all.",
    atmosphere: [
      'The Spanish sun bakes the terraces a deep terracotta.',
      "Robson's lightning start still rings in English ears.",
      'Unbeaten — and somehow that still might not be enough.',
      "Brazil's Zico and Sócrates are lighting up this World Cup.",
    ],
  },
  1986: {
    nickname: "Mexico '86",
    host: 'Mexico',
    tagline: 'Maradona. The Hand of God. The Goal of the Century. One afternoon.',
    englandTale:
      "Lineker's Golden Boot couldn't outrun Maradona's genius — and his cheating — in the same breath. The quarter-final in the Azteca that no England fan will ever forget, or forgive.",
    atmosphere: [
      "The Azteca's vast bowl swallows the noise whole.",
      'Maradona is the only name on anyone’s lips here.',
      'The Mexican heat is back to test tired English legs.',
      "Lineker's goals are firing England forward.",
    ],
  },
  1990: {
    nickname: "Italia '90",
    host: 'Italy',
    tagline: 'Nessun Dorma, New Order, and the summer English football fell back in love.',
    englandTale:
      "Gazza's tears. Platt's last-gasp volley. Lineker's poaching. A semi-final shootout against West Germany — Pearce, then Waddle — and a whole nation sobbing along to Pavarotti.",
    atmosphere: [
      "Pavarotti's Nessun Dorma drifts across the Italian night.",
      'Gazza is the beating heart of this England side.',
      'The Stadio delle Alpi hums under the floodlights.',
      'This is the summer English football came home to itself.',
    ],
  },
  1994: {
    nickname: "USA '94",
    host: 'United States',
    tagline: 'Soccer in the States — and England nowhere to be seen.',
    englandTale:
      "\"Do I not like that.\" Graham Taylor's England missed out entirely. No Three Lions in America, just a wildcard and a sore head.",
    atmosphere: [
      'Vast American stadiums shimmer in the summer heat.',
      'The USA is falling, briefly and madly, for soccer.',
      'England are here on a wildcard — uninvited but unbowed.',
      'Not a single English flag expected. Let’s change that.',
    ],
  },
  1998: {
    nickname: "France '98",
    host: 'France',
    tagline: "Beckham's red, Owen's wonder-goal, and Batty's penalty in Saint-Étienne.",
    englandTale:
      "A teenage Michael Owen announced himself to the planet with that run against Argentina. Then Beckham saw red, Batty's spot-kick was saved, and 'Three Lions' played on through the tears.",
    atmosphere: [
      'The Saint-Étienne night air is thick with old tension.',
      'A teenage Michael Owen has frightened the whole world.',
      'France basks in a glorious football summer.',
      'England and Argentina — it always, always means more.',
    ],
  },
  2002: {
    nickname: 'Korea/Japan 2002',
    host: 'South Korea & Japan',
    tagline: "Beckham's redemption from the spot — and Ronaldinho's lob over Seaman.",
    englandTale:
      "Beckham buried the penalty against Argentina — sweet, sweet revenge for '98. Then Ronaldinho floated one over Seaman in Shizuoka, and the dream drifted away in the Far East.",
    atmosphere: [
      'The humid Asian afternoon is sapping the legs.',
      'Beckham is England’s redeemed talisman now.',
      'Co-hosts Korea have an entire continent dreaming.',
      "Seaman's ponytail flaps in the Shizuoka breeze.",
    ],
  },
  2006: {
    nickname: 'Germany 2006',
    host: 'Germany',
    tagline: "WAGs, Rooney's metatarsal, and another shootout heartbreak.",
    englandTale:
      "Rooney rushed back from a broken metatarsal, then saw red against Portugal. Lampard, Gerrard and Carragher all missed from the spot. The Golden Generation flattered to deceive yet again.",
    atmosphere: [
      "Baden-Baden's WAGs are dominating the back pages.",
      "Rooney's fitness is the only story back in England.",
      'German efficiency hums quietly around this tournament.',
      'The Golden Generation carries the hopes of a nation.',
    ],
  },
  2010: {
    nickname: 'South Africa 2010',
    host: 'South Africa',
    tagline: "Vuvuzelas, Rob Green's fumble, and Lampard's goal that never was.",
    englandTale:
      'Green spilled it against the USA, the vuvuzelas droned on, and Lampard’s shot crossed the line by a yard against Germany — never given. A 4-1 humbling in Bloemfontein followed.',
    atmosphere: [
      'The vuvuzelas drone endlessly around the stadium.',
      'The thin Highveld air troubles every lung out there.',
      'Jabulani balls swerve unpredictably through the air.',
      "Africa's first World Cup — history in every fixture.",
    ],
  },
  2014: {
    nickname: 'Brazil 2014',
    host: 'Brazil',
    tagline: 'The spiritual home of football — and a group-stage goodbye.',
    englandTale:
      'Sturridge and Sterling flickered, but Suárez and Italy sent England packing at the group stage in the Amazonian heat. Two games, two defeats, an early flight home.',
    atmosphere: [
      'The Amazonian humidity hangs heavy over the pitch.',
      "Brazil's yellow shirts fill every single stand.",
      'Samba drums echo around the great bowl of a stadium.',
      'The home of football demands something beautiful.',
    ],
  },
  2018: {
    nickname: 'Russia 2018',
    host: 'Russia',
    tagline: "Waistcoats, 'It's Coming Home', and England finally winning a shootout.",
    englandTale:
      'Southgate’s waistcoat, Kane’s Golden Boot, and — at long, long last — a penalty shootout won, against Colombia. The semi-final defeat to Croatia hurt, but the nation fell in love all over again.',
    atmosphere: [
      "'It's Coming Home' rings out from every English throat.",
      "Southgate's waistcoat is the look of the entire summer.",
      "Russia's vast new stadiums throw open their doors.",
      'A young, fearless England has the country dreaming.',
    ],
  },
  2022: {
    nickname: 'Qatar 2022',
    host: 'Qatar',
    tagline: "A winter World Cup in the desert — and Kane's penalty over the bar.",
    englandTale:
      "Bellingham announced himself, England dazzled early — then Kane skied the penalty against France in the quarter-final. So near, and yet the same old story.",
    atmosphere: [
      'A surreal winter World Cup under desert floodlights.',
      'Air-conditioned stadiums glow in the Qatari night.',
      'Bellingham is the new jewel in the English crown.',
      'The desert air is cool; the stakes are red hot.',
    ],
  },
  2026: {
    nickname: 'World Cup 2026',
    host: 'USA, Canada & Mexico',
    tagline: '48 teams, three nations, and a trophy genuinely up for grabs.',
    englandTale:
      'Bellingham, Saka, Kane and a golden crop. No more nearly-men? The biggest World Cup ever staged, and England among the favourites. Write your own ending.',
    atmosphere: [
      'The first 48-team World Cup sprawls across a continent.',
      'Bellingham and Saka lead a fearless new England.',
      'Three host nations, one enormous stage.',
      'This time, the pressure is the privilege.',
    ],
  },

  // ─── European Championships ─────────────────────────────────────────────────
  1960: {
    nickname: 'Euro 1960',
    host: 'France',
    tagline: "The very first European Championship — Yashin's USSR crowned the kings of a new continent.",
    englandTale:
      "England didn't even enter the inaugural Euros. Consider this your wildcard ticket to a tournament the Three Lions never tasted.",
    atmosphere: [
      'A brand-new European tournament takes its first breath.',
      'Lev Yashin, the Black Spider, guards the Soviet goal.',
      'Post-war Europe gathers for football’s newest prize.',
      'England gatecrash a party they once snubbed.',
    ],
  },
  1964: {
    nickname: 'Euro 1964',
    host: 'Spain',
    tagline: "Franco's Spain, the Bernabéu, and a continent finding its feet.",
    englandTale:
      "Knocked out long before the finals. A wildcard is England's only route into Spain '64 — Moore and Greaves let loose on Europe.",
    atmosphere: [
      'The Bernabéu glows under the Madrid lights.',
      'Spanish football announces itself to all of Europe.',
      'Bobby Moore marshals the English back line.',
      'A young England side out to prove a point abroad.',
    ],
  },
  1968: {
    nickname: 'Euro 1968',
    host: 'Italy',
    tagline: 'Coin-toss semi-finals, and the world champions chasing a European crown.',
    englandTale:
      'The reigning world champions came for the double and finished third in Italy. Charlton, Banks and Moore — so close to ruling the world and Europe at once.',
    atmosphere: [
      'Italy hums with the easy swagger of the hosts.',
      'England arrive as world champions, the team to beat.',
      'Catenaccio defending tests every ounce of English patience.',
      "Moore and Charlton still carry the glow of '66.",
    ],
  },
  1972: {
    nickname: 'Euro 1972',
    host: 'Belgium',
    tagline: "Günter Netzer's West Germany — the most beautiful side of the age.",
    englandTale:
      "Netzer's Germany outclassed England at Wembley and knocked them out. No place in Belgium — just a wildcard and the sting of being schooled at home.",
    atmosphere: [
      'Netzer’s West Germany play football from the future.',
      'Belgian crowds savour a fierce, compact tournament.',
      'England nurse the bruise of defeat at Wembley.',
      'The Germans are the team everyone quietly fears.',
    ],
  },
  1976: {
    nickname: 'Euro 1976',
    host: 'Yugoslavia',
    tagline: "Panenka's penalty — the cheekiest kick in football history.",
    englandTale:
      "England missed out yet again. In Yugoslavia, Antonín Panenka dinked his way into legend. The Three Lions can only watch — unless you rewrite it.",
    atmosphere: [
      'Yugoslav stadiums crackle with raw Balkan passion.',
      "Panenka's audacity is the talk of all Europe.",
      'A four-team tournament where every match is a final.',
      'England crash the party with a point to prove.',
    ],
  },
  1980: {
    nickname: 'Euro 1980',
    host: 'Italy',
    tagline: 'England back at the Euros — and English hooliganism back in the headlines.',
    englandTale:
      "Ron Greenwood's England returned after a decade away, but a group-stage exit in Italy — and ugly scenes on the terraces — overshadowed the lot.",
    atmosphere: [
      'Italian ultras fill the curva with colour and smoke.',
      'England are back among Europe’s elite at last.',
      'Keegan leads the English line with bristling intent.',
      'The Italian press scrutinise every English move.',
    ],
  },
  1984: {
    nickname: 'Euro 1984',
    host: 'France',
    tagline: "Michel Platini's tournament — nine goals, total command, pure magic.",
    englandTale:
      "Denmark knocked England out in qualifying. Platini ran riot in France. The Three Lions watched a masterclass from home — now here's a wildcard reprieve.",
    atmosphere: [
      'Platini is bending this entire tournament to his will.',
      'French summer light pours over the terraces.',
      'England arrive uninvited, itching to spoil the party.',
      'Les Bleus have a whole nation in full song.',
    ],
  },
  1988: {
    nickname: 'Euro 1988',
    host: 'West Germany',
    tagline: "Marco van Basten's volley — and an English nightmare in Germany.",
    englandTale:
      "Three games, three defeats. Van Basten's hat-trick tore England apart. Robson's side flew home pointless — one of the bleakest ebbs of the whole era.",
    atmosphere: [
      'Van Basten and the Dutch are simply imperious.',
      'West German organisation runs this tournament like clockwork.',
      'England need a response — and they need it fast.',
      'The English press are already sharpening their knives.',
    ],
  },
  1992: {
    nickname: 'Euro 1992',
    host: 'Sweden',
    tagline: "'Swedes 2 Turnips 1' — and Lineker hooked off for the very last time.",
    englandTale:
      'Graham Taylor’s England drew a blank and bowed out. Lineker, subbed against Sweden, never played for England again. The tabloids turned him into a turnip.',
    atmosphere: [
      'The long Scandinavian evenings stretch the shadows out.',
      'Denmark are here almost by accident — and loving every second.',
      'Lineker chases one final goal in an England shirt.',
      'Swedish crowds bring a warm midsummer roar.',
    ],
  },
  1996: {
    nickname: "Euro '96",
    host: 'England',
    tagline: "Football's Coming Home. Three Lions. The dentist's chair. That Gazza goal.",
    englandTale:
      "Gazza's goal against Scotland, Shearer firing, Wembley in full voice — then Southgate's penalty saved by Köpke, and Germany again. So nearly the summer it all came home.",
    atmosphere: [
      "'Three Lions' booms out from every corner of Wembley.",
      'Football really does feel like it’s coming home.',
      'Gazza and Shearer have this England side purring.',
      'The old Wembley shakes to its very foundations.',
    ],
  },
  2000: {
    nickname: 'Euro 2000',
    host: 'Belgium & Netherlands',
    tagline: 'Shearer sinks Germany — but England trip over themselves again.',
    englandTale:
      "Alan Shearer's header beat Germany, but a 3-2 collapse against Romania sent Keegan's England home early. One step forward, two stumbles back.",
    atmosphere: [
      'The Low Countries put on a slick, modern tournament.',
      'Shearer leads the English line one final summer.',
      'Dutch and Belgian colours swirl through the stands.',
      "England's fragile defence holds its breath.",
    ],
  },
  2004: {
    nickname: 'Euro 2004',
    host: 'Portugal',
    tagline: 'A teenage Wayne Rooney on fire — until that metatarsal cracked.',
    englandTale:
      "Rooney was the revelation of the tournament until his foot broke against Portugal. Sol Campbell's goal was disallowed, the shootout was lost, and Lisbon broke English hearts.",
    atmosphere: [
      'A blazing Portuguese teenager has Europe talking.',
      "Lisbon's tiled streets fill with English songs.",
      'Rooney is fearless, unstoppable, just eighteen years old.',
      'The Estádio da Luz braces for another English drama.',
    ],
  },
  2008: {
    nickname: 'Euro 2008',
    host: 'Austria & Switzerland',
    tagline: "The wally with the brolly — England's grimmest night at Wembley.",
    englandTale:
      "McClaren's England lost to Croatia in the Wembley rain and missed the whole tournament. The umbrella image said it all. A wildcard is scant consolation.",
    atmosphere: [
      'Alpine backdrops frame a picture-postcard tournament.',
      'Spain are starting to play a thrilling new kind of football.',
      'England arrive on a wildcard, redemption on their minds.',
      'The mountains loom over packed Swiss stadiums.',
    ],
  },
  2012: {
    nickname: 'Euro 2012',
    host: 'Poland & Ukraine',
    tagline: "Pirlo's Panenka, and England's penalty curse rolls relentlessly on.",
    englandTale:
      "Hodgson's gritty England held Italy for 120 minutes — then Pirlo chipped a Panenka past Hart and the shootout did its usual cruel work in Kyiv.",
    atmosphere: [
      'Eastern Europe throws its doors open to the football world.',
      'Pirlo conducts the Italian midfield like an orchestra.',
      'England dig in, backs to the wall as ever.',
      "Kyiv's Olympic Stadium waits to break English hearts.",
    ],
  },
  2016: {
    nickname: 'Euro 2016',
    host: 'France',
    tagline: 'Iceland. The Thunderclap. The most humiliating night of them all.',
    englandTale:
      "Roy Hodgson's England lost to tiny Iceland in Nice — the Thunderclap echoing around the ground — and the manager walked before the post-match was even over. Rock bottom.",
    atmosphere: [
      "Iceland's travelling fans clap out their Viking thunder.",
      'France stages the tournament under tight summer security.',
      'England look nervous every time they touch the ball.',
      'The Stade de Nice simmers in the southern heat.',
    ],
  },
  2020: {
    nickname: 'Euro 2020',
    host: 'Europe-wide (final at Wembley)',
    tagline: "Played in 2021. Wembley. Sterling, Saka, and pens that still sting.",
    englandTale:
      "Sterling drove them to the final, Wembley roared 'It's Coming Home' — then Saka's penalty was saved by Donnarumma and Italy took it. So, so close, on home turf.",
    atmosphere: [
      'A pandemic-delayed final at a roaring, reopened Wembley.',
      "'It's Coming Home' surges around the old stadium.",
      'Southgate’s England are ninety minutes from glory.',
      'The whole nation dares, finally, to believe.',
    ],
  },
  2024: {
    nickname: 'Euro 2024',
    host: 'Germany',
    tagline: "Bellingham's bicycle kick, Watkins' winner — and Spain in the final.",
    englandTale:
      "Bellingham's overhead kick rescued them, Watkins sank the Dutch in the 90th — but Spain edged the final in Berlin. Southgate's last act, agonisingly short once more.",
    atmosphere: [
      "German cities throng with England's travelling thousands.",
      'Bellingham carries England’s hopes on young shoulders.',
      'Late, late drama follows this England side everywhere.',
      "Berlin's Olympiastadion awaits one more twist.",
    ],
  },
}

export function getLore(year: number): TournamentLore | undefined {
  return TOURNAMENT_LORE[year]
}

// Returns a shuffled copy of the atmosphere lines for a year, so a single match
// can consume several without repeating.
export function atmosphereDeck(year: number): string[] {
  const lore = TOURNAMENT_LORE[year]
  if (!lore) return []
  return [...lore.atmosphere].sort(() => Math.random() - 0.5)
}
