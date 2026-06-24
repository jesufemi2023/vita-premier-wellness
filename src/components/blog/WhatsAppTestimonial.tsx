import React, { useState, useEffect } from 'react';
import { Phone, Video, MoreVertical, Send, Check, CheckCheck, Smile, Paperclip, Camera, Mic, Play, Pause, RefreshCw, ShoppingCart, ShieldCheck } from 'lucide-react';

interface Message {
  sender: 'customer' | 'consultant';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatScript {
  name: string;
  location: string;
  avatarText: string;
  avatarColor: string;
  topic: string;
  messages: Message[];
}

interface WhatsAppTestimonialProps {
  category?: string;
  postTitle?: string;
  onOrderClick?: () => void;
  packageName?: string;
}

export function WhatsAppTestimonial({ category = '', postTitle = '', onOrderClick, packageName }: WhatsAppTestimonialProps) {
  // Select matching script based on category
  const normalizedCategory = category.toLowerCase();
  const normalizedTitle = postTitle.toLowerCase();

  const scripts: Record<string, ChatScript> = {
    fertility: {
      name: "Mrs. Chioma",
      location: "Lagos, NG",
      avatarText: "CO",
      avatarColor: "bg-emerald-600",
      topic: "Pregnancy & Fibroid Success",
      messages: [
        { sender: 'customer', text: "Good morning doctor. I have good news! 🙏😭", time: "09:14 AM" },
        { sender: 'consultant', text: "Good morning Mrs. Chioma! Hope you are doing well? Please tell us! 😊", time: "09:15 AM", status: 'read' },
        { sender: 'customer', text: "Yes o! Remember the Fertility & Fibroid package I ordered last month? My periods started on time and the heavy pain is completely gone.", time: "09:17 AM" },
        { sender: 'customer', text: "I went for a scan yesterday at the General Hospital. The doctor was so confused. The fibroid has shrunk from 7.2cm to less than 1.8cm! No surgery needed again!", time: "09:19 AM" },
        { sender: 'consultant', text: "Glory be to God! This is wonderful news. The GHT products are highly potent. Did you finish the entire package?", time: "09:20 AM", status: 'read' },
        { sender: 'customer', text: "Not even finished yet! I have one week left. My husband and I are so happy. We are ordering another package for my sister-in-law. Please send your account details.", time: "09:22 AM" },
        { sender: 'consultant', text: "We are extremely happy for you. Yes, we will prepare and ship the new package immediately today!", time: "09:23 AM", status: 'read' }
      ]
    },
    diabetes: {
      name: "Alhaji Umar",
      location: "Kano, NG",
      avatarText: "AU",
      avatarColor: "bg-indigo-600",
      topic: "Diabetes & High BP Normalization",
      messages: [
        { sender: 'customer', text: "Salam, consultant. I want to thank you for the GHT BP and Diabetes combo.", time: "08:30 AM" },
        { sender: 'consultant', text: "Wa Alaikum Salam, Alhaji Umar. How is your health now?", time: "08:32 AM", status: 'read' },
        { sender: 'customer', text: "For 6 years my fasting sugar was never below 180. Always 200+. Yesterday morning I checked, it was 95! 95 after only 3 weeks on the herbs!", time: "08:35 AM" },
        { sender: 'customer', text: "My BP is also 120/78 today. I feel so light and active. Even the numbness in my feet is gone completely.", time: "08:36 AM" },
        { sender: 'consultant', text: "Alhamdulillah! This is what we call deep cellular rejuvenation. Continue the dosage strictly. Avoid heavy starch.", time: "08:38 AM", status: 'read' },
        { sender: 'customer', text: "Yes, I am following the plan. I want to buy 3 more sets for my friends at the office. Everyone is asking me my secret!", time: "08:40 AM" }
      ]
    },
    joint: {
      name: "Elder Joseph",
      location: "Enugu, NG",
      avatarText: "EJ",
      avatarColor: "bg-amber-600",
      topic: "Severe Arthritis & Joint Recovery",
      messages: [
        { sender: 'customer', text: "Hello GHT support. God bless your team.", time: "11:05 AM" },
        { sender: 'consultant', text: "Amen! Hello Elder Joseph. Hope you are walking more comfortably now?", time: "11:07 AM", status: 'read' },
        { sender: 'customer', text: "Comfortably? I can walk to the junction and back without any support! The severe knee pain that kept me awake at night is 90% gone.", time: "11:10 AM" },
        { sender: 'customer', text: "I can bend my knees and pray properly now. The Ca-Mg plus and the liquid calcium are like magic.", time: "11:12 AM" },
        { sender: 'consultant', text: "Wonderful! We are so glad to hear this. Consistent use rebuilds the cartilage.", time: "11:15 AM", status: 'read' },
        { sender: 'customer', text: "I am telling all my church elders about this. Please prepare another order for me so I don't run out.", time: "11:17 AM" }
      ]
    },
    general: {
      name: "Chief Mrs. Florence",
      location: "Port Harcourt, NG",
      avatarText: "FC",
      avatarColor: "bg-pink-600",
      topic: "Total Detox & Weight Shedding",
      messages: [
        { sender: 'customer', text: "Good afternoon dear. Just wanted to drop a quick feedback.", time: "02:15 PM" },
        { sender: 'consultant', text: "Good afternoon Chief! We appreciate you checking in. How do you feel?", time: "02:17 PM", status: 'read' },
        { sender: 'customer', text: "My digestion has never been this smooth. The constant bloating and chronic fatigue are gone. I have lost 4.5kg of pure waste and water weight in 2 weeks!", time: "02:20 PM" },
        { sender: 'customer', text: "My skin is glowing too. Everyone is saying I look 10 years younger. GHT is indeed the best.", time: "02:22 PM" },
        { sender: 'consultant', text: "That is the power of the high-purity GHT active herbal blends. Keep glowing!", time: "02:25 PM", status: 'read' },
        { sender: 'customer', text: "Please send the second batch of the detox tea. My friends are begging to buy from me.", time: "02:27 PM" }
      ]
    }
  };

  // Select script
  let activeScript = scripts.general;
  if (normalizedCategory.includes('fertility') || normalizedCategory.includes('womb') || normalizedCategory.includes('fibroid') || normalizedTitle.includes('fertility') || normalizedTitle.includes('pregnancy') || normalizedTitle.includes('fibroid') || normalizedTitle.includes('woman') || normalizedTitle.includes('conceive')) {
    activeScript = scripts.fertility;
  } else if (normalizedCategory.includes('diabet') || normalizedCategory.includes('sugar') || normalizedCategory.includes('pressure') || normalizedCategory.includes('hypertension') || normalizedTitle.includes('diabet') || normalizedTitle.includes('sugar') || normalizedTitle.includes('bp') || normalizedTitle.includes('hypertension')) {
    activeScript = scripts.diabetes;
  } else if (normalizedCategory.includes('joint') || normalizedCategory.includes('arthritis') || normalizedCategory.includes('bone') || normalizedCategory.includes('pain') || normalizedTitle.includes('joint') || normalizedTitle.includes('arthritis') || normalizedTitle.includes('bone')) {
    activeScript = scripts.joint;
  }

  // Animation logic
  const [visibleCount, setVisibleCount] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    if (visibleCount < activeScript.messages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setVisibleCount(prev => prev + 1);
      }, 3500); // 3.5s delay for realistic typing representation
      return () => clearTimeout(timer);
    } else {
      // Loop with delay
      const loopTimer = setTimeout(() => {
        setVisibleCount(2);
      }, 8000);
      return () => clearTimeout(loopTimer);
    }
  }, [visibleCount, isPlaying, activeScript]);

  return (
    <div className="my-10 max-w-lg mx-auto bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-800 relative overflow-hidden">
      {/* Speaker and Camera notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-2xl z-20 flex justify-center items-center gap-2">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
        <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
      </div>

      {/* Screen Wrapper */}
      <div className="bg-[#efeae2] rounded-[2.2rem] overflow-hidden relative border border-slate-700/10 min-h-[500px] flex flex-col pt-3">
        {/* WhatsApp Header */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${activeScript.avatarColor} shadow-inner`}>
              {activeScript.avatarText}
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-1.5">
                {activeScript.name} 
                <span className="text-[9px] bg-[#128c7e] text-white px-1.5 py-0.5 rounded font-medium">{activeScript.location}</span>
              </div>
              <div className="text-[10px] text-emerald-100/90 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <Video size={18} className="cursor-pointer hover:text-white" />
            <Phone size={16} className="cursor-pointer hover:text-white" />
            <MoreVertical size={16} className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Encrypted Disclaimer */}
        <div className="p-3 text-center">
          <span className="inline-block bg-[#ffeecd] text-[#554225] text-[9.5px] font-bold px-3 py-1.5 rounded-lg shadow-sm leading-relaxed max-w-[90%]">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </span>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 flex flex-col justify-end min-h-[350px]">
          {activeScript.messages.slice(0, visibleCount).map((msg, index) => {
            const isMe = msg.sender === 'consultant';
            return (
              <div 
                key={index} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm relative ${
                  isMe 
                    ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none'
                }`}>
                  <p className="font-medium leading-relaxed break-words whitespace-pre-line pr-10">{msg.text}</p>
                  
                  {/* Timestamp & Tick status */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                    <span>{msg.time}</span>
                    {isMe && (
                      msg.status === 'read' ? (
                        <CheckCheck size={13} className="text-sky-500" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck size={13} className="text-slate-400" />
                      ) : (
                        <Check size={13} className="text-slate-400" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Realistic Live Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start w-full">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Fake Input bar */}
        <div className="p-2.5 bg-[#f0f0f0] flex items-center gap-2 border-t border-slate-200">
          <div className="flex-1 bg-white rounded-full px-3.5 py-2 flex items-center gap-2.5 text-slate-400 shadow-sm border border-slate-100">
            <Smile size={20} className="text-slate-400 cursor-pointer" />
            <input 
              type="text" 
              readOnly 
              placeholder="Type a message" 
              className="w-full bg-transparent text-xs text-slate-600 font-bold outline-none border-none select-none"
            />
            <Paperclip size={18} className="text-slate-400 cursor-pointer -rotate-45" />
            <Camera size={18} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white shadow-md">
            <Mic size={18} />
          </div>
        </div>
      </div>

      {/* Controller overlay */}
      <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 border border-slate-700/50 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-[#128c7e] flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
            title={isPlaying ? "Pause conversation" : "Play conversation"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <span>{isPlaying ? 'Live Simulation Active' : 'Simulation Paused'}</span>
        </div>

        <button 
          onClick={() => setVisibleCount(2)}
          className="text-slate-400 hover:text-white flex items-center gap-1 font-bold transition-colors"
        >
          <RefreshCw size={12} /> Reset Chat
        </button>
      </div>

      {/* Instant Action Button */}
      {onOrderClick && (
        <div className="mt-4">
          <button 
            onClick={onOrderClick}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-950/40 border border-red-500/30"
          >
            <ShoppingCart size={15} />
            Order {packageName || 'Recommended Package'} Now
          </button>
          <div className="text-center mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
            <ShieldCheck size={11} className="text-emerald-500" />
            <span>100% Genuine GHT Solution Guaranteed</span>
          </div>
        </div>
      )}
    </div>
  );
}
