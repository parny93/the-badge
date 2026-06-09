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
    // FIFA 00 = 94 globally (top-10 in game); peak was 1997-2001 Arsenal double era
    1990: 77,
    1992: 80,
    1994: 83,
    1996: 87,   // Euro 96 — penalty save vs Spain in SF; already world-class
    1998: 87,   // WC 98 — peak Arsenal years
    2000: 87,   // FIFA 00 = 94 globally; his absolute prime
    2002: 81,   // Ronaldinho chip was one moment; still excellent FA Cup form
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
    // FIFA 05 = 93 globally (top-10!); FIFA 06 = 90; genuinely world-class peak
    1998: 79,
    2000: 83,
    2002: 87,   // WC 2002 — top-10 player in the world per EA; superb tournament
    2004: 86,   // Euro 2004 — FIFA 05=93; among Europe's very best CBs
    2006: 83,
    2008: 72,   // Declining; last England cap Jul 2007
  },

  rio_ferdinand: {
    // FIFA 03 = 93 globally (top-10 after WC 02!); FIFA 06 = 92; confirmed elite peak
    2000: 79,
    2002: 87,   // WC 2002 — FIFA 03=93 globally; superb partnership with Campbell
    2004: 89,   // Man Utd peak — best CB in PL; FIFA 06 had him at 92
    2006: 91,   // WC 2006 — dominant; arguably his best England tournament
    2008: 88,
    2010: 85,   // WC 2010
    2012: 81,
    2014: 72,
  },

  john_terry: {
    // FIFA 07 = 90 globally (7th in game!); FIFA 08 = 89; confirmed world-class
    2002: 77,
    2004: 83,
    2006: 89,   // FIFA 07=90 — 7th best player in the world per EA; dominant
    2008: 90,   // Absolute peak — best CB in world; FIFA 08=89 (our scale +1 for form)
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
    // FIFA 05 = 92 globally; FIFA 06 = 87 (after retiring from England, clearly rated lower)
    // Peak: one of the best CMs in the world 2001-2004
    1996: 78,
    1998: 82,
    2000: 86,
    2002: 89,   // WC 2002 — FIFA 05=92 reflects this era; among world's best CMs
    2004: 89,   // Euro 2004 — last England tournament; still at his absolute peak
  },

  steven_gerrard: {
    // FIFA 06 = 93 globally (equal to Rooney — top-5 in game!); FIFA 08=88, 09=88, 10=88
    1998: 72,
    2000: 77,
    2002: 85,   // Pre-Istanbul; already Liverpool's heartbeat; excellent form
    2004: 89,   // Istanbul preparation year; arguably his best single season
    2006: 91,   // FIFA 06=93; WC 2006 England's standout player; scored vs T&T
    2008: 90,
    2010: 87,   // FIFA 10=88; WC 2010 — disallowed goal tournament; still elite
    2012: 85,
    2014: 80,
  },

  frank_lampard: {
    // FIFA 06=90, FIFA 07=89 (8th globally!), FIFA 10=87, FIFA 11=87 (10th globally)
    2000: 77,
    2002: 82,
    2004: 88,
    2006: 90,   // FIFA 06=90, FIFA 07=89; Chelsea record scorer; peak form
    2008: 88,   // Still excellent; FIFA 08 ~87; consistent 15+ goals/season
    2010: 87,   // FIFA 10=87; WC 2010 — disallowed goal; still among best in Europe
    2012: 83,
    2014: 77,
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
    // FIFA 99=94 (top-3 globally!), FIFA 00=93, FIFA 01=93, FIFA 02=89, FIFA 04=90
    1996: 79,
    1998: 86,   // FIFA 99=94 post-WC 98; top-3 globally; our scale 86
    2000: 89,   // FIFA 00=93; absolute prime — Man Utd treble era
    2002: 89,   // WC 2002 — FIFA 02=89 (our scale); that penalty; but also red card '98 hangover gone
    2004: 87,   // FIFA 04=90; Real Madrid, still world-class
    2006: 83,   // FIFA 07=87; WC 2006 — older, metatarsal recovery, but iconic set pieces
    2008: 79,   // Declining — LA Galaxy, occasional England cameos
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
    // FIFA 97 = 96 globally (top-3!), FIFA 98 = 94; confirmed world-class peak
    1993: 78,   // Already elite — 22 goals in 92-93 for Southampton then Blackburn
    1994: 85,   // Blackburn title season 94-95 incoming; Ballon d'Or nomination
    1996: 91,   // Euro 96 Golden Boot — 5 goals; England's defining striker; FIFA 97=96
    1998: 89,   // WC 98 — still elite despite injury limiting club form
    2000: 85,   // Euro 2000 — last England tournament; post-ankle injury but still sharp
  },

  michael_owen: {
    // FIFA 99=94 (top-5 globally!), FIFA 02=92, FIFA 05=91, FIFA 08=84, FIFA 10=79
    1998: 87,   // FIFA 99=94 post-WC; that Argentina goal; Ballon d'Or 4th; world top-5
    2000: 88,   // Consistent elite form; Ballon d'Or 2001; Liverpool era peak
    2002: 89,   // WC 2002 — FIFA 02=92; scored vs Brazil QF; true peak
    2004: 85,   // FIFA 05=91; Real Madrid, still elite before injuries took hold
    2006: 75,   // Injured IN tournament; FIFA 07 ~84 but WC was curtailed; Newcastle decline
    2008: 72,   // FIFA 08=84; Man Utd squad player, still capable but not starter-quality
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
    // FIFA 06=93 (8th globally at 19!), FIFA 07=92 (2nd globally!), FIFA 08=90 (8th),
    // FIFA 11=88 (5th), FIFA 12=90 (6th), FIFA 13=89 (7th)
    2004: 82,   // Euro 2004 — 18yo; FIFA 05 would rate him ~88; scale down for age/rawness
    2006: 87,   // FIFA 07=92 (2nd in world!); scale to 89, minus red card/injury = 87
    2008: 88,   // FIFA 08=90; consistently top-10 in world; scale 88
    2010: 86,   // FIFA 10=87; WC 2010 — poor tournament form but class remains
    2012: 90,   // FIFA 12=90; absolute peak — Man Utd's leading scorer; POTY contender
    2014: 87,   // FIFA 13/14=89; still excellent
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

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW ADDITIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // DEFENDERS

  martin_keown: {
    1992: 73,
    1994: 76,
    1996: 78,
    1998: 80,   // Arsenal double era — one of the best CBs in the PL
    2000: 80,   // Absolute peak — Invincibles era approach
    2002: 79,
    2004: 72,
  },

  graeme_le_saux: {
    1992: 72,
    1994: 78,   // Blackburn title winners — underrated key man
    1996: 79,   // Euro 96
    1998: 79,   // Peak — Chelsea's most technical LB
    2000: 75,
    2002: 70,
  },

  wayne_bridge: {
    2001: 72,
    2002: 74,
    2004: 78,   // Chelsea under Mourinho — key part of the defence
    2006: 77,
    2008: 74,
    2010: 70,
  },

  // MIDFIELDERS

  bobby_charlton: {
    // One of England's greatest ever — WC winner, European Footballer of Year
    // Pre-FIFA era: estimated from contemporary press, statistical records, retrospective analysis
    1958: 73,   // Munich survivor; already electric in short spells
    1960: 79,
    1962: 83,   // WC 62 — quarter final
    1964: 88,
    1966: 91,   // WC winner; European Footballer of Year; Man Utd's heartbeat
    1968: 90,   // European Cup winner — his crowning Man Utd moment
    1970: 87,   // WC 70 — substituted against West Germany
    1972: 78,   // Twilight of a remarkable career
  },

  darren_anderton: {
    1994: 74,
    1996: 79,   // Euro 96 — key starter for Venables' creative system
    1997: 77,
    1998: 76,   // WC 98 — injury-disrupted (the "Sicknote" years)
    2000: 73,
    2001: 70,
  },

  jack_wilshere: {
    2012: 78,   // First full Arsenal season — absolutely extraordinary on the ball
    2013: 79,   // Standout CL goal vs Napoli; genuine world-class contender
    2014: 77,   // Injuries beginning to bite
    2016: 74,
  },

  james_milner: {
    2008: 72,
    2010: 75,
    2012: 78,
    2014: 79,   // Peak years at Man City
    2016: 79,   // Champions League winner's medal at Liverpool
    2018: 76,
    2020: 72,
  },

  // FORWARDS

  robbie_fowler: {
    // God — one of the most natural goalscorers English football has produced
    1995: 82,   // First full season — 25 goals in all competitions
    1996: 85,   // Peak — 36 goals all comps in 95-96; should have gone to Euro 96
    1997: 84,
    1998: 81,
    2000: 77,   // Start of knee injury problems
    2002: 72,
  },

  andy_cole: {
    // 34 goals for Newcastle (PL record at the time), Man Utd treble hero
    1994: 77,   // Newcastle 34-goal PL record season
    1996: 80,   // Man Utd double winners — found his feet after slow start
    1998: 82,
    1999: 83,   // Treble season — vital contributor
    2000: 80,
    2002: 75,
    2004: 70,
  },

  martin_chivers: {
    // Tottenham's big striker of the early 70s — 44 goals in 71-72
    1968: 70,
    1970: 73,
    1972: 77,   // Peak — UEFA Cup, League Cup; England's lead striker
    1974: 73,
  },

  jamie_vardy: {
    2016: 79,   // Euro 2016 — top form after historic PL title
    2018: 83,   // WC 2018 — scored vs Iran, pace terrifying at 31
    2020: 79,
    2022: 74,
  },

  theo_walcott: {
    2006: 68,   // 17yo at WC — selected but didn't play; pace already frightening
    2008: 73,
    2010: 75,
    2012: 78,   // Peak Arsenal — 14 PL goals, PFA Team of Year
    2014: 76,
    2016: 72,
    2018: 68,
  },

  // ─── Era-gap defenders ────────────────────────────────────────────────────

  jimmy_armfield: {
    1958: 70,
    1962: 77,
    1964: 80,   // England's first-choice RB, captain
    1966: 76,
  },

  george_cohen: {
    1962: 72,
    1966: 80,   // World Cup winner — peak season
    1968: 74,
  },

  keith_newton: {
    1964: 68,
    1966: 74,
    1968: 77,   // Peak form — Blackburn/Everton
    1970: 75,   // 1970 WC squad
  },

  paul_parker: {
    1986: 70,
    1988: 74,
    1990: 79,   // Peak — World Cup semi-final; QPR then Man Utd
    1992: 77,
    1994: 73,
  },

  ray_wilson: {
    1960: 74,
    1962: 79,
    1966: 83,   // World Cup winner — best LB in the tournament
    1968: 75,
  },

  mick_mills: {
    1966: 62,
    1970: 69,
    1974: 75,
    1978: 78,   // Peak — Ipswich FA Cup; regular England full-back
    1980: 77,
    1982: 73,
  },

  dave_watson: {
    1970: 69,
    1974: 77,
    1976: 79,
    1978: 79,   // Peak — Sunderland, Man City, England regular
    1980: 76,
    1982: 72,
  },

  phil_thompson: {
    1974: 70,
    1978: 78,
    1980: 80,   // Peak — Liverpool dominate Europe; Thompson is captain
    1982: 76,
    1984: 70,
  },

  phil_jagielka: {
    2006: 72,
    2008: 75,
    2010: 78,
    2012: 80,   // Peak — England first choice
    2014: 79,
    2016: 74,
    2018: 68,
  },

  mark_wright: {
    1986: 74,
    1988: 77,
    1990: 81,   // Peak — Italia '90 semi-final run; scored vs Belgium
    1992: 79,
    1994: 74,
    1996: 68,
  },

  leighton_baines: {
    2008: 72,
    2010: 76,
    2012: 80,
    2014: 82,   // Peak — Everton's outstanding LB; excellent set-pieces
    2016: 75,
  },

  danny_rose: {
    2012: 68,
    2014: 73,
    2016: 78,
    2018: 80,   // Peak — Spurs LB; excellent WC campaign
    2020: 70,
  },

  ben_chilwell: {
    2018: 73,
    2020: 79,
    2022: 83,   // Peak — Chelsea starting LB; attacking threat
    2024: 80,
    2026: 78,
  },

  eric_dier: {
    2016: 76,
    2018: 79,
    2020: 80,
    2022: 79,   // Reinvented as CB at Spurs and England
    2024: 74,
  },

  tyrone_mings: {
    2019: 74,
    2020: 78,
    2022: 80,   // Peak — regular England CB under Southgate
  },

  marc_guehi: {
    2022: 75,
    2024: 80,
    2026: 82,   // Rising star — Crystal Palace then regular England CB
  },

  // ─── Era-gap forwards ─────────────────────────────────────────────────────

  dominic_calvert_lewin: {
    2020: 76,
    2021: 83,   // Peak — 16 PL goals for Everton; England's first-choice ST
    2022: 80,
    2024: 78,
    2026: 77,
  },

  ollie_watkins: {
    2020: 72,
    2022: 78,
    2024: 83,   // Peak — Aston Villa's top scorer; won England's EURO semi-final
    2026: 83,
  },

  // ─── Additional era-gap players ───────────────────────────────────────────

  norman_hunter: {
    1966: 77,
    1968: 80,
    1970: 81,   // Peak — Leeds dominate England football
    1972: 80,
    1974: 77,
    1976: 72,
  },

  michael_keane: {
    2016: 72,
    2018: 79,   // Peak — regular England CB under Southgate
    2020: 74,
  },

  levi_colwill: {
    2022: 72,
    2024: 78,
    2026: 82,   // Rising England regular; CB and LB for Chelsea
  },

  tony_dorigo: {
    1988: 73,
    1990: 78,
    1992: 80,   // Peak — Leeds title-winning season; Euro squad
    1994: 75,
  },

  wes_brown: {
    2002: 73,
    2004: 77,
    2006: 79,   // Peak — Man Utd first team; versatile and athletic
    2008: 76,
    2010: 72,
  },

  peter_bonetti: {
    1964: 74,
    1966: 77,
    1968: 79,   // Peak — Chelsea FA Cup era
    1970: 76,
    1972: 70,
  },

  callum_wilson: {
    2018: 74,
    2020: 78,
    2022: 80,   // Peak — Newcastle's top scorer; strong England cameos
    2024: 76,
  },

  tammy_abraham: {
    2020: 73,
    2022: 78,
    2024: 81,   // Peak — Roma form; physical presence at 6ft4
    2026: 79,
  },

  francis_lee: {
    1966: 72,
    1968: 77,
    1970: 80,   // Peak — Man City title; regular England scorer
    1972: 78,
    1974: 72,
  },

  mick_channon: {
    1970: 68,
    1972: 74,
    1974: 78,
    1976: 80,   // Peak — Southampton era; 46 caps, 21 goals
    1978: 77,
    1980: 70,
  },
}
