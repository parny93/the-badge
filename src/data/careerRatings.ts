/**
 * Season-by-season player quality ratings.
 *
 * Each entry is a sparse Record<year, rating> of key waypoints. The agingCurve
 * module interpolates linearly between supplied years and applies a ±3-per-year
 * decay/rise outside the defined range (floor 40).
 *
 * Derivation formula (applied mentally for each waypoint):
 *   0.55 × FIFA / EA historical rating (post-1993) or equivalent estimate
 *   0.25 × Transfermarkt market-value career percentile
 *   0.10 × club season performance (trophy, Golden Boot, awards etc.)
 *   0.10 × England / tournament relevance (key player, standout display)
 * + manual football knowledge overrides for famous edge cases
 *
 * Pre-FIFA era (pre-1993): formula applied via football historical knowledge,
 * contemporary press ratings, and retrospective statistical analysis.
 *
 * Prime mode (All-Time Draft / All-Time XI) ignores this entirely and always
 * uses player.peakRating — these values only affect Manager Mode.
 */
export const CAREER_RATINGS: Record<string, Record<number, number>> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // GOALKEEPERS
  // ═══════════════════════════════════════════════════════════════════════════

  gordon_banks: {
    1962: 82,
    1964: 87,
    1966: 92,   // World Cup winner — universally regarded world's best
    1968: 91,
    1970: 93,   // Career peak — the Pelé save; car crash ended career Oct 1972
    1972: 85,
  },

  peter_shilton: {
    1970: 74,   // Early — ferocious battle with Clemence for the shirt
    1974: 80,
    1977: 83,
    1980: 85,
    1982: 87,   // WC 82 — clean sheet run, excellent throughout
    1984: 87,
    1986: 86,   // WC 86
    1988: 85,
    1990: 82,   // WC 90 — 40 years old, still world-class at GK
  },

  ray_clemence: {
    1972: 78,
    1974: 82,
    1977: 87,   // Peak Liverpool era — contested England spot with Shilton
    1980: 86,
    1982: 83,   // Last WC
  },

  david_seaman: {
    1990: 77,
    1992: 80,
    1994: 82,
    1996: 85,   // Euro 96 — penalty save vs Spain in SF
    1998: 85,   // WC 98
    2000: 82,
    2002: 79,   // Ronaldinho chip — still excellent FA Cup form that season
  },

  joe_hart: {
    2008: 72,
    2010: 77,
    2012: 84,   // Peak — best GK in PL; PFA Team of Year
    2014: 84,
    2016: 83,
    2018: 78,
  },

  jordan_pickford: {
    2018: 79,   // WC 2018 — brilliant, saved penalties in SF shootout
    2020: 81,
    2022: 82,
    2024: 83,
    2026: 82,
  },

  nigel_martyn: {
    1996: 73,
    1998: 76,
    2000: 78,
    2002: 77,
  },

  david_james: {
    1998: 69,   // "Calamity James" era — gifted but chronically unreliable
    2000: 72,
    2002: 73,
    2004: 76,   // Steadied; Euro 2004 starter
    2006: 76,
    2008: 74,
    2010: 79,   // WC 2010 — first-choice starter; best late-career form
  },

  paul_robinson: {
    2002: 71,
    2004: 75,
    2006: 79,   // WC 2006 — first choice; shot-stopping excellent that period
    2008: 75,
    2010: 70,
  },

  nick_pope: {
    2020: 77,
    2022: 81,
    2024: 83,
    2026: 82,
  },

  aaron_ramsdale: {
    2020: 73,
    2022: 78,
    2024: 78,
    2026: 77,
  },

  chris_woods: {
    1984: 74,
    1986: 77,
    1988: 78,
    1990: 79,   // Backup to Shilton at WC 90 — deserved more caps
    1992: 75,
  },

  rob_green: {
    2006: 71,
    2008: 73,
    2010: 70,   // WC 2010 — infamous Clint Dempsey howler ended England career
    2012: 72,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // RIGHT BACKS
  // ═══════════════════════════════════════════════════════════════════════════

  viv_anderson: {
    1978: 73,   // First Black England international — trailblazer
    1980: 76,
    1982: 79,   // WC 82 — Nottingham Forest's two-time European Cup winner
    1984: 79,
    1986: 76,
    1988: 71,
  },

  phil_neal: {
    1976: 78,
    1978: 81,
    1980: 83,
    1982: 84,   // WC 82 — part of the great Liverpool pipeline
    1984: 81,
    1986: 74,
  },

  gary_neville: {
    1996: 76,
    1998: 80,
    2000: 82,
    2002: 83,
    2004: 84,   // Peak years — one of the best RBs in Europe
    2006: 81,
  },

  glen_johnson: {
    2004: 72,
    2006: 74,
    2008: 77,
    2010: 80,   // WC 2010 — best England years, marauding from RB
    2012: 78,
    2014: 75,
  },

  kieran_trippier: {
    2018: 80,   // WC 2018 — free kick vs Croatia in SF; standout performer
    2020: 79,
    2022: 81,
    2024: 80,
    2026: 78,
  },

  kyle_walker: {
    2016: 81,
    2018: 84,
    2020: 84,
    2022: 84,
    2024: 83,
    2026: 80,
  },

  trent_alexander_arnold: {
    2018: 75,
    2020: 82,
    2022: 83,
    2024: 85,
    2026: 86,
  },

  reece_james: {
    2020: 76,
    2022: 82,   // Peak — elite two-way RB when fit
    2024: 80,
    2026: 82,
  },

  lee_dixon: {
    1990: 76,
    1992: 77,
    1994: 77,
    1996: 76,
    1998: 73,
    2000: 70,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // LEFT BACKS
  // ═══════════════════════════════════════════════════════════════════════════

  terry_cooper: {
    1966: 76,
    1968: 81,
    1970: 84,   // WC 70 — one of the best LBs in the tournament
    1972: 78,
  },

  kenny_sansom: {
    1980: 78,
    1982: 82,
    1984: 83,
    1986: 84,   // WC 86 peak — best LB in Europe at the time
    1988: 80,
    1990: 73,
  },

  stuart_pearce: {
    1986: 77,
    1988: 81,
    1990: 83,   // WC 90 — iconic despite penalty miss; uncompromising
    1992: 82,
    1994: 81,
    1996: 79,   // Euro 96 — redemption penalty vs Spain
    1998: 71,
  },

  ashley_cole: {
    2002: 77,
    2004: 83,
    2006: 87,
    2008: 89,   // Peak — arguably the best LB in the world
    2010: 88,
    2012: 83,
    2014: 76,
  },

  luke_shaw: {
    2016: 75,
    2018: 78,
    2020: 81,
    2022: 82,
    2024: 82,
    2026: 80,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // CENTRE BACKS
  // ═══════════════════════════════════════════════════════════════════════════

  bobby_moore: {
    1962: 82,
    1964: 88,
    1966: 93,   // World Cup winner — universally world's best CB
    1968: 91,
    1970: 95,   // Career peak — mastered Pelé; greatest England performance ever
    1972: 85,
    1974: 76,
  },

  jack_charlton: {
    1962: 76,
    1964: 79,
    1966: 83,   // World Cup winner
    1968: 82,
    1970: 80,
    1972: 72,
  },

  terry_butcher: {
    1982: 78,
    1984: 82,
    1986: 83,   // WC 86 — cornerstone of England's back line
    1988: 84,
    1990: 84,   // WC 90 — "that photo"; legendary courage and commitment
  },

  des_walker: {
    1988: 78,
    1990: 84,   // WC 90 — electric pace, excellent; "you'll never beat Des Walker"
    1992: 82,
    1994: 79,
    1996: 74,
  },

  tony_adams: {
    1988: 77,
    1990: 80,
    1992: 81,
    1994: 82,
    1996: 84,   // Euro 96 — commanding, Arsenal double winner
    1998: 84,   // WC 98
    2000: 82,
    2002: 75,
  },

  gareth_southgate: {
    1994: 73,
    1996: 76,   // Euro 96 — solid but infamous penalty miss in SF
    1998: 77,
    2000: 78,
    2002: 77,
    2004: 72,
  },

  sol_campbell: {
    1998: 79,
    2000: 82,
    2002: 85,   // WC 2002 — among Europe's very best CBs
    2004: 84,   // Euro 2004 — excellent
    2006: 83,
    2008: 73,   // Declining; last England cap Jul 2007
  },

  rio_ferdinand: {
    2000: 79,
    2002: 84,
    2004: 88,   // Man Utd peak — best CB in PL by common consent
    2006: 90,   // WC 2006 — dominant; arguably his best England tournament
    2008: 88,
    2010: 85,   // WC 2010
    2012: 81,
    2014: 72,
  },

  john_terry: {
    2002: 77,
    2004: 83,
    2006: 88,
    2008: 90,   // Absolute peak — best CB in world
    2010: 88,
    2012: 84,
    2014: 78,
  },

  ledley_king: {
    2002: 74,
    2004: 78,
    2006: 81,   // WC 2006 — excellent when fit; tragic injury career
    2008: 77,
    2010: 73,
  },

  gary_cahill: {
    2010: 73,
    2012: 77,
    2014: 79,
    2016: 79,
    2018: 74,
  },

  john_stones: {
    2016: 74,
    2018: 76,
    2020: 80,
    2022: 82,
    2024: 82,
    2026: 81,
  },

  harry_maguire: {
    2018: 78,   // WC 2018 — breakthrough tournament; scored vs Sweden
    2020: 80,
    2022: 77,
    2024: 74,
    2026: 73,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // DEFENSIVE / CENTRAL MIDFIELD
  // ═══════════════════════════════════════════════════════════════════════════

  nobby_stiles: {
    1964: 77,
    1966: 83,   // WC winner — masterclass in breaking up play; also scored OG vs France
    1968: 81,
    1970: 75,
  },

  emlyn_hughes: {
    1970: 76,
    1972: 79,
    1974: 82,   // WC 74 — versatile Liverpool stalwart; Crazy Horse
    1976: 83,
    1978: 81,
    1980: 74,
  },

  alan_ball: {
    1964: 77,
    1966: 84,   // WC winner — MOTM contender in final; tireless box-to-box
    1968: 83,
    1970: 84,   // WC 70 — arguably career best
    1972: 81,
    1975: 72,
  },

  martin_peters: {
    1964: 76,
    1966: 82,   // WC winner — scored in final; "10 years ahead of his time"
    1968: 83,
    1970: 83,   // WC 70 — peak in tandem with Ball
    1972: 80,
    1974: 71,
  },

  ray_wilkins: {
    1976: 74,
    1978: 77,
    1980: 79,
    1982: 82,   // WC 82 — captain, composed under pressure
    1984: 80,
    1986: 77,
  },

  trevor_brooking: {
    1974: 76,
    1977: 79,
    1980: 82,   // EC 80 — peak creative force
    1982: 82,   // WC 82 — came back from injury; scored vs Kuwait
    1984: 71,
  },

  bryan_robson: {
    1980: 79,
    1982: 84,   // WC 82 — fastest ever WC goal (27 sec vs France)
    1984: 87,
    1986: 87,   // WC 86 peak — two injuries derailed tournament
    1988: 84,
    1990: 82,   // WC 90 — injured again but class when fit
    1992: 76,
  },

  paul_gascoigne: {
    1988: 79,
    1990: 89,   // WC 90 — best England individual tournament since 1970; those tears
    1992: 84,
    1994: 85,
    1996: 88,   // Euro 96 — that Scotland lob, the dentist's chair; England's heartbeat
    1998: 78,
  },

  david_platt: {
    1990: 81,   // WC 90 — that last-minute volley vs Belgium
    1992: 82,
    1994: 83,   // Peak — reliable goalscoring midfielder
    1996: 80,
    1998: 71,
  },

  paul_ince: {
    1992: 76,
    1994: 79,
    1996: 80,
    1998: 80,   // WC 98 — the "Guvnor" at his commanding best
    2000: 73,
  },

  glen_hoddle: {
    1978: 77,
    1980: 80,
    1982: 82,   // WC 82
    1984: 83,
    1986: 84,   // WC 86 — brilliant despite being criminally underused
    1988: 80,
    1990: 74,
  },

  paul_scholes: {
    1996: 78,
    1998: 82,
    2000: 85,
    2002: 88,   // WC 2002 — outstanding; one of best in world that season
    2004: 88,   // Euro 2004 — last England tournament; voluntarily retired
  },

  steven_gerrard: {
    1998: 72,
    2000: 77,
    2002: 83,
    2004: 87,
    2006: 90,   // WC 2006 — England's standout player; scored free kick vs T&T
    2008: 90,
    2010: 88,   // WC 2010 — disallowed goal tournament; still class
    2012: 85,
    2014: 80,
  },

  frank_lampard: {
    2000: 77,
    2002: 82,
    2004: 88,
    2006: 90,   // WC 2006 — Chelsea record scorer; peak form
    2008: 89,
    2010: 87,   // WC 2010 — disallowed goal; still among best in Europe
    2012: 83,
    2014: 76,
  },

  michael_carrick: {
    2004: 74,
    2006: 76,
    2008: 79,
    2010: 80,
    2012: 81,
    2014: 78,
    2016: 73,
  },

  gareth_barry: {
    2004: 73,
    2006: 76,
    2008: 79,
    2010: 79,   // WC 2010 — first choice DM
    2012: 77,
    2014: 72,
  },

  owen_hargreaves: {
    2002: 74,
    2004: 76,
    2006: 82,   // WC 2006 — many argued England's best player in tournament
    2008: 77,
  },

  jordan_henderson: {
    2012: 72,
    2014: 74,
    2016: 76,
    2018: 78,
    2020: 79,
    2022: 78,
    2024: 72,
  },

  declan_rice: {
    2020: 77,
    2022: 83,
    2024: 87,
    2026: 88,
  },

  kobbie_mainoo: {
    2024: 79,
    2026: 83,
  },

  mason_mount: {
    2020: 77,
    2022: 80,
    2024: 77,
    2026: 78,
  },

  dele_alli: {
    2016: 77,
    2018: 79,
    2020: 73,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // ATTACKING MIDFIELD
  // ═══════════════════════════════════════════════════════════════════════════

  david_beckham: {
    1996: 79,
    1998: 85,
    2000: 88,
    2002: 91,   // WC 2002 — absolute peak; that penalty vs Argentina
    2004: 86,
    2006: 85,   // WC 2006 — older but still elite set-piece weapon
    2008: 81,
  },

  steve_mcmanaman: {
    1994: 74,
    1996: 77,   // Euro 96 — standout dribbler; freed Shearer to score
    1998: 78,
    2000: 79,   // Champions League winner with Real Madrid
    2002: 73,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // WINGERS
  // ═══════════════════════════════════════════════════════════════════════════

  john_barnes: {
    1984: 78,
    1986: 85,   // WC 86 — that Brazil solo goal; single greatest England moment?
    1988: 86,   // Peak — best winger in Europe
    1990: 82,   // WC 90
    1992: 78,
    1994: 72,
  },

  chris_waddle: {
    1984: 76,
    1986: 82,   // WC 86
    1988: 84,
    1990: 86,   // WC 90 — arguably England's best player in Italia 90
    1992: 80,
    1994: 72,
  },

  steve_coppell: {
    1977: 75,
    1979: 77,
    1980: 79,
    1982: 80,   // WC 82
    1984: 72,
  },

  raheem_sterling: {
    2014: 76,
    2016: 80,
    2018: 83,
    2020: 85,
    2022: 83,
    2024: 78,
    2026: 74,
  },

  bukayo_saka: {
    2020: 78,
    2022: 84,   // WC 2022 — outstanding; dangerous in every game
    2024: 87,
    2026: 88,
  },

  jadon_sancho: {
    2020: 79,
    2022: 78,   // Struggled badly at Man Utd; not his best period
    2024: 76,
    2026: 77,
  },

  phil_foden: {
    2020: 81,
    2022: 86,
    2024: 89,
    2026: 91,
  },

  cole_palmer: {
    2024: 86,   // Breakout Premier League season with Chelsea
    2026: 88,
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // STRIKERS
  // ═══════════════════════════════════════════════════════════════════════════

  jimmy_greaves: {
    1960: 82,
    1962: 85,   // WC 62 — already feared by every defence in the world
    1964: 87,
    1966: 85,   // Cruelly dropped from final despite being fit; tragic
    1967: 80,
  },

  roger_hunt: {
    1962: 76,
    1964: 79,
    1966: 83,   // World Cup winner — Ramsey's trusted workman
    1968: 78,
    1970: 71,
  },

  geoff_hurst: {
    1964: 77,
    1966: 88,   // World Cup winner — the only hat-trick in a WC final
    1968: 84,
    1970: 82,
    1972: 72,
  },

  kevin_keegan: {
    1973: 74,
    1974: 78,
    1976: 82,
    1977: 85,   // Ballon d'Or — club form world-class; England didn't qualify 74/78
    1979: 86,
    1980: 84,
    1982: 81,   // WC 82 — ill before tournament; still quality
  },

  trevor_francis: {
    1978: 77,
    1980: 79,
    1982: 82,   // WC 82 — England's spearhead; first £1m player
    1984: 78,
    1986: 72,
  },

  gary_lineker: {
    1982: 76,
    1984: 80,
    1986: 89,   // WC 86 Golden Boot — 6 goals including hat-trick vs Poland
    1988: 86,
    1990: 88,   // WC 90 — 4 goals; the ice-cool penalty taker
    1992: 83,
  },

  peter_beardsley: {
    1986: 80,
    1988: 81,
    1990: 82,   // WC 90 — perfect foil for Lineker
    1992: 80,
    1994: 74,
  },

  ian_wright: {
    1992: 79,
    1994: 82,
    1996: 81,
    1998: 73,
  },

  teddy_sheringham: {
    1994: 77,
    1996: 80,
    1998: 80,   // WC 98
    2000: 79,
    2002: 74,
  },

  les_ferdinand: {
    1994: 78,
    1996: 82,   // Euro 96 — peak form; 24-goal PL season with Newcastle
    1998: 77,
    2000: 72,
  },

  alan_shearer: {
    1993: 76,
    1994: 82,
    1996: 91,   // Euro 96 Golden Boot — 5 goals; England's defining striker
    1998: 89,   // WC 98
    2000: 85,   // Euro 2000 — retired from England after this
  },

  michael_owen: {
    1998: 84,   // WC 98 — that Argentina goal; 18-year-old sensation
    2000: 86,
    2002: 89,   // WC 2002 — peak; scored vs Brazil in QF
    2004: 82,
    2006: 71,   // Metatarsal suffered IN the tournament; already post-injury decline
    2008: 66,
  },

  emile_heskey: {
    1998: 73,
    2000: 76,
    2002: 77,   // WC 2002 — selfless partner for Owen
    2004: 75,
    2006: 73,
    2008: 72,
    2010: 72,   // Last England year — still a useful decoy
  },

  wayne_rooney: {
    2004: 77,   // Euro 2004 — 18-year-old explosive debut; two goals vs Croatia
    2006: 83,   // WC 2006 — red card but clearly elite talent at 20
    2008: 87,
    2010: 88,
    2012: 90,   // Peak — Man Utd's leading scorer; POTY contender
    2014: 87,
    2016: 82,
  },

  peter_crouch: {
    2004: 70,
    2006: 73,   // WC 2006 — scored key goal vs T&T; aerial threat
    2008: 73,
    2010: 72,
    2012: 69,
  },

  jermain_defoe: {
    2004: 72,
    2006: 73,
    2008: 74,
    2010: 75,   // WC 2010 — scored vs Slovenia; lively from the bench
    2012: 73,
    2014: 71,
  },

  daniel_sturridge: {
    2010: 73,
    2012: 76,
    2014: 80,   // WC 2014 — scored vs Italy; genuinely world-class when fit
    2016: 76,
    2018: 71,
  },

  harry_kane: {
    2016: 82,
    2018: 88,   // WC 2018 Golden Boot — 6 goals including 2 vs Tunisia
    2020: 88,
    2022: 91,
    2024: 91,
    2026: 89,
  },

  marcus_rashford: {
    2018: 79,
    2020: 82,
    2022: 83,
    2024: 78,
    2026: 80,
  },

  jude_bellingham: {
    2022: 84,   // WC 2022 — excellent at 19; already Real Madrid-bound
    2024: 91,   // Euro 2024 — that bicycle kick vs Slovakia; world-class
    2026: 92,
  },
}
