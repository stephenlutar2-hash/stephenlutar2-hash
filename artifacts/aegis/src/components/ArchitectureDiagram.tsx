import React from "react";
import { motion } from "framer-motion";
import { Shield, Server, Database, Cloud } from "lucide-react";

export function ArchitectureDiagram() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-square md:aspect-video flex items-center justify-center py-12">
      {/* Orbital Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-[80%] aspect-square rounded-full border border-primary/20 absolute animate-[spin_60s_linear_infinite]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="w-[50%] aspect-square rounded-full border border-primary/40 absolute animate-[spin_40s_linear_infinite_reverse]"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Central Aegis Core */}
        <motion.div variants={itemVariants} className="absolute z-20 flex flex-col items-center justify-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background border-2 border-primary box-glow flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <Shield className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          </div>
          <div className="mt-4 font-display font-bold tracking-widest text-primary text-xl">AEGIS CORE</div>
        </motion.div>

        {/* Orbiting Elements */}
        {/* Beacon */}
        <motion.div variants={itemVariants} className="absolute top-[10%] left-[20%] md:top-[15%] md:left-[25%] z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-primary/30">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div className="mt-2 text-sm font-semibold tracking-wider text-muted-foreground">BEACON</div>
        </motion.div>

        {/* Nimbus */}
        <motion.div variants={itemVariants} className="absolute top-[10%] right-[20%] md:top-[15%] md:right-[25%] z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-primary/30">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <div className="mt-2 text-sm font-semibold tracking-wider text-muted-foreground">NIMBUS</div>
        </motion.div>

        {/* Zeus */}
        <motion.div variants={itemVariants} className="absolute bottom-[10%] left-[50%] -translate-x-1/2 md:bottom-[15%] z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-primary/30">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div className="mt-2 text-sm font-semibold tracking-wider text-muted-foreground">ZEUS</div>
        </motion.div>

        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.line 
            x1="50%" y1="50%" x2="25%" y2="25%" 
            stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 1 }}
          />
          <motion.line 
            x1="50%" y1="50%" x2="75%" y2="25%" 
            stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 1 }}
          />
          <motion.line 
            x1="50%" y1="50%" x2="50%" y2="80%" 
            stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
