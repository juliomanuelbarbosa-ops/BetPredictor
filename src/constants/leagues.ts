export interface League {
    id: string;
    name: string;
    region: 'Europe' | 'South America' | 'North America' | 'Asia' | 'Africa' | 'International';
    flag: string;
    city: string;
}

export const LEAGUES: League[] = [
    // --- EUROPE ---
    { id: 'soccer_epl', name: 'Premier League', region: 'Europe', flag: '🇬🇧', city: 'London' },
    { id: 'soccer_efl_champ', name: 'Championship', region: 'Europe', flag: '🇬🇧', city: 'London' },
    { id: 'soccer_england_league1', name: 'League One', region: 'Europe', flag: '🇬🇧', city: 'London' },
    { id: 'soccer_england_league2', name: 'League Two', region: 'Europe', flag: '🇬🇧', city: 'London' },
    { id: 'soccer_england_national_league', name: 'National League', region: 'Europe', flag: '🇬🇧', city: 'London' },
    
    { id: 'soccer_spain_la_liga', name: 'La Liga', region: 'Europe', flag: 'ES', city: 'Madrid' },
    { id: 'soccer_spain_segunda_division', name: 'La Liga 2', region: 'Europe', flag: 'ES', city: 'Madrid' },
    
    { id: 'soccer_germany_bundesliga', name: 'Bundesliga', region: 'Europe', flag: 'DE', city: 'Berlin' },
    { id: 'soccer_germany_bundesliga2', name: '2. Bundesliga', region: 'Europe', flag: 'DE', city: 'Berlin' },
    { id: 'soccer_germany_liga3', name: '3. Liga', region: 'Europe', flag: 'DE', city: 'Berlin' },
    
    { id: 'soccer_italy_serie_a', name: 'Serie A', region: 'Europe', flag: 'IT', city: 'Rome' },
    { id: 'soccer_italy_serie_b', name: 'Serie B', region: 'Europe', flag: 'IT', city: 'Rome' },
    
    { id: 'soccer_france_ligue_one', name: 'Ligue 1', region: 'Europe', flag: 'FR', city: 'Paris' },
    { id: 'soccer_france_ligue_two', name: 'Ligue 2', region: 'Europe', flag: 'FR', city: 'Paris' },
    
    { id: 'soccer_portugal_primeira_liga', name: 'Primeira Liga', region: 'Europe', flag: 'PT', city: 'Lisbon' },
    { id: 'soccer_portugal_liga_portugal_2', name: 'Liga Portugal 2', region: 'Europe', flag: 'PT', city: 'Lisbon' },
    
    { id: 'soccer_netherlands_eredivisie', name: 'Eredivisie', region: 'Europe', flag: 'NL', city: 'Amsterdam' },
    { id: 'soccer_netherlands_eeste_divisie', name: 'Eerste Divisie', region: 'Europe', flag: 'NL', city: 'Amsterdam' },
    
    { id: 'soccer_belgium_first_div', name: 'Pro League', region: 'Europe', flag: 'BE', city: 'Brussels' },
    { id: 'soccer_belgium_amateur', name: 'First Amateur Division', region: 'Europe', flag: 'BE', city: 'Brussels' },
    
    { id: 'soccer_scotland_premiership', name: 'Premiership', region: 'Europe', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', city: 'Edinburgh' },
    { id: 'soccer_scotland_championship', name: 'Championship (SCO)', region: 'Europe', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', city: 'Edinburgh' },
    
    { id: 'soccer_turkey_super_league', name: 'Süper Lig', region: 'Europe', flag: 'TR', city: 'Istanbul' },
    { id: 'soccer_turkey_tff_first_league', name: 'TFF First League', region: 'Europe', flag: 'TR', city: 'Istanbul' },
    
    { id: 'soccer_greece_super_league', name: 'Super League', region: 'Europe', flag: 'GR', city: 'Athens' },
    { id: 'soccer_greece_super_league_2', name: 'Super League 2', region: 'Europe', flag: 'GR', city: 'Athens' },
    
    { id: 'soccer_russia_premier_league', name: 'Premier League (RUS)', region: 'Europe', flag: 'RU', city: 'Moscow' },
    { id: 'soccer_ukraine_premier_league', name: 'Premier League (UKR)', region: 'Europe', flag: 'UA', city: 'Kyiv' },
    { id: 'soccer_austria_bundesliga', name: 'Bundesliga (AUT)', region: 'Europe', flag: 'AT', city: 'Vienna' },
    { id: 'soccer_switzerland_super_league', name: 'Super League (SUI)', region: 'Europe', flag: 'CH', city: 'Zurich' },
    { id: 'soccer_denmark_superliga', name: 'Superliga (DEN)', region: 'Europe', flag: 'DK', city: 'Copenhagen' },
    { id: 'soccer_sweden_allsvenskan', name: 'Allsvenskan', region: 'Europe', flag: 'SE', city: 'Stockholm' },
    { id: 'soccer_norway_eliteserien', name: 'Eliteserien', region: 'Europe', flag: 'NO', city: 'Oslo' },
    { id: 'soccer_czech_first_league', name: 'First League (CZE)', region: 'Europe', flag: 'CZ', city: 'Prague' },
    { id: 'soccer_poland_ekstraklasa', name: 'Ekstraklasa', region: 'Europe', flag: 'PL', city: 'Warsaw' },
    { id: 'soccer_croatia_hnl', name: 'HNL', region: 'Europe', flag: 'HR', city: 'Zagreb' },
    { id: 'soccer_serbia_superliga', name: 'SuperLiga (SRB)', region: 'Europe', flag: 'RS', city: 'Belgrade' },
    { id: 'soccer_romania_liga_1', name: 'Liga 1 (ROU)', region: 'Europe', flag: 'RO', city: 'Bucharest' },

    // --- UEFA COMPETITIONS ---
    { id: 'soccer_uefa_champions_league', name: 'Champions League', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_uefa_europa_league', name: 'Europa League', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_uefa_europa_conference_league', name: 'Conference League', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_uefa_nations_league', name: 'Nations League', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_uefa_youth_league', name: 'Youth League', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_uefa_super_cup', name: 'UEFA Super Cup', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_fifa_club_world_cup', name: 'Club World Cup', region: 'International', flag: '🌍', city: 'Zurich' },

    // --- SOUTH AMERICA ---
    { id: 'soccer_brazil_campeonato', name: 'Brasileirão Série A', region: 'South America', flag: 'BR', city: 'Rio de Janeiro' },
    { id: 'soccer_brazil_serie_b', name: 'Brasileirão Série B', region: 'South America', flag: 'BR', city: 'Rio de Janeiro' },
    { id: 'soccer_brazil_copa', name: 'Copa do Brasil', region: 'South America', flag: 'BR', city: 'Rio de Janeiro' },
    { id: 'soccer_argentina_primera_division', name: 'Primera División (ARG)', region: 'South America', flag: 'AR', city: 'Buenos Aires' },
    { id: 'soccer_argentina_copa_liga', name: 'Copa de la Liga (ARG)', region: 'South America', flag: 'AR', city: 'Buenos Aires' },
    { id: 'soccer_colombia_liga_betplay', name: 'Liga BetPlay', region: 'South America', flag: 'CO', city: 'Bogota' },
    { id: 'soccer_chile_primera_division', name: 'Primera División (CHI)', region: 'South America', flag: 'CL', city: 'Santiago' },
    { id: 'soccer_uruguay_primera_division', name: 'Primera División (URU)', region: 'South America', flag: 'UY', city: 'Montevideo' },
    { id: 'soccer_paraguay_division_honor', name: 'División de Honor', region: 'South America', flag: 'PY', city: 'Asuncion' },
    { id: 'soccer_peru_liga_1', name: 'Liga 1 (PER)', region: 'South America', flag: 'PE', city: 'Lima' },
    { id: 'soccer_ecuador_liga_pro', name: 'Liga Pro', region: 'South America', flag: 'EC', city: 'Quito' },
    { id: 'soccer_bolivia_division_profesional', name: 'División Profesional', region: 'South America', flag: 'BO', city: 'La Paz' },
    { id: 'soccer_venezuela_primera_division', name: 'Primera División (VEN)', region: 'South America', flag: 'VE', city: 'Caracas' },
    { id: 'soccer_conmebol_libertadores', name: 'Libertadores', region: 'South America', flag: '🌎', city: 'Luque' },
    { id: 'soccer_conmebol_sudamericana', name: 'Sudamericana', region: 'South America', flag: '🌎', city: 'Luque' },

    // --- NORTH AMERICA ---
    { id: 'soccer_usa_mls', name: 'MLS', region: 'North America', flag: '🇺🇸', city: 'New York' },
    { id: 'soccer_usa_usl_championship', name: 'USL Championship', region: 'North America', flag: '🇺🇸', city: 'Tampa' },
    { id: 'soccer_usa_usl_league_one', name: 'USL League One', region: 'North America', flag: '🇺🇸', city: 'Tampa' },
    { id: 'soccer_mexico_ligamx', name: 'Liga MX', region: 'North America', flag: 'MX', city: 'Mexico City' },
    { id: 'soccer_mexico_expansion', name: 'Liga de Expansión', region: 'North America', flag: 'MX', city: 'Mexico City' },
    { id: 'soccer_canada_premier_league', name: 'Canadian Premier League', region: 'North America', flag: 'CA', city: 'Toronto' },

    // --- ASIA & OCEANIA ---
    { id: 'soccer_japan_j_league', name: 'J1 League', region: 'Asia', flag: 'JP', city: 'Tokyo' },
    { id: 'soccer_japan_j_league_2', name: 'J2 League', region: 'Asia', flag: 'JP', city: 'Tokyo' },
    { id: 'soccer_south_korea_kleague_1', name: 'K League 1', region: 'Asia', flag: 'KR', city: 'Seoul' },
    { id: 'soccer_south_korea_kleague_2', name: 'K League 2', region: 'Asia', flag: 'KR', city: 'Seoul' },
    { id: 'soccer_china_super_league', name: 'Super League (CHN)', region: 'Asia', flag: 'CN', city: 'Beijing' },
    { id: 'soccer_saudi_arabia_pro_league', name: 'Pro League (KSA)', region: 'Asia', flag: 'SA', city: 'Riyadh' },
    { id: 'soccer_uae_arabian_gulf_league', name: 'Arabian Gulf League', region: 'Asia', flag: 'AE', city: 'Abu Dhabi' },
    { id: 'soccer_australia_aleague', name: 'A-League', region: 'Asia', flag: 'AU', city: 'Sydney' },
    { id: 'soccer_india_isl', name: 'ISL', region: 'Asia', flag: 'IN', city: 'Mumbai' },

    // --- AFRICA ---
    { id: 'soccer_egypt_premier_league', name: 'Premier League (EGY)', region: 'Africa', flag: 'EG', city: 'Cairo' },
    { id: 'soccer_morocco_botola_pro', name: 'Botola Pro', region: 'Africa', flag: 'MA', city: 'Rabat' },
    { id: 'soccer_south_africa_premier_soccer_league', name: 'Premier Soccer League', region: 'Africa', flag: 'ZA', city: 'Johannesburg' },
    { id: 'soccer_nigeria_npfl', name: 'NPFL', region: 'Africa', flag: 'NG', city: 'Abuja' },
    { id: 'soccer_caf_champions_league', name: 'CAF Champions League', region: 'Africa', flag: '🌍', city: 'Cairo' },
    { id: 'soccer_caf_confederation_cup', name: 'CAF Confederation Cup', region: 'Africa', flag: '🌍', city: 'Cairo' },

    // --- INTERNATIONAL ---
    { id: 'soccer_fifa_world_cup', name: 'FIFA World Cup', region: 'International', flag: '🌍', city: 'Zurich' },
    { id: 'soccer_fifa_world_cup_qualifiers_uefa', name: 'World Cup Qualifiers (UEFA)', region: 'International', flag: '🇪🇺', city: 'Zurich' },
    { id: 'soccer_fifa_world_cup_qualifiers_conmebol', name: 'World Cup Qualifiers (CONMEBOL)', region: 'International', flag: '🌎', city: 'Zurich' },
    { id: 'soccer_fifa_world_cup_qualifiers_concacaf', name: 'World Cup Qualifiers (CONCACAF)', region: 'International', flag: '🌎', city: 'Zurich' },
    { id: 'soccer_fifa_world_cup_qualifiers_caf', name: 'World Cup Qualifiers (CAF)', region: 'International', flag: '🌍', city: 'Zurich' },
    { id: 'soccer_fifa_world_cup_qualifiers_afc', name: 'World Cup Qualifiers (AFC)', region: 'International', flag: '🌏', city: 'Zurich' },
    { id: 'soccer_conmebol_copa_america', name: 'Copa América', region: 'International', flag: '🌎', city: 'Luque' },
    { id: 'soccer_uefa_euro_championship', name: 'EURO Championship', region: 'International', flag: '🇪🇺', city: 'Nyon' },
    { id: 'soccer_caf_afcon', name: 'AFCON', region: 'International', flag: '🌍', city: 'Cairo' },
    { id: 'soccer_afc_asian_cup', name: 'AFC Asian Cup', region: 'International', flag: '🌏', city: 'Kuala Lumpur' },
    { id: 'soccer_concacaf_gold_cup', name: 'CONCACAF Gold Cup', region: 'International', flag: '🌎', city: 'Miami' },
    { id: 'soccer_olympics_football', name: 'Olympic Football', region: 'International', flag: '🏅', city: 'Lausanne' },
];

export const getLeagueById = (id: string) => LEAGUES.find(l => l.id === id);

export const getLeaguesByRegion = (region: League['region']) => LEAGUES.filter(l => l.region === region);

export const REGIONS: League['region'][] = ['Europe', 'South America', 'North America', 'Asia', 'Africa', 'International'];

export const LEAGUE_MAP: Record<string, { oddsKey: string, city: string }> = LEAGUES.reduce((acc, league) => {
    acc[league.name.toLowerCase()] = { oddsKey: league.id, city: league.city };
    return acc;
}, {} as Record<string, { oddsKey: string, city: string }>);
