/**
 * Club photo library: /public/images/gallery/hub-NN.webp (1600px max), hub-NN-md.webp (1080px), hub-NN-sm.webp (720px).
 * Originals: /assets-src/images/gallery. Alt text describes what is actually in each photo.
 */
export interface Photo { id: string, w: number, h: number, alt: string }

export const PHOTOS: Photo[] = [
  { id: '00', w: 1600, h: 1067, alt: "DJ mixing on the decks" },
  { id: '01', w: 1368, h: 1600, alt: "Bottle server holding a tequila bottle under the LED ceiling" },
  { id: '02', w: 1200, h: 1600, alt: "Group in matching pink dresses at the Best Night Ever wall" },
  { id: '03', w: 1200, h: 1600, alt: "Couple posing in sunglasses on the dance floor" },
  { id: '04', w: 1200, h: 1600, alt: "Friends at the balloon photo wall" },
  { id: '05', w: 585, h: 1266, alt: "Couple smiling under red lights" },
  { id: '07', w: 1200, h: 1600, alt: "Birthday group in the pink balloon photo frame" },
  { id: '08', w: 1200, h: 1600, alt: "Group celebrating with gold number balloons" },
  { id: '09', w: 1200, h: 1600, alt: "Friends in bright dresses at the neon Best Night Ever sign" },
  { id: '10', w: 1200, h: 1600, alt: "Friends posing by the neon sign and balloons" },
  { id: '11', w: 1200, h: 1600, alt: "Bottle presentation with sparklers and a disco-ball ice bucket" },
  { id: '12', w: 900, h: 1600, alt: "Group in pink dresses on a VIP couch" },
  { id: '13', w: 1200, h: 1600, alt: "Friends taking a selfie under the neon sign" },
  { id: '14', w: 1600, h: 1600, alt: "Group in a VIP booth holding a Book VIP sign" },
  { id: '15', w: 900, h: 1600, alt: "Friends at the Hub logo wall" },
  { id: '16', w: 900, h: 1600, alt: "Bachelorette group in white at the neon sign" },
  { id: '17', w: 1600, h: 553, alt: "The patio with yellow umbrellas" },
  { id: '18', w: 900, h: 1600, alt: "Group posing on a yellow VIP couch" },
  { id: '19', w: 1600, h: 1067, alt: "The neon Best Night Ever sign" },
  { id: '20', w: 1600, h: 1067, alt: "DJ in a pink cap playing to the crowd" },
  { id: '21', w: 1600, h: 1067, alt: "Guests in front of the illuminated Hub logo" },
  { id: '22', w: 1600, h: 1067, alt: "Guest raising a sparkler in a VIP booth" },
  { id: '23', w: 1600, h: 1067, alt: "Group at a VIP table with bottle service" },
  { id: '24', w: 1600, h: 1067, alt: "Sparkler bottle delivery in a VIP booth" },
  { id: '25', w: 1600, h: 1067, alt: "Crowd dancing with hands up" },
  { id: '26', w: 1600, h: 1067, alt: "Packed dance floor" },
  { id: '27', w: 1600, h: 1067, alt: "Friends posing on the dance floor" },
  { id: '28', w: 1600, h: 1067, alt: "DJ at the decks" },
  { id: '29', w: 1600, h: 1067, alt: "Crowd under the LED rain-light ceiling" },
  { id: '30', w: 1600, h: 1067, alt: "Guest dancing under orange and teal lights" },
  { id: '31', w: 1067, h: 1600, alt: "Dancer with a fan in the crowd" },
  { id: '32', w: 1600, h: 1067, alt: "Packed dance floor with hands in the air" },
  { id: '33', w: 1600, h: 1067, alt: "Friends posing on the dance floor" },
  { id: '34', w: 1600, h: 1067, alt: "Crowd under the LED ceiling" },
  { id: '35', w: 1600, h: 1067, alt: "Friends at a high-top table" },
  { id: '36', w: 1600, h: 1067, alt: "Live band playing to dancing guests" },
  { id: '37', w: 1600, h: 1067, alt: "Group at the Patr\u00f3n photo wall" },
  { id: '38', w: 1600, h: 1066, alt: "Friends at the Patr\u00f3n photo wall" },
  { id: '39', w: 1024, h: 819, alt: "Bottle servers at the illuminated Hub logo" },
  { id: '40', w: 1600, h: 1067, alt: "The lounge with booths and pink lights" }
]

const byId = Object.fromEntries(PHOTOS.map(p => [p.id, p])) as Record<string, Photo>

/** Everything an <img> needs for a library photo: responsive src/srcset, size and alt. */
export function photo(id: string) {
  const p = byId[id]
  if (!p) throw new Error(`Unknown photo hub-${id}`)
  return {
    src: `/images/gallery/hub-${id}.webp`,
    srcset: `/images/gallery/hub-${id}-sm.webp 720w, /images/gallery/hub-${id}-md.webp ${Math.min(1080, p.w)}w, /images/gallery/hub-${id}.webp ${p.w}w`,
    width: p.w,
    height: p.h,
    alt: p.alt
  }
}
