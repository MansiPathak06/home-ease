// "use client";
// import React, { useEffect, useRef, useState } from 'react';
// import { Star, ArrowRight, Wrench, Droplet, Zap, Wind, PaintBucket, Hammer,
//   Sparkles, Bug, Tv, Drill, Truck, Settings, Lightbulb, Sofa, Lock,
//   Camera, Waves, TreePine, Package, Flame, DoorOpen, UtensilsCrossed,
//   Baby, Heart, User, Laptop, Wifi, Printer, Car, Leaf, Shield, Home,
//   Scissors, Thermometer } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export function toSlug(str = "") {
//   return str
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-");
// }

// const categoryIconMap = {
//   "Home Cleaning":               Sparkles,
//   "Deep Cleaning":               Sparkles,
//   "Kitchen Cleaning":            Sparkles,
//   "Bathroom Cleaning":           Sparkles,
//   "Sofa Cleaning":               Sofa,
//   "Carpet Cleaning":             Sofa,
//   "Mattress Cleaning":           Sofa,
//   "Pest Control":                Bug,
//   "Termite Control":             Bug,
//   "Cockroach / Ant Control":     Bug,
//   "Bed Bug Control":             Bug,
//   "AC Repair & Service":         Wind,
//   "Washing Machine Repair":      Wrench,
//   "Refrigerator Repair":         Thermometer,
//   "Microwave Repair":            Wrench,
//   "TV Repair & Installation":    Tv,
//   "Geyser Repair":               Flame,
//   "Water Cooler Repair":         Waves,
//   "Electrician":                 Zap,
//   "Fan Installation / Repair":   Lightbulb,
//   "Light & Switch Repair":       Lightbulb,
//   "Inverter / Battery Service":  Zap,
//   "Plumber":                     Droplet,
//   "Tap & Faucet Repair":         Droplet,
//   "Leakage Repair":              Droplet,
//   "Bathroom Fittings Installation": Droplet,
//   "Water Tank Cleaning":         Waves,
//   "RO / Water Purifier Service": Waves,
//   "RO Installation":             Waves,
//   "RO Filter Change":            Waves,
//   "CCTV Installation":           Camera,
//   "Doorbell Installation":       DoorOpen,
//   "TV Wall Mount Installation":  Tv,
//   "Curtain & Blinds Installation": Home,
//   "Carpenter":                   Hammer,
//   "Furniture Repair":            Hammer,
//   "Modular Kitchen Repair":      Hammer,
//   "Wardrobe Repair":             Hammer,
//   "House Painting":              PaintBucket,
//   "Wall Putty & Polish":         PaintBucket,
//   "Home Renovation":             Home,
//   "Tiles & Flooring":            Home,
//   "Packers & Movers":            Truck,
//   "Home Shifting Service":       Truck,
//   "Cook / Chef at Home":         UtensilsCrossed,
//   "Babysitter / Nanny":          Baby,
//   "Elderly Care":                Heart,
//   "Maid Service":                User,
//   "Laptop / Computer Repair":    Laptop,
//   "WiFi / Internet Setup":       Wifi,
//   "Printer Repair":              Printer,
//   "Driver on Hire":              Car,
//   "Gardening Service":           Leaf,
//   "Home Sanitization":           Shield,
//   "Handyman Service":            Wrench,
// };

// const categoryImageMap = {
//    "Home Cleaning": "https://i.pinimg.com/736x/31/81/99/3181998038958da485cc13cfae232a56.jpg",
//   "Deep Cleaning": "https://i.pinimg.com/736x/3a/33/9f/3a339f80394ff9f3694073d48f37a356.jpg",
//   "Kitchen Cleaning": "https://i.pinimg.com/736x/14/e3/62/14e36214bcd44e446c851343510f2543.jpg",
//   "Bathroom Cleaning": "https://i.pinimg.com/736x/19/56/b4/1956b4e506f1367dcccc625eda5158c4.jpg",
//   "Sofa Cleaning": "https://i.pinimg.com/736x/fa/2d/b4/fa2db4c1568fee08047b6d19576a0857.jpg",
//   "Carpet Cleaning": "https://i.pinimg.com/736x/68/04/e0/6804e0f2bd03e771e2282acda2d37079.jpg",
//   "Mattress Cleaning": "https://i.pinimg.com/736x/c2/a9/cc/c2a9ccb402be35b3e422bee3365f01d7.jpg",
//   "Pest Control": "https://i.pinimg.com/236x/70/12/84/7012847afdc426d8680e08482ece5f95.jpg",
//   "Termite Control": "https://i.pinimg.com/736x/be/6c/51/be6c512c3bc9b1fdae7b78e9c95143f9.jpg",
//   "Cockroach / Ant Control": "https://i.pinimg.com/736x/f7/f5/5e/f7f55e8a245ae7beb7b0266c98d26a22.jpg",
//   "Bed Bug Control": "https://i.pinimg.com/736x/43/ae/c3/43aec37aad5c13bb6f449508b317b699.jpg",
//   "AC Repair & Service": "https://i.pinimg.com/736x/ae/cb/c4/aecbc43202b817eca2df7be0fe5c22b1.jpg",
//   "Washing Machine Repair": "https://i.pinimg.com/736x/87/a4/ca/87a4ca4a56a81c44eaea7a5ef02efb6c.jpg",
//   "Refrigerator Repair": "https://i.pinimg.com/736x/21/c2/c4/21c2c4d0d2811002d8fe3d46aabf6c07.jpg",
//   "Microwave Repair": "https://i.pinimg.com/736x/87/9f/02/879f0250ccdda2466a36cfb7cdd1cdd7.jpg",
//   "TV Repair & Installation": "https://i.pinimg.com/736x/08/02/f8/0802f86d4d85de2296266739d74853b6.jpg",
//   "Geyser Repair": "https://i.pinimg.com/736x/80/3b/49/803b49e9a285c939c9f4cb370e68196e.jpg",
//   "Water Cooler Repair": "https://i.pinimg.com/1200x/b0/86/25/b08625df707fbc08a0b0cf134ea65e4f.jpg",
//   "Electrician": "https://i.pinimg.com/736x/98/31/41/9831416a51a6be8b893621cbb398d75d.jpg",
//   "Fan Installation / Repair": "https://i.pinimg.com/1200x/90/0c/c1/900cc190f8bdc0969a81804e810ab2b0.jpg",
//   "Light & Switch Repair": "https://i.pinimg.com/736x/64/a5/22/64a522057d0b955b28a5cd95c23b890f.jpg",
//   "Inverter / Battery Service": "https://i.pinimg.com/736x/a7/f7/93/a7f7933fcf33171a4ff35c8fecd654dd.jpg",
//   "Plumber": "https://i.pinimg.com/736x/3b/f1/65/3bf1657d5535007babb33ec2dea3ecae.jpg",
//   "Tap & Faucet Repair": "https://i.pinimg.com/736x/ce/4f/14/ce4f1417af7dc6ce669b3110f3b26fe4.jpg",
//   "Leakage Repair": "https://i.pinimg.com/736x/5a/f1/f5/5af1f56f88b5061368ebcf9b3bba10b6.jpg",
//   "Bathroom Fittings Installation": "https://i.pinimg.com/736x/e7/72/df/e772dfd1c71b8ebca2e9647b1dd45834.jpg",
//   "Water Tank Cleaning": "https://i.pinimg.com/736x/51/5f/1d/515f1da96f1a2c387de22779b22b62d3.jpg",
//   "RO / Water Purifier Service": "https://i.pinimg.com/736x/87/ea/1e/87ea1e9211d513018715e10709526368.jpg",
//   "RO Installation": "https://i.pinimg.com/736x/7f/88/dc/7f88dcfaa3487e749f5fe9ca60015103.jpg",
//   "RO Filter Change": "https://i.pinimg.com/736x/1f/80/c1/1f80c1ee029a9e104b104c67d977ee0e.jpg",
//   "CCTV Installation": "https://i.pinimg.com/1200x/c0/93/36/c09336d0be0a9a55abab3b3ce65bb03a.jpg",
//   "Doorbell Installation": "https://i.pinimg.com/736x/5a/f9/c5/5af9c56d299e309fedcad3acd24908f3.jpg",
//   "TV Wall Mount Installation": "https://i.pinimg.com/736x/3a/7f/ae/3a7fae502c85d9a2280845cfc61219ec.jpg",
//   "Curtain & Blinds Installation": "https://i.pinimg.com/1200x/e1/bd/07/e1bd0770c726d7a61cb41cbdf70ce452.jpg",
//   "Carpenter": "https://i.pinimg.com/1200x/2c/19/2b/2c192bcc4ea3ad0b6ece446c89d525ec.jpg",
//   "Furniture Repair": "https://i.pinimg.com/736x/01/52/35/015235edbfe6daf9166ceb1c14344f9e.jpg",
//   "Modular Kitchen Repair": "https://i.pinimg.com/1200x/09/0c/bd/090cbd3b304bee6ca0f22f50ad622eec.jpg",
//   "Wardrobe Repair": "https://i.pinimg.com/736x/66/3a/69/663a69237581cc5f483bf131d735c96b.jpg",
//   "House Painting": "https://i.pinimg.com/1200x/fa/77/52/fa7752f5c782a1816674672e0e2bf569.jpg",
//   "Wall Putty & Polish": "https://i.pinimg.com/736x/5b/c8/ec/5bc8ec26432bfa0560cd99db480245de.jpg",
//   "Home Renovation": "https://i.pinimg.com/736x/fe/75/8a/fe758ad58dd194b04a9def49779b2553.jpg",
//   "Tiles & Flooring": "https://i.pinimg.com/736x/4d/87/9e/4d879e63ff7f052a8e2ef3a224a13c08.jpg",
//   "Packers & Movers": "https://i.pinimg.com/1200x/9f/73/31/9f733181d2901998764d5ef5cfef4612.jpg",
//   "Home Shifting Service": "https://i.pinimg.com/736x/1c/ed/2d/1ced2d90a3501ef4ac7a30fe4d018068.jpg",
//   "Cook / Chef at Home": "https://i.pinimg.com/736x/71/cb/a4/71cba4b41851126581f746aa8d50bd22.jpg",
//   "Babysitter / Nanny": "https://i.pinimg.com/736x/09/79/fb/0979fbb50132a84f490db9b1bf386b9e.jpg",
//   "Elderly Care": "https://i.pinimg.com/736x/d1/9b/53/d19b53e11275a54f9d768db94683eb8c.jpg",
//   "Maid Service": "https://i.pinimg.com/736x/42/6d/0d/426d0db92f4cec266e91d2edc981a8e3.jpg",
//   "Laptop / Computer Repair": "https://i.pinimg.com/736x/28/4e/28/284e28bb2883f729873683cc427671ce.jpg",
//   "WiFi / Internet Setup": "https://i.pinimg.com/736x/18/06/0b/18060b88d6512bdc73b4064a86eda631.jpg",
//   "Printer Repair": "https://i.pinimg.com/736x/3f/46/61/3f46614fc507677962a03293520a4196.jpg",
//   "Driver on Hire": "https://i.pinimg.com/736x/86/0d/b6/860db60b3b83858d4dc33a8a75a33fcf.jpg",
//   "Gardening Service": "https://i.pinimg.com/1200x/ff/0c/39/ff0c39a6cc4d12d189a20b755a9bbfcb.jpg",
//   "Home Sanitization": "https://i.pinimg.com/236x/6d/38/cb/6d38cbb7242256939d76661f6fb32ec8.jpg",
//   "Handyman Service": "https://i.pinimg.com/736x/5f/6e/49/5f6e49f225506f0a682a0b6799acd640.jpg",
// };

// const ALL_SERVICES = [
//   "Home Cleaning","Deep Cleaning","Kitchen Cleaning","Bathroom Cleaning",
//   "Sofa Cleaning","Carpet Cleaning","Mattress Cleaning","Pest Control",
//   "Termite Control","Cockroach / Ant Control","Bed Bug Control",
//   "AC Repair & Service","Washing Machine Repair","Refrigerator Repair",
//   "Microwave Repair","TV Repair & Installation","Geyser Repair",
//   "Water Cooler Repair","Electrician","Fan Installation / Repair",
//   "Light & Switch Repair","Inverter / Battery Service","Plumber",
//   "Tap & Faucet Repair","Leakage Repair","Bathroom Fittings Installation",
//   "Water Tank Cleaning","RO / Water Purifier Service","RO Installation",
//   "RO Filter Change","CCTV Installation","Doorbell Installation",
//   "TV Wall Mount Installation","Curtain & Blinds Installation","Carpenter",
//   "Furniture Repair","Modular Kitchen Repair","Wardrobe Repair",
//   "House Painting","Wall Putty & Polish","Home Renovation","Tiles & Flooring",
//   "Packers & Movers","Home Shifting Service","Cook / Chef at Home",
//   "Babysitter / Nanny","Elderly Care","Maid Service","Laptop / Computer Repair",
//   "WiFi / Internet Setup","Printer Repair","Driver on Hire",
//   "Gardening Service","Home Sanitization","Handyman Service",
// ];

// const FEATURED = ALL_SERVICES.slice(0, 6);

// function ServicesSection() {
//   const router = useRouter();
//   const [visibleCards, setVisibleCards] = useState([]);
//   const [visibleTestimonials, setVisibleTestimonials] = useState(false);
//   const cardsRef = useRef([]);
//   const testimonialsRef = useRef(null);

//   const testimonials = [
//     { id: 1, name: 'Sarah Johnson',   text: 'Absolutely fantastic service! The team was professional, punctual, and exceeded all my expectations.', rating: 5 },
//     { id: 2, name: 'Michael Chen',    text: 'Best home service experience ever. They transformed my living room beautifully!',                        rating: 5 },
//     { id: 3, name: 'Emily Rodriguez', text: 'Highly recommend! Quality work at fair prices with excellent customer care throughout.',                  rating: 5 },
//   ];

//   useEffect(() => {
//     const observerOptions = { threshold: 0.15, rootMargin: '0px' };
//     const handleIntersect = (entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           const index = cardsRef.current.indexOf(entry.target);
//           if (index !== -1 && !visibleCards.includes(index))
//             setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 80);
//         }
//       });
//     };
//     const observer = new IntersectionObserver(handleIntersect, observerOptions);
//     const testimonialsObserver = new IntersectionObserver(
//       (entries) => entries.forEach(e => e.isIntersecting && setVisibleTestimonials(true)),
//       observerOptions
//     );
//     cardsRef.current.forEach(card => { if (card) observer.observe(card); });
//     if (testimonialsRef.current) testimonialsObserver.observe(testimonialsRef.current);
//     return () => { observer.disconnect(); testimonialsObserver.disconnect(); };
//   }, [visibleCards]);

//   return (
//     <div style={{ backgroundColor: '#111111' }}>
//       {/* Services Section */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
//           <div>
//             <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>
//               What We Offer
//             </p>
//             <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#f0f0f0' }}>
//               Our Top Services
//             </h2>
//           </div>
//           <button
//             onClick={() => router.push('/services')}
//             className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
//             style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
//             onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
//             onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
//           >
//             View All Services <ArrowRight className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px" style={{ backgroundColor: '#2a2a2a', border: '1px solid #2a2a2a' }}>
//           {FEATURED.map((title, index) => {
//             const Icon = categoryIconMap[title] || Wrench;
//             const image = categoryImageMap[title];
//             const slug = toSlug(title);
//             return (
//               <div
//                 key={title}
//                 ref={el => { if (el) cardsRef.current[index] = el; }}
//                 onClick={() => router.push(`/services/${slug}`)}
//                 className={`group cursor-pointer relative overflow-hidden transition-all duration-400
//                   ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
//                 style={{ backgroundColor: '#1a1a1a', transitionDelay: `${index * 60}ms` }}
//               >
//                 <div className="aspect-square relative overflow-hidden">
//                   {image ? (
//                     <img src={image} alt={title}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
//                       <Icon className="w-10 h-10" style={{ color: '#555' }} />
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
//                   <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: '#C0392B' }}>
//                     <Icon className="w-3.5 h-3.5 text-white" />
//                   </div>
//                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <span className="text-white text-xs font-bold px-4 py-2 uppercase tracking-wider" style={{ backgroundColor: '#C0392B' }}>
//                       Find Vendors
//                     </span>
//                   </div>
//                 </div>
//                 <div
//                   className="p-3 border-t transition-colors duration-200"
//                   style={{ borderColor: '#2a2a2a' }}
//                   onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
//                   onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
//                 >
//                   <h3 className="text-xs font-bold mb-0.5 line-clamp-1" style={{ color: '#f0f0f0' }}>{title}</h3>
//                 </div>
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: '#C0392B' }} />
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       {/* Testimonials & Stats */}
//       <section ref={testimonialsRef} className="border-t py-14" style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${visibleTestimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//             <div>
//               <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>
//                 Customer Reviews
//               </p>
//               <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#f0f0f0' }}>
//                 What Our Customers Say
//               </h2>
//             </div>
//             <button
//               className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
//               style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
//               onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
//               onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
//             >
//               Read All Reviews <ArrowRight className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//             {/* Stats panel */}
//             <div className={`lg:col-span-2 transition-all duration-700 delay-100 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
//               <div className="border h-full" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
//                 <div className="grid grid-cols-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
//                   {[
//                     { value: '10K+', label: 'Happy Customers' },
//                     { value: '50K+', label: 'Jobs Done' },
//                     { value: '4.9★', label: 'Avg Rating' },
//                     { value: '98%',  label: 'Satisfaction' },
//                   ].map((stat, i) => (
//                     <div
//                       key={i}
//                       className="p-5 transition-colors duration-200 group cursor-default"
//                       style={{
//                         borderRight: i % 2 === 0 ? '1px solid #2a2a2a' : 'none',
//                         borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none',
//                       }}
//                       onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; }}
//                       onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
//                     >
//                       <div className="text-2xl font-black mb-0.5" style={{ color: '#f0f0f0' }}>{stat.value}</div>
//                       <div className="text-xs font-medium" style={{ color: '#888' }}>{stat.label}</div>
//                     </div>
//                   ))}
//                 </div>
//                 <div style={{ borderTop: '1px solid #2a2a2a' }}>
//                   {[
//                     { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: '100% Verified Reviews', sub: 'All feedback is authentic' },
//                     { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Background-Checked Pros', sub: 'Secure & safe service' },
//                     { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: '2-Hour Response', sub: 'Fast & reliable booking' },
//                   ].map((badge, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200"
//                       style={{ borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none' }}
//                       onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
//                       onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
//                     >
//                       <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(192,57,43,0.15)' }}>
//                         <svg className="w-4 h-4" style={{ color: '#C0392B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
//                         </svg>
//                       </div>
//                       <div>
//                         <div className="text-xs font-bold" style={{ color: '#f0f0f0' }}>{badge.title}</div>
//                         <div className="text-xs" style={{ color: '#888' }}>{badge.sub}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Testimonials */}
//             <div className={`lg:col-span-3 flex flex-col gap-4 transition-all duration-700 delay-200 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
//               {testimonials.map((t, i) => (
//                 <div
//                   key={t.id}
//                   className="p-5 border transition-colors duration-200"
//                   style={{
//                     backgroundColor: '#1a1a1a',
//                     borderColor: '#2a2a2a',
//                     transitionDelay: visibleTestimonials ? `${(i + 1) * 120}ms` : '0ms',
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
//                   onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div
//                       className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
//                       style={{ backgroundColor: '#C0392B' }}
//                     >
//                       {t.name.charAt(0)}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between gap-2 mb-1">
//                         <span className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{t.name}</span>
//                         <div className="flex gap-0.5 flex-shrink-0">
//                           {[...Array(t.rating)].map((_, i) => (
//                             <Star key={i} className="w-3 h-3" style={{ fill: '#C0392B', color: '#C0392B' }} />
//                           ))}
//                         </div>
//                       </div>
//                       <p className="text-sm leading-relaxed" style={{ color: '#aaa' }}>"{t.text}"</p>
//                       <div className="mt-2 flex items-center gap-1.5">
//                         <div className="w-1.5 h-1.5" style={{ backgroundColor: '#22c55e' }}></div>
//                         <span className="text-xs font-medium" style={{ color: '#666' }}>Verified Customer</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default ServicesSection;
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Star, ArrowRight, Wrench, Droplet, Zap, Wind, PaintBucket, Hammer,
  Sparkles, Bug, Tv, Truck, Lightbulb, Sofa,
  Camera, Waves, Flame, DoorOpen, UtensilsCrossed,
  Baby, Heart, User, Laptop, Wifi, Printer, Car, Leaf, Shield, Home,
  Thermometer, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewSubmitForm from '@/components/ReviewSubmitForm';
import { api } from '@/lib/api';

export function toSlug(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

const categoryIconMap = {
  "Home Cleaning": Sparkles, "Deep Cleaning": Sparkles, "Kitchen Cleaning": Sparkles,
  "Bathroom Cleaning": Sparkles, "Sofa Cleaning": Sofa, "Carpet Cleaning": Sofa,
  "Mattress Cleaning": Sofa, "Pest Control": Bug, "Termite Control": Bug,
  "Cockroach / Ant Control": Bug, "Bed Bug Control": Bug, "AC Repair & Service": Wind,
  "Washing Machine Repair": Wrench, "Refrigerator Repair": Thermometer, "Microwave Repair": Wrench,
  "TV Repair & Installation": Tv, "Geyser Repair": Flame, "Water Cooler Repair": Waves,
  "Electrician": Zap, "Fan Installation / Repair": Lightbulb, "Light & Switch Repair": Lightbulb,
  "Inverter / Battery Service": Zap, "Plumber": Droplet, "Tap & Faucet Repair": Droplet,
  "Leakage Repair": Droplet, "Bathroom Fittings Installation": Droplet, "Water Tank Cleaning": Waves,
  "RO / Water Purifier Service": Waves, "RO Installation": Waves, "RO Filter Change": Waves,
  "CCTV Installation": Camera, "Doorbell Installation": DoorOpen, "TV Wall Mount Installation": Tv,
  "Curtain & Blinds Installation": Home, "Carpenter": Hammer, "Furniture Repair": Hammer,
  "Modular Kitchen Repair": Hammer, "Wardrobe Repair": Hammer, "House Painting": PaintBucket,
  "Wall Putty & Polish": PaintBucket, "Home Renovation": Home, "Tiles & Flooring": Home,
  "Packers & Movers": Truck, "Home Shifting Service": Truck, "Cook / Chef at Home": UtensilsCrossed,
  "Babysitter / Nanny": Baby, "Elderly Care": Heart, "Maid Service": User,
  "Laptop / Computer Repair": Laptop, "WiFi / Internet Setup": Wifi, "Printer Repair": Printer,
  "Driver on Hire": Car, "Gardening Service": Leaf, "Home Sanitization": Shield,
  "Handyman Service": Wrench,
};

const categoryImageMap = {
  "Home Cleaning": "https://i.pinimg.com/736x/31/81/99/3181998038958da485cc13cfae232a56.jpg",
  "Deep Cleaning": "https://i.pinimg.com/736x/3a/33/9f/3a339f80394ff9f3694073d48f37a356.jpg",
  "Kitchen Cleaning": "https://i.pinimg.com/736x/14/e3/62/14e36214bcd44e446c851343510f2543.jpg",
  "Bathroom Cleaning": "https://i.pinimg.com/736x/19/56/b4/1956b4e506f1367dcccc625eda5158c4.jpg",
  "Sofa Cleaning": "https://i.pinimg.com/736x/fa/2d/b4/fa2db4c1568fee08047b6d19576a0857.jpg",
  "Carpet Cleaning": "https://i.pinimg.com/736x/68/04/e0/6804e0f2bd03e771e2282acda2d37079.jpg",
};

const FEATURED = ["Home Cleaning","Deep Cleaning","Kitchen Cleaning","Bathroom Cleaning","Sofa Cleaning","Carpet Cleaning"];

const FALLBACK_REVIEWS = [
  { id: 1, name: 'Sarah Johnson', text: 'Absolutely fantastic service! The team was professional, punctual, and exceeded all my expectations.', rating: 5, service: null },
  { id: 2, name: 'Michael Chen',  text: 'Best home service experience ever. They transformed my living room beautifully!', rating: 5, service: null },
  { id: 3, name: 'Emily Rodriguez', text: 'Highly recommend! Quality work at fair prices with excellent customer care throughout.', rating: 5, service: null },
];

function ReviewModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="w-full max-w-lg rounded-lg" style={{ backgroundColor: "#111111", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: "#f0f0f0" }}>Share Your Experience</h3>
            <p className="text-xs mt-0.5" style={{ color: "#666" }}>Your review will be visible after approval</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X className="w-5 h-5" style={{ color: "#999" }} />
          </button>
        </div>
        <div className="p-5">
          <ReviewSubmitForm />
        </div>
      </div>
    </div>
  );
}

function ServicesSection() {
  const router = useRouter();
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleTestimonials, setVisibleTestimonials] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const cardsRef = useRef([]);
  const testimonialsRef = useRef(null);

  useEffect(() => {
    api.reviews.getPublic()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTotalReviewCount(data.length);       // total count for button label
          setReviews(data.slice(0, 3));           // only first 3 on homepage
        } else {
          setReviews(FALLBACK_REVIEWS);
          setTotalReviewCount(0);
        }
      })
      .catch(() => { setReviews(FALLBACK_REVIEWS); setTotalReviewCount(0); })
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px' };
    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = cardsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleCards.includes(index))
            setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 80);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const testimonialsObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisibleTestimonials(true)),
      observerOptions
    );
    cardsRef.current.forEach(card => { if (card) observer.observe(card); });
    if (testimonialsRef.current) testimonialsObserver.observe(testimonialsRef.current);
    return () => { observer.disconnect(); testimonialsObserver.disconnect(); };
  }, [visibleCards]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <div style={{ backgroundColor: '#111111' }}>
      {showReviewModal && <ReviewModal onClose={() => setShowReviewModal(false)} />}

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#f0f0f0' }}>Our Top Services</h2>
          </div>
          <button
            onClick={() => router.push('/services')}
            className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
            style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px" style={{ backgroundColor: '#2a2a2a', border: '1px solid #2a2a2a' }}>
          {FEATURED.map((title, index) => {
            const Icon = categoryIconMap[title] || Wrench;
            const image = categoryImageMap[title];
            const slug = toSlug(title);
            return (
              <div
                key={title}
                ref={el => { if (el) cardsRef.current[index] = el; }}
                onClick={() => router.push(`/services/${slug}`)}
                className={`group cursor-pointer relative overflow-hidden transition-all duration-400
                  ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ backgroundColor: '#1a1a1a', transitionDelay: `${index * 60}ms` }}
              >
                <div className="aspect-square relative overflow-hidden">
                  {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
                      <Icon className="w-10 h-10" style={{ color: '#555' }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                  <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: '#C0392B' }}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-bold px-4 py-2 uppercase tracking-wider" style={{ backgroundColor: '#C0392B' }}>
                      Find Vendors
                    </span>
                  </div>
                </div>
                <div className="p-3 border-t transition-colors duration-200" style={{ borderColor: '#2a2a2a' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                  <h3 className="text-xs font-bold mb-0.5 line-clamp-1" style={{ color: '#f0f0f0' }}>{title}</h3>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: '#C0392B' }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials & Stats */}
      <section ref={testimonialsRef} className="border-t py-14" style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 transition-all duration-700 ${visibleTestimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C0392B' }}>Customer Reviews</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#f0f0f0' }}>What Our Customers Say</h2>
            </div>

            {/* ── Two buttons side by side ── */}
            <div className="flex flex-wrap gap-2 self-start sm:self-auto">
              {/* Read All Reviews — only show if more than 3 exist */}
              {totalReviewCount > 3 && (
                <button
                  onClick={() => router.push('/reviews')}
                  className="inline-flex items-center gap-2 font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
                  style={{ border: '2px solid #444', color: '#aaa', backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa'; }}
                >
                  Read All Reviews ({totalReviewCount}) <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-2 font-semibold py-2.5 px-5 text-sm transition-colors duration-200"
                style={{ border: '2px solid #C0392B', color: '#C0392B', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C0392B'; }}
              >
                <Plus className="w-4 h-4" /> Write a Review
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Stats panel */}
            <div className={`lg:col-span-2 transition-all duration-700 delay-100 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="border h-full" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <div className="grid grid-cols-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {[
                    { value: '10K+', label: 'Happy Customers' },
                    { value: '50K+', label: 'Jobs Done' },
                    { value: `${avgRating}★`, label: 'Avg Rating' },
                    { value: '98%', label: 'Satisfaction' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 transition-colors duration-200 cursor-default"
                      style={{ borderRight: i % 2 === 0 ? '1px solid #2a2a2a' : 'none', borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div className="text-2xl font-black mb-0.5" style={{ color: '#f0f0f0' }}>{stat.value}</div>
                      <div className="text-xs font-medium" style={{ color: '#888' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a' }}>
                  {[
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: '100% Verified Reviews', sub: 'All feedback is authentic' },
                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Background-Checked Pros', sub: 'Secure & safe service' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: '2-Hour Response', sub: 'Fast & reliable booking' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200"
                      style={{ borderBottom: i < 2 ? '1px solid #2a2a2a' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(192,57,43,0.15)' }}>
                        <svg className="w-4 h-4" style={{ color: '#C0392B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: '#f0f0f0' }}>{badge.title}</div>
                        <div className="text-xs" style={{ color: '#888' }}>{badge.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials — always max 3 */}
            <div className={`lg:col-span-3 flex flex-col gap-4 transition-all duration-700 delay-200 ${visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              {reviewsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-5 border animate-pulse" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex-shrink-0" style={{ backgroundColor: '#2a2a2a' }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded" style={{ backgroundColor: '#2a2a2a' }} />
                        <div className="h-3 w-full rounded" style={{ backgroundColor: '#2a2a2a' }} />
                        <div className="h-3 w-3/4 rounded" style={{ backgroundColor: '#2a2a2a' }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                reviews.map((t, i) => (
                  <div
                    key={t.id}
                    className="p-5 border transition-colors duration-200"
                    style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', transitionDelay: visibleTestimonials ? `${(i + 1) * 120}ms` : '0ms' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#C0392B' }}>
                        {(t.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{t.name}</span>
                            {t.service && (
                              <span className="text-xs px-2 py-0.5" style={{ backgroundColor: '#2a0000', color: '#C0392B', border: '1px solid #3a0000' }}>
                                {t.service}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[...Array(Number(t.rating))].map((_, idx) => (
                              <Star key={idx} className="w-3 h-3" style={{ fill: '#C0392B', color: '#C0392B' }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#aaa' }}>"{t.text}"</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5" style={{ backgroundColor: '#22c55e' }}></div>
                            <span className="text-xs font-medium" style={{ color: '#666' }}>Verified Customer</span>
                          </div>
                          {t.created_at && (
                            <span className="text-xs" style={{ color: '#555' }}>
                              {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Bottom CTA row */}
              {!reviewsLoading && (
                <div className="flex gap-3">
                  {totalReviewCount > 3 && (
                    <button
                      onClick={() => router.push('/reviews')}
                      className="flex-1 p-4 border text-sm font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'transparent', borderColor: '#2a2a2a', color: '#888' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888'; }}
                    >
                      <ArrowRight className="w-4 h-4" />
                      See all {totalReviewCount} reviews
                    </button>
                  )}
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex-1 p-4 border text-sm font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'transparent', borderColor: '#2a2a2a', color: '#666', borderStyle: 'dashed' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B'; e.currentTarget.style.borderStyle = 'solid'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderStyle = 'dashed'; }}
                  >
                    <Plus className="w-4 h-4" /> Share your experience
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesSection;