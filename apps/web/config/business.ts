export const businessConfig = {
  name: "Chand Mobile Expert",
  shortName: "CHAND MOBILE EXPERT",
  tagline: "Your Phone. Our Expertise.",
  description:
    "Professional smartphone repairs including screen replacement, battery replacement, charging port repair and more. Fast service, quality parts and warranty-backed repairs.",
  phone: "+91 97586 77978",
  phoneRaw: "+919758677978",
  whatsapp: "+919758677978",
  email: "chandmobileexpert@gmail.com",
  address: "Main Market, Sarai Tarin",
  city: "Sambhal",
  state: "Uttar Pradesh",
  zip: "244303",
  country: "IN",
  latitude: 28.548185,
  longitude: 78.561416,
  rating: "4.9",
  reviewCount: "612+",
  devicesRepaired: "10,000+",
  satisfaction: "98%",
  warranty: "1 Year",
  hours: [
    { day: "Monday – Saturday", time: "10:00 AM – 8:00 PM" },
    { day: "Sunday", time: "11:00 AM – 5:00 PM" },
  ],
  social: {
    instagram: "https://www.instagram.com/chandmobileexpert/",
    youtube: "https://www.youtube.com/@ChandMobileExpert",
    whatsapp: "https://wa.me/919758677978",
    facebook: "https://facebook.com",
    twitter: "https://x.com",
  },
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3504.7183260698603!2d78.5614159754977!3d28.548184975710857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDMyJzUzLjUiTiA3OMKwMzMnNTAuNCJF!5e0!3m2!1sen!2sin!4v1792393084790!5m2!1sen!2sin",
} as const;

export function waLink(message: string = "Hello Chand Mobile Expert, I would like to enquire about mobile repair.") {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${businessConfig.whatsapp.replace(/[^0-9]/g, "")}?text=${encoded}`;
}

export function telLink() {
  return `tel:${businessConfig.phoneRaw}`;
}
