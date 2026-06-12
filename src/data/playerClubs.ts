// ─── Player clubs ─────────────────────────────────────────────────────────────
// Each player's defining club during his England career — the one that makes
// the link-up real. Used by chemistry: a settled club bloc in your XI (the '66
// West Ham trio, the Class of '92, the Chelsea or Liverpool spine, this City
// side) links up better than eleven strangers. Players iconic at two clubs are
// placed where the bloc is strongest.

// Authored club → players, then flattened. Easier to reason about by bloc.
const CLUB_ROSTERS: Record<string, string[]> = {
  'West Ham': [
    'bobby_moore', 'geoff_hurst', 'martin_peters',      // the '66 trio
    'mark_noble', 'carlton_cole', 'jarrod_bowen', 'dean_ashton',
  ],
  'Manchester United': [
    'roger_byrne', 'duncan_edwards', 'tommy_taylor',    // the Busby Babes
    'bobby_charlton', 'nobby_stiles',                   // '66
    'david_beckham', 'paul_scholes', 'gary_neville', 'phil_neville', 'nicky_butt',  // Class of '92
    'rio_ferdinand', 'wayne_rooney', 'michael_carrick', 'wes_brown', 'owen_hargreaves',
    'steve_bruce', 'gary_pallister', 'paul_parker', 'andy_cole',
    'luke_shaw', 'marcus_rashford', 'jadon_sancho', 'kobbie_mainoo', 'kieran_richardson',
    'aaron_lennon',
  ],
  'Liverpool': [
    'ray_clemence', 'emlyn_hughes', 'phil_neal', 'phil_thompson', 'ian_callaghan',
    'kevin_keegan', 'john_barnes',
    'steve_mcmanaman', 'robbie_fowler', 'michael_owen', 'jamie_carragher', 'steven_gerrard',
    'jamie_redknapp', 'mark_wright',
    'trent_alexander_arnold', 'daniel_sturridge',
  ],
  'Chelsea': [
    'john_terry', 'frank_lampard', 'ashley_cole', 'joe_cole', 'wayne_bridge',
    'graeme_le_saux', 'dennis_wise', 'scott_parker', 'peter_osgood', 'alan_hudson',
    'levi_colwill', 'mason_mount', 'reece_james', 'conor_gallagher', 'fikayo_tomori', 'tammy_abraham',
  ],
  'Arsenal': [
    'david_seaman', 'tony_adams', 'martin_keown', 'ray_parlour', 'ian_wright',
    'charlie_george', 'kenny_sansom', 'sol_campbell', 'paul_merson',
    'theo_walcott', 'jack_wilshere', 'bukayo_saka', 'declan_rice',
  ],
  'Tottenham': [
    'jimmy_greaves', 'martin_chivers', 'glenn_hoddle', 'gary_lineker', 'teddy_sheringham',
    'darren_anderton', 'ledley_king', 'bobby_smith',
    'harry_kane', 'eric_dier', 'dele_alli', 'danny_rose', 'harry_winks', 'jermaine_jenas',
    'jermain_defoe',
  ],
  'Manchester City': [
    'joe_hart', 'kyle_walker', 'john_stones', 'phil_foden', 'raheem_sterling',
    'joleon_lescott', 'james_milner', 'gareth_barry', 'shaun_wright_phillips', 'francis_lee',
  ],
  'Everton': [
    'ray_wilson', 'leighton_baines', 'phil_jagielka', 'dominic_calvert_lewin', 'jordan_pickford',
    'nick_barmby', 'andrew_johnson',
  ],
  'Newcastle': [
    'peter_beardsley', 'rob_lee', 'jackie_milburn', 'kieron_dyer', 'andros_townsend',
  ],
  'Nottingham Forest': [
    'peter_shilton', 'stuart_pearce', 'des_walker', 'steve_stone', 'trevor_francis',
  ],
  'Leeds': [
    'norman_hunter', 'terry_cooper', 'tony_dorigo', 'david_batty', 'danny_mills',
  ],
  'Wolves': [
    'billy_wright', 'ron_flowers', 'bert_williams', 'steve_bull',
  ],
  'Leicester': [
    'gordon_banks', 'jamie_vardy', 'james_maddison', 'gerry_hitchens',
  ],
  'Southampton': [
    'matt_le_tissier', 'terry_paine', 'rickie_lambert', 'james_ward_prowse', 'james_beattie',
  ],
  'Aston Villa': [
    'tony_morley', 'gareth_southgate', 'darius_vassell', 'tyrone_mings', 'ollie_watkins',
    'morgan_rogers',
  ],
  'Crystal Palace': [
    'wilfried_zaha', 'marc_guehi', 'adam_wharton',
  ],
  'Blackpool': [
    'jimmy_armfield', 'stanley_matthews', 'stan_mortensen',
  ],
  'Preston North End': [
    'tom_finney',
  ],
  'Ipswich': [
    'terry_butcher', 'mick_mills',
  ],
  'QPR': [
    'stan_bowles', 'rodney_marsh', 'les_ferdinand',
  ],
  'Fulham': [
    'george_cohen', 'johnny_haynes',
  ],
  'Bolton': [
    'nat_lofthouse',
  ],
  'Sheffield United': [
    'tony_currie',
  ],
  'Blackburn': [
    'alan_shearer', 'keith_newton',
  ],
  'Sunderland': [
    'kevin_phillips', 'jordan_henderson_placeholder', 'dave_watson',
  ],
  'Stoke': [
    'neil_franklin',
  ],
  'Portsmouth': [
    'jimmy_dickinson', 'jamie_redknapp_placeholder',
  ],
  'Birmingham': [
    'gil_merrick', 'trevor_sinclair', 'matthew_upson',
  ],
  'Burnley': [
    'colin_mcdonald', 'john_connelly',
  ],
  'Sheffield Wednesday': [
    'ron_springett', 'carlton_palmer',
  ],
  'Coventry': [
    'dave_thomas',
  ],
  'Middlesbrough': [
    'stewart_downing',
  ],
  'Brentford': [
    'ivan_toney',
  ],
  'Bournemouth': [
    'dominic_solanke', 'callum_wilson',
  ],
  'Charlton': [
    'luke_young',
  ],
  'Arsenal (loan era)': [],
}

// Multi-era / additional placements that don't fit the bloc lists above.
const EXTRA: Record<string, string> = {
  alan_ball: 'Everton',
  roger_hunt: 'Liverpool',
  emile_heskey: 'Liverpool',
  peter_crouch: 'Liverpool',
  peter_thompson: 'Liverpool',
  george_eastham: 'Arsenal',
  bryan_robson: 'Manchester United',
  chris_waddle: 'Tottenham',
  paul_gascoigne: 'Tottenham',
  bryan_douglas: 'Blackburn',
  wilf_mannion: 'Middlesbrough',
  alf_ramsey_player: 'Tottenham',
  mick_channon: 'Southampton',
  steve_hodge: 'Nottingham Forest',
  trevor_steven: 'Everton',
  peter_bonetti: 'Chelsea',
  frank_worthington: 'Leicester',
  joey_barton: 'Manchester City',
  jermaine_pennant: 'Liverpool',
  darren_bent: 'Sunderland',
  jay_bothroyd: 'Cardiff',
  seth_johnson: 'Derby',
  francis_jeffers: 'Arsenal',
  stan_collymore: 'Nottingham Forest',
  david_nugent: 'Preston North End',
  danny_welbeck: 'Manchester United',
  angel_gomes: 'Manchester United',
  jack_grealish: 'Aston Villa',
  cole_palmer: 'Chelsea',
  bukayo_saka: 'Arsenal',
}

const PLAYER_CLUB: Record<string, string> = {}
for (const [club, ids] of Object.entries(CLUB_ROSTERS)) {
  for (const id of ids) if (!id.includes('placeholder')) PLAYER_CLUB[id] = club
}
for (const [id, club] of Object.entries(EXTRA)) PLAYER_CLUB[id] = club

export function clubOf(playerId: string): string | null {
  return PLAYER_CLUB[playerId] ?? null
}
