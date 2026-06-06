/**
 * ============================================================
 * ROOMGENIE AI — INTERIOR DESIGN LIBRARY
 * ============================================================
 * Single source of truth for all interior design data.
 * Used by: API routes, 3D viewer, 2D floor plan, Claude prompts,
 *          Supabase schema, and UI components.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// SECTION 1: CORE TYPES
// ─────────────────────────────────────────────────────────────

export type RoomType =
  | 'Living Room'
  | 'Bedroom'
  | 'Master Suite'
  | 'Kitchen'
  | 'Dining Room'
  | 'Bathroom'
  | 'Home Office'
  | 'Kids Room'
  | 'Studio'
  | 'Walk-in Closet'
  | 'Hallway'
  | 'Basement'
  | 'Outdoor Patio'

export type DesignStyle =
  | 'Modern'
  | 'Luxury'
  | 'Minimalist'
  | 'Scandinavian'
  | 'Industrial'
  | 'Bohemian'
  | 'Japandi'
  | 'Classic'
  | 'Contemporary'
  | 'Mediterranean'
  | 'Art Deco'
  | 'Coastal'
  | 'Farmhouse'
  | 'Mid-Century Modern'
  | 'Transitional'

export type FloorMaterial =
  | 'hardwood'
  | 'engineered_wood'
  | 'parquet'
  | 'marble'
  | 'tile'
  | 'concrete'
  | 'carpet'
  | 'vinyl'
  | 'terrazzo'
  | 'herringbone'
  | 'chevron'

export type WallFinish =
  | 'paint'
  | 'plaster'
  | 'wallpaper'
  | 'brick'
  | 'stone'
  | 'wood_panel'
  | 'fabric_panel'
  | 'lime_wash'
  | 'venetian_plaster'
  | 'shiplap'

export type FurnitureType =
  | 'sofa'
  | 'sectional_sofa'
  | 'chaise'
  | 'armchair'
  | 'accent_chair'
  | 'bed'
  | 'murphy_bed'
  | 'bunk_bed'
  | 'dining_table'
  | 'coffee_table'
  | 'side_table'
  | 'console_table'
  | 'dining_chair'
  | 'stool'
  | 'ottoman'
  | 'bench'
  | 'desk'
  | 'bookshelf'
  | 'shelving'
  | 'wardrobe'
  | 'dresser'
  | 'nightstand'
  | 'sideboard'
  | 'tv_unit'
  | 'island'
  | 'cabinets_lower'
  | 'cabinets_upper'
  | 'vanity'
  | 'bathtub'
  | 'shower'
  | 'toilet'
  | 'fireplace'
  | 'rug'
  | 'floor_lamp'
  | 'table_lamp'
  | 'chandelier'
  | 'pendant_light'
  | 'plant'
  | 'artwork'
  | 'mirror'
  | 'curtains'
  | 'blinds'

export type MaterialFinish =
  | 'matte'
  | 'satin'
  | 'gloss'
  | 'brushed'
  | 'polished'
  | 'raw'
  | 'distressed'
  | 'lacquered'

export type FurnitureMaterial =
  | 'fabric'
  | 'velvet'
  | 'leather'
  | 'boucle'
  | 'linen'
  | 'cotton'
  | 'wool'
  | 'wood'
  | 'oak'
  | 'walnut'
  | 'pine'
  | 'mahogany'
  | 'teak'
  | 'bamboo'
  | 'rattan'
  | 'marble'
  | 'granite'
  | 'quartz'
  | 'metal'
  | 'brass'
  | 'gold'
  | 'chrome'
  | 'iron'
  | 'steel'
  | 'glass'
  | 'acrylic'
  | 'ceramic'
  | 'concrete'
  | 'stone'
  | 'wicker'

export type BudgetRange =
  | 'budget'       // Under $1K
  | 'mid_range'    // $1K–$5K
  | 'premium'      // $5K–$15K
  | 'luxury'       // $15K–$50K
  | 'ultra_luxury' // $50K+

export type LightingType =
  | 'ambient'
  | 'task'
  | 'accent'
  | 'natural'
  | 'statement'

// ─────────────────────────────────────────────────────────────
// SECTION 2: ROOM DIMENSIONS
// ─────────────────────────────────────────────────────────────

export interface RoomDimensions {
  widthFt:   number
  lengthFt:  number
  heightFt:  number
  sqft:      number
}

export function calcSqft(w: number, l: number): number {
  return Math.round(w * l)
}

export function makeDimensions(w: number, l: number, h: number): RoomDimensions {
  return { widthFt: w, lengthFt: l, heightFt: h, sqft: calcSqft(w, l) }
}

/** Typical room size ranges per type */
export const ROOM_SIZE_GUIDES: Record<RoomType, { minSqft: number; maxSqft: number; typicalW: number; typicalL: number; typicalH: number; description: string }> = {
  'Living Room':    { minSqft: 150, maxSqft: 600,  typicalW: 15, typicalL: 20, typicalH: 9,  description: 'Main gathering space for family and guests' },
  'Bedroom':        { minSqft: 100, maxSqft: 400,  typicalW: 12, typicalL: 14, typicalH: 9,  description: 'Primary sleeping space' },
  'Master Suite':   { minSqft: 200, maxSqft: 800,  typicalW: 16, typicalL: 20, typicalH: 10, description: 'Spacious primary bedroom with ensuite' },
  'Kitchen':        { minSqft: 80,  maxSqft: 400,  typicalW: 12, typicalL: 16, typicalH: 9,  description: 'Food preparation and cooking area' },
  'Dining Room':    { minSqft: 100, maxSqft: 300,  typicalW: 12, typicalL: 14, typicalH: 9,  description: 'Dedicated dining and entertaining' },
  'Bathroom':       { minSqft: 40,  maxSqft: 200,  typicalW: 8,  typicalL: 10, typicalH: 9,  description: 'Full bathroom with all fixtures' },
  'Home Office':    { minSqft: 80,  maxSqft: 250,  typicalW: 10, typicalL: 12, typicalH: 9,  description: 'Dedicated workspace' },
  'Kids Room':      { minSqft: 100, maxSqft: 250,  typicalW: 12, typicalL: 14, typicalH: 8,  description: "Child's bedroom and play space" },
  'Studio':         { minSqft: 200, maxSqft: 600,  typicalW: 18, typicalL: 22, typicalH: 10, description: 'Open-plan studio apartment' },
  'Walk-in Closet': { minSqft: 30,  maxSqft: 150,  typicalW: 6,  typicalL: 8,  typicalH: 8,  description: 'Dressing and storage room' },
  'Hallway':        { minSqft: 20,  maxSqft: 100,  typicalW: 4,  typicalL: 12, typicalH: 9,  description: 'Entrance or corridor space' },
  'Basement':       { minSqft: 200, maxSqft: 1000, typicalW: 20, typicalL: 24, typicalH: 8,  description: 'Below-grade multipurpose space' },
  'Outdoor Patio':  { minSqft: 100, maxSqft: 500,  typicalW: 12, typicalL: 16, typicalH: 0,  description: 'Covered or open outdoor living' },
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: FURNITURE CATALOG
// ─────────────────────────────────────────────────────────────

export interface FurniturePiece {
  id:          string
  type:        FurnitureType
  label:       string
  // Dimensions in feet
  widthFt:     number
  depthFt:     number
  heightFt:    number
  // Layout position as fraction of room (0–1)
  xFrac:       number   // left edge from left wall
  yFrac:       number   // top edge from far wall
  wFrac:       number   // width as fraction of room width
  dFrac:       number   // depth as fraction of room length
  rotation:    0 | 90 | 180 | 270
  color:       string   // hex
  material:    FurnitureMaterial
  finish:      MaterialFinish
  preserved:   boolean  // came from user upload
  notes:       string
  // Render helpers
  isLighting:  boolean
  isDecor:     boolean
}

/** Standard furniture sizes in feet — used when Claude doesn't specify */
export const FURNITURE_SIZES: Record<FurnitureType, { w: number; d: number; h: number; label: string }> = {
  sofa:             { w: 8.5,  d: 3.5,  h: 3.0,  label: 'Sofa' },
  sectional_sofa:   { w: 11.0, d: 4.0,  h: 3.0,  label: 'Sectional Sofa' },
  chaise:           { w: 5.5,  d: 2.8,  h: 2.8,  label: 'Chaise Lounge' },
  armchair:         { w: 3.0,  d: 3.0,  h: 3.2,  label: 'Armchair' },
  accent_chair:     { w: 2.5,  d: 2.5,  h: 3.0,  label: 'Accent Chair' },
  bed:              { w: 6.7,  d: 6.7,  h: 4.5,  label: 'King Bed' },
  murphy_bed:       { w: 6.0,  d: 1.5,  h: 8.0,  label: 'Murphy Bed' },
  bunk_bed:         { w: 3.5,  d: 6.5,  h: 6.0,  label: 'Bunk Bed' },
  dining_table:     { w: 6.0,  d: 3.5,  h: 2.5,  label: 'Dining Table' },
  coffee_table:     { w: 4.0,  d: 2.0,  h: 1.5,  label: 'Coffee Table' },
  side_table:       { w: 2.0,  d: 2.0,  h: 2.2,  label: 'Side Table' },
  console_table:    { w: 4.0,  d: 1.2,  h: 2.8,  label: 'Console Table' },
  dining_chair:     { w: 1.8,  d: 2.0,  h: 3.2,  label: 'Dining Chair' },
  stool:            { w: 1.5,  d: 1.5,  h: 3.0,  label: 'Bar Stool' },
  ottoman:          { w: 3.0,  d: 2.5,  h: 1.5,  label: 'Ottoman' },
  bench:            { w: 4.0,  d: 1.5,  h: 1.8,  label: 'Bench' },
  desk:             { w: 5.0,  d: 2.5,  h: 2.5,  label: 'Desk' },
  bookshelf:        { w: 3.0,  d: 1.2,  h: 7.0,  label: 'Bookshelf' },
  shelving:         { w: 4.0,  d: 1.2,  h: 6.0,  label: 'Shelving Unit' },
  wardrobe:         { w: 6.0,  d: 2.0,  h: 8.0,  label: 'Wardrobe' },
  dresser:          { w: 4.0,  d: 1.8,  h: 3.5,  label: 'Dresser' },
  nightstand:       { w: 1.8,  d: 1.5,  h: 2.2,  label: 'Nightstand' },
  sideboard:        { w: 5.0,  d: 1.5,  h: 3.0,  label: 'Sideboard' },
  tv_unit:          { w: 6.0,  d: 1.5,  h: 2.0,  label: 'TV Unit' },
  island:           { w: 5.0,  d: 2.5,  h: 3.2,  label: 'Kitchen Island' },
  cabinets_lower:   { w: 8.0,  d: 2.0,  h: 3.0,  label: 'Lower Cabinets' },
  cabinets_upper:   { w: 8.0,  d: 1.2,  h: 2.5,  label: 'Upper Cabinets' },
  vanity:           { w: 4.0,  d: 1.8,  h: 6.0,  label: 'Vanity' },
  bathtub:          { w: 5.5,  d: 2.8,  h: 2.5,  label: 'Bathtub' },
  shower:           { w: 4.0,  d: 3.5,  h: 8.0,  label: 'Shower' },
  toilet:           { w: 1.8,  d: 3.0,  h: 2.8,  label: 'Toilet' },
  fireplace:        { w: 5.0,  d: 1.5,  h: 4.0,  label: 'Fireplace' },
  rug:              { w: 8.0,  d: 10.0, h: 0.1,  label: 'Area Rug' },
  floor_lamp:       { w: 1.0,  d: 1.0,  h: 5.5,  label: 'Floor Lamp' },
  table_lamp:       { w: 0.8,  d: 0.8,  h: 2.0,  label: 'Table Lamp' },
  chandelier:       { w: 2.5,  d: 2.5,  h: 2.5,  label: 'Chandelier' },
  pendant_light:    { w: 1.0,  d: 1.0,  h: 1.5,  label: 'Pendant Light' },
  plant:            { w: 1.5,  d: 1.5,  h: 4.0,  label: 'Indoor Plant' },
  artwork:          { w: 3.0,  d: 0.1,  h: 2.5,  label: 'Artwork' },
  mirror:           { w: 2.5,  d: 0.1,  h: 4.0,  label: 'Mirror' },
  curtains:         { w: 5.0,  d: 0.2,  h: 8.0,  label: 'Curtains' },
  blinds:           { w: 4.0,  d: 0.1,  h: 6.0,  label: 'Blinds' },
}

/** Default furniture layouts per room type — fractions of room (0–1) */
export const DEFAULT_FURNITURE_LAYOUTS: Record<RoomType, Array<{
  type: FurnitureType; xFrac: number; yFrac: number; wFrac: number; dFrac: number
  heightFt: number; color: string; material: FurnitureMaterial; rotation: 0|90|180|270; notes: string
}>> = {
  'Living Room': [
    { type:'sofa',        xFrac:.12, yFrac:.45, wFrac:.42, dFrac:.18, heightFt:3.0, color:'#8B8680', material:'fabric',  rotation:0,  notes:'Centered facing TV' },
    { type:'coffee_table',xFrac:.20, yFrac:.33, wFrac:.22, dFrac:.12, heightFt:1.5, color:'#6B5B45', material:'wood',    rotation:0,  notes:'In front of sofa' },
    { type:'tv_unit',     xFrac:.12, yFrac:.06, wFrac:.42, dFrac:.10, heightFt:2.0, color:'#4A4A4A', material:'wood',    rotation:0,  notes:'Against far wall' },
    { type:'armchair',    xFrac:.62, yFrac:.42, wFrac:.14, dFrac:.14, heightFt:3.0, color:'#7A6A5A', material:'fabric',  rotation:90, notes:'Accent seating' },
    { type:'floor_lamp',  xFrac:.62, yFrac:.56, wFrac:.04, dFrac:.04, heightFt:5.5, color:'#B8A898', material:'metal',   rotation:0,  notes:'Reading light' },
    { type:'rug',         xFrac:.10, yFrac:.30, wFrac:.55, dFrac:.38, heightFt:0.1, color:'#C8B8A8', material:'wool',    rotation:0,  notes:'Defines seating zone' },
    { type:'plant',       xFrac:.80, yFrac:.08, wFrac:.06, dFrac:.06, heightFt:4.5, color:'#2D5A1B', material:'ceramic', rotation:0,  notes:'Corner plant' },
  ],
  'Bedroom': [
    { type:'bed',         xFrac:.22, yFrac:.06, wFrac:.52, dFrac:.42, heightFt:4.5, color:'#F5F0EB', material:'fabric',  rotation:0,  notes:'Centered far wall' },
    { type:'nightstand',  xFrac:.12, yFrac:.10, wFrac:.10, dFrac:.12, heightFt:2.2, color:'#8B7355', material:'wood',    rotation:0,  notes:'Left of bed' },
    { type:'nightstand',  xFrac:.74, yFrac:.10, wFrac:.10, dFrac:.12, heightFt:2.2, color:'#8B7355', material:'wood',    rotation:0,  notes:'Right of bed' },
    { type:'wardrobe',    xFrac:.06, yFrac:.68, wFrac:.35, dFrac:.18, heightFt:8.0, color:'#D4C9BE', material:'wood',    rotation:0,  notes:'Side wall full height' },
    { type:'dresser',     xFrac:.62, yFrac:.70, wFrac:.24, dFrac:.14, heightFt:3.5, color:'#A09080', material:'wood',    rotation:0,  notes:'Opposite to wardrobe' },
    { type:'rug',         xFrac:.16, yFrac:.36, wFrac:.65, dFrac:.36, heightFt:0.1, color:'#E8DDD0', material:'wool',    rotation:0,  notes:'Under foot of bed' },
    { type:'floor_lamp',  xFrac:.78, yFrac:.56, wFrac:.04, dFrac:.04, heightFt:5.5, color:'#C8A870', material:'brass',   rotation:0,  notes:'Reading corner' },
  ],
  'Master Suite': [
    { type:'bed',         xFrac:.22, yFrac:.05, wFrac:.52, dFrac:.42, heightFt:4.8, color:'#F0EBE3', material:'velvet',  rotation:0,  notes:'Feature headboard wall' },
    { type:'nightstand',  xFrac:.12, yFrac:.08, wFrac:.09, dFrac:.11, heightFt:2.2, color:'#8B7355', material:'marble',  rotation:0,  notes:'His side' },
    { type:'nightstand',  xFrac:.74, yFrac:.08, wFrac:.09, dFrac:.11, heightFt:2.2, color:'#8B7355', material:'marble',  rotation:0,  notes:'Her side' },
    { type:'chaise',      xFrac:.68, yFrac:.62, wFrac:.26, dFrac:.14, heightFt:3.0, color:'#C8B8A8', material:'velvet',  rotation:90, notes:'Reading nook' },
    { type:'vanity',      xFrac:.06, yFrac:.64, wFrac:.24, dFrac:.15, heightFt:5.5, color:'#D4C9BE', material:'wood',    rotation:0,  notes:'Dressing vanity' },
    { type:'wardrobe',    xFrac:.06, yFrac:.06, wFrac:.14, dFrac:.52, heightFt:8.0, color:'#E8E0D5', material:'wood',    rotation:0,  notes:'Walk-in wardrobe' },
    { type:'chandelier',  xFrac:.38, yFrac:.28, wFrac:.08, dFrac:.08, heightFt:8.5, color:'#D4A840', material:'brass',   rotation:0,  notes:'Central feature light' },
    { type:'rug',         xFrac:.15, yFrac:.36, wFrac:.68, dFrac:.30, heightFt:0.1, color:'#E0D5C5', material:'wool',    rotation:0,  notes:'Luxury rug' },
  ],
  'Kitchen': [
    { type:'cabinets_lower',xFrac:.04, yFrac:.04, wFrac:.56, dFrac:.16, heightFt:3.0, color:'#E8E0D4', material:'wood',  rotation:0,  notes:'Main run' },
    { type:'cabinets_upper',xFrac:.04, yFrac:.04, wFrac:.56, dFrac:.10, heightFt:6.5, color:'#E8E0D4', material:'wood',  rotation:0,  notes:'Above lowers' },
    { type:'island',        xFrac:.22, yFrac:.44, wFrac:.38, dFrac:.20, heightFt:3.2, color:'#C8B8A8', material:'marble',rotation:0,  notes:'Central island' },
    { type:'stool',         xFrac:.24, yFrac:.64, wFrac:.07, dFrac:.07, heightFt:3.0, color:'#6B5B45', material:'metal', rotation:0,  notes:'Island stool 1' },
    { type:'stool',         xFrac:.36, yFrac:.64, wFrac:.07, dFrac:.07, heightFt:3.0, color:'#6B5B45', material:'metal', rotation:0,  notes:'Island stool 2' },
    { type:'stool',         xFrac:.48, yFrac:.64, wFrac:.07, dFrac:.07, heightFt:3.0, color:'#6B5B45', material:'metal', rotation:0,  notes:'Island stool 3' },
    { type:'pendant_light', xFrac:.32, yFrac:.30, wFrac:.04, dFrac:.04, heightFt:7.0, color:'#B8A060', material:'brass', rotation:0,  notes:'Over island' },
  ],
  'Dining Room': [
    { type:'dining_table',xFrac:.18, yFrac:.22, wFrac:.58, dFrac:.44, heightFt:2.5, color:'#6B5B45', material:'wood',   rotation:0,  notes:'Centered under light' },
    { type:'dining_chair',xFrac:.19, yFrac:.14, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:0,  notes:'Head position' },
    { type:'dining_chair',xFrac:.33, yFrac:.14, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:0,  notes:'Side' },
    { type:'dining_chair',xFrac:.47, yFrac:.14, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:0,  notes:'Side' },
    { type:'dining_chair',xFrac:.61, yFrac:.14, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:0,  notes:'End' },
    { type:'dining_chair',xFrac:.19, yFrac:.68, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:180,notes:'Other side' },
    { type:'dining_chair',xFrac:.33, yFrac:.68, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:180,notes:'Other side' },
    { type:'dining_chair',xFrac:.47, yFrac:.68, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:180,notes:'Other side' },
    { type:'dining_chair',xFrac:.61, yFrac:.68, wFrac:.10, dFrac:.12, heightFt:3.2, color:'#8B7355', material:'fabric', rotation:180,notes:'Other side' },
    { type:'sideboard',   xFrac:.08, yFrac:.76, wFrac:.46, dFrac:.14, heightFt:3.0, color:'#5B4B35', material:'wood',   rotation:0,  notes:'Back wall' },
    { type:'chandelier',  xFrac:.40, yFrac:.28, wFrac:.06, dFrac:.06, heightFt:8.5, color:'#D4A840', material:'brass',  rotation:0,  notes:'Above table center' },
  ],
  'Bathroom': [
    { type:'bathtub',     xFrac:.52, yFrac:.08, wFrac:.40, dFrac:.32, heightFt:2.5, color:'#F0EDE8', material:'ceramic',rotation:0,  notes:'Feature near window' },
    { type:'vanity',      xFrac:.04, yFrac:.06, wFrac:.44, dFrac:.20, heightFt:3.2, color:'#D4C9BE', material:'wood',   rotation:0,  notes:'Main wall with mirror' },
    { type:'shower',      xFrac:.52, yFrac:.52, wFrac:.42, dFrac:.40, heightFt:8.0, color:'#E8E8E8', material:'glass',  rotation:0,  notes:'Corner glass shower' },
    { type:'toilet',      xFrac:.08, yFrac:.60, wFrac:.16, dFrac:.22, heightFt:2.8, color:'#F5F2EF', material:'ceramic',rotation:0,  notes:'Private corner' },
  ],
  'Home Office': [
    { type:'desk',        xFrac:.14, yFrac:.08, wFrac:.48, dFrac:.22, heightFt:2.5, color:'#6B5B45', material:'wood',   rotation:0,  notes:'Faces window' },
    { type:'armchair',    xFrac:.26, yFrac:.30, wFrac:.16, dFrac:.16, heightFt:4.5, color:'#2C2C2C', material:'leather',rotation:0,  notes:'Desk chair' },
    { type:'bookshelf',   xFrac:.70, yFrac:.04, wFrac:.26, dFrac:.16, heightFt:8.0, color:'#8B7355', material:'wood',   rotation:0,  notes:'Floor to ceiling' },
    { type:'bookshelf',   xFrac:.70, yFrac:.22, wFrac:.26, dFrac:.16, heightFt:8.0, color:'#8B7355', material:'wood',   rotation:0,  notes:'Continued shelving' },
    { type:'armchair',    xFrac:.06, yFrac:.55, wFrac:.18, dFrac:.18, heightFt:3.5, color:'#8B7355', material:'leather',rotation:0,  notes:'Reading chair' },
    { type:'floor_lamp',  xFrac:.06, yFrac:.74, wFrac:.05, dFrac:.05, heightFt:5.5, color:'#C8A870', material:'brass',  rotation:0,  notes:'Reading lamp' },
    { type:'rug',         xFrac:.10, yFrac:.26, wFrac:.55, dFrac:.45, heightFt:0.1, color:'#8B6B4B', material:'wool',   rotation:0,  notes:'Defines workspace' },
  ],
  'Kids Room': [
    { type:'bed',         xFrac:.06, yFrac:.06, wFrac:.40, dFrac:.32, heightFt:3.5, color:'#FFE4E1', material:'wood',   rotation:0,  notes:'Wall, leaving play space' },
    { type:'desk',        xFrac:.60, yFrac:.06, wFrac:.30, dFrac:.20, heightFt:2.4, color:'#FFF8DC', material:'wood',   rotation:0,  notes:'Near window' },
    { type:'shelving',    xFrac:.06, yFrac:.68, wFrac:.52, dFrac:.15, heightFt:5.0, color:'#E8F4FD', material:'wood',   rotation:0,  notes:'Low accessible storage' },
    { type:'wardrobe',    xFrac:.68, yFrac:.64, wFrac:.26, dFrac:.22, heightFt:7.5, color:'#F0F8E8', material:'wood',   rotation:0,  notes:'Full height clothes' },
    { type:'rug',         xFrac:.08, yFrac:.38, wFrac:.58, dFrac:.28, heightFt:0.1, color:'#FFD700', material:'cotton', rotation:0,  notes:'Central play area' },
    { type:'floor_lamp',  xFrac:.60, yFrac:.26, wFrac:.05, dFrac:.05, heightFt:4.0, color:'#FF9999', material:'fabric', rotation:0,  notes:'Desk lamp area' },
  ],
  'Studio': [
    { type:'murphy_bed',  xFrac:.04, yFrac:.04, wFrac:.46, dFrac:.16, heightFt:8.0, color:'#D4C9BE', material:'wood',   rotation:0,  notes:'Wall bed closed = shelf' },
    { type:'sofa',        xFrac:.54, yFrac:.28, wFrac:.36, dFrac:.16, heightFt:3.0, color:'#8B8680', material:'fabric', rotation:90, notes:'Living zone' },
    { type:'coffee_table',xFrac:.62, yFrac:.46, wFrac:.18, dFrac:.14, heightFt:1.5, color:'#6B5B45', material:'wood',   rotation:0,  notes:'In front of sofa' },
    { type:'dining_table',xFrac:.16, yFrac:.55, wFrac:.22, dFrac:.22, heightFt:2.5, color:'#6B5B45', material:'wood',   rotation:0,  notes:'Dining zone' },
    { type:'dining_chair',xFrac:.14, yFrac:.48, wFrac:.08, dFrac:.10, heightFt:3.0, color:'#8B7355', material:'wood',   rotation:180,notes:'Chair 1' },
    { type:'dining_chair',xFrac:.30, yFrac:.58, wFrac:.08, dFrac:.10, heightFt:3.0, color:'#8B7355', material:'wood',   rotation:0,  notes:'Chair 2' },
    { type:'shelving',    xFrac:.04, yFrac:.22, wFrac:.46, dFrac:.14, heightFt:7.5, color:'#D4C9BE', material:'wood',   rotation:0,  notes:'Storage wall' },
  ],
  'Walk-in Closet': [
    { type:'wardrobe',    xFrac:.04, yFrac:.04, wFrac:.90, dFrac:.20, heightFt:8.0, color:'#E8E0D4', material:'wood',   rotation:0,  notes:'Main hanging rail' },
    { type:'shelving',    xFrac:.04, yFrac:.26, wFrac:.42, dFrac:.16, heightFt:8.0, color:'#E8E0D4', material:'wood',   rotation:0,  notes:'Shelf storage left' },
    { type:'dresser',     xFrac:.52, yFrac:.26, wFrac:.42, dFrac:.16, heightFt:3.5, color:'#D4C9BE', material:'wood',   rotation:0,  notes:'Drawer unit right' },
    { type:'ottoman',     xFrac:.30, yFrac:.52, wFrac:.32, dFrac:.22, heightFt:1.8, color:'#C8B8A8', material:'velvet', rotation:0,  notes:'Seating island' },
    { type:'mirror',      xFrac:.06, yFrac:.50, wFrac:.18, dFrac:.02, heightFt:6.5, color:'#E8E8E8', material:'glass',  rotation:0,  notes:'Full length mirror' },
  ],
  'Hallway': [
    { type:'console_table',xFrac:.04,yFrac:.08, wFrac:.55, dFrac:.14, heightFt:2.8, color:'#8B7355', material:'wood',   rotation:0,  notes:'Entry table' },
    { type:'mirror',       xFrac:.06,yFrac:.04, wFrac:.28, dFrac:.02, heightFt:5.5, color:'#C8C8C8', material:'glass',  rotation:0,  notes:'Entry mirror' },
    { type:'shelving',     xFrac:.62,yFrac:.06, wFrac:.32, dFrac:.14, heightFt:6.5, color:'#D4C9BE', material:'wood',   rotation:0,  notes:'Coat and shoe storage' },
    { type:'floor_lamp',   xFrac:.04,yFrac:.60, wFrac:.06, dFrac:.06, heightFt:5.5, color:'#C8A870', material:'brass',  rotation:0,  notes:'Ambient lighting' },
  ],
  'Basement': [
    { type:'sofa',         xFrac:.08,yFrac:.40, wFrac:.42, dFrac:.16, heightFt:3.0, color:'#6B6B6B', material:'leather',rotation:0,  notes:'Media seating' },
    { type:'coffee_table', xFrac:.14,yFrac:.28, wFrac:.22, dFrac:.12, heightFt:1.5, color:'#4A4A4A', material:'wood',   rotation:0,  notes:'In front of sofa' },
    { type:'tv_unit',      xFrac:.08,yFrac:.06, wFrac:.42, dFrac:.10, heightFt:2.0, color:'#333333', material:'wood',   rotation:0,  notes:'Media wall' },
    { type:'shelving',     xFrac:.58,yFrac:.06, wFrac:.36, dFrac:.14, heightFt:7.5, color:'#5B5B5B', material:'metal',  rotation:0,  notes:'Storage shelving' },
    { type:'rug',          xFrac:.06,yFrac:.24, wFrac:.48, dFrac:.42, heightFt:0.1, color:'#4A3828', material:'wool',   rotation:0,  notes:'Media area rug' },
  ],
  'Outdoor Patio': [
    { type:'sofa',         xFrac:.08,yFrac:.12, wFrac:.45, dFrac:.16, heightFt:3.0, color:'#8B8680', material:'rattan', rotation:0,  notes:'Outdoor seating' },
    { type:'coffee_table', xFrac:.14,yFrac:.30, wFrac:.22, dFrac:.12, heightFt:1.5, color:'#6B5B45', material:'teak',   rotation:0,  notes:'Central table' },
    { type:'armchair',     xFrac:.58,yFrac:.18, wFrac:.14, dFrac:.14, heightFt:3.0, color:'#7A6A5A', material:'rattan', rotation:90, notes:'Accent seating' },
    { type:'dining_table', xFrac:.12,yFrac:.55, wFrac:.52, dFrac:.35, heightFt:2.5, color:'#6B5B45', material:'teak',   rotation:0,  notes:'Al fresco dining' },
    { type:'plant',        xFrac:.80,yFrac:.06, wFrac:.08, dFrac:.08, heightFt:5.0, color:'#2D5A1B', material:'ceramic',rotation:0,  notes:'Potted plant' },
    { type:'rug',          xFrac:.06,yFrac:.08, wFrac:.50, dFrac:.40, heightFt:0.1, color:'#8B7B5A', material:'wool',   rotation:0,  notes:'Outdoor rug' },
  ],
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: DESIGN STYLES
// ─────────────────────────────────────────────────────────────

export interface StyleDefinition {
  name:           DesignStyle
  tagline:        string
  description:    string
  keywords:       string   // for AI prompts
  wallColors:     string[] // hex suggestions
  floorColors:    string[] // hex suggestions
  accentColors:   string[] // hex suggestions
  materials:      FurnitureMaterial[]
  floorMaterial:  FloorMaterial
  wallFinish:     WallFinish
  lighting:       string   // lighting description
  moodWords:      string[]
  budgetRange:    BudgetRange
}

export const DESIGN_STYLES: Record<DesignStyle, StyleDefinition> = {
  Modern: {
    name: 'Modern', tagline: 'Clean lines, neutral tones, effortless sophistication',
    description: 'Contemporary minimalist design with clean straight lines, neutral whites and greys, low-profile furniture, polished floors, and recessed lighting.',
    keywords: 'contemporary minimalist, clean straight lines, neutral white grey, low-profile furniture, polished hardwood, recessed lights, metal accents',
    wallColors: ['#F5F5F0','#E8E8E2','#DCDCD5','#F0EEE8'],
    floorColors: ['#C4A882','#B89870','#D4B896','#A08060'],
    accentColors: ['#2C2C2C','#4A4A4A','#6B6B6B','#1A1A1A'],
    materials: ['fabric','metal','glass','wood'],
    floorMaterial: 'hardwood', wallFinish: 'paint',
    lighting: 'warm 2700K recessed lighting, floor lamps',
    moodWords: ['sleek','uncluttered','sophisticated','functional'],
    budgetRange: 'premium',
  },
  Luxury: {
    name: 'Luxury', tagline: 'Opulent materials, timeless elegance, extraordinary detail',
    description: 'Ultra-luxury opulent interior with Italian marble floors, gold and brass fixtures, velvet upholstery, crystal chandeliers, and jewel-tone walls.',
    keywords: 'ultra luxury opulent, Italian marble, gold brass fixtures, deep velvet, crystal chandelier, jewel tones, expensive art, silk curtains',
    wallColors: ['#F5EDD8','#EDE0C8','#F0E8D5','#E8DCC8'],
    floorColors: ['#F0EDE8','#E8E5DF','#D4CFC8','#C8C0B4'],
    accentColors: ['#C9A84C','#B8922A','#D4AF37','#8B6914'],
    materials: ['velvet','marble','brass','gold','silk'],
    floorMaterial: 'marble', wallFinish: 'venetian_plaster',
    lighting: 'crystal chandelier, brass sconces, warm ambient',
    moodWords: ['opulent','grand','sumptuous','prestigious'],
    budgetRange: 'ultra_luxury',
  },
  Minimalist: {
    name: 'Minimalist', tagline: 'Less is more. Silence in design.',
    description: 'Extreme minimalism with pure white walls, only essential furniture, polished floor, single pendant lamp, and completely empty walls.',
    keywords: 'extreme minimalism, pure white walls, essential furniture only, polished white floor, one pendant lamp, empty walls, zen atmosphere',
    wallColors: ['#FFFFFF','#F8F8F8','#F5F5F5','#FAFAFA'],
    floorColors: ['#E8E8E8','#D5D5D5','#EBEBEB','#F0F0F0'],
    accentColors: ['#2C2C2C','#1A1A1A','#404040','#000000'],
    materials: ['concrete','glass','metal','linen'],
    floorMaterial: 'concrete', wallFinish: 'paint',
    lighting: 'single pendant, diffused natural light',
    moodWords: ['zen','serene','pure','uncluttered'],
    budgetRange: 'premium',
  },
  Scandinavian: {
    name: 'Scandinavian', tagline: 'Hygge warmth meets functional Nordic beauty',
    description: 'Nordic hygge interior with light pine floors, white walls, cozy textures, simple birch furniture, warm pendant lamps, and indoor plants.',
    keywords: 'nordic hygge, light pine wood floors, white walls, sheepskin throw, simple birch furniture, warm pendant lamps, indoor plants, cozy textiles',
    wallColors: ['#FFFFFF','#F8F6F2','#F2EEE8','#FAF8F4'],
    floorColors: ['#D4BC94','#C8B080','#DEC89E','#C0A878'],
    accentColors: ['#4A6741','#5C7A52','#8B6B3D','#6B4C28'],
    materials: ['pine','birch','linen','wool','cotton'],
    floorMaterial: 'hardwood', wallFinish: 'paint',
    lighting: 'warm pendant lamps, candles, diffused natural light',
    moodWords: ['cozy','hyggelig','warm','natural'],
    budgetRange: 'mid_range',
  },
  Industrial: {
    name: 'Industrial', tagline: 'Raw materials, urban soul, authentic character',
    description: 'Urban loft style with exposed red brick, polished concrete floors, black steel shelving, Edison bulbs, and distressed leather furniture.',
    keywords: 'urban loft industrial, exposed red brick, polished dark concrete floor, black steel pipe shelving, Edison filament bulbs, distressed brown leather, reclaimed wood',
    wallColors: ['#B5A898','#A09080','#C8B8A8','#8B7B6B'],
    floorColors: ['#7A7A7A','#6B6B6B','#888888','#5C5C5C'],
    accentColors: ['#2C2C2C','#1A1A1A','#333333','#404040'],
    materials: ['leather','metal','concrete','wood'],
    floorMaterial: 'concrete', wallFinish: 'brick',
    lighting: 'Edison filament bulbs, pendant clusters, industrial floor lamps',
    moodWords: ['raw','edgy','authentic','urban'],
    budgetRange: 'mid_range',
  },
  Bohemian: {
    name: 'Bohemian', tagline: 'Layered, eclectic, wonderfully imperfect',
    description: 'Boho chic eclectic interior with layered Persian rugs, macrame wall art, tropical plants, natural rattan furniture, and warm amber lighting.',
    keywords: 'boho eclectic, layered colorful Persian rugs, macrame wall hanging, many tropical plants, natural rattan furniture, warm amber lighting, patterned cushions',
    wallColors: ['#F5EAD5','#EDE0C8','#F0E4CC','#E8D8B8'],
    floorColors: ['#C4A882','#B89060','#D4B080','#A87850'],
    accentColors: ['#C85A2A','#D4781E','#8B3A3A','#6B4C28'],
    materials: ['rattan','cotton','wool','wicker','linen'],
    floorMaterial: 'hardwood', wallFinish: 'plaster',
    lighting: 'warm amber pendant, candles, string lights, salt lamps',
    moodWords: ['eclectic','free-spirited','warm','layered'],
    budgetRange: 'mid_range',
  },
  Japandi: {
    name: 'Japandi', tagline: 'Where Japanese wabi-sabi meets Scandinavian hygge',
    description: 'Japandi fusion with very low wooden platform furniture, neutral beige and cream tones, wabi-sabi ceramics, bonsai, and shoji screens.',
    keywords: 'japandi japanese scandinavian fusion, very low wooden platform furniture, neutral beige cream, wabi-sabi ceramics, small bonsai, shoji screens, natural linen',
    wallColors: ['#F2EDE5','#EDE5DC','#F5F0E8','#E8E0D5'],
    floorColors: ['#C8AA80','#B89870','#D4B890','#A88860'],
    accentColors: ['#5C4830','#4A3820','#6B5540','#3C2C18'],
    materials: ['wood','bamboo','linen','ceramic','wool'],
    floorMaterial: 'engineered_wood', wallFinish: 'plaster',
    lighting: 'shoji diffused light, low washi pendant lamps',
    moodWords: ['wabi-sabi','tranquil','mindful','natural'],
    budgetRange: 'premium',
  },
  Classic: {
    name: 'Classic', tagline: 'Timeless European grandeur and craftsmanship',
    description: 'Traditional classic European interior with ornate mahogany furniture, tufted velvet, crown moulding, antique brass chandelier, Persian rug, and silk drapes.',
    keywords: 'traditional classic european, ornate mahogany carved wood, tufted velvet, crown moulding ceiling, antique brass chandelier, persian rug, silk drapes, dark hardwood floor',
    wallColors: ['#F5F0E8','#EDE5D8','#F0E8D5','#E8DCC8'],
    floorColors: ['#8B6B3D','#7A5A2C','#9C7A4E','#6B4C28'],
    accentColors: ['#C9A84C','#A07830','#8B6B14','#D4AF37'],
    materials: ['mahogany','velvet','brass','silk','wool'],
    floorMaterial: 'herringbone', wallFinish: 'paint',
    lighting: 'antique brass chandelier, wall sconces, table lamps with shades',
    moodWords: ['grand','timeless','formal','opulent'],
    budgetRange: 'luxury',
  },
  Contemporary: {
    name: 'Contemporary', tagline: 'Of-the-moment design with bold personality',
    description: 'Contemporary chic with bold geometric accent walls, mixed metals, designer floor lamps, smoked glass, and oversized abstract art.',
    keywords: 'contemporary chic, bold geometric accent wall, sleek mixed metal furniture, designer floor lamp, smoked glass table, oversized abstract art, neutral with bold accents',
    wallColors: ['#F0EEE8','#E8E5DE','#F5F2E8','#ECEAE2'],
    floorColors: ['#C4A882','#B89870','#D4B896','#A08060'],
    accentColors: ['#2C4A6B','#1A3854','#4A2C6B','#6B2C4A'],
    materials: ['glass','metal','velvet','concrete'],
    floorMaterial: 'engineered_wood', wallFinish: 'paint',
    lighting: 'statement pendant, LED strip, designer floor lamp',
    moodWords: ['current','dynamic','bold','curated'],
    budgetRange: 'premium',
  },
  Mediterranean: {
    name: 'Mediterranean', tagline: 'Sun-drenched coastal living, terracotta and sea',
    description: 'Mediterranean coastal villa interior with handmade terracotta tile floors, rough whitewashed walls, arched doorways, cobalt blue ceramics, and warm golden light.',
    keywords: 'mediterranean coastal, handmade terracotta tile floor, rough whitewashed plaster walls, arched doorway, cobalt blue ceramics, wrought iron lamp, large potted olive tree, golden sunlight',
    wallColors: ['#F5F0E5','#EDE8D8','#F2ECD8','#E8E0CC'],
    floorColors: ['#C87040','#B86030','#D48050','#A85020'],
    accentColors: ['#1E5FA0','#244E8A','#2E6EB8','#1A4070'],
    materials: ['ceramic','stone','iron','teak','cotton'],
    floorMaterial: 'tile', wallFinish: 'plaster',
    lighting: 'wrought iron lanterns, warm golden afternoon light, terracotta lamps',
    moodWords: ['sun-drenched','relaxed','rustic','vibrant'],
    budgetRange: 'mid_range',
  },
  'Art Deco': {
    name: 'Art Deco', tagline: 'Glamorous geometry and golden-age luxury',
    description: 'Art Deco glamour with bold geometric patterns, gold and black contrast, mirrored surfaces, velvet upholstery, and statement lighting.',
    keywords: 'art deco glamorous, geometric patterns, gold black contrast, mirrored surfaces, velvet upholstery, statement chandelier, lacquered finishes',
    wallColors: ['#1A1A1A','#2C2C2C','#F5EDD8','#C8B870'],
    floorColors: ['#1A1A1A','#2C2C2C','#8B6914','#D4AF37'],
    accentColors: ['#D4AF37','#C9A84C','#B8920A','#FFD700'],
    materials: ['velvet','marble','brass','gold','glass'],
    floorMaterial: 'marble', wallFinish: 'lacquered',
    lighting: 'geometric brass chandelier, fan sconces, uplighters',
    moodWords: ['glamorous','bold','luxurious','geometric'],
    budgetRange: 'luxury',
  },
  Coastal: {
    name: 'Coastal', tagline: 'Breezy, light and beautifully relaxed',
    description: 'Coastal beach house interior with white shiplap walls, bleached oak floors, natural linen, sea glass accents, and abundance of natural light.',
    keywords: 'coastal beach house, white shiplap walls, bleached oak floors, natural linen, rope and jute accents, sea glass blues, natural light, driftwood',
    wallColors: ['#FFFFFF','#F8F6F2','#EEF4F8','#F2F8FA'],
    floorColors: ['#D4C8A8','#C8BC96','#DCD2B8','#C0B490'],
    accentColors: ['#4A8FA8','#5B9FB8','#3A7A98','#6BAFC8'],
    materials: ['linen','cotton','rattan','teak','jute'],
    floorMaterial: 'engineered_wood', wallFinish: 'shiplap',
    lighting: 'white linen pendants, natural light, coastal lanterns',
    moodWords: ['airy','relaxed','fresh','natural'],
    budgetRange: 'mid_range',
  },
  Farmhouse: {
    name: 'Farmhouse', tagline: 'Warm, welcoming and rooted in the land',
    description: 'Modern farmhouse with shiplap walls, distressed wood beams, apron-front sink, galvanized metal accents, and cozy layered textiles.',
    keywords: 'modern farmhouse, shiplap white walls, reclaimed wood beams, distressed wood furniture, galvanized metal, mason jar lighting, cozy layered textiles',
    wallColors: ['#FFFFFF','#F8F5F0','#F5F0E8','#FAF6F0'],
    floorColors: ['#A88850','#987840','#B89860','#8A6830'],
    accentColors: ['#5C4830','#4A3820','#7A6040','#6B4C28'],
    materials: ['wood','cotton','linen','iron','wool'],
    floorMaterial: 'hardwood', wallFinish: 'shiplap',
    lighting: 'mason jar pendants, barn lights, candle sconces',
    moodWords: ['cozy','rustic','homey','authentic'],
    budgetRange: 'mid_range',
  },
  'Mid-Century Modern': {
    name: 'Mid-Century Modern', tagline: 'Retro-forward, organically modern',
    description: 'Mid-century modern with organic curves, teak and walnut wood, warm ochre and olive accents, tapered legs, and statement sunburst clocks.',
    keywords: 'mid-century modern, organic curves, teak walnut wood, warm ochre olive, tapered legs, sunburst lighting, Nelson pendant, Eames chair',
    wallColors: ['#F5EDD5','#EDE5C8','#F2E8CC','#E8E0BC'],
    floorColors: ['#8B6030','#7A5020','#9C7040','#6B4818'],
    accentColors: ['#C8780A','#A05820','#D4901E','#8B4A10'],
    materials: ['teak','walnut','wool','velvet','ceramic'],
    floorMaterial: 'parquet', wallFinish: 'paint',
    lighting: 'Sputnik chandelier, arc lamp, cone pendants',
    moodWords: ['retro','organic','warm','iconic'],
    budgetRange: 'premium',
  },
  Transitional: {
    name: 'Transitional', tagline: 'The perfect balance between classic and contemporary',
    description: 'Transitional style blending traditional warmth with contemporary clean lines — neutral palette, mixed textures, timeless pieces with modern sensibility.',
    keywords: 'transitional interior, classic meets contemporary, neutral warm palette, mixed textures, timeless furniture, clean lines with traditional warmth',
    wallColors: ['#F2EDE5','#EDE5DC','#F5F0E8','#E8E0D5'],
    floorColors: ['#C4A882','#B89870','#D4B896','#A08060'],
    accentColors: ['#6B5B45','#8B7355','#4A3828','#7A6A5A'],
    materials: ['fabric','wood','metal','linen'],
    floorMaterial: 'hardwood', wallFinish: 'paint',
    lighting: 'drum pendant, table lamps with fabric shades',
    moodWords: ['balanced','timeless','versatile','refined'],
    budgetRange: 'premium',
  },
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: COLOR PALETTES
// ─────────────────────────────────────────────────────────────

export interface ColorPalette {
  name:      string
  primary:   string  // hex — main wall/background color
  secondary: string  // hex — furniture/upholstery dominant
  accent:    string  // hex — pops of color, cushions, artwork
  neutral:   string  // hex — floors, ceiling, trim
  dark:      string  // hex — dark elements, frames, legs
  light:     string  // hex — lightest element, ceiling, trim
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  'Warm Ivory':       { name:'Warm Ivory',       primary:'#F5F0E8', secondary:'#C4A882', accent:'#8B6B3D', neutral:'#E8E0D0', dark:'#3C2C18', light:'#FFFAF5' },
  'Cool Grey':        { name:'Cool Grey',         primary:'#E8E8E5', secondary:'#B0B0AB', accent:'#4A6B8B', neutral:'#F5F5F3', dark:'#2C2C2C', light:'#FAFAFA' },
  'Midnight Blue':    { name:'Midnight Blue',     primary:'#1A2840', secondary:'#C8A864', accent:'#D4AF37', neutral:'#F5F0E8', dark:'#0A1420', light:'#EDE5D8' },
  'Forest Green':     { name:'Forest Green',      primary:'#2D4A30', secondary:'#C4A882', accent:'#D4AF37', neutral:'#F5F0E8', dark:'#1A2C1C', light:'#F0EBE0' },
  'Dusty Rose':       { name:'Dusty Rose',        primary:'#D4A8A0', secondary:'#8B6B5A', accent:'#C8A864', neutral:'#F5F0E8', dark:'#4A2C28', light:'#FFF5F3' },
  'Sage Green':       { name:'Sage Green',        primary:'#8BA888', secondary:'#D4C4A8', accent:'#6B4C28', neutral:'#F5F2E8', dark:'#3C4A38', light:'#F5F5F0' },
  'Terracotta':       { name:'Terracotta',        primary:'#C07050', secondary:'#F5EDD5', accent:'#1E5FA0', neutral:'#F0E8D8', dark:'#5A3018', light:'#FFF8F0' },
  'Charcoal':         { name:'Charcoal',          primary:'#2C2C2C', secondary:'#E8E0D4', accent:'#C9A84C', neutral:'#F5F5F5', dark:'#1A1A1A', light:'#FAFAF8' },
  'Caramel Cream':    { name:'Caramel Cream',     primary:'#F5EDD5', secondary:'#C4A060', accent:'#8B4A10', neutral:'#FAF6EC', dark:'#4A3010', light:'#FFFFFF' },
  'Coastal Blue':     { name:'Coastal Blue',      primary:'#EEF4F8', secondary:'#8BAFC8', accent:'#2C6080', neutral:'#FFFFFF', dark:'#1A4060', light:'#F8FAFB' },
  'Blush Luxe':       { name:'Blush Luxe',        primary:'#F0E0D8', secondary:'#C8A08A', accent:'#8B1A4A', neutral:'#FDF8F5', dark:'#4A1828', light:'#FFF5F2' },
  'Moody Jewel':      { name:'Moody Jewel',       primary:'#2A1E4A', secondary:'#8B6BB8', accent:'#D4AF37', neutral:'#F5F0E8', dark:'#18102C', light:'#EDE0D8' },
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: MATERIALS DATABASE
// ─────────────────────────────────────────────────────────────

export interface MaterialDefinition {
  name:        FurnitureMaterial
  displayName: string
  category:    'soft' | 'hard' | 'natural' | 'synthetic' | 'metal' | 'stone'
  roughness:   number  // 0–1 for 3D rendering
  metalness:   number  // 0–1 for 3D rendering
  sheen:       number  // 0–1
  description: string
  cleaningCode: string
  durability:  'low' | 'medium' | 'high' | 'very_high'
  costIndicator: '$' | '$$' | '$$$' | '$$$$'
  typicalColors: string[]
}

export const MATERIALS: Record<FurnitureMaterial, MaterialDefinition> = {
  fabric:    { name:'fabric',   displayName:'Fabric',         category:'soft',      roughness:.95, metalness:0,   sheen:0,   description:'General woven textile upholstery', cleaningCode:'W', durability:'medium',    costIndicator:'$$',   typicalColors:['#8B8680','#6B6B6B','#A09080','#C8B8A8'] },
  velvet:    { name:'velvet',   displayName:'Velvet',         category:'soft',      roughness:1.0, metalness:0,   sheen:.3,  description:'Luxurious soft pile textile, light-responsive', cleaningCode:'S', durability:'medium', costIndicator:'$$$',  typicalColors:['#4A3068','#1A4A5A','#6B2C4A','#4A6B2C'] },
  leather:   { name:'leather',  displayName:'Leather',        category:'soft',      roughness:.6,  metalness:0,   sheen:.25, description:'Natural or synthetic leather', cleaningCode:'S', durability:'high',      costIndicator:'$$$',  typicalColors:['#3C2010','#1A0C08','#5A3018','#8B5030'] },
  boucle:    { name:'boucle',   displayName:'Bouclé',         category:'soft',      roughness:1.0, metalness:0,   sheen:0,   description:'Looped textured weave fabric', cleaningCode:'S', durability:'medium',    costIndicator:'$$$',  typicalColors:['#F5F0E8','#E8DDD0','#D4C8B8','#C0B4A0'] },
  linen:     { name:'linen',    displayName:'Linen',          category:'soft',      roughness:.95, metalness:0,   sheen:.05, description:'Natural plant-based textile, airy feel', cleaningCode:'W', durability:'high',  costIndicator:'$$',   typicalColors:['#D4C8A8','#C8BC98','#E0D4B4','#B8AC88'] },
  cotton:    { name:'cotton',   displayName:'Cotton',         category:'soft',      roughness:.9,  metalness:0,   sheen:.1,  description:'Soft breathable natural fabric', cleaningCode:'W', durability:'medium',    costIndicator:'$',    typicalColors:['#FFFFFF','#F5F5F5','#E8E8E8','#F0E8E8'] },
  wool:      { name:'wool',     displayName:'Wool',           category:'soft',      roughness:1.0, metalness:0,   sheen:.08, description:'Natural fibre, warm and durable', cleaningCode:'S', durability:'high',      costIndicator:'$$$',  typicalColors:['#C8B898','#8B7860','#D4C0A0','#A09080'] },
  wood:      { name:'wood',     displayName:'Wood',           category:'natural',   roughness:.85, metalness:0,   sheen:.15, description:'Generic hardwood or softwood', cleaningCode:'dry', durability:'high',      costIndicator:'$$',   typicalColors:['#8B6030','#7A5020','#9C7040','#6B4818'] },
  oak:       { name:'oak',      displayName:'Oak',            category:'natural',   roughness:.82, metalness:0,   sheen:.18, description:'Light to medium grain hardwood', cleaningCode:'dry', durability:'very_high', costIndicator:'$$$',  typicalColors:['#C4A872','#B89860','#D4B880','#A88850'] },
  walnut:    { name:'walnut',   displayName:'Walnut',         category:'natural',   roughness:.80, metalness:0,   sheen:.22, description:'Rich dark brown hardwood', cleaningCode:'dry', durability:'very_high',   costIndicator:'$$$',  typicalColors:['#5C3A1A','#4A2C10','#6B4828','#3C2410'] },
  pine:      { name:'pine',     displayName:'Pine',           category:'natural',   roughness:.88, metalness:0,   sheen:.12, description:'Light soft wood, knotty character', cleaningCode:'dry', durability:'medium',  costIndicator:'$',    typicalColors:['#D4BC88','#C8B078','#E0C898','#B8A068'] },
  mahogany:  { name:'mahogany', displayName:'Mahogany',       category:'natural',   roughness:.78, metalness:0,   sheen:.28, description:'Rich reddish-brown tropical hardwood', cleaningCode:'dry', durability:'very_high',costIndicator:'$$$$', typicalColors:['#6B2018','#5A1810','#7A2820','#4A1008'] },
  teak:      { name:'teak',     displayName:'Teak',           category:'natural',   roughness:.75, metalness:0,   sheen:.30, description:'Golden-brown tropical hardwood, weather resistant', cleaningCode:'dry', durability:'very_high',costIndicator:'$$$$', typicalColors:['#9C7A30','#8B6820','#AC8A40','#7A5818'] },
  bamboo:    { name:'bamboo',   displayName:'Bamboo',         category:'natural',   roughness:.82, metalness:0,   sheen:.18, description:'Sustainable grass-based material', cleaningCode:'dry', durability:'high',    costIndicator:'$',    typicalColors:['#D4CC88','#C8C078','#E0D498','#B8B468'] },
  rattan:    { name:'rattan',   displayName:'Rattan',         category:'natural',   roughness:.92, metalness:0,   sheen:.08, description:'Woven natural palm material', cleaningCode:'dry', durability:'medium',      costIndicator:'$$',   typicalColors:['#C4A868','#B89858','#D4B878','#A08848'] },
  marble:    { name:'marble',   displayName:'Marble',         category:'stone',     roughness:.12, metalness:.05, sheen:.85, description:'Polished natural stone, veined pattern', cleaningCode:'dry', durability:'very_high',costIndicator:'$$$$', typicalColors:['#F0EDE8','#E8E5E0','#D4D0C8','#F5F2EE'] },
  granite:   { name:'granite',  displayName:'Granite',        category:'stone',     roughness:.20, metalness:.08, sheen:.70, description:'Speckled natural stone, very hard', cleaningCode:'dry', durability:'very_high', costIndicator:'$$$',  typicalColors:['#8B8888','#7A7878','#9C9898','#6B6868'] },
  quartz:    { name:'quartz',   displayName:'Quartz',         category:'stone',     roughness:.15, metalness:.05, sheen:.80, description:'Engineered stone, uniform appearance', cleaningCode:'dry', durability:'very_high',costIndicator:'$$$',  typicalColors:['#F5F5F0','#E8E8E2','#DCDCDC','#F0F0EA'] },
  metal:     { name:'metal',    displayName:'Metal',          category:'metal',     roughness:.30, metalness:.80, sheen:.70, description:'Generic metal finish', cleaningCode:'dry', durability:'very_high',            costIndicator:'$$',   typicalColors:['#8B8B8B','#7A7A7A','#9C9C9C','#6B6B6B'] },
  brass:     { name:'brass',    displayName:'Brass',          category:'metal',     roughness:.25, metalness:.85, sheen:.80, description:'Warm gold-toned metal alloy', cleaningCode:'dry', durability:'very_high',    costIndicator:'$$$',  typicalColors:['#C9A84C','#B8922A','#D4AF37','#A08020'] },
  gold:      { name:'gold',     displayName:'Gold',           category:'metal',     roughness:.10, metalness:.95, sheen:.98, description:'Bright polished gold plating', cleaningCode:'dry', durability:'medium',        costIndicator:'$$$$', typicalColors:['#FFD700','#F5C518','#E8B800','#D4A500'] },
  chrome:    { name:'chrome',   displayName:'Chrome',         category:'metal',     roughness:.05, metalness:.98, sheen:1.0, description:'Mirror-bright metallic finish', cleaningCode:'dry', durability:'high',          costIndicator:'$$',   typicalColors:['#E8E8E8','#DCDCDC','#F0F0F0','#D0D0D0'] },
  iron:      { name:'iron',     displayName:'Iron',           category:'metal',     roughness:.70, metalness:.75, sheen:.30, description:'Dark matte cast iron or wrought iron', cleaningCode:'dry', durability:'very_high',costIndicator:'$$',   typicalColors:['#2C2C2C','#1A1A1A','#3C3C3C','#404040'] },
  steel:     { name:'steel',    displayName:'Steel',          category:'metal',     roughness:.35, metalness:.88, sheen:.65, description:'Stainless or painted steel', cleaningCode:'dry', durability:'very_high',        costIndicator:'$$',   typicalColors:['#8B8B8B','#9A9A9A','#7A7A7A','#ABABAB'] },
  glass:     { name:'glass',    displayName:'Glass',          category:'synthetic', roughness:.04, metalness:.10, sheen:.95, description:'Clear or tinted glass', cleaningCode:'dry', durability:'medium',                costIndicator:'$$',   typicalColors:['rgba(180,220,255,0.3)','rgba(200,230,200,0.2)'] },
  acrylic:   { name:'acrylic',  displayName:'Acrylic',        category:'synthetic', roughness:.08, metalness:.05, sheen:.90, description:'Clear or coloured perspex', cleaningCode:'dry', durability:'medium',            costIndicator:'$',    typicalColors:['rgba(200,240,255,0.4)','#F0F8FF'] },
  ceramic:   { name:'ceramic',  displayName:'Ceramic',        category:'stone',     roughness:.15, metalness:.05, sheen:.80, description:'Fired clay, glazed or unglazed', cleaningCode:'dry', durability:'high',        costIndicator:'$$',   typicalColors:['#F5F0E8','#E8DDD0','#C8B8A8','#D4C4B0'] },
  concrete:  { name:'concrete', displayName:'Concrete',       category:'stone',     roughness:.95, metalness:.05, sheen:.05, description:'Raw or polished concrete', cleaningCode:'dry', durability:'very_high',          costIndicator:'$$',   typicalColors:['#9A9A96','#8B8B88','#ABABAB','#7A7A78'] },
  stone:     { name:'stone',    displayName:'Stone',          category:'stone',     roughness:.85, metalness:.02, sheen:.15, description:'Natural stone, various types', cleaningCode:'dry', durability:'very_high',      costIndicator:'$$$',  typicalColors:['#9C9090','#8B8080','#B0A4A0','#7A7070'] },
  wicker:    { name:'wicker',   displayName:'Wicker',         category:'natural',   roughness:.92, metalness:0,   sheen:.06, description:'Woven plant stems or reeds', cleaningCode:'dry', durability:'medium',            costIndicator:'$',    typicalColors:['#C8A860','#B89850','#D4B870','#A08840'] },
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: ROOM LAYOUT JSON SCHEMA
// ─────────────────────────────────────────────────────────────

/** This is what Claude generates and what all 3 views consume */
export interface RoomLayoutJSON {
  roomId:      string
  roomType:    RoomType
  style:       DesignStyle
  dimensions:  RoomDimensions
  floor:  { material: FloorMaterial; color: string; pattern?: string }
  walls:  { color: string; material: WallFinish; accentWall?: string }
  ceiling:{ color: string; heightFt: number; feature?: string }
  furniture: FurniturePiece[]
  lighting: {
    ambient:  string
    accent:   string
    natural:  string
    fixtures: string[]
  }
  palette:     ColorPalette
  styleDetails: string
  mood:         string
  // Display fields (Claude populates)
  title?:        string
  tagline?:      string
  description?:  string
  spatialNotes?: string
  colors?:       string[]    // ["#hex - Name"] format
  tips?:         string[]
  materials?:    string[]
  designRationale?: string
}

// ─────────────────────────────────────────────────────────────
// SECTION 8: CLAUDE PROMPT TEMPLATES
// ─────────────────────────────────────────────────────────────

export function buildLayoutPromptSystem(): string {
  return `You are an expert interior designer and spatial planner with 20 years of experience.
Generate precise room layout JSON where ALL furniture positions and sizes are fractions of the room (0.0-1.0).

Coordinate system:
- xFrac=0 is LEFT wall, xFrac=1 is RIGHT wall
- yFrac=0 is FAR wall (back), yFrac=1 is NEAR wall (viewer)
- wFrac = furniture width / room width
- dFrac = furniture depth / room length
- Ensure NO furniture overlaps
- Maintain minimum 3ft walkways (≈0.18 fraction) between pieces
- Scale furniture realistically to room size
- Place main furniture against walls where appropriate
- Create a coherent, functional layout that matches the style

Respond ONLY with valid JSON. No markdown. No explanation.`
}

export function buildLayoutPromptUser(params: {
  style:        DesignStyle
  roomType:     RoomType
  dims:         RoomDimensions
  answers:      Record<string, string>
  custom:       string
  roomContext:  string
  furnContext:  string
}): string {
  const { style, roomType, dims, answers, custom, roomContext, furnContext } = params
  const styleDef = DESIGN_STYLES[style]
  const defaultFurniture = DEFAULT_FURNITURE_LAYOUTS[roomType]
  const sizeGuide = ROOM_SIZE_GUIDES[roomType]

  const context = [
    `Style: ${style}. Room: ${roomType}.`,
    `Exact dimensions: ${dims.widthFt}ft wide × ${dims.lengthFt}ft long × ${dims.heightFt}ft ceiling. Total: ${dims.sqft} sqft.`,
    `Typical ${roomType} range: ${sizeGuide.minSqft}–${sizeGuide.maxSqft} sqft.`,
    answers.mood     ? `Mood: ${answers.mood}.`         : '',
    answers.budget   ? `Budget: ${answers.budget}.`     : '',
    answers.lighting ? `Lighting: ${answers.lighting}.` : '',
    answers.material ? `Materials: ${answers.material}.`: '',
    custom           ? `Client notes: ${custom}.`       : '',
    roomContext      ? `Existing room: ${roomContext}`   : '',
    furnContext      ? `Furniture to preserve: ${furnContext}` : '',
    `Style keywords: ${styleDef?.keywords || style}.`,
    `Recommended materials: ${styleDef?.materials.join(', ')}.`,
    `Default furniture to include (scale to actual dimensions): ${
      defaultFurniture.slice(0,6).map(f => `${FURNITURE_SIZES[f.type]?.label} (${FURNITURE_SIZES[f.type]?.w}w × ${FURNITURE_SIZES[f.type]?.d}d ft)`).join(', ')
    }.`,
  ].filter(Boolean).join('\n')

  return `${context}

Generate complete room layout JSON:
{
  "roomId": "r${Date.now()}",
  "roomType": "${roomType}",
  "style": "${style}",
  "dimensions": {"widthFt":${dims.widthFt},"lengthFt":${dims.lengthFt},"heightFt":${dims.heightFt},"sqft":${dims.sqft}},
  "floor": {"material":"${styleDef?.floorMaterial||'hardwood'}","color":"#hex","pattern":"optional"},
  "walls": {"color":"#hex","material":"${styleDef?.wallFinish||'paint'}","accentWall":"optional description"},
  "ceiling": {"color":"#hex","heightFt":${dims.heightFt},"feature":"optional e.g. crown moulding"},
  "furniture": [
    {"id":"f1","type":"sofa","label":"Display Name","color":"#hex","material":"fabric",
     "xFrac":0.0,"yFrac":0.0,"wFrac":0.0,"dFrac":0.0,"heightFt":0.0,
     "rotation":0,"preserved":false,"isLighting":false,"isDecor":false,
     "finish":"matte","widthFt":0,"depthFt":0,"notes":"placement reason"}
  ],
  "lighting": {
    "ambient":"describe ambient lighting",
    "accent":"describe accent lighting",
    "natural":"describe natural light source and direction",
    "fixtures":["list","of","fixture","types"]
  },
  "palette": {"primary":"#hex","secondary":"#hex","accent":"#hex","neutral":"#hex","dark":"#hex","light":"#hex"},
  "styleDetails": "${styleDef?.keywords || style}",
  "mood": "${answers.mood || 'balanced and inviting'}",
  "title": "Creative evocative design title",
  "tagline": "One poetic sentence",
  "description": "3 sentences describing materials, atmosphere, and lifestyle this design enables",
  "spatialNotes": "1 sentence about how the dimensions shaped the layout decisions",
  "colors": ["#hex - Color Name","#hex - Color Name","#hex - Color Name","#hex - Color Name"],
  "tips": ["Specific actionable tip 1","Tip 2","Tip 3"],
  "materials": ["Material 1 with brief detail","Material 2","Material 3"],
  "designRationale": "2 sentences explaining key layout decisions"
}`
}

// ─────────────────────────────────────────────────────────────
// SECTION 9: SUPABASE SCHEMA DEFINITIONS
// ─────────────────────────────────────────────────────────────

/** Supabase table: designs */
export interface DesignRecord {
  id:            string           // uuid
  user_id:       string           // uuid, FK → auth.users
  created_at:    string           // timestamp
  updated_at:    string           // timestamp
  title:         string
  room_type:     RoomType
  style:         DesignStyle
  dimensions:    RoomDimensions
  layout_json:   RoomLayoutJSON   // jsonb
  photo_url:     string | null    // generated photorealistic render
  floor_plan_svg: string | null   // SVG string or data URL
  is_public:     boolean
  is_favorite:   boolean
  tags:          string[]
  notes:         string | null
  generation_params: {
    mood?:     string
    budget?:   string
    lighting?: string
    custom?:   string
  }
}

/** Supabase table: user_preferences */
export interface UserPreferencesRecord {
  user_id:          string
  preferred_styles: DesignStyle[]
  preferred_rooms:  RoomType[]
  budget_range:     BudgetRange
  favorite_colors:  string[]
  saved_palettes:   string[]     // palette names from COLOR_PALETTES
  units:            'imperial' | 'metric'
  created_at:       string
  updated_at:       string
}

/** Supabase table: furniture_inventory (user's physical furniture) */
export interface FurnitureInventoryRecord {
  id:          string
  user_id:     string
  label:       string
  type:        FurnitureType
  description: string
  color:       string
  material:    FurnitureMaterial
  width_ft:    number
  depth_ft:    number
  height_ft:   number
  image_url:   string | null
  created_at:  string
  notes:       string | null
}

/** Supabase table: design_renders (multiple renders per design) */
export interface RenderRecord {
  id:          string
  design_id:   string      // FK → designs.id
  user_id:     string
  created_at:  string
  render_type: 'photorealistic' | 'isometric_3d' | 'floor_plan_2d'
  image_url:   string
  prompt_used: string | null
  model_used:  string | null  // 'gpt-image-1', 'sdxl', 'svg'
  is_favorite: boolean
}

/** SQL to create tables (for reference / migration) */
export const SUPABASE_SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Designs table
CREATE TABLE IF NOT EXISTS public.designs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title           TEXT NOT NULL,
  room_type       TEXT NOT NULL,
  style           TEXT NOT NULL,
  dimensions      JSONB NOT NULL,
  layout_json     JSONB NOT NULL,
  photo_url       TEXT,
  floor_plan_svg  TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  notes           TEXT,
  generation_params JSONB DEFAULT '{}'
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_styles  TEXT[] DEFAULT '{}',
  preferred_rooms   TEXT[] DEFAULT '{}',
  budget_range      TEXT DEFAULT 'premium',
  favorite_colors   TEXT[] DEFAULT '{}',
  saved_palettes    TEXT[] DEFAULT '{}',
  units             TEXT DEFAULT 'imperial',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Furniture inventory (user's physical furniture)
CREATE TABLE IF NOT EXISTS public.furniture_inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#8B8680',
  material    TEXT DEFAULT 'fabric',
  width_ft    NUMERIC(6,2) NOT NULL,
  depth_ft    NUMERIC(6,2) NOT NULL,
  height_ft   NUMERIC(6,2) NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes       TEXT
);

-- Renders (multiple per design)
CREATE TABLE IF NOT EXISTS public.design_renders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id   UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  render_type TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  prompt_used TEXT,
  model_used  TEXT,
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_designs_user_id    ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created    ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_style      ON public.designs(style);
CREATE INDEX IF NOT EXISTS idx_designs_room_type  ON public.designs(room_type);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id  ON public.furniture_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_renders_design_id  ON public.design_renders(design_id);

-- Row Level Security
ALTER TABLE public.designs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_renders      ENABLE ROW LEVEL SECURITY;

-- RLS Policies — users can only see/edit their own data
CREATE POLICY "Users own designs"     ON public.designs             FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own prefs"       ON public.user_preferences    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own inventory"   ON public.furniture_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own renders"     ON public.design_renders      FOR ALL USING (auth.uid() = user_id);

-- Public designs readable by all
CREATE POLICY "Public designs readable" ON public.designs FOR SELECT USING (is_public = TRUE);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS \$\$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; \$\$ LANGUAGE plpgsql;
CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
`

// ─────────────────────────────────────────────────────────────
// SECTION 10: UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Convert room dimensions from metric (m) to imperial (ft) */
export function metersToFeet(m: number): number { return Math.round(m * 3.28084 * 10) / 10 }
export function feetToMeters(ft: number): number { return Math.round(ft * 0.3048 * 100) / 100 }
export function sqftToSqm(sqft: number): number  { return Math.round(sqft * 0.0929 * 10) / 10 }

/** Validate room dimensions */
export function validateDimensions(w: number, l: number, h: number, roomType: RoomType): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  const sqft = w * l
  const guide = ROOM_SIZE_GUIDES[roomType]
  if (sqft < guide.minSqft) warnings.push(`${roomType} is typically at least ${guide.minSqft} sqft. Your ${sqft} sqft may feel cramped.`)
  if (sqft > guide.maxSqft) warnings.push(`${roomType} at ${sqft} sqft is very large. Consider adding a seating area or dividing zones.`)
  if (h < 7.5) warnings.push(`${h}ft ceiling is quite low. Consider furniture with lower profiles.`)
  if (h > 14)  warnings.push(`${h}ft ceiling is dramatic. Consider double-height shelving or pendant clusters.`)
  if (w / l > 2.5 || l / w > 2.5) warnings.push('Very elongated room. Consider zoning with rugs or room dividers.')
  return { valid: warnings.length === 0, warnings }
}

/** Scale furniture fractions to actual feet */
export function fracToFeet(frac: number, roomDim: number): number {
  return Math.round(frac * roomDim * 10) / 10
}

/** Check if two furniture pieces overlap */
export function doOverlap(a: FurniturePiece, b: FurniturePiece, margin = 0): boolean {
  const aRight  = a.xFrac + a.wFrac + margin
  const aBottom = a.yFrac + a.dFrac + margin
  const bRight  = b.xFrac + b.wFrac + margin
  const bBottom = b.yFrac + b.dFrac + margin
  return !(aRight <= b.xFrac || bRight <= a.xFrac || aBottom <= b.yFrac || bBottom <= a.yFrac)
}

/** Generate a unique furniture ID */
export function makeFurnitureId(type: FurnitureType, idx: number): string {
  return `${type}_${idx}_${Math.random().toString(36).slice(2, 6)}`
}

/** Convert a hex color to RGB (0-255) */
export function hexToRgb255(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').padEnd(6, '0')
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }
}

/** Lighten a hex color by amount (0-1) */
export function lightenColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb255(hex)
  const f = (v: number) => Math.min(255, Math.round(v + amount * 255))
  return `#${[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`
}

/** Darken a hex color by amount (0-1) */
export function darkenColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb255(hex)
  const f = (v: number) => Math.max(0, Math.round(v - amount * 255))
  return `#${[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`
}

/** Mix two hex colors */
export function mixColors(hex1: string, hex2: string, t: number): string {
  const a = hexToRgb255(hex1), b2 = hexToRgb255(hex2)
  const f = (v1: number, v2: number) => Math.round(v1 + (v2 - v1) * t)
  return `#${[f(a.r,b2.r),f(a.g,b2.g),f(a.b,b2.b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`
}

/** Get a contrasting text color (black or white) for a background */
export function contrastColor(hex: string): '#000000' | '#FFFFFF' {
  const { r, g, b } = hexToRgb255(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/** Format sqft for display */
export function formatSqft(sqft: number): string {
  return sqft >= 1000 ? `${(sqft/1000).toFixed(1)}K sq ft` : `${sqft} sq ft`
}

/** Format dimensions for display */
export function formatDimensions(dims: RoomDimensions): string {
  return `${dims.widthFt}' × ${dims.lengthFt}' · ${formatSqft(dims.sqft)} · ${dims.heightFt}ft ceiling`
}

/** Get furniture pieces that are lighting */
export function getLightingPieces(furniture: FurniturePiece[]): FurniturePiece[] {
  const lightingTypes: FurnitureType[] = ['floor_lamp','table_lamp','chandelier','pendant_light']
  return furniture.filter(f => lightingTypes.includes(f.type) || f.isLighting)
}

/** Get furniture pieces sorted for rendering (back-to-front) */
export function sortFurnitureForRender(furniture: FurniturePiece[], angleDeg: number): FurniturePiece[] {
  const rad = angleDeg * Math.PI / 180
  return [...furniture].sort((a, b) => {
    const da = (a.xFrac + a.wFrac/2) * Math.sin(rad) + (a.yFrac + a.dFrac/2) * Math.cos(rad)
    const db = (b.xFrac + b.wFrac/2) * Math.sin(rad) + (b.yFrac + b.dFrac/2) * Math.cos(rad)
    return da - db
  })
}

/** Generate default layout for a room type and style */
export function generateDefaultLayout(
  roomType: RoomType,
  style: DesignStyle,
  dims: RoomDimensions
): FurniturePiece[] {
  const defaults = DEFAULT_FURNITURE_LAYOUTS[roomType] || DEFAULT_FURNITURE_LAYOUTS['Living Room']
  const styleDef = DESIGN_STYLES[style]

  return defaults.map((item, i) => {
    const sizes = FURNITURE_SIZES[item.type]
    const lightingTypes: FurnitureType[] = ['floor_lamp','table_lamp','chandelier','pendant_light']
    const decorTypes: FurnitureType[] = ['plant','artwork','mirror','curtains','blinds','rug']

    return {
      id:          makeFurnitureId(item.type, i),
      type:        item.type,
      label:       sizes?.label || item.type,
      widthFt:     Math.round(item.wFrac * dims.widthFt * 10) / 10,
      depthFt:     Math.round(item.dFrac * dims.lengthFt * 10) / 10,
      heightFt:    item.heightFt,
      xFrac:       item.xFrac,
      yFrac:       item.yFrac,
      wFrac:       item.wFrac,
      dFrac:       item.dFrac,
      rotation:    item.rotation,
      color:       item.color,
      material:    item.material,
      finish:      'matte' as MaterialFinish,
      preserved:   false,
      isLighting:  lightingTypes.includes(item.type),
      isDecor:     decorTypes.includes(item.type),
      notes:       item.notes,
    }
  })
}

// ─────────────────────────────────────────────────────────────
// SECTION 11: API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

export interface GenerateAPIResponse {
  image:         string | null     // photorealistic render URL or base64
  floorPlan:     string | null     // SVG data URL
  hasDimensions: boolean
  dimensions: {
    w:    string
    l:    string
    h:    string
    sqft: number
  } | null
  design: {
    title:       string
    tagline:     string
    description: string
    spatialNote: string
    colors:      string[]
    furniture:   string[]
    tips:        string[]
    materials:   string[]
  }
  layoutJSON: {
    dimensions: RoomDimensions
    furniture:  FurniturePiece[]
    floor:      { material: string; color: string }
    walls:      { color: string; material: string; accentWall?: string }
    palette:    ColorPalette
  }
}

export interface RenderFrom3DRequest {
  image:      string       // base64 PNG of the 3D SVG capture
  style:      DesignStyle
  roomType:   RoomType
  layoutJSON: GenerateAPIResponse['layoutJSON']
}

// ─────────────────────────────────────────────────────────────
// SECTION 12: CONSTANTS
// ─────────────────────────────────────────────────────────────

export const ALL_ROOM_TYPES: RoomType[] = [
  'Living Room', 'Bedroom', 'Master Suite', 'Kitchen', 'Dining Room',
  'Bathroom', 'Home Office', 'Kids Room', 'Studio', 'Walk-in Closet',
  'Hallway', 'Basement', 'Outdoor Patio'
]

export const ALL_DESIGN_STYLES: DesignStyle[] = [
  'Modern', 'Luxury', 'Minimalist', 'Scandinavian', 'Industrial',
  'Bohemian', 'Japandi', 'Classic', 'Contemporary', 'Mediterranean',
  'Art Deco', 'Coastal', 'Farmhouse', 'Mid-Century Modern', 'Transitional'
]

export const MOOD_OPTIONS = [
  'Cozy & Warm', 'Clean & Fresh', 'Bold & Dramatic', 'Calm & Zen',
  'Playful & Fun', 'Sophisticated', 'Romantic', 'Energising',
  'Rustic & Natural', 'Glamorous', 'Professional', 'Family-Friendly'
]

export const BUDGET_OPTIONS: { value: BudgetRange; label: string; range: string }[] = [
  { value: 'budget',       label: 'Budget',       range: 'Under $1K' },
  { value: 'mid_range',    label: 'Mid-Range',     range: '$1K–$5K' },
  { value: 'premium',      label: 'Premium',       range: '$5K–$15K' },
  { value: 'luxury',       label: 'Luxury',        range: '$15K–$50K' },
  { value: 'ultra_luxury', label: 'Ultra Luxury',  range: '$50K+' },
]

export const LIGHTING_OPTIONS = [
  'Very Bright & Airy', 'Warm & Moody', 'Bright Natural Light',
  'Soft Diffused', 'Dramatic Accent', 'Minimal Natural Light'
]

export const MATERIAL_PREFERENCE_OPTIONS = [
  'Wood & Natural', 'Marble & Stone', 'Metal & Glass',
  'Fabric & Soft', 'Mixed Materials', 'Sustainable Materials'
]

// Badge colors for numbered furniture items (consistent across 3D and 2D)
export const FURNITURE_BADGE_COLORS = [
  '#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce',
  '#805ad5','#d53f8c','#2b6cb0','#276749','#744210',
  '#c05621','#553c9a','#97266d','#1a365d','#22543d'
]

export function getBadgeColor(idx: number): string {
  return FURNITURE_BADGE_COLORS[idx % FURNITURE_BADGE_COLORS.length]
}
