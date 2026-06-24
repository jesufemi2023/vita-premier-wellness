import React, { useEffect, useState } from 'react';
import { BlogPost as BlogPostType } from '../../types';
import { ArrowLeft, Calendar, Tag, Share2, CheckCircle2, Star, ShieldCheck, Truck, Clock, UserCheck, Phone, ShoppingCart } from 'lucide-react';
import { CONFIG } from '../../config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import { trackBlogView } from '../../lib/analytics';
import { WhatsAppTestimonial } from './WhatsAppTestimonial';

interface BlogPostProps {
  id: string;
  onBack: () => void;
  onOrderPackage?: (pkg: any) => void;
}

export function BlogPost({ id, onBack, onOrderPackage }: BlogPostProps) {
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 35 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: 14, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    if (!post) return;
    const shareUrl = `${window.location.origin}/?blog=${post.slug || post.id}`;
    const shareData = {
      title: post.title,
      text: post.meta_description || post.title,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          trackBlogView(data.title);
        }
      } catch (e) {
        console.error("Failed to fetch blog post", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-32 bg-slate-50 min-h-screen">
        <h3 className="text-2xl font-black text-slate-900">Article not found</h3>
        <button onClick={onBack} className="mt-6 text-emerald-600 font-bold hover:underline">
          &larr; Back to all articles
        </button>
      </div>
    );
  }

  // Calculate reading time
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Custom renderer for markdown
  const components = {
    blockquote: ({ node, children, ...props }: any) => {
      const text = String(children).toLowerCase();
      const isCustomer = text.includes('customer:') || text.includes('client:');
      const isBrand = text.includes('brand:') || text.includes('consultant:') || text.includes('expert:');

      if (isCustomer || isBrand) {
        const isUser = isCustomer;
        return (
          <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
              isUser 
                ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm' 
                : 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tr-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isUser ? 'bg-slate-200 text-slate-600' : 'bg-emerald-200 text-emerald-700'}`}>
                  {isUser ? 'C' : 'E'}
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest opacity-60">
                  {isUser ? 'Verified Customer' : 'Health Expert'}
                </div>
              </div>
              <div className="text-base font-medium leading-relaxed">
                {children}
              </div>
            </div>
          </div>
        );
      }

      return (
        <blockquote className="border-l-4 border-emerald-500 pl-6 py-2 my-8 italic text-xl font-medium text-slate-700 bg-emerald-50/30 rounded-r-xl" {...props}>
          {children}
        </blockquote>
      );
    },
    h1: ({ node, ...props }: any) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-12 mb-6 tracking-tight" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6 tracking-tight border-b border-slate-100 pb-4" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-8 mb-4" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-lg text-slate-600 leading-relaxed mb-6" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-6 space-y-3 text-lg text-slate-600 marker:text-emerald-500" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-lg text-slate-600 marker:text-emerald-500 font-medium" {...props} />,
    li: ({ node, ...props }: any) => <li className="pl-2" {...props} />,
    a: ({ node, ...props }: any) => <a className="text-emerald-600 font-bold hover:text-emerald-700 underline decoration-emerald-200 underline-offset-4 transition-colors" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-slate-900" {...props} />,
  };

  return (
    <article className="bg-white min-h-screen pb-32 md:pb-24 font-sans">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>
          {post.recommended_package && (
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => {
                  const message = `Hello SD GHT Health Care, I am reading the article "${post.title}" and I am interested in the ${post.recommended_package.name} solution. Could you please provide more information?`;
                  window.open(`https://wa.me/${CONFIG.company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                <Phone size={14} className="text-emerald-600" />
                Chat with us
              </button>
              <button 
                onClick={() => onOrderPackage && onOrderPackage(post.recommended_package)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors"
              >
                Order Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Hero Section */}
      <header className="max-w-4xl mx-auto px-4 md:px-8 pt-12 pb-8 text-center">
        {post.category && (
          <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
            {post.category}
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500 border-y border-slate-100 py-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-500" />
            <span className="text-slate-700 font-bold">Medically Reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} />
            {readingTime} min read
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mb-12">
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-xl shadow-slate-200/50 border border-slate-100">
          <img 
            src={getOptimizedImageUrl(post.image_url || `https://picsum.photos/seed/supplement-hero-${post.id}/1920/1080`, 1200)} 
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/healthcare-hero-${post.id}/1200/675`;
            }}
          />
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 relative">
          
          {/* Left Column: Article Content */}
          <div className="w-full lg:w-[65%] xl:w-[70%]">
            <div className="prose prose-lg prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Dynamic Interactive WhatsApp Feedback Chat (Social Proof) */}
            <div className="mt-12">
              <div className="border-l-4 border-emerald-500 pl-4 py-1 mb-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Real-Time Patient Feedback</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live WhatsApp chat feedback from a verified user</p>
              </div>
              <WhatsAppTestimonial 
                category={post.category || ''} 
                postTitle={post.title} 
                onOrderClick={post.recommended_package ? () => onOrderPackage && onOrderPackage(post.recommended_package) : undefined}
                packageName={post.recommended_package?.name}
              />
            </div>

            {/* Curated High-Conversion Written Testimonials */}
            <div className="mt-12 space-y-6">
              <div className="border-l-4 border-emerald-500 pl-4 py-1">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Verified Patient Success Stories</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Real people. Real results. Verified by medical records.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Testimonial 1 */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded ml-2 uppercase tracking-wide">Verified Purchase</span>
                    </div>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                      "I spent over ₦600,000 on hospital visits and different drugs for my chronic infection and irregular cycle. Nothing worked until my colleague recommended GHT. Within 2 weeks of using the recommended combo, the constant itching stopped, and my cycle became perfectly regular. Three months later, I got my positive pregnancy test! God bless this company!"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60 mt-6">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-black text-sm rounded-full flex items-center justify-center">
                      MA
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Mrs. Mary Adebayo</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ikeja, Lagos</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded ml-2 uppercase tracking-wide">Verified Purchase</span>
                    </div>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                      "My father's blood pressure was dangerously high at 180/110, causing severe headaches and dizziness. He was taking 3 different prescription pills with bad side effects. We got him the GHT Cardiovascular Wellness combo. Today, his average BP reading is 122/80! He is energetic, happy, and walks 2 kilometers every morning. This is truly a miraculous formula."
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60 mt-6">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-black text-sm rounded-full flex items-center justify-center">
                      EO
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Engr. Obinna Okoye</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Port Harcourt, Rivers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad-Focused High-Conversion Section */}
            {post.recommended_package && (
              <div className="mt-12 bg-gradient-to-br from-[#0c2a1c] to-slate-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-emerald-500/20">
                {/* Background lighting flare */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                      Limited Time Promo Offer
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
                      98% Success Rate
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
                      Order the <span className="text-emerald-400">{post.recommended_package.name}</span> Today & Enjoy Permanent Relief!
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                      Join over 14,800+ Nigerians who have successfully treated their health issues permanently with GHT organic premium herbal treatments. No surgery. No side effects.
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="text-emerald-400 shrink-0" size={24} />
                      <div>
                        <p className="text-xs font-black uppercase text-slate-200 tracking-wider">Hurry! Special discount closes in</p>
                        <p className="text-[10px] text-emerald-300 font-bold">Offer is only valid for readers of this health report.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <div className="bg-red-600 px-3 py-2 rounded-xl text-center min-w-[50px] shadow-lg shadow-red-950/50">
                        <span className="text-xl font-black block leading-none text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[8px] font-black uppercase text-red-200">Mins</span>
                      </div>
                      <span className="text-2xl font-black text-red-500 animate-pulse">:</span>
                      <div className="bg-red-600 px-3 py-2 rounded-xl text-center min-w-[50px] shadow-lg shadow-red-950/50">
                        <span className="text-xl font-black block leading-none text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[8px] font-black uppercase text-red-200">Secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Comparison */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Standard Price</span>
                      <span className="text-lg font-bold text-slate-400 line-through">
                        ₦{Math.round(post.recommended_package.price / 0.8).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 col-span-1">
                      <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block mb-1">Today's Deal</span>
                      <span className="text-2xl font-black text-emerald-400">
                        ₦{post.recommended_package.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2 md:col-span-1 flex flex-col justify-center">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1 font-mono">Bonus included</span>
                      <span className="text-xs font-bold text-emerald-300">Free Weekly Follow-ups</span>
                    </div>
                  </div>

                  {/* Premium Bullet benefits */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                      <span><b>FREE SHIPPING + PAY ON DELIVERY:</b> Pay only when the delivery agent brings the package to your doorstep in any state in Nigeria. No deposit required.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                      <span><b>100% GENUINE & HERBAL:</b> Pure cellular extract formulations certified by NAFDAC, zero chemicals, safe for all ages.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                      <span><b>FREE RECOVERY CONSULTATION:</b> Our licensed health practitioners will monitor you weekly throughout your treatment course.</span>
                    </div>
                  </div>

                  {/* Huge conversion triggers / buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => onOrderPackage && onOrderPackage(post.recommended_package)}
                      className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart size={18} />
                      Click to Order Now (Instant Form)
                    </button>
                    <button
                      onClick={() => {
                        const message = `Hello SD GHT Health Care, I am reading the article "${post.title}" and I am ready to order the "${post.recommended_package.name}" deal of ₦${post.recommended_package.price.toLocaleString()}. Please arrange my order.`;
                        window.open(`https://wa.me/${CONFIG.company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex-1 h-14 bg-[#25d366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <Phone size={18} />
                      Order Directly via WhatsApp
                    </button>
                  </div>

                  <div className="text-center text-[11px] text-slate-400 flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 border-t border-white/5 font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-400" /> Secure Checkout</span>
                    <span className="flex items-center gap-1"><Truck size={13} className="text-emerald-400" /> Free Nationwide Delivery</span>
                    <span className="flex items-center gap-1"><UserCheck size={13} className="text-emerald-400" /> NAFDAC Certified Solutions</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile/Tablet Recommended Package */}
            {post.recommended_package && (
              <div className="lg:hidden mt-12 bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50 overflow-hidden">
                <div className="bg-emerald-600 text-white text-center py-3 text-xs font-black uppercase tracking-widest">
                  Recommended Solution
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="w-full sm:w-1/3 aspect-square rounded-2xl overflow-hidden bg-slate-50 relative group">
                      <img 
                        src={getOptimizedImageUrl(post.recommended_package.package_image_url || `https://picsum.photos/seed/supplement-pkg-${post.recommended_package.id}/400/400`, 600)} 
                        alt={post.recommended_package.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/healthcare-pkg-${post.recommended_package.id}/400/400`;
                        }}
                      />
                      {post.recommended_package.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                          Save {post.recommended_package.discount}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full">
                      <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{post.recommended_package.name}</h3>
                      
                      <div className="flex items-center gap-1 text-amber-400 mb-4">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <span className="text-slate-500 text-xs font-bold ml-1 text-slate-600">(4.9/5 Reviews)</span>
                      </div>

                      <div className="space-y-3 mb-6">
                        {post.recommended_package.health_benefits?.slice(0, 3).map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-6 mb-6">
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-3xl font-black text-emerald-600">₦{post.recommended_package.price.toLocaleString()}</span>
                          {post.recommended_package.discount > 0 && (
                            <span className="text-sm font-bold text-slate-400 line-through mb-1">
                              ₦{Math.round(post.recommended_package.price / (1 - post.recommended_package.discount / 100)).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">In Stock & Ready to Ship</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            const message = `Hello SD GHT Health Care, I am reading the article "${post.title}" and I am interested in the ${post.recommended_package.name} solution. Could you please provide more information?`;
                            window.open(`https://wa.me/${CONFIG.company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Phone size={18} className="text-emerald-600" />
                          Chat with us
                        </button>
                        <button 
                          onClick={() => onOrderPackage && onOrderPackage(post.recommended_package)}
                          className="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          Order Now
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                          <ShieldCheck size={14} className="text-emerald-500" /> Secure Checkout
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                          <Truck size={14} className="text-emerald-500" /> Fast & Discreet Shipping
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags & Share */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag, i) => (
                  <span key={i} className="bg-slate-50 text-slate-600 text-[10px] px-3 py-1.5 rounded-full border border-slate-200 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-200"
              >
                {isCopied ? (
                  <><CheckCircle2 size={16} className="text-emerald-500" /> Copied!</>
                ) : (
                  <><Share2 size={16} /> Share Article</>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block w-[35%] xl:w-[30%]">
            <div className="sticky top-24 space-y-6">
              {post.recommended_package ? (
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50 overflow-hidden">
                  <div className="bg-emerald-600 text-white text-center py-3 text-xs font-black uppercase tracking-widest">
                    Recommended Solution
                  </div>
                  <div className="p-6">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-6 relative group">
                      <img 
                        src={getOptimizedImageUrl(post.recommended_package.package_image_url || `https://picsum.photos/seed/supplement-side-${post.recommended_package.id}/400/400`, 600)} 
                        alt={post.recommended_package.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/healthcare-side-${post.recommended_package.id}/400/400`;
                        }}
                      />
                      {post.recommended_package.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                          Save {post.recommended_package.discount}%
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{post.recommended_package.name}</h3>
                    
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <span className="text-slate-500 text-xs font-bold ml-1 text-slate-600">(4.9/5 Reviews)</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {post.recommended_package.health_benefits?.slice(0, 3).map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-6 mb-6">
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-black text-emerald-600">₦{post.recommended_package.price.toLocaleString()}</span>
                        {post.recommended_package.discount > 0 && (
                          <span className="text-sm font-bold text-slate-400 line-through mb-1">
                            ₦{Math.round(post.recommended_package.price / (1 - post.recommended_package.discount / 100)).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">In Stock & Ready to Ship</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const message = `Hello SD GHT Health Care, I am reading the article "${post.title}" and I am interested in the ${post.recommended_package.name} solution. Could you please provide more information?`;
                          window.open(`https://wa.me/${CONFIG.company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Phone size={18} className="text-emerald-600" />
                        Chat with us
                      </button>
                      <button 
                        onClick={() => onOrderPackage && onOrderPackage(post.recommended_package)}
                        className="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Order Now
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-500" /> Secure Checkout
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                        <Truck size={14} className="text-emerald-500" /> Fast & Discreet Shipping
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Trusted Health Information</h4>
                  <p className="text-sm text-slate-500">Our articles are written and reviewed by health professionals to ensure accuracy and safety.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA (Bottom) */}
      {post.recommended_package && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Recommended</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-emerald-600">₦{post.recommended_package.price.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => {
                const message = `Hello SD GHT Health Care, I am reading the article "${post.title}" and I am interested in the ${post.recommended_package.name} solution. Could you please provide more information?`;
                window.open(`https://wa.me/${CONFIG.company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 px-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={18} className="text-emerald-600" />
              Chat with us
            </button>
            <button 
              onClick={() => onOrderPackage && onOrderPackage(post.recommended_package)}
              className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 text-center"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
