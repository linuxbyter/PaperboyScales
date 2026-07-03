"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-border/50 backdrop-blur-xl bg-bg/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brass rounded-sm flex items-center justify-center">
              <span className="text-bg font-bold text-sm">PB</span>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Paperboy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted hover:text-ink transition-colors">Sign in</Link>
            <Link href="/signup" className="px-4 py-2 bg-brass text-bg text-sm font-medium rounded-lg hover:bg-brass-light transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brass/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ink/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              backgroundImage: `radial-gradient(circle at ${50 + scrollY * 0.02}% ${50 + scrollY * 0.05}%, rgba(191, 155, 48, 0.1) 0%, transparent 50%)` 
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-xs font-medium mb-8">
            <span className="w-2 h-2 bg-good rounded-full animate-pulse" />
            Now accepting agents in UK & Australia
          </div>

          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Future of
            <span className="block text-brass">P2P Trading</span>
          </h1>

          <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Seamless bank-to-bank transfers with verified agents. No chat, no delays — just quick actions and instant confirmations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-brass text-bg font-semibold rounded-lg hover:bg-brass-light transition-all text-lg shadow-lg shadow-brass/20"
            >
              Start Trading
            </Link>
            <Link 
              href="/agent/signup" 
              className="px-8 py-4 border border-border text-ink font-semibold rounded-lg hover:border-brass hover:text-brass transition-all text-lg"
            >
              Become an Agent
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brass mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                $<AnimatedCounter end={2500000} />
              </div>
              <div className="text-sm text-muted">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brass mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                <AnimatedCounter end={15000} />
              </div>
              <div className="text-sm text-muted">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brass mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                <AnimatedCounter end={500} />
              </div>
              <div className="text-sm text-muted">Verified Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brass mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                <AnimatedCounter end={99} />%
              </div>
              <div className="text-sm text-muted">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Why Paperboy?
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Built for speed, security, and simplicity. Trade with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 group hover:border-brass/50 transition-all">
              <div className="w-12 h-12 bg-brass/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors">
                <svg className="w-6 h-6 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted">Average trade completion under 5 minutes with quick action status buttons. No waiting around.</p>
            </div>

            <div className="card p-8 group hover:border-brass/50 transition-all">
              <div className="w-12 h-12 bg-brass/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors">
                <svg className="w-6 h-6 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
              <p className="text-muted">Direct bank transfers with verified agents. No middlemen, no crypto, just real money.</p>
            </div>

            <div className="card p-8 group hover:border-brass/50 transition-all">
              <div className="w-12 h-12 bg-brass/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors">
                <svg className="w-6 h-6 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Agents</h3>
              <p className="text-muted">Every agent is manually approved. KYC verification and bank details required before trading.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              How It Works
            </h2>
            <p className="text-muted text-lg">Three simple steps to start trading</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="card p-8 h-full">
                <div className="text-6xl font-bold text-brass/20 mb-4" style={{ fontFamily: "var(--font-display)" }}>01</div>
                <h3 className="text-xl font-semibold mb-3">Choose an Agent</h3>
                <p className="text-muted">Browse verified agents and select one with your preferred bank.</p>
              </div>
            </div>
            <div className="relative">
              <div className="card p-8 h-full">
                <div className="text-6xl font-bold text-brass/20 mb-4" style={{ fontFamily: "var(--font-display)" }}>02</div>
                <h3 className="text-xl font-semibold mb-3">Send Payment</h3>
                <p className="text-muted">Deposit directly into the agent&apos;s bank account using the provided details.</p>
              </div>
            </div>
            <div className="relative">
              <div className="card p-8 h-full">
                <div className="text-6xl font-bold text-brass/20 mb-4" style={{ fontFamily: "var(--font-display)" }}>03</div>
                <h3 className="text-xl font-semibold mb-3">Confirm & Complete</h3>
                <p className="text-muted">Agent confirms receipt and completes the trade. Track progress with status buttons.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Banks */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Supported Banks
          </h2>
          <p className="text-muted text-lg mb-12">We support major banks in the UK and Australia</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Revolut", "HSBC", "Stanbic", "Lloyds", "AMP", "ING", "ANZ", "UpBank"].map((bank) => (
              <div key={bank} className="card p-4 flex items-center justify-center hover:border-brass/50 transition-all">
                <span className="font-medium text-ink">{bank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-brass/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Start Trading?
              </h2>
              <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of traders and agents already using Paperboy Network.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 bg-brass text-bg font-semibold rounded-lg hover:bg-brass-light transition-all text-lg"
                >
                  Create Account
                </Link>
                <Link 
                  href="/agent/signup" 
                  className="px-8 py-4 border border-border text-ink font-semibold rounded-lg hover:border-brass hover:text-brass transition-all text-lg"
                >
                  Become an Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brass rounded-sm flex items-center justify-center">
              <span className="text-bg font-bold text-sm">PB</span>
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Paperboy</span>
          </div>
          <p className="text-muted text-sm"> The Future of P2P Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}