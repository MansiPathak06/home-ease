

// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Wrench, Droplet, Zap, Wind, PaintBucket, Hammer, Sparkles, Phone,
//   ArrowRight, Award, CheckCircle2, Users, Home, Leaf, Bug, Tv, Drill,
//   Truck, Settings, Star, Lightbulb, Sofa, Lock, Camera, Waves, TreePine,
//   Package, Flame, DoorOpen, Fence, UtensilsCrossed, Baby, Heart, User,
//   Laptop, Wifi, Printer, Car, Shield, Thermometer,
// } from "lucide-react";

// function toSlug(str = "") {
//   return str
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-");
// }

// const categoryIconMap = {
//   "Home Cleaning": Sparkles, "Deep Cleaning": Sparkles, "Kitchen Cleaning": Sparkles,
//   "Bathroom Cleaning": Sparkles, "Sofa Cleaning": Sofa, "Carpet Cleaning": Sofa,
//   "Mattress Cleaning": Sofa, "Pest Control": Bug, "Termite Control": Bug,
//   "Cockroach / Ant Control": Bug, "Bed Bug Control": Bug, "AC Repair & Service": Wind,
//   "Washing Machine Repair": Wrench, "Refrigerator Repair": Thermometer, "Microwave Repair": Wrench,
//   "TV Repair & Installation": Tv, "Geyser Repair": Flame, "Water Cooler Repair": Waves,
//   "Electrician": Zap, "Fan Installation / Repair": Lightbulb, "Light & Switch Repair": Lightbulb,
//   "Inverter / Battery Service": Zap, "Plumber": Droplet, "Tap & Faucet Repair": Droplet,
//   "Leakage Repair": Droplet, "Bathroom Fittings Installation": Droplet, "Water Tank Cleaning": Waves,
//   "RO / Water Purifier Service": Waves, "RO Installation": Waves, "RO Filter Change": Waves,
//   "CCTV Installation": Camera, "Doorbell Installation": DoorOpen, "TV Wall Mount Installation": Tv,
//   "Curtain & Blinds Installation": Home, "Carpenter": Hammer, "Furniture Repair": Hammer,
//   "Modular Kitchen Repair": Hammer, "Wardrobe Repair": Hammer, "House Painting": PaintBucket,
//   "Wall Putty & Polish": PaintBucket, "Home Renovation": Home, "Tiles & Flooring": Home,
//   "Packers & Movers": Truck, "Home Shifting Service": Truck, "Cook / Chef at Home": UtensilsCrossed,
//   "Babysitter / Nanny": Baby, "Elderly Care": Heart, "Maid Service": User,
//   "Laptop / Computer Repair": Laptop, "WiFi / Internet Setup": Wifi, "Printer Repair": Printer,
//   "Driver on Hire": Car, "Gardening Service": Leaf, "Home Sanitization": Shield,
//   "Handyman Service": Wrench,
// };

// const categoryImageMap = {
//   "Home Cleaning": "https://i.pinimg.com/736x/31/81/99/3181998038958da485cc13cfae232a56.jpg",
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

// const FEATURED   = ALL_SERVICES.slice(0, 8);
// const ADDITIONAL = ALL_SERVICES.slice(8);

// const stats = [
//   { icon: Users,        number: "15,000+", label: "Happy Customers" },
//   { icon: CheckCircle2, number: "75,000+", label: "Services Done"   },
//   { icon: Award,        number: "800+",    label: "Professionals"   },
//   { icon: Star,         number: "4.9/5",   label: "Avg Rating"      },
// ];

// const processSteps = [
//   { step: "01", icon: Phone,  title: "Book Service",  description: "Choose service & schedule a convenient time",   image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563226/Book_Service_hwrt4t.jpg" },
//   { step: "02", icon: Users,  title: "Get Matched",   description: "We assign the best verified pro for your need", image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg" },
//   { step: "03", icon: Wrench, title: "Service Done",  description: "Expert arrives on time and completes work",      image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563231/Service_Done_wf7afl.jpg" },
//   { step: "04", icon: Star,   title: "Rate & Review", description: "Share your experience and enjoy quality",        image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563229/Rate_Review_dicdgy.jpg" },
// ];

// function OurServicesPage() {
//   const router = useRouter();
//   const [visibleFeatured,   setVisibleFeatured]   = useState([]);
//   const [visibleAdditional, setVisibleAdditional] = useState([]);
//   const [visibleProcess,    setVisibleProcess]    = useState([]);
//   const [visibleStats,      setVisibleStats]      = useState(false);
//   const featuredRefs   = useRef([]);
//   const additionalRefs = useRef([]);
//   const processRefs    = useRef([]);
//   const statsRef       = useRef(null);

//   useEffect(() => {
//     const opts = { threshold: 0.15 };
//     const makeObs = (refs, setter, visited) =>
//       new IntersectionObserver((entries) => {
//         entries.forEach((e) => {
//           if (e.isIntersecting) {
//             const i = refs.current.indexOf(e.target);
//             if (i !== -1 && !visited.includes(i))
//               setTimeout(() => setter((p) => [...p, i]), i * 60);
//           }
//         });
//       }, opts);

//     const fObs = makeObs(featuredRefs,   setVisibleFeatured,   visibleFeatured);
//     const aObs = makeObs(additionalRefs, setVisibleAdditional, visibleAdditional);
//     const pObs = makeObs(processRefs,    setVisibleProcess,    visibleProcess);
//     const sObs = new IntersectionObserver(
//       (entries) => entries.forEach((e) => e.isIntersecting && setVisibleStats(true)), opts
//     );
//     featuredRefs.current.forEach((el)   => el && fObs.observe(el));
//     additionalRefs.current.forEach((el) => el && aObs.observe(el));
//     processRefs.current.forEach((el)    => el && pObs.observe(el));
//     if (statsRef.current) sObs.observe(statsRef.current);
//     return () => { fObs.disconnect(); aObs.disconnect(); pObs.disconnect(); sObs.disconnect(); };
//   }, []);

//   return (
//     // THEME CHANGE: was bg-white → #111111 dark charcoal
//     <div className="min-h-screen" style={{ backgroundColor: "#111111" }}>

//       {/* ── Hero ── (overlay stays red — it's over an image, unchanged visually) */}
//       <section className="relative py-24 md:py-32 overflow-hidden">
//         <div className="absolute inset-0">
//           <img src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Professional_Home_Services_Background_yzqgrf.jpg" alt="Hero" className="w-full h-full object-cover" />
//           {/* THEME CHANGE: overlay was bg-red-700/85 → deeper #8B0000 at 90% */}
//           <div className="absolute inset-0" style={{ backgroundColor: "rgba(139,0,0,0.90)" }} />
//         </div>
//         <div className="relative z-8 max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="max-w-3xl">
//             <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#CC0000" }}>Home Services</p>
//             <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">Every Service<br />Your Home Needs</h1>
//             <p className="text-base md:text-lg mb-8 max-w-xl leading-relaxed" style={{ color: "#cccccc" }}>
//               Verified professionals for plumbing, electrical, cleaning, and 50+ more services — anytime, anywhere.
//             </p>
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={() => router.push("/services")}
//                 className="font-bold py-3 px-7 text-sm transition-all duration-200 flex items-center gap-2 group"
//                 style={{ backgroundColor: "#FFFFFF", color: "#8B0000" }}
//                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
//                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
//               >
//                 Book a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//               <button
//                 onClick={() => router.push("/services")}
//                 className="font-bold py-3 px-7 text-sm transition-all duration-200"
//                 style={{ border: "2px solid #FFFFFF", color: "#FFFFFF", backgroundColor: "transparent" }}
//                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.color = "#8B0000"; }}
//                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#FFFFFF"; }}
//               >
//                 View All Services
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Stats ── */}
//       {/* THEME CHANGE: was border-gray-200 → #2a2a2a */}
//       <section ref={statsRef} style={{ borderBottom: "1px solid #2a2a2a" }}>
//         <div className="max-w-7xl mx-auto">
//           {/* THEME CHANGE: divide colors → #2a2a2a */}
//           <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderColor: "#2a2a2a" }}>
//             {stats.map((s, i) => {
//               const Icon = s.icon;
//               return (
//                 <div
//                   key={i}
//                   className={`px-6 py-8 flex items-center gap-4 group transition-colors duration-200 ${visibleStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}
//                   style={{
//                     transitionDelay: `${i * 80}ms`,
//                     borderRight: i < 3 ? "1px solid #2a2a2a" : "none",
//                     backgroundColor: "#111111",
//                   }}
//                   // THEME CHANGE: hover → #8B0000 deep crimson
//                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
//                 >
//                   {/* THEME CHANGE: icon box was bg-red-50 → #2a0000 */}
//                   <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors duration-200" style={{ backgroundColor: "#2a0000" }}>
//                     <Icon className="w-5 h-5 transition-colors duration-200" style={{ color: "#CC0000" }} />
//                   </div>
//                   <div>
//                     {/* THEME CHANGE: number was text-gray-900 → white */}
//                     <div className="text-xl font-black transition-colors duration-200" style={{ color: "#FFFFFF" }}>{s.number}</div>
//                     {/* THEME CHANGE: label was text-gray-500 → #999999 */}
//                     <div className="text-xs font-medium transition-colors duration-200" style={{ color: "#999999" }}>{s.label}</div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Popular Services ── */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
//           <div>
//             <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Most Booked</p>
//             <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>Popular Services</h2>
//           </div>
//         </div>
//         {/* THEME CHANGE: gap bg was bg-gray-200 border-gray-200 → #2a2a2a */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}>
//           {FEATURED.map((title, index) => {
//             const Icon  = categoryIconMap[title] || Wrench;
//             const image = categoryImageMap[title];
//             return (
//               <div
//                 key={title}
//                 ref={(el) => { if (el) featuredRefs.current[index] = el; }}
//                 className={`group overflow-hidden relative transition-all duration-500 ${visibleFeatured.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
//                 style={{ transitionDelay: `${index * 60}ms`, backgroundColor: "#111111" }}
//               >
//                 <div className="h-44 relative overflow-hidden">
//                   <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
//                   <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
//                   {/* THEME CHANGE: icon badge → #8B0000 */}
//                   <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: "#8B0000" }}>
//                     <Icon className="w-3.5 h-3.5 text-white" />
//                   </div>
//                   <div className="absolute bottom-0 left-0 right-0 p-3">
//                     <h3 className="text-sm font-bold text-white">{title}</h3>
//                   </div>
//                 </div>
//                 <div className="p-4">
//                   <button
//                     onClick={() => router.push(`/services/${toSlug(title)}`)}
//                     className="w-full text-white font-semibold py-2 text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
//                     style={{ backgroundColor: "#8B0000" }}
//                     onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CC0000"; }}
//                     onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
//                   >
//                     Find Vendors <ArrowRight className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//                 {/* THEME CHANGE: bottom accent → #CC0000 */}
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       {/* ── All Services ── */}
//       {/* THEME CHANGE: was bg-gray-50 border-gray-200 → #1a1a1a #2a2a2a */}
//       <section className="py-14" style={{ backgroundColor: "#1a1a1a", borderTop: "1px solid #2a2a2a" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
//             <div>
//               <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Everything Under One Roof</p>
//               <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>Complete Home Solutions</h2>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-px" style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}>
//             {ADDITIONAL.map((title, index) => {
//               const Icon  = categoryIconMap[title] || Wrench;
//               const image = categoryImageMap[title];
//               return (
//                 <div
//                   key={title}
//                   ref={(el) => { if (el) additionalRefs.current[index] = el; }}
//                   onClick={() => router.push(`/services/${toSlug(title)}`)}
//                   className={`group cursor-pointer overflow-hidden relative transition-all duration-500 ${visibleAdditional.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
//                   style={{ transitionDelay: `${index * 40}ms`, backgroundColor: "#111111" }}
//                 >
//                   <div className="h-28 relative overflow-hidden">
//                     <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
//                     <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: "rgba(0,0,0,0)" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)"; }} />
//                     <div className="absolute top-2 left-2 p-1" style={{ backgroundColor: "#8B0000" }}>
//                       <Icon className="w-3 h-3 text-white" />
//                     </div>
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <span className="text-white text-xs font-bold px-3 py-1 uppercase tracking-wide" style={{ backgroundColor: "#CC0000" }}>Book Now</span>
//                     </div>
//                   </div>
//                   {/* THEME CHANGE: text row border → #2a2a2a, hover → #CC0000 */}
//                   <div className="px-2.5 py-2 transition-colors duration-200" style={{ borderTop: "1px solid #2a2a2a" }}>
//                     <h3 className="text-xs font-bold mb-1 line-clamp-2 leading-tight" style={{ color: "#FFFFFF" }}>{title}</h3>
//                   </div>
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── How It Works ── */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
//         <div className="mb-10">
//           <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Simple Process</p>
//           <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>How It Works</h2>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}>
//           {processSteps.map((p, index) => {
//             const Icon = p.icon;
//             return (
//               <div
//                 key={index}
//                 ref={(el) => { if (el) processRefs.current[index] = el; }}
//                 className={`group overflow-hidden relative transition-all duration-500 ${visibleProcess.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
//                 style={{ transitionDelay: `${index * 80}ms`, backgroundColor: "#111111" }}
//               >
//                 <div className="h-40 relative overflow-hidden">
//                   <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
//                   <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
//                   <div className="absolute top-3 left-3 text-4xl font-black leading-none select-none" style={{ color: "rgba(255,255,255,0.15)" }}>{p.step}</div>
//                   <div className="absolute top-3 right-3 p-1.5" style={{ backgroundColor: "#8B0000" }}>
//                     <Icon className="w-3.5 h-3.5 text-white" />
//                   </div>
//                 </div>
//                 {/* THEME CHANGE: hover was bg-red-600 → #8B0000 */}
//                 <div
//                   className="p-4 transition-colors duration-300"
//                   style={{ backgroundColor: "#111111" }}
//                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
//                 >
//                   <h3 className="text-sm font-bold mb-1 transition-colors duration-300" style={{ color: "#FFFFFF" }}>{p.title}</h3>
//                   <p className="text-xs leading-snug transition-colors duration-300" style={{ color: "#999999" }}>{p.description}</p>
//                 </div>
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       {/* ── CTA ── THEME CHANGE: was bg-red-600 → #8B0000 deep crimson */}
//       <section style={{ backgroundColor: "#8B0000", borderTop: "4px solid #6a0000" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2">
//             <div className="relative h-64 lg:h-auto overflow-hidden">
//               <img src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761538862/Team_imw68d.jpg" alt="Professional Team" className="w-full h-100 object-cover" />
//               <div className="absolute inset-0" style={{ backgroundColor: "rgba(100,0,0,0.5)" }} />
//               <div className="absolute bottom-6 left-6 bg-white px-5 py-3">
//                 <div className="text-2xl font-black" style={{ color: "#8B0000" }}>24/7</div>
//                 <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#666666" }}>Available</div>
//               </div>
//             </div>
//             <div className="p-5 md:p-7 flex flex-col justify-center">
//               {/* THEME CHANGE: sub-label was text-red-200 → #CC0000 lighter on dark bg */}
//               <p className="text-[10px] font-semibold tracking-wider uppercase mb-2" style={{ color: "#ffaaaa" }}>Get Help Today</p>
//               <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-snug">Having a problem?<br />We'll fix it today.</h2>
//               <p className="text-xs mb-4 leading-relaxed max-w-sm" style={{ color: "#ffcccc" }}>
//                 Instant access to verified professionals ready to solve your home service needs — fast response, quality work, guaranteed satisfaction.
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
//                 {["Verified Professionals","Same-Day Service","100% Satisfaction Guaranteed","No Hidden Charges","Emergency 24/7","Warranty on All Work"].map((f, i) => (
//                   <div key={i} className="flex items-center gap-1.5">
//                     <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ffaaaa" }} />
//                     <span className="text-white text-[11px] font-medium">{f}</span>
//                   </div>
//                 ))}
//               </div>
//               {/* THEME CHANGE: phone box was bg-red-700 → #6a0000 */}
//               <div className="flex items-center gap-2 px-3 py-2 mb-4 w-fit" style={{ backgroundColor: "#6a0000" }}>
//                 <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "#ffaaaa" }} />
//                 <div>
//                   <div className="text-[10px] leading-none" style={{ color: "#ffaaaa" }}>Call Us Now</div>
//                   <a href="tel:+912342312323" className="font-bold text-sm text-white hover:text-red-200 transition-colors">(234) 231-2323</a>
//                 </div>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => router.push("/services")}
//                   className="font-bold py-2 px-5 text-xs transition-colors duration-200 flex items-center gap-1.5"
//                   style={{ backgroundColor: "#FFFFFF", color: "#8B0000" }}
//                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
//                 >
//                   Book Now <ArrowRight className="w-3.5 h-3.5" />
//                 </button>
//                 <button
//                   className="font-bold py-2 px-5 text-xs transition-all duration-200"
//                   style={{ border: "1px solid #FFFFFF", color: "#FFFFFF", backgroundColor: "transparent" }}
//                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.color = "#8B0000"; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#FFFFFF"; }}
//                 >
//                   Learn More
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default OurServicesPage;

"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wrench, Droplet, Zap, Wind, PaintBucket, Hammer, Sparkles, Phone,
  ArrowRight, Award, CheckCircle2, Users, Home, Leaf, Bug, Tv, Drill,
  Truck, Settings, Star, Lightbulb, Sofa, Lock, Camera, Waves, TreePine,
  Package, Flame, DoorOpen, Fence, UtensilsCrossed, Baby, Heart, User,
  Laptop, Wifi, Printer, Car, Shield, Thermometer, X,
} from "lucide-react";

function toSlug(str = "") {
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
  "Mattress Cleaning": "https://i.pinimg.com/736x/c2/a9/cc/c2a9ccb402be35b3e422bee3365f01d7.jpg",
  "Pest Control": "https://i.pinimg.com/236x/70/12/84/7012847afdc426d8680e08482ece5f95.jpg",
  "Termite Control": "https://i.pinimg.com/736x/be/6c/51/be6c512c3bc9b1fdae7b78e9c95143f9.jpg",
  "Cockroach / Ant Control": "https://i.pinimg.com/736x/f7/f5/5e/f7f55e8a245ae7beb7b0266c98d26a22.jpg",
  "Bed Bug Control": "https://i.pinimg.com/736x/43/ae/c3/43aec37aad5c13bb6f449508b317b699.jpg",
  "AC Repair & Service": "https://i.pinimg.com/736x/ae/cb/c4/aecbc43202b817eca2df7be0fe5c22b1.jpg",
  "Washing Machine Repair": "https://i.pinimg.com/736x/87/a4/ca/87a4ca4a56a81c44eaea7a5ef02efb6c.jpg",
  "Refrigerator Repair": "https://i.pinimg.com/736x/21/c2/c4/21c2c4d0d2811002d8fe3d46aabf6c07.jpg",
  "Microwave Repair": "https://i.pinimg.com/736x/87/9f/02/879f0250ccdda2466a36cfb7cdd1cdd7.jpg",
  "TV Repair & Installation": "https://i.pinimg.com/736x/08/02/f8/0802f86d4d85de2296266739d74853b6.jpg",
  "Geyser Repair": "https://i.pinimg.com/736x/80/3b/49/803b49e9a285c939c9f4cb370e68196e.jpg",
  "Water Cooler Repair": "https://i.pinimg.com/1200x/b0/86/25/b08625df707fbc08a0b0cf134ea65e4f.jpg",
  "Electrician": "https://i.pinimg.com/736x/98/31/41/9831416a51a6be8b893621cbb398d75d.jpg",
  "Fan Installation / Repair": "https://i.pinimg.com/1200x/90/0c/c1/900cc190f8bdc0969a81804e810ab2b0.jpg",
  "Light & Switch Repair": "https://i.pinimg.com/736x/64/a5/22/64a522057d0b955b28a5cd95c23b890f.jpg",
  "Inverter / Battery Service": "https://i.pinimg.com/736x/a7/f7/93/a7f7933fcf33171a4ff35c8fecd654dd.jpg",
  "Plumber": "https://i.pinimg.com/736x/3b/f1/65/3bf1657d5535007babb33ec2dea3ecae.jpg",
  "Tap & Faucet Repair": "https://i.pinimg.com/736x/ce/4f/14/ce4f1417af7dc6ce669b3110f3b26fe4.jpg",
  "Leakage Repair": "https://i.pinimg.com/736x/5a/f1/f5/5af1f56f88b5061368ebcf9b3bba10b6.jpg",
  "Bathroom Fittings Installation": "https://i.pinimg.com/736x/e7/72/df/e772dfd1c71b8ebca2e9647b1dd45834.jpg",
  "Water Tank Cleaning": "https://i.pinimg.com/736x/51/5f/1d/515f1da96f1a2c387de22779b22b62d3.jpg",
  "RO / Water Purifier Service": "https://i.pinimg.com/736x/87/ea/1e/87ea1e9211d513018715e10709526368.jpg",
  "RO Installation": "https://i.pinimg.com/736x/7f/88/dc/7f88dcfaa3487e749f5fe9ca60015103.jpg",
  "RO Filter Change": "https://i.pinimg.com/736x/1f/80/c1/1f80c1ee029a9e104b104c67d977ee0e.jpg",
  "CCTV Installation": "https://i.pinimg.com/1200x/c0/93/36/c09336d0be0a9a55abab3b3ce65bb03a.jpg",
  "Doorbell Installation": "https://i.pinimg.com/736x/5a/f9/c5/5af9c56d299e309fedcad3acd24908f3.jpg",
  "TV Wall Mount Installation": "https://i.pinimg.com/736x/3a/7f/ae/3a7fae502c85d9a2280845cfc61219ec.jpg",
  "Curtain & Blinds Installation": "https://i.pinimg.com/1200x/e1/bd/07/e1bd0770c726d7a61cb41cbdf70ce452.jpg",
  "Carpenter": "https://i.pinimg.com/1200x/2c/19/2b/2c192bcc4ea3ad0b6ece446c89d525ec.jpg",
  "Furniture Repair": "https://i.pinimg.com/736x/01/52/35/015235edbfe6daf9166ceb1c14344f9e.jpg",
  "Modular Kitchen Repair": "https://i.pinimg.com/1200x/09/0c/bd/090cbd3b304bee6ca0f22f50ad622eec.jpg",
  "Wardrobe Repair": "https://i.pinimg.com/736x/66/3a/69/663a69237581cc5f483bf131d735c96b.jpg",
  "House Painting": "https://i.pinimg.com/1200x/fa/77/52/fa7752f5c782a1816674672e0e2bf569.jpg",
  "Wall Putty & Polish": "https://i.pinimg.com/736x/5b/c8/ec/5bc8ec26432bfa0560cd99db480245de.jpg",
  "Home Renovation": "https://i.pinimg.com/736x/fe/75/8a/fe758ad58dd194b04a9def49779b2553.jpg",
  "Tiles & Flooring": "https://i.pinimg.com/736x/4d/87/9e/4d879e63ff7f052a8e2ef3a224a13c08.jpg",
  "Packers & Movers": "https://i.pinimg.com/1200x/9f/73/31/9f733181d2901998764d5ef5cfef4612.jpg",
  "Home Shifting Service": "https://i.pinimg.com/736x/1c/ed/2d/1ced2d90a3501ef4ac7a30fe4d018068.jpg",
  "Cook / Chef at Home": "https://i.pinimg.com/736x/71/cb/a4/71cba4b41851126581f746aa8d50bd22.jpg",
  "Babysitter / Nanny": "https://i.pinimg.com/736x/09/79/fb/0979fbb50132a84f490db9b1bf386b9e.jpg",
  "Elderly Care": "https://i.pinimg.com/736x/d1/9b/53/d19b53e11275a54f9d768db94683eb8c.jpg",
  "Maid Service": "https://i.pinimg.com/736x/42/6d/0d/426d0db92f4cec266e91d2edc981a8e3.jpg",
  "Laptop / Computer Repair": "https://i.pinimg.com/736x/28/4e/28/284e28bb2883f729873683cc427671ce.jpg",
  "WiFi / Internet Setup": "https://i.pinimg.com/736x/18/06/0b/18060b88d6512bdc73b4064a86eda631.jpg",
  "Printer Repair": "https://i.pinimg.com/736x/3f/46/61/3f46614fc507677962a03293520a4196.jpg",
  "Driver on Hire": "https://i.pinimg.com/736x/86/0d/b6/860db60b3b83858d4dc33a8a75a33fcf.jpg",
  "Gardening Service": "https://i.pinimg.com/1200x/ff/0c/39/ff0c39a6cc4d12d189a20b755a9bbfcb.jpg",
  "Home Sanitization": "https://i.pinimg.com/236x/6d/38/cb/6d38cbb7242256939d76661f6fb32ec8.jpg",
  "Handyman Service": "https://i.pinimg.com/736x/5f/6e/49/5f6e49f225506f0a682a0b6799acd640.jpg",
};

const ALL_SERVICES = [
  "Home Cleaning","Deep Cleaning","Kitchen Cleaning","Bathroom Cleaning",
  "Sofa Cleaning","Carpet Cleaning","Mattress Cleaning","Pest Control",
  "Termite Control","Cockroach / Ant Control","Bed Bug Control",
  "AC Repair & Service","Washing Machine Repair","Refrigerator Repair",
  "Microwave Repair","TV Repair & Installation","Geyser Repair",
  "Water Cooler Repair","Electrician","Fan Installation / Repair",
  "Light & Switch Repair","Inverter / Battery Service","Plumber",
  "Tap & Faucet Repair","Leakage Repair","Bathroom Fittings Installation",
  "Water Tank Cleaning","RO / Water Purifier Service","RO Installation",
  "RO Filter Change","CCTV Installation","Doorbell Installation",
  "TV Wall Mount Installation","Curtain & Blinds Installation","Carpenter",
  "Furniture Repair","Modular Kitchen Repair","Wardrobe Repair",
  "House Painting","Wall Putty & Polish","Home Renovation","Tiles & Flooring",
  "Packers & Movers","Home Shifting Service","Cook / Chef at Home",
  "Babysitter / Nanny","Elderly Care","Maid Service","Laptop / Computer Repair",
  "WiFi / Internet Setup","Printer Repair","Driver on Hire",
  "Gardening Service","Home Sanitization","Handyman Service",
];

const stats = [
  { icon: Users,        number: "15,000+", label: "Happy Customers" },
  { icon: CheckCircle2, number: "75,000+", label: "Services Done"   },
  { icon: Award,        number: "800+",    label: "Professionals"   },
  { icon: Star,         number: "4.9/5",   label: "Avg Rating"      },
];

const processSteps = [
  { step: "01", icon: Phone,  title: "Book Service",  description: "Choose service & schedule a convenient time",   image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563226/Book_Service_hwrt4t.jpg" },
  { step: "02", icon: Users,  title: "Get Matched",   description: "We assign the best verified pro for your need", image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg" },
  { step: "03", icon: Wrench, title: "Service Done",  description: "Expert arrives on time and completes work",     image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563231/Service_Done_wf7afl.jpg" },
  { step: "04", icon: Star,   title: "Rate & Review", description: "Share your experience and enjoy quality",       image: "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563229/Rate_Review_dicdgy.jpg" },
];

// ── Inner component that reads searchParams ──────────────────────────────────
function ServicesInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Read navbar search params
  const urlService  = searchParams.get("service") || "";
  const urlLocation = searchParams.get("location") || "";

  // If a service param exists, filter ALL_SERVICES; else show all
  const displayedServices = urlService
    ? ALL_SERVICES.filter((s) =>
        s.toLowerCase().includes(urlService.toLowerCase())
      )
    : ALL_SERVICES;

  const FEATURED   = displayedServices.slice(0, 8);
  const ADDITIONAL = displayedServices.slice(8);

  const [visibleFeatured,   setVisibleFeatured]   = useState([]);
  const [visibleAdditional, setVisibleAdditional] = useState([]);
  const [visibleProcess,    setVisibleProcess]    = useState([]);
  const [visibleStats,      setVisibleStats]      = useState(false);

  const featuredRefs   = useRef([]);
  const additionalRefs = useRef([]);
  const processRefs    = useRef([]);
  const statsRef       = useRef(null);

  // Reset animations when search params change
  useEffect(() => {
    setVisibleFeatured([]);
    setVisibleAdditional([]);
  }, [urlService]);

  useEffect(() => {
    const opts = { threshold: 0.15 };
    const makeObs = (refs, setter, visited) =>
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = refs.current.indexOf(e.target);
            if (i !== -1 && !visited.includes(i))
              setTimeout(() => setter((p) => [...p, i]), i * 60);
          }
        });
      }, opts);

    const fObs = makeObs(featuredRefs,   setVisibleFeatured,   visibleFeatured);
    const aObs = makeObs(additionalRefs, setVisibleAdditional, visibleAdditional);
    const pObs = makeObs(processRefs,    setVisibleProcess,    visibleProcess);
    const sObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisibleStats(true)), opts
    );
    featuredRefs.current.forEach((el)   => el && fObs.observe(el));
    additionalRefs.current.forEach((el) => el && aObs.observe(el));
    processRefs.current.forEach((el)    => el && pObs.observe(el));
    if (statsRef.current) sObs.observe(statsRef.current);
    return () => { fObs.disconnect(); aObs.disconnect(); pObs.disconnect(); sObs.disconnect(); };
  }, [urlService]);

  // Navigate to vendor page — pass location so [slug] page can use it
  const goToVendors = (title) => {
    const slug = toSlug(title);
    const params = new URLSearchParams();
    if (urlLocation) params.set("location", urlLocation);
    const qs = params.toString();
    router.push(`/services/${slug}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#111111" }}>

      {/* ── Active filter banner ── */}
      {(urlService || urlLocation) && (
        <div
          className="pt-20 px-4"
          style={{ backgroundColor: "#111111" }}
        >
          <div className="max-w-7xl mx-auto py-3 flex flex-wrap items-center gap-2">
            <span style={{ color: "#999999", fontSize: "13px" }}>Showing results for:</span>

            {urlService && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#2a0000", color: "#CC0000", border: "1px solid #8B0000" }}
              >
                Service: {urlService}
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete("service");
                    router.push(`/services${p.toString() ? `?${p}` : ""}`);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {urlLocation && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#001a2a", color: "#60a5fa", border: "1px solid #1e4a6a" }}
              >
                Location: {urlLocation}
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete("location");
                    router.push(`/services${p.toString() ? `?${p}` : ""}`);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={() => router.push("/services")}
              className="text-xs underline"
              style={{ color: "#666666" }}
            >
              Clear all
            </button>

            <span style={{ color: "#666666", fontSize: "12px", marginLeft: "auto" }}>
              {displayedServices.length} service{displayedServices.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      )}

      {/* ── Hero (only show when no filter active) ── */}
      {!urlService && !urlLocation && (
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Professional_Home_Services_Background_yzqgrf.jpg" alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(139,0,0,0.90)" }} />
          </div>
          <div className="relative z-8 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#CC0000" }}>Home Services</p>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">Every Service<br />Your Home Needs</h1>
              <p className="text-base md:text-lg mb-8 max-w-xl leading-relaxed" style={{ color: "#cccccc" }}>
                Verified professionals for plumbing, electrical, cleaning, and 50+ more services — anytime, anywhere.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/services")}
                  className="font-bold py-3 px-7 text-sm transition-all duration-200 flex items-center gap-2 group"
                  style={{ backgroundColor: "#FFFFFF", color: "#8B0000" }}
                >
                  Book a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats (only when no filter) ── */}
      {!urlService && !urlLocation && (
        <section ref={statsRef} style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={`px-6 py-8 flex items-center gap-4 group transition-colors duration-200 ${visibleStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}
                    style={{ transitionDelay: `${i * 80}ms`, borderRight: i < 3 ? "1px solid #2a2a2a" : "none", backgroundColor: "#111111" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2a0000" }}>
                      <Icon className="w-5 h-5" style={{ color: "#CC0000" }} />
                    </div>
                    <div>
                      <div className="text-xl font-black" style={{ color: "#FFFFFF" }}>{s.number}</div>
                      <div className="text-xs font-medium" style={{ color: "#999999" }}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── No results ── */}
      {urlService && displayedServices.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>No services found for "{urlService}"</p>
          <p className="text-sm mt-2" style={{ color: "#666666" }}>Try a different keyword</p>
          <button
            onClick={() => router.push("/services")}
            className="mt-5 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#8B0000" }}
          >
            View All Services
          </button>
        </div>
      )}

      {/* ── Featured / Filtered Services ── */}
      {FEATURED.length > 0 && (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 py-14 ${urlService || urlLocation ? "pt-6" : ""}`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>
                {urlService ? "Matching Services" : "Most Booked"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>
                {urlService ? `Results for "${urlService}"` : "Popular Services"}
              </h2>
            </div>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}
          >
            {FEATURED.map((title, index) => {
              const Icon  = categoryIconMap[title] || Wrench;
              const image = categoryImageMap[title];
              return (
                <div
                  key={title}
                  ref={(el) => { if (el) featuredRefs.current[index] = el; }}
                  className={`group overflow-hidden relative transition-all duration-500 ${visibleFeatured.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${index * 60}ms`, backgroundColor: "#111111" }}
                >
                  <div className="h-44 relative overflow-hidden">
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
                    <div className="absolute top-2.5 left-2.5 p-1.5" style={{ backgroundColor: "#8B0000" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={() => goToVendors(title)}
                      className="w-full text-white font-semibold py-2 text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: "#8B0000" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CC0000"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
                    >
                      Find Vendors <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Additional Services (only when >8 results) ── */}
      {ADDITIONAL.length > 0 && (
        <section className="py-14" style={{ backgroundColor: "#1a1a1a", borderTop: "1px solid #2a2a2a" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Everything Under One Roof</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>Complete Home Solutions</h2>
            </div>
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-px"
              style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}
            >
              {ADDITIONAL.map((title, index) => {
                const Icon  = categoryIconMap[title] || Wrench;
                const image = categoryImageMap[title];
                return (
                  <div
                    key={title}
                    ref={(el) => { if (el) additionalRefs.current[index] = el; }}
                    onClick={() => goToVendors(title)}
                    className={`group cursor-pointer overflow-hidden relative transition-all duration-500 ${visibleAdditional.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${index * 40}ms`, backgroundColor: "#111111" }}
                  >
                    <div className="h-28 relative overflow-hidden">
                      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute top-2 left-2 p-1" style={{ backgroundColor: "#8B0000" }}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-xs font-bold px-3 py-1 uppercase tracking-wide" style={{ backgroundColor: "#CC0000" }}>Find Vendors</span>
                      </div>
                    </div>
                    <div className="px-2.5 py-2 transition-colors duration-200" style={{ borderTop: "1px solid #2a2a2a" }}>
                      <h3 className="text-xs font-bold mb-1 line-clamp-2 leading-tight" style={{ color: "#FFFFFF" }}>{title}</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works (only when no filter) ── */}
      {!urlService && !urlLocation && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#CC0000" }}>Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#2a2a2a", border: "1px solid #2a2a2a" }}>
            {processSteps.map((p, index) => {
              const Icon = p.icon;
              return (
                <div
                  key={index}
                  ref={(el) => { if (el) processRefs.current[index] = el; }}
                  className={`group overflow-hidden relative transition-all duration-500 ${visibleProcess.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${index * 80}ms`, backgroundColor: "#111111" }}
                >
                  <div className="h-40 relative overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
                    <div className="absolute top-3 left-3 text-4xl font-black leading-none select-none" style={{ color: "rgba(255,255,255,0.15)" }}>{p.step}</div>
                    <div className="absolute top-3 right-3 p-1.5" style={{ backgroundColor: "#8B0000" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="p-4 transition-colors duration-300" style={{ backgroundColor: "#111111" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8B0000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#111111"; }}
                  >
                    <h3 className="text-sm font-bold mb-1" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                    <p className="text-xs leading-snug" style={{ color: "#999999" }}>{p.description}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: "#CC0000" }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#8B0000", borderTop: "4px solid #6a0000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto overflow-hidden">
              <img src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761538862/Team_imw68d.jpg" alt="Professional Team" className="w-full h-100 object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: "rgba(100,0,0,0.5)" }} />
              <div className="absolute bottom-6 left-6 bg-white px-5 py-3">
                <div className="text-2xl font-black" style={{ color: "#8B0000" }}>24/7</div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#666666" }}>Available</div>
              </div>
            </div>
            <div className="p-5 md:p-7 flex flex-col justify-center">
              <p className="text-[10px] font-semibold tracking-wider uppercase mb-2" style={{ color: "#ffaaaa" }}>Get Help Today</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-snug">Having a problem?<br />We'll fix it today.</h2>
              <p className="text-xs mb-4 leading-relaxed max-w-sm" style={{ color: "#ffcccc" }}>
                Instant access to verified professionals ready to solve your home service needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
                {["Verified Professionals","Same-Day Service","100% Satisfaction Guaranteed","No Hidden Charges","Emergency 24/7","Warranty on All Work"].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ffaaaa" }} />
                    <span className="text-white text-[11px] font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 mb-4 w-fit" style={{ backgroundColor: "#6a0000" }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "#ffaaaa" }} />
                <div>
                  <div className="text-[10px] leading-none" style={{ color: "#ffaaaa" }}>Call Us Now</div>
                  <a href="tel:+912342312323" className="font-bold text-sm text-white">(234) 231-2323</a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push("/services")}
                  className="font-bold py-2 px-5 text-xs flex items-center gap-1.5"
                  style={{ backgroundColor: "#FFFFFF", color: "#8B0000" }}
                >
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Wrap in Suspense (required for useSearchParams in Next.js App Router) ────
export default function OurServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#111111" }}>
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ServicesInner />
    </Suspense>
  );
}
