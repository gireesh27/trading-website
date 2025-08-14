"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextRevealCard } from "@/components/ui/text-reveal";
import { FocusCards } from "@/components/ui/focused-cards";
import Link from "next/link";
import {
  BarChart3,
  Zap,
  Shield,
  Smartphone,
  Globe,
  TrendingUp,
  Coins,
} from "lucide-react";
import { BoxesCore } from "@/components/ui/background-boxes";
import { TextGenerateEffect } from "../ui/Text-Generate-Effect";
// Framer Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};
const cards = [
  {
    title: "Advanced Charting",
    src: "/images/chart-bg.jpg", 
    content: {
      desc: "Professional-grade charts with 50+ technical indicators.",
      icon: <BarChart3 className="h-10 w-10 text-blue-500" />,
    },
  },
  {
    title: "Real-time Data",
    src: "/images/realtime-bg.jpg",
    content: {
      desc: "Live data via WebSocket streaming with millisecond latency.",
      icon: <Zap className="h-10 w-10 text-green-500" />,
    },
  },
  {
    title: "Secure Trading",
    src: "/images/security-bg.jpg",
    content: {
      desc: "Bank-grade encrypted wallet & transaction security.",
      icon: <Shield className="h-10 w-10 text-purple-500" />,
    },
  },
  {
    title: "Mobile First",
    src: "/images/mobile-bg.jpg",
    content: {
      desc: "Fully responsive PWA across all mobile + desktop screens.",
      icon: <Smartphone className="h-10 w-10 text-orange-500" />,
    },
  },
  {
    title: "Global Markets",
    src: "/images/global-bg.jpg",
    content: {
      desc: "Access NSE, BSE, NYSE, NASDAQ and more in one place.",
      icon: <Globe className="h-10 w-10 text-cyan-500" />,
    },
  },
    {
    title: "Crypto",
    src: "/images/crypto-bg.jpg",
    content: {
      desc: "Track and trade cryptocurrencies in real-time.", 
      icon: <Coins className="h-10 w-10 text-yellow-500" />,
    },
  },
];
export function EnhancedSections() {
  return (
    <>
      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-[#0e0f1a] to-[#1a1f2e] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold mb-4 glow-text">
              <TextRevealCard
                text="Everything You Need to Trade — All in One Place"
                revealText="From First Trade to Full Portfolio — We’ve Got You Covered"
              />
            </h2>
            <div className="text-xl font-bold mx-auto text-center text-gray-300">
              <TextGenerateEffect
                words={
                  "Unlock powerful, intuitive tools crafted for both beginners taking their first steps and professionals aiming for peak performance"
                }
                 className=""
              />
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <FocusCards
              cards={cards.map((card, i) => ({
                title: card.title,
                src: card.src,
                renderContent: () => (
                  <div className="p-6 text-white flex flex-col gap-3">
                    {card.content.icon}
                    <h3 className="text-xl font-semibold">{card.title}</h3>
                    <p className="text-gray-300 text-sm">{card.content.desc}</p>
                  </div>
                ),
              }))}
            />
          </motion.div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 bg-black/80 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              ["1M+", "Active Traders", "text-blue-500"],
              ["₹50B+", "Daily Volume", "text-green-500"],
              ["99.9%", "Uptime", "text-purple-500"],
              ["24/7", "Support", "text-orange-500"],
            ].map(([stat, label, color], i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
              >
                <div>
                  <div className={`text-4xl font-bold mb-2 ${color}`}>
                    {stat}
                  </div>
                  <div className="text-gray-300">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        {/* Animated background boxes */}
        <BoxesCore className="absolute inset-0 z-0" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0}
            className="text-4xl font-extrabold mb-4"
          >
            Ready to Start Trading?
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1}
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of traders who trust TradeView for their investment
            journey
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            custom={2}
          >
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-md"
              >
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black text-gray-300 py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">TradeView</span>
              </div>
              <p className="text-gray-400">
                Professional trading platform for modern investors.
              </p>
            </div>
            {[
              ["Platform", ["Trading", "Portfolio", "Analytics", "Mobile App"]],
              ["Support", ["Help Center", "Contact Us", "API Docs", "Status"]],
              [
                "Legal",
                [
                  "Privacy Policy",
                  "Terms of Service",
                  "Risk Disclosure",
                  "Compliance",
                ],
              ],
            ].map(([title, links], i) => (
              <div key={i}>
                <h3 className="text-white font-semibold mb-4">{title}</h3>
                <ul className="space-y-2 text-gray-400">
                  {(links as string[]).map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-all">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            &copy; 2025 Trade-View. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
