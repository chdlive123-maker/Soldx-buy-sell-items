import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Tag, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Sparkles,
  ArrowLeft,
  DollarSign,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Conversation, ChatMessage } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => void;
  onAcceptOffer?: (conversationId: string, messageId: string) => void;
  onDeclineOffer?: (conversationId: string, messageId: string) => void;
  onCounterOffer?: (conversationId: string, messageId: string, counterAmount: number) => void;
  onViewListing?: (listingId: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
  onViewListing,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMobileList, setShowMobileList] = useState(!activeConversationId);
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);
  const [offerInput, setOfferInput] = useState<number | ''>('');
  
  // Counter-offer modal/drawer state
  const [counterTargetMsgId, setCounterTargetMsgId] = useState<string | null>(null);
  const [counterInput, setCounterInput] = useState<number | ''>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentConv) return;
    onSendMessage(currentConv.id, inputText.trim());
    setInputText('');
  };

  const handleSendQuickChip = (text: string) => {
    if (!currentConv) return;
    onSendMessage(currentConv.id, text);
  };

  const handleSendOffer = (amount: number) => {
    if (!currentConv || !amount) return;
    const discount = Math.round(((currentConv.listingPrice - amount) / currentConv.listingPrice) * 100);
    const text = discount > 0 
      ? `I'd like to offer ${formatCurrency(amount, currentConv.currency)} (${discount}% off listed price). Can we make a deal?`
      : `I'd like to offer ${formatCurrency(amount, currentConv.currency)}.`;

    onSendMessage(currentConv.id, text, true, amount);
    setOfferInput('');
    setShowOfferDrawer(false);
  };

  const handleCustomOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offerInput && typeof offerInput === 'number') {
      handleSendOffer(offerInput);
    }
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterTargetMsgId || !counterInput || !currentConv) return;
    
    if (onCounterOffer) {
      onCounterOffer(currentConv.id, counterTargetMsgId, Number(counterInput));
    } else {
      onSendMessage(
        currentConv.id,
        `How about a counter-offer of ${formatCurrency(Number(counterInput), currentConv.currency)}? That is my best final price.`,
        true,
        Number(counterInput)
      );
    }
    setCounterTargetMsgId(null);
    setCounterInput('');
  };

  const isFreeConnect = currentConv ? currentConv.listingPrice <= 0 : false;

  const bargainingPrompts = isFreeConnect
    ? [
        'Hi! Loved your profile, would love to connect.',
        'Where in town do you enjoy grabbing coffee?',
        'Hey! Tell me a little more about your interests.',
        'Are you free for a casual cafe meetup this weekend?',
      ]
    : [
        'Is the price negotiable?',
        'What is your lowest cash price today?',
        'Can I come inspect and pay right now?',
        'Are original invoice and warranty included?',
        'I can pick it up in 1 hour if you agree!',
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[88vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95">
        
        {/* Top Header */}
        <div className="bg-[#002f34] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#23e5db]" />
            <div>
              <h2 className="font-extrabold text-base tracking-tight">SOLDX Chat & Connect Center</h2>
              <p className="text-[11px] text-gray-300 hidden sm:block">Message members, buyers and sellers safely in real time</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content split into Inbox & Active Thread */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Conversation List */}
          <div
            className={`w-full sm:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 ${
              !showMobileList && 'hidden sm:flex'
            }`}
          >
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Conversations ({conversations.length})
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active conversations yet. Click "Chat with Seller" on any ad!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = currentConv?.id === conv.id;
                  const hasAgreed = !!conv.agreedPrice;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        setShowMobileList(false);
                      }}
                      className={`p-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-slate-100 ${
                        isSelected ? 'bg-cyan-50/70 border-l-4 border-[#002f34]' : ''
                      }`}
                    >
                      <img
                        src={conv.listingImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {conv.sellerName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{conv.lastTimestamp}</span>
                        </div>

                        <p className="text-[11px] font-semibold text-cyan-900 truncate">
                          {formatCurrency(conv.listingPrice, conv.currency)} • {conv.listingTitle}
                        </p>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-slate-500 truncate flex-1">
                            {conv.lastMessage}
                          </p>
                          {hasAgreed && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0 ml-1">
                              DEAL FIXED
                            </span>
                          )}
                        </div>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#23e5db] text-[#002f34] text-[10px] font-black flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat View */}
          {currentConv ? (
            <div
              className={`flex-1 flex flex-col bg-white overflow-hidden ${
                showMobileList && 'hidden sm:flex'
              }`}
            >
              {/* Active Conversation Top Bar */}
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="sm:hidden p-1 text-slate-600 hover:bg-slate-200 rounded"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={currentConv.sellerAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {currentConv.sellerName}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden md:inline">· Verified Member</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentConv.listingTitle} ·{' '}
                      <strong className="text-slate-900">
                        {isFreeConnect ? 'Free Connect (18+)' : formatCurrency(currentConv.listingPrice, currentConv.currency)}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isFreeConnect && (
                    <button
                      onClick={() => setShowOfferDrawer(!showOfferDrawer)}
                      className="text-xs font-bold text-[#002f34] bg-white border border-[#002f34] px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#002f34]" />
                      <span>Make Offer</span>
                    </button>
                  )}

                  <button
                    onClick={() => onViewListing && onViewListing(currentConv.listingId)}
                    className="text-xs font-bold text-white bg-[#002f34] px-2.5 py-1.5 rounded-lg hover:bg-[#00474e] transition-colors cursor-pointer"
                  >
                    View Ad
                  </button>
                </div>
              </div>

              {/* Bargaining Quick Discount Bar (Only for priced marketplace items) */}
              {!isFreeConnect && (
                <div className="bg-cyan-50/70 border-b border-cyan-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
                  <div className="flex items-center gap-1.5 text-cyan-950 font-bold shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                    <span className="text-[11px]">Quick Bargain:</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[5, 10, 15, 20].map((pct) => {
                      const discounted = Math.round(currentConv.listingPrice * (1 - pct / 100));
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleSendOffer(discounted)}
                          className="px-2 py-1 bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded font-semibold text-[10px] shrink-0 transition-colors cursor-pointer"
                        >
                          {pct}% Off ({formatCurrency(discounted, currentConv.currency)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
                {currentConv.messages.map((msg) => {
                  const isBuyer = msg.sender === 'buyer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs shadow-2xs leading-relaxed ${
                          isBuyer
                            ? 'bg-[#002f34] text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        {/* SPECIAL BARGAINING OFFER CARD */}
                        {msg.isOffer ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/20">
                              <div className="flex items-center gap-1.5 font-black text-[#ffce32]">
                                <Tag className="w-4 h-4" />
                                <span>OFFER: {formatCurrency(msg.offerAmount || 0, currentConv.currency)}</span>
                              </div>
                              {msg.offerStatus === 'accepted' ? (
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> ACCEPTED
                                </span>
                              ) : msg.offerStatus === 'declined' ? (
                                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                  DECLINED
                                </span>
                              ) : msg.offerStatus === 'countered' ? (
                                <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                  COUNTERED ({formatCurrency(msg.counterAmount || 0, currentConv.currency)})
                                </span>
                              ) : (
                                <span className="bg-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> PENDING
                                </span>
                              )}
                            </div>

                            <p className="text-xs">{msg.text}</p>

                            {/* Actions for Offer (Accept / Counter / Decline) */}
                            {msg.offerStatus === 'pending' && (
                              <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/10">
                                <button
                                  type="button"
                                  onClick={() => onAcceptOffer && onAcceptOffer(currentConv.id, msg.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Accept Offer</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounterTargetMsgId(msg.id);
                                    setCounterInput(Math.round((msg.offerAmount || currentConv.listingPrice) * 1.05));
                                  }}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Counter Offer</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeclineOffer && onDeclineOffer(currentConv.id, msg.id)}
                                  className="px-2 py-1 bg-red-600/80 hover:bg-red-700 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                        <span>{msg.timestamp}</span>
                        {isBuyer && <CheckCheck className="w-3 h-3 text-cyan-600" />}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {currentConv.isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] font-medium">{currentConv.sellerName} is typing a response...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Bargaining Chips Carousel */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-1.5 shrink-0">
                {bargainingPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuickChip(prompt)}
                    className="whitespace-nowrap text-[10px] font-medium px-2.5 py-1 bg-white hover:bg-cyan-50 hover:text-cyan-900 border border-slate-200 rounded-full transition-colors shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Counter-Offer Popup Drawer */}
              {counterTargetMsgId && (
                <form onSubmit={handleSendCounter} className="p-3 bg-amber-50 border-t border-amber-200 flex items-center gap-2 animate-in fade-in shrink-0">
                  <span className="text-xs font-bold text-amber-900 shrink-0">Counter Offer (₹):</span>
                  <input
                    type="number"
                    placeholder="Enter counter price"
                    value={counterInput}
                    onChange={(e) => setCounterInput(e.target.value ? Number(e.target.value) : '')}
                    className="w-36 px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Send Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterTargetMsgId(null)}
                    className="text-xs text-slate-600 hover:text-slate-900 px-1"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Custom Offer Drawer */}
              {showOfferDrawer && (
                <form onSubmit={handleCustomOfferSubmit} className="p-3 bg-cyan-50 border-t border-cyan-200 flex items-center gap-2 animate-in fade-in shrink-0">
                  <span className="text-xs font-bold text-[#002f34] shrink-0">Custom Offer (₹):</span>
                  <input
                    type="number"
                    placeholder={`e.g. ${Math.round(currentConv.listingPrice * 0.9)}`}
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value ? Number(e.target.value) : '')}
                    className="w-40 px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#002f34] hover:bg-[#00474e] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Send Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferDrawer(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 px-1"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Bottom input bar */}
              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  {!isFreeConnect && (
                    <button
                      type="button"
                      onClick={() => setShowOfferDrawer(!showOfferDrawer)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Bargain / Make Offer"
                    >
                      <Tag className="w-4 h-4 text-[#002f34]" />
                      <span className="hidden sm:inline">Offer</span>
                    </button>
                  )}

                  <input
                    type="text"
                    placeholder={isFreeConnect ? 'Say hello and introduce yourself...' : 'Type your message or negotiate price...'}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-[#002f34] text-white rounded-lg hover:bg-[#00474e] disabled:opacity-40 transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation from the left to start messaging
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
