const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const COLORS = {
  bg: '#0a0a0f',
  bgCard: '#12121a',
  bgBox: '#1a1a2e',
  cyan: '#00d4ff',
  cyanDark: '#0099bb',
  gold: '#c8a84e',
  white: '#ffffff',
  lightGray: '#cccccc',
  midGray: '#888888',
  darkGray: '#333344',
  accent: '#00d4ff',
  red: '#ff4444',
  green: '#00cc88',
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const BANNERS_DIR = path.join(__dirname, 'banners');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_DIR = path.join(__dirname, 'pdf-guides');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'szl-marketing-playbook.pdf');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true,
  info: {
    Title: 'SZL Holdings — Ultimate Marketing Playbook',
    Author: 'Stephen Lutar',
    Subject: '8-Week Social Media Campaign Guide',
    Creator: 'SZL Holdings',
  },
});

const stream = fs.createWriteStream(OUTPUT_FILE);
doc.pipe(stream);

let currentY = MARGIN;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function drawPageBackground() {
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.bg);
  doc.restore();
}

function ensureSpace(needed) {
  if (currentY + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    drawPageBackground();
    currentY = MARGIN;
  }
}

function drawLine(y, color = COLORS.darkGray) {
  doc.save();
  doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor(color).lineWidth(0.5).stroke();
  doc.restore();
}

function writeTitle(text, size = 28) {
  ensureSpace(size + 20);
  doc.font('Helvetica-Bold').fontSize(size).fillColor(COLORS.cyan);
  doc.text(text, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 10;
}

function writeSubtitle(text, size = 18) {
  ensureSpace(size + 15);
  doc.font('Helvetica-Bold').fontSize(size).fillColor(COLORS.white);
  doc.text(text, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 8;
}

function writeSubheading(text, size = 14) {
  ensureSpace(size + 12);
  doc.font('Helvetica-Bold').fontSize(size).fillColor(COLORS.gold);
  doc.text(text, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 6;
}

function writeBody(text, size = 10) {
  ensureSpace(size + 8);
  doc.font('Helvetica').fontSize(size).fillColor(COLORS.lightGray);
  doc.text(text, MARGIN, currentY, { width: CONTENT_WIDTH, lineGap: 3 });
  currentY = doc.y + 6;
}

function writeBullet(text, indent = 15) {
  ensureSpace(18);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.cyan);
  doc.text('\u2022', MARGIN + indent - 12, currentY);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.lightGray);
  doc.text(text, MARGIN + indent, currentY, { width: CONTENT_WIDTH - indent });
  currentY = doc.y + 4;
}

function writeCheckbox(text, indent = 15) {
  ensureSpace(18);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.midGray);
  doc.text('[ ]', MARGIN + indent - 18, currentY);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.lightGray);
  doc.text(text, MARGIN + indent, currentY, { width: CONTENT_WIDTH - indent });
  currentY = doc.y + 4;
}

function writeNumbered(num, text, indent = 15) {
  ensureSpace(18);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.cyan);
  doc.text(`${num}.`, MARGIN + indent - 14, currentY);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.lightGray);
  doc.text(text, MARGIN + indent + 6, currentY, { width: CONTENT_WIDTH - indent - 6 });
  currentY = doc.y + 4;
}

function writeCopyBox(title, text) {
  const textHeight = doc.font('Helvetica').fontSize(9).heightOfString(text, { width: CONTENT_WIDTH - 30 });
  const boxHeight = textHeight + 40;
  ensureSpace(boxHeight + 10);

  doc.save();
  doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, boxHeight, 4).fillAndStroke(COLORS.bgBox, COLORS.cyanDark);
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.cyan);
  doc.text(title, MARGIN + 12, currentY + 8, { width: CONTENT_WIDTH - 24 });

  doc.font('Helvetica').fontSize(9).fillColor(COLORS.white);
  doc.text(text, MARGIN + 12, currentY + 22, { width: CONTENT_WIDTH - 24, lineGap: 2 });

  currentY += boxHeight + 8;
}

function writeProTip(text) {
  const textHeight = doc.font('Helvetica').fontSize(9).heightOfString(text, { width: CONTENT_WIDTH - 40 });
  const boxHeight = textHeight + 20;
  ensureSpace(boxHeight + 10);

  doc.save();
  doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, boxHeight, 4).fillAndStroke('#1a2a1a', COLORS.green);
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.green);
  doc.text('PRO TIP:', MARGIN + 12, currentY + 8);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.lightGray);
  doc.text(text, MARGIN + 70, currentY + 8, { width: CONTENT_WIDTH - 82 });

  currentY += boxHeight + 8;
}

function embedImage(imagePath, maxWidth, maxHeight) {
  if (!fs.existsSync(imagePath)) {
    writeBody(`[Image not found: ${path.basename(imagePath)}]`);
    return;
  }
  try {
    const imgWidth = Math.min(maxWidth, CONTENT_WIDTH);
    ensureSpace(maxHeight + 10);
    const xCenter = MARGIN + (CONTENT_WIDTH - imgWidth) / 2;
    doc.image(imagePath, xCenter, currentY, { width: imgWidth, height: maxHeight, fit: [imgWidth, maxHeight] });
    currentY += maxHeight + 10;
  } catch (e) {
    writeBody(`[Could not embed image: ${path.basename(imagePath)}]`);
  }
}

function newSection() {
  doc.addPage();
  drawPageBackground();
  currentY = MARGIN;
}

const WEEKS = [
  {
    num: 1, title: 'Genesis', subtitle: 'SZL Holdings (The Big Tease)',
    theme: 'Introduce the holding company and the vision behind building an interconnected tech ecosystem.',
    bannerLinkedin: 'week1-genesis-linkedin.png', bannerSquare: 'week1-genesis-square.png',
    screenshots: ['szl-holdings-hero.jpg', 'apps-showcase-hero.jpg'],
    linkedinPost: `What happens when a single engineer decides to build an entire technology ecosystem from scratch?

Not a startup. Not a side project. An ecosystem.

Over the past year, I've been quietly building SZL Holdings — a portfolio of interconnected platforms spanning AI research, cybersecurity, predictive intelligence, observability, creative tech, and strategic consulting.

Every platform is production-grade. Every one was designed, engineered, and shipped by one person. And every one connects to the others in ways that make the whole greater than the sum of its parts.

Over the next 8 weeks, I'm going to pull back the curtain on every single one.

Here's what I've learned so far:
- The best systems are the ones that think like ecosystems, not silos
- Building in public is uncomfortable — but it's the fastest way to earn trust
- The hardest skill isn't coding. It's knowing what to build next

This is Week 1. The Genesis. SZL Holdings is the foundation.

Next week, I'll introduce the brain of the operation.

Stay tuned.

#BuildInPublic #TechFounder #SZLHoldings #Innovation #StartupLife #FounderJourney #TechLeadership #SaaS`,
    xPost: `I built an entire technology ecosystem. Alone.

AI research. Cybersecurity. Predictive intelligence. Observability. Creative tech. Consulting.

All interconnected. All production-grade.

Over 8 weeks, I'm revealing everything.

Week 1: The Genesis.

This is SZL Holdings.

#BuildInPublic #TechFounder #SZLHoldings`,
    hackajobUpdate: [
      'Update headline to mention "Founder & CTO at SZL Holdings"',
      'Add SZL Holdings as primary project in portfolio section',
    ],
    linkedinHashtags: '#BuildInPublic #TechFounder #SZLHoldings #Innovation #StartupLife #FounderJourney #TechLeadership #SaaS',
    xHashtags: '#BuildInPublic #TechFounder #SZLHoldings',
    carousel: {
      title: '5 Reasons I Built an Entire Tech Ecosystem Alone',
      slides: [
        { title: 'Slide 1: Title', content: '"5 Reasons I Built an Entire Tech Ecosystem Alone"\nStephen Lutar | SZL Holdings\nUse SZL Holdings banner background' },
        { title: 'Slide 2: The Problem', content: '"Most tech companies build silos."\nSeparate teams. Separate tools. Zero integration.\nIcon: disconnected puzzle pieces' },
        { title: 'Slide 3: The Vision', content: '"What if every platform talked to every other platform?"\nAI + Security + Observability + Predictions = Ecosystem\nIcon: interconnected nodes' },
        { title: 'Slide 4: The Scale', content: '"12+ production-grade platforms."\nOne founder. One architecture. One vision.\nList: INCA, Lyte, Rosie, Aegis, Nimbus, Beacon, Zeus, DreamEra...' },
        { title: 'Slide 5: The Lesson', content: '"The hardest skill isn\'t coding."\nIt\'s knowing what to build next.\nSystems thinking > individual features' },
        { title: 'Slide 6: CTA', content: '"Follow along for the next 8 weeks."\nI\'m pulling back the curtain on every platform.\nWeek 2: The Brain (INCA Intelligence)\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 I built an entire technology ecosystem from scratch. Alone.\n\nNot a startup pitch. Not a side project. A production-grade ecosystem.\n\nHere\'s the story (1/7)',
      'Over the past year, I\'ve been quietly building SZL Holdings.\n\n12+ interconnected platforms spanning:\n- AI research\n- Cybersecurity\n- Predictive intelligence\n- Observability\n- Creative tech\n- Strategic consulting\n\n(2/7)',
      'Why interconnected?\n\nBecause isolated tools create data silos. Connected platforms create intelligence.\n\nWhen your security system talks to your observability platform, you get threat detection that actually works.\n\n(3/7)',
      'The hardest part wasn\'t the code.\n\nIt was architecture. Deciding what connects to what. What data flows where. Which platform serves which purpose.\n\nSystems thinking is the real skill.\n\n(4/7)',
      'Every platform is production-grade:\n- Real-time dashboards\n- AI-powered analysis\n- Professional UX\n- Interconnected data flows\n\nThis isn\'t vapourware. It\'s live.\n\n(5/7)',
      'Over the next 8 weeks, I\'m revealing every platform.\n\nWeek 2: The Brain (AI Research Intelligence)\nWeek 3: The Eyes (Observability)\nWeek 4: The Shield (Cybersecurity)\n...and more.\n\n(6/7)',
      'If you\'re building something ambitious — follow along.\n\nI\'ll share the architecture decisions, the mistakes, and the lessons.\n\nThis is SZL Holdings. Week 1: Genesis.\n\n#BuildInPublic #TechFounder #SZLHoldings\n\n(7/7)',
    ],
    proTips: [
      'Post the LinkedIn version first (Tuesday 8-9 AM GMT), then share the X version the next day. This gives each platform peak attention.',
      'After posting on LinkedIn, immediately comment on 5-10 posts in your feed to boost your visibility before the algorithm evaluates your post.',
      'Pin the X post as your pinned tweet for the week.',
    ],
  },
  {
    num: 2, title: 'The Brain', subtitle: 'INCA Intelligence Platform',
    theme: 'Showcase the AI research intelligence platform at the core of the ecosystem.',
    bannerLinkedin: 'week2-brain-linkedin.png', bannerSquare: 'week2-brain-square.png',
    screenshots: ['inca-dashboard.jpg'],
    linkedinPost: `Every ecosystem needs a brain. Ours is called INCA.

INCA is an AI-powered research intelligence platform that serves as the central nervous system for the entire SZL Holdings ecosystem. It manages experiments, tracks model performance, surfaces insights, and turns raw research into actionable intelligence.

Think of it as the command center where every data point from every platform converges.

Here's what makes INCA different from yet another dashboard:

1. Live experiment tracking with real-time accuracy metrics
2. Cross-platform intelligence — it doesn't just monitor INCA, it connects insights across Nimbus (predictions), Beacon (analytics), and Zeus (orchestration)
3. Model performance benchmarking that actually tells you when something is degrading before your users notice

Building an intelligence platform taught me something unexpected: the hardest part isn't the algorithms. It's designing the information architecture so that the right insight reaches the right person at the right moment.

Most teams drown in data. INCA was built to surface signal.

Week 3: The Eyes. Coming next.

#BuildInPublic #AI #MachineLearning #DataScience #SZLHoldings #Innovation #TechFounder #EnterpriseAI`,
    xPost: `Meet INCA — the brain of the SZL ecosystem.

AI research intelligence that:
- Tracks experiments in real-time
- Benchmarks model performance
- Surfaces insights across platforms

The hardest part? Not algorithms. Information architecture.

Week 2 of 8.

#BuildInPublic #AI #SZLHoldings`,
    hackajobUpdate: [
      'Add INCA as a featured project with description: "AI-powered research intelligence platform with real-time experiment tracking and model performance benchmarking"',
    ],
    carousel: {
      title: 'How INCA Works — The Brain of an AI Ecosystem',
      slides: [
        { title: 'Slide 1: Title', content: '"How INCA Works"\nThe Brain of an AI Ecosystem\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: The Problem', content: '"Most AI teams drown in data."\nToo many dashboards. Too many metrics.\nZero clarity on what actually matters.' },
        { title: 'Slide 3: What INCA Does', content: '"INCA surfaces signal from noise."\n- Live experiment tracking\n- Real-time accuracy metrics\n- Cross-platform intelligence' },
        { title: 'Slide 4: Architecture', content: '"The Central Nervous System"\nINCA connects to every platform in the ecosystem.\nData flows in → Insights flow out\nDiagram: hub-and-spoke with INCA at center' },
        { title: 'Slide 5: Key Feature', content: '"Model Performance Benchmarking"\nKnow when something is degrading BEFORE your users notice.\nProactive, not reactive intelligence.' },
        { title: 'Slide 6: The Insight', content: '"The hardest part isn\'t algorithms."\nIt\'s information architecture.\nRight insight → Right person → Right moment' },
        { title: 'Slide 7: CTA', content: '"Next week: The Eyes"\nLyte Intelligent Observability\nFollow for Week 3\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 Every ecosystem needs a brain.\n\nMeet INCA — the AI research intelligence platform at the heart of SZL Holdings.\n\nHere\'s what it does and why it matters.\n\n(1/6)',
      'INCA manages:\n- Experiment tracking (live, real-time)\n- Model performance benchmarking\n- Cross-platform insight aggregation\n\nThink of it as mission control for AI research.\n\n(2/6)',
      'What makes INCA different from "yet another dashboard"?\n\nIt doesn\'t just display data. It connects data ACROSS platforms.\n\nSecurity insights + prediction data + analytics = compound intelligence.\n\n(3/6)',
      'The killer feature: degradation detection.\n\nINCA tells you when a model is getting worse BEFORE your users notice.\n\nThat 3-hour early warning? Worth more than any 99% accuracy metric.\n\n(4/6)',
      'The biggest lesson building INCA:\n\nThe hardest part of AI isn\'t the algorithms.\n\nIt\'s information architecture — ensuring the right insight reaches the right person at the right moment.\n\n(5/6)',
      'Next week: The Eyes.\n\nLyte Intelligent Observability — the platform that watches everything.\n\nWeek 2 of 8. Follow along.\n\n#BuildInPublic #AI #SZLHoldings\n\n(6/6)',
    ],
    proTips: [
      'Include the INCA dashboard screenshot — visual posts get 2x more engagement on LinkedIn.',
      'Reference Week 1 in your post comments: "Last week I introduced SZL Holdings — this week, we go deeper."',
      'Engage with AI/ML community posts before and after posting to boost algorithmic reach.',
    ],
  },
  {
    num: 3, title: 'The Eyes', subtitle: 'Lyte Intelligent Observability',
    theme: 'Reveal the observability platform that monitors everything.',
    bannerLinkedin: 'week3-eyes-linkedin.png', bannerSquare: 'week3-eyes-square.png',
    screenshots: ['lyte-command-center.jpg'],
    linkedinPost: `If INCA is the brain, Lyte is the eyes.

Every system needs to be watched. Not just monitored — understood. Lyte is an intelligent observability platform that goes beyond metrics and logs to provide genuine system understanding.

What does intelligent observability actually mean?

Traditional monitoring tells you something broke. Lyte tells you why it broke, what's about to break next, and what you should do about it. It's the difference between a smoke detector and a fire prediction system.

Here's what I built into Lyte:
- Real-time system health visualization across the entire SZL ecosystem
- Anomaly detection that learns normal behaviour patterns and alerts on deviations
- Correlation analysis that connects events across services
- A command center view that gives you the full picture at a glance

The personal lesson: I built Lyte because I needed it. When you're running 15+ platforms as a solo founder, you can't manually check each one. You need a system that watches the systems.

That's Lyte. The eyes that never blink.

Week 4: The Shield. We're getting into cybersecurity next.

#BuildInPublic #Observability #DevOps #SZLHoldings #SystemDesign #TechFounder #SaaS #Innovation`,
    xPost: `Lyte — the eyes of the ecosystem.

Not just monitoring. Understanding.

Intelligent observability that tells you:
- Why it broke
- What's about to break
- What to do about it

When you run 15+ platforms solo, you need eyes that never blink.

Week 3 of 8.

#BuildInPublic #Observability #SZLHoldings`,
    hackajobUpdate: [
      'Add Lyte as a featured project with skills: "Observability, Real-time Systems, Anomaly Detection"',
    ],
    carousel: {
      title: 'Monitoring vs Observability — What\'s the Difference?',
      slides: [
        { title: 'Slide 1: Title', content: '"Monitoring vs. Observability"\nWhy Lyte Goes Beyond Dashboards\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: Traditional Monitoring', content: '"Traditional monitoring tells you something broke."\nAlerts fire. Engineers scramble. Users already noticed.\nIcon: red alarm bell' },
        { title: 'Slide 3: Intelligent Observability', content: '"Lyte tells you WHY it broke, what\'s ABOUT to break, and what to DO about it."\nFire prediction > smoke detection' },
        { title: 'Slide 4: Four Pillars', content: '"What Lyte Does"\n1. Real-time system health visualization\n2. Anomaly detection with pattern learning\n3. Cross-service correlation analysis\n4. Command center overview' },
        { title: 'Slide 5: Personal Story', content: '"I built Lyte because I needed it."\n15+ platforms. One founder.\nYou need a system that watches the systems.\nIcon: eye symbol' },
        { title: 'Slide 6: CTA', content: '"Next week: The Shield"\nCybersecurity across Rosie, Aegis & Firestorm\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 Monitoring tells you something broke.\n\nObservability tells you WHY, what\'s NEXT, and what to DO.\n\nMeet Lyte — the eyes of the SZL ecosystem.\n\n(1/6)',
      'Lyte is an intelligent observability platform.\n\nNot just logs + metrics + traces.\n\nIt provides genuine system UNDERSTANDING.\n\nThe difference between a smoke detector and a fire prediction system.\n\n(2/6)',
      'What I built into Lyte:\n\n- Real-time health visualization\n- Anomaly detection that LEARNS normal patterns\n- Cross-service correlation\n- Command center view\n\nAll watching 15+ platforms simultaneously.\n\n(3/6)',
      'Why I built it:\n\nAs a solo founder running 15+ production platforms, I can\'t manually check each one.\n\nI needed a system that watches the systems.\n\nThat\'s Lyte. Eyes that never blink.\n\n(4/6)',
      'The key insight:\n\nMost teams are over-monitored and under-observed.\n\nThey have 47 dashboards and zero understanding.\n\nLyte was built to fix that.\n\n(5/6)',
      'Next week: The Shield.\n\nThree cybersecurity platforms working as one defense layer.\n\nRosie + Aegis + Firestorm.\n\nWeek 3 of 8.\n\n#BuildInPublic #Observability #SZLHoldings\n\n(6/6)',
    ],
    proTips: [
      'DevOps and observability content performs very well on LinkedIn — tag relevant DevOps thought leaders if you\'ve engaged with them before.',
      'Include the Lyte command center screenshot prominently — visual proof is powerful.',
      'Post a 30-minute follow-up comment asking: "What\'s the biggest gap in your current monitoring setup?" to drive engagement.',
    ],
  },
  {
    num: 4, title: 'The Shield', subtitle: 'Rosie + Aegis + Firestorm (Security Stack)',
    theme: 'Unveil the three-layer cybersecurity defense platform.',
    bannerLinkedin: 'week4-shield-linkedin.png', bannerSquare: 'week4-shield-square.png',
    screenshots: ['rosie-hero.jpg', 'aegis-hero.jpg', 'firestorm-hero.jpg'],
    linkedinPost: `You don't build one security tool. You build a security stack.

This week I'm revealing three platforms that work together as SZL's defense layer:

ROSIE — The Front Line
Rosie is the first responder. It handles threat detection, automated triage, and initial incident response. Think of it as your security team's first pair of hands, working 24/7 without fatigue. It includes an AI-powered security assistant (Alloy) that can analyse threats in natural language.

AEGIS — The Fortress
Where Rosie detects, Aegis defends. It's the defensive perimeter — managing access controls, vulnerability assessments, and compliance monitoring. Aegis ensures that once a threat is identified, the doors are already locked.

FIRESTORM — The War Room
When the worst happens, Firestorm takes over. It's the incident response simulator and trainer — running scenarios, coordinating response procedures, and ensuring your team has practised for every eventuality before it happens.

Why three platforms instead of one? Because security isn't a product. It's a system. Detection, defense, and response are fundamentally different disciplines that require different tools, different UIs, and different mental models.

Building this taught me: the best security architecture mirrors how security teams actually think and work, not how software engineers think they should work.

Week 5: Prediction. Things get interesting.

#BuildInPublic #Cybersecurity #SecurityOps #TechFounder #SZLHoldings #Innovation #B2B #StartupLife`,
    xPost: `One security tool isn't enough. You need a stack.

ROSIE — Detection & triage
AEGIS — Defense & compliance
FIRESTORM — Incident response simulation

Three platforms. One defense layer.

Security isn't a product. It's a system.

Week 4 of 8.

#BuildInPublic #Cybersecurity #SZLHoldings`,
    hackajobUpdate: [
      'Add all three security platforms as projects',
      'Update skills to include: "Cybersecurity, Threat Detection, Incident Response, Security Architecture"',
    ],
    carousel: {
      title: 'Why One Security Tool Isn\'t Enough',
      slides: [
        { title: 'Slide 1: Title', content: '"Why One Security Tool Isn\'t Enough"\nThe 3-Layer Defense Model\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: The Problem', content: '"Most companies buy ONE security product and call it done."\nThat\'s like having a lock on your front door but no alarm and no fire escape.\nIcon: single padlock' },
        { title: 'Slide 3: Layer 1 - ROSIE', content: '"Layer 1: DETECTION (Rosie)"\n- AI-powered threat detection\n- Automated triage\n- 24/7 first responder\n- Natural language threat analysis\nIcon: radar/scanning' },
        { title: 'Slide 4: Layer 2 - AEGIS', content: '"Layer 2: DEFENSE (Aegis)"\n- Access controls\n- Vulnerability assessment\n- Compliance monitoring\n- The fortress that locks the doors\nIcon: shield' },
        { title: 'Slide 5: Layer 3 - FIRESTORM', content: '"Layer 3: RESPONSE (Firestorm)"\n- Incident response simulation\n- Scenario training\n- Response coordination\n- Practice before it happens\nIcon: war room' },
        { title: 'Slide 6: Why Three?', content: '"Detection, defense, and response are different disciplines."\nDifferent tools. Different UIs. Different mental models.\nSecurity mirrors how teams THINK.' },
        { title: 'Slide 7: CTA', content: '"Next week: Prediction"\nNimbus + Beacon — seeing the future\n#BuildInPublic #Cybersecurity #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 Most companies buy one security tool and call it a day.\n\nThat\'s like having a lock but no alarm and no fire escape.\n\nHere\'s why I built THREE security platforms for SZL Holdings.\n\n(1/7)',
      'LAYER 1: ROSIE (Detection)\n\nThe first responder. AI-powered.\n\n- Threat detection in real-time\n- Automated triage\n- Natural language threat analysis via "Alloy" AI assistant\n- Works 24/7 without fatigue\n\n(2/7)',
      'LAYER 2: AEGIS (Defense)\n\nThe fortress.\n\n- Access controls\n- Vulnerability assessments\n- Compliance monitoring\n\nWhere Rosie detects, Aegis defends. Doors locked before the threat arrives.\n\n(3/7)',
      'LAYER 3: FIRESTORM (Response)\n\nThe war room.\n\n- Incident response simulation\n- Scenario training\n- Response coordination\n\nPractice for every eventuality BEFORE it happens.\n\n(4/7)',
      'Why three platforms instead of one?\n\nBecause detection, defense, and response are fundamentally different disciplines.\n\nDifferent tools. Different UIs. Different mental models.\n\n(5/7)',
      'The lesson:\n\nThe best security architecture mirrors how security teams actually THINK and WORK.\n\nNot how software engineers think they should work.\n\nDesign for the user\'s mental model.\n\n(6/7)',
      'Next week: Prediction.\n\nNimbus + Beacon — the platforms that see the future.\n\nWeek 4 of 8. The shield is up. Now let\'s predict.\n\n#BuildInPublic #Cybersecurity #SZLHoldings\n\n(7/7)',
    ],
    proTips: [
      'Cybersecurity content is HIGHLY engaging on LinkedIn — expect this to be one of your best-performing weeks.',
      'Upload all three screenshots (Rosie, Aegis, Firestorm) as a multi-image post for maximum visual impact.',
      'Tag relevant cybersecurity communities or thought leaders you\'ve previously engaged with.',
      'Save time this week to actively respond to comments — security posts attract strong opinions and discussions.',
    ],
  },
  {
    num: 5, title: 'The Prediction Engine', subtitle: 'Nimbus + Beacon',
    theme: 'Showcase the predictive intelligence platforms.',
    bannerLinkedin: 'week5-prediction-linkedin.png', bannerSquare: 'week5-prediction-square.png',
    screenshots: ['nimbus-hero.jpg', 'beacon-hero.jpg'],
    linkedinPost: `What if you could see the future? Not perfectly — but well enough to act before everyone else?

That's the question behind Nimbus and Beacon, the predictive intelligence layer of SZL Holdings.

NIMBUS — The Forecaster
Nimbus is a predictive AI platform that analyses patterns, builds forecasting models, and generates predictions across multiple domains. It takes the intelligence gathered by INCA and the monitoring data from Lyte, and asks: "What happens next?"

BEACON — The Signal
Beacon is the analytics and alerting companion. Where Nimbus predicts, Beacon surfaces. It connects to every other platform in the ecosystem — Zeus, INCA, DreamEra — and creates cross-platform intelligence reports that highlight trends, anomalies, and opportunities.

Together, they form a prediction engine that gets smarter as the ecosystem grows. Every new platform adds new data. Every new data point improves the predictions.

The insight that changed how I think about AI: prediction isn't about being right. It's about being useful. A prediction that's 70% accurate but arrives 3 hours early is infinitely more valuable than a 99% accurate post-mortem.

Build for speed of insight, not perfection of analysis.

Week 6: The Advisory Arm. Consulting meets technology.

#BuildInPublic #PredictiveAI #AI #DataScience #SZLHoldings #TechFounder #Innovation #MachineLearning`,
    xPost: `Prediction isn't about being right. It's about being early.

NIMBUS — Forecasts what happens next
BEACON — Surfaces signals across platforms

A 70% accurate prediction that arrives 3 hours early beats a 99% accurate post-mortem.

Build for speed of insight.

Week 5 of 8.

#BuildInPublic #PredictiveAI #SZLHoldings`,
    hackajobUpdate: [
      'Add Nimbus and Beacon as featured projects',
      'Update skills: "Predictive Analytics, Forecasting, AI/ML"',
    ],
    carousel: {
      title: 'Speed of Insight > Perfection of Analysis',
      slides: [
        { title: 'Slide 1: Title', content: '"Speed of Insight > Perfection of Analysis"\nWhy 70% Accurate & Early Beats 99% Accurate & Late\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: The Question', content: '"What if you could see the future?"\nNot perfectly. But well enough to act FIRST.\nIcon: crystal ball / telescope' },
        { title: 'Slide 3: Nimbus', content: '"NIMBUS — The Forecaster"\n- Pattern analysis across domains\n- Forecasting models\n- Connects INCA intelligence + Lyte monitoring\n- Asks: "What happens next?"' },
        { title: 'Slide 4: Beacon', content: '"BEACON — The Signal"\n- Cross-platform analytics\n- Trend detection\n- Anomaly highlighting\n- Intelligence reports across the entire ecosystem' },
        { title: 'Slide 5: Compound Effect', content: '"The prediction engine gets smarter as the ecosystem grows."\nMore platforms = more data\nMore data = better predictions\nIcon: upward growth spiral' },
        { title: 'Slide 6: The Insight', content: '"70% accurate + 3 hours early"\n> "99% accurate + after the fact"\n\nBuild for speed of insight, not perfection of analysis.' },
        { title: 'Slide 7: CTA', content: '"Next: The Advisory Arm"\nCarlota Jo Consulting — where tech meets strategy\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 What if you could see the future?\n\nNot perfectly. But well enough to act before everyone else?\n\nThat\'s the question behind Nimbus and Beacon.\n\n(1/6)',
      'NIMBUS is the forecaster.\n\nIt takes data from INCA (intelligence) and Lyte (observability) and asks one question:\n\n"What happens next?"\n\nPattern analysis → Forecasting models → Predictions.\n\n(2/6)',
      'BEACON is the signal.\n\nWhere Nimbus predicts, Beacon surfaces.\n\nCross-platform intelligence reports that highlight:\n- Trends\n- Anomalies\n- Opportunities\n\nAcross every platform in the ecosystem.\n\n(3/6)',
      'Together they create a compound effect:\n\nMore platforms = more data\nMore data = better predictions\nBetter predictions = smarter platforms\n\nThe ecosystem feeds itself.\n\n(4/6)',
      'The insight that changed my thinking:\n\nPrediction isn\'t about being RIGHT.\nIt\'s about being USEFUL.\n\n70% accurate + 3 hours early\n> 99% accurate + after the fact\n\nSpeed of insight > perfection of analysis.\n\n(5/6)',
      'Next week: The Advisory Arm.\n\nCarlota Jo Consulting — where technology meets strategy.\n\nWeek 5 of 8.\n\n#BuildInPublic #PredictiveAI #SZLHoldings\n\n(6/6)',
    ],
    proTips: [
      'The "70% accurate + early vs 99% accurate + late" is a highly quotable insight — make it the hook of your follow-up comment.',
      'Cross-reference previous weeks: "INCA gathers intelligence, Lyte observes, and now Nimbus predicts — the ecosystem is taking shape."',
      'Predictive AI content attracts data science audiences — use relevant hashtags to reach them.',
    ],
  },
  {
    num: 6, title: 'The Advisory Arm', subtitle: 'Carlota Jo Consulting',
    theme: 'Introduce the strategic consulting arm that bridges technology and business.',
    bannerLinkedin: 'week6-advisory-linkedin.png', bannerSquare: 'week6-advisory-square.png',
    screenshots: ['carlota-jo-hero.jpg'],
    linkedinPost: `Technology without strategy is just expensive tooling.

That's why SZL Holdings has a consulting arm: Carlota Jo.

Carlota Jo Consulting delivers elite strategic advisory for enterprises, family offices, and institutional investors. It's where the technology stack meets the real world — helping organisations understand how to leverage AI, security, and predictive intelligence to create lasting competitive advantage.

"Where Vision Meets Precision" isn't just a tagline. It's how I think about the gap between having technology and using technology effectively.

Our practice areas:
- Digital transformation strategy for organisations drowning in tools but starving for direction
- AI integration advisory — helping teams move from "we should use AI" to "here's exactly how AI fits our workflow"
- Security posture assessment — using the Rosie/Aegis/Firestorm methodology
- Portfolio management and venture strategy

Here's what surprised me most about building a consulting arm alongside a tech portfolio: the consulting makes the technology better. Every client conversation reveals a gap, an assumption, or a workflow that the platforms didn't account for.

The feedback loop between building and advising is the most underrated advantage a founder can have.

Week 7: The Creative Side. We're going somewhere unexpected.

#BuildInPublic #StrategicConsulting #TechLeadership #SZLHoldings #Innovation #DigitalTransformation #B2B #TechFounder`,
    xPost: `Technology without strategy is just expensive tooling.

Carlota Jo Consulting bridges the gap:
- Digital transformation strategy
- AI integration advisory
- Security posture assessment

The feedback loop between building and advising? Most underrated founder advantage.

Week 6 of 8.

#BuildInPublic #StrategicConsulting #SZLHoldings`,
    hackajobUpdate: [
      'Add Carlota Jo as a project: "Strategic consulting platform for enterprise advisory"',
      'Update headline to include consulting expertise',
    ],
    carousel: {
      title: 'The Builder\'s Secret Weapon: A Consulting Feedback Loop',
      slides: [
        { title: 'Slide 1: Title', content: '"The Builder\'s Secret Weapon"\nWhy Every Tech Founder Needs a Consulting Arm\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: The Problem', content: '"Technology without strategy is just expensive tooling."\nMost startups build first, ask questions later.\nIcon: expensive tools gathering dust' },
        { title: 'Slide 3: Carlota Jo', content: '"Carlota Jo Consulting"\nElite strategic advisory where tech meets real-world business.\n"Where Vision Meets Precision"' },
        { title: 'Slide 4: Practice Areas', content: '"What We Do"\n- Digital transformation strategy\n- AI integration advisory\n- Security posture assessment\n- Portfolio management & venture strategy' },
        { title: 'Slide 5: The Secret', content: '"The consulting makes the technology BETTER."\nEvery client conversation reveals a gap.\nEvery gap improves the platform.\nThe feedback loop is the real product.' },
        { title: 'Slide 6: CTA', content: '"Next week: The Creative Side"\nDreamEra + Dreamscape — where tech meets imagination\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 Technology without strategy is just expensive tooling.\n\nThat\'s why SZL Holdings has a consulting arm.\n\nMeet Carlota Jo.\n\n(1/6)',
      'Carlota Jo Consulting delivers strategic advisory for:\n\n- Enterprises drowning in tools but starving for direction\n- Family offices navigating tech investments\n- Teams stuck at "we should use AI" without a plan\n\n"Where Vision Meets Precision"\n\n(2/6)',
      'Our practice areas:\n\n1. Digital transformation strategy\n2. AI integration advisory\n3. Security posture assessment (using Rosie/Aegis/Firestorm methodology)\n4. Portfolio management & venture strategy\n\n(3/6)',
      'The surprising part:\n\nThe consulting makes the TECHNOLOGY better.\n\nEvery client conversation reveals:\n- A gap we didn\'t see\n- An assumption we made\n- A workflow we didn\'t account for\n\n(4/6)',
      'The feedback loop:\n\nBuild → Advise → Learn → Improve → Build\n\nThis cycle is the most underrated advantage a founder can have.\n\nYour clients are your best product managers.\n\n(5/6)',
      'Next week: The Creative Side.\n\nDreamEra + Dreamscape — where technology meets imagination.\n\nWeek 6 of 8. Almost there.\n\n#BuildInPublic #StrategicConsulting #SZLHoldings\n\n(6/6)',
    ],
    proTips: [
      'Consulting/strategy content resonates strongly with LinkedIn\'s business audience — expect good reach this week.',
      '"Technology without strategy is just expensive tooling" is a strong opener — use it as the hook.',
      'Follow-up comment idea: "What\'s the biggest gap between your technology capabilities and your business strategy?"',
    ],
  },
  {
    num: 7, title: 'The Creative Side', subtitle: 'DreamEra + Dreamscape',
    theme: 'Reveal the creative technology platforms that add imagination to the ecosystem.',
    bannerLinkedin: 'week7-creative-linkedin.png', bannerSquare: 'week7-creative-square.png',
    screenshots: ['dreamera-hero.jpg', 'dreamscape-hero.jpg'],
    linkedinPost: `Everyone builds the serious stuff. Few build the creative stuff. I built both.

DreamEra and Dreamscape are the creative technology platforms in the SZL ecosystem. They exist because I believe the future of tech isn't just functional — it's expressive.

DREAMERA — The Canvas
DreamEra is a creative AI storytelling platform that renders artifact maps and discovers energy breakthroughs in narrative space. It's where ideas get their first visual form — transforming concepts into living, breathing story worlds.

DREAMSCAPE — The Experience
Dreamscape takes creative concepts and turns them into immersive digital experiences. An immersive creative workspace for exploring worlds, crafting artifacts, and generating extraordinary content.

"Why would a tech holding company need creative platforms?"

Because the companies that win in the next decade won't just have the best algorithms. They'll have the best experiences. The most memorable interfaces. The most human-feeling technology.

Creative tech is competitive advantage disguised as art.

My personal take: building creative tools kept me sane while building security and analytics platforms. The creative side uses completely different mental muscles. If you're a builder who only builds "serious" tools, try building something beautiful. It'll change how you think about everything else.

Week 8: The Full Reveal. Everything comes together.

#BuildInPublic #CreativeTech #Innovation #SZLHoldings #TechFounder #ProductDevelopment #Design #AI`,
    xPost: `Everyone builds the serious stuff. Few build the creative stuff.

DreamEra — Creative AI for concepts & exploration
Dreamscape — Immersive digital experiences

Creative tech is competitive advantage disguised as art.

It also keeps you sane while building security platforms.

Week 7 of 8.

#BuildInPublic #CreativeTech #SZLHoldings`,
    hackajobUpdate: [
      'Add DreamEra and Dreamscape as creative technology projects',
      'Add skills: "Creative AI, Generative Design, UX Design"',
    ],
    carousel: {
      title: 'Why Every Tech Builder Needs a Creative Side Project',
      slides: [
        { title: 'Slide 1: Title', content: '"Why Every Tech Builder Needs a Creative Side Project"\nThe Case for Building Beautiful Things\nStephen Lutar | SZL Holdings' },
        { title: 'Slide 2: The Default', content: '"Everyone builds the serious stuff."\nDashboards. APIs. Analytics. Security.\nFew build the creative stuff. But they should.' },
        { title: 'Slide 3: DreamEra', content: '"DreamEra — The Canvas"\nCreative AI storytelling platform\nTransform concepts into living, breathing story worlds\nWhere ideas get their first visual form' },
        { title: 'Slide 4: Dreamscape', content: '"Dreamscape — The Experience"\nImmersive digital experiences\nExplore worlds. Craft artifacts. Generate extraordinary content.\nCreativity as technology.' },
        { title: 'Slide 5: Why It Matters', content: '"The winners won\'t just have the best algorithms."\nThey\'ll have the best EXPERIENCES.\nThe most memorable interfaces.\nThe most human-feeling technology.' },
        { title: 'Slide 6: Personal Take', content: '"Building creative tools kept me sane."\nThe creative side uses different mental muscles.\nIt changed how I think about EVERYTHING else.\nCreative tech = competitive advantage disguised as art.' },
        { title: 'Slide 7: CTA', content: '"Next week: The Full Reveal"\nEverything comes together.\n8 weeks. One ecosystem. One builder.\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 Everyone builds dashboards.\nEveryone builds APIs.\nEveryone builds analytics.\n\nFew build the creative stuff.\n\nHere\'s why I did — and why you should too.\n\n(1/6)',
      'DreamEra is a creative AI storytelling platform.\n\nIt transforms concepts into living, breathing story worlds.\n\nWhere ideas get their first visual form.\n\nThe canvas of the SZL ecosystem.\n\n(2/6)',
      'Dreamscape takes those concepts and turns them into immersive digital experiences.\n\nExplore worlds. Craft artifacts. Generate content.\n\nCreativity as a technology platform.\n\n(3/6)',
      '"Why would a tech holding company need creative platforms?"\n\nBecause the companies that win in the next decade won\'t just have the best algorithms.\n\nThey\'ll have the best EXPERIENCES.\n\n(4/6)',
      'Personal take:\n\nBuilding creative tools kept me sane while building security and analytics.\n\nDifferent mental muscles. Different challenges. Different rewards.\n\nIt changed how I think about everything else.\n\n(5/6)',
      'Next week: THE FULL REVEAL.\n\nEverything comes together. 8 weeks. One ecosystem. One builder.\n\nStay tuned for the grand finale.\n\n#BuildInPublic #CreativeTech #SZLHoldings\n\n(6/6)',
    ],
    proTips: [
      'Creative content is refreshing after weeks of technical posts — expect a different audience to engage this week.',
      'The "creative tech is competitive advantage disguised as art" line is highly shareable — use it prominently.',
      'Build anticipation for Week 8: "Next week, everything comes together" — tease the grand finale heavily.',
    ],
  },
  {
    num: 8, title: 'The Full Reveal', subtitle: 'Stephen Lutar / The Complete Portfolio',
    theme: 'The grand finale. Founder story, full portfolio reveal, and the interconnected vision.',
    bannerLinkedin: 'week8-reveal-linkedin.png', bannerSquare: 'week8-reveal-square.png',
    screenshots: ['career-stephen-lutar.jpg', 'szl-holdings-hero.jpg', 'apps-showcase-hero.jpg'],
    linkedinPost: `8 weeks ago I told you I built an entire technology ecosystem. Alone.

Today, the full picture:

SZL HOLDINGS — The Foundation
A technology holding company with a portfolio of interconnected platforms.

THE ECOSYSTEM:
- INCA — AI research intelligence & experiment tracking
- Lyte — Intelligent observability & system monitoring
- Rosie — Threat detection & security operations
- Aegis — Defensive perimeter & compliance
- Firestorm — Incident response simulation & training
- Nimbus — Predictive AI & forecasting
- Beacon — Cross-platform analytics & alerting
- Zeus — Platform orchestration & management
- DreamEra — Creative AI & concept generation
- Dreamscape — Immersive digital experiences
- AlloyScape — Unified interface & integration layer
- Carlota Jo — Strategic consulting & advisory

Every platform connects. Intelligence flows from INCA. Lyte watches everything. The security stack protects it all. Nimbus predicts. Beacon alerts. Zeus orchestrates. And Carlota Jo ensures it all serves real business outcomes.

This isn't a collection of side projects. It's a thesis: one engineer can build a comprehensive, production-grade technology ecosystem if they think in systems, build in layers, and treat every platform as part of something larger.

The journey taught me three things:
1. Architecture matters more than any individual feature
2. The connections between platforms create more value than the platforms themselves
3. Building in public is the best decision I've made in my career

My name is Stephen Lutar. I'm a builder, founder, and system architect.

And I'm just getting started.

If any of this resonated — let's connect. I'm always interested in conversations with people building ambitious things.

#BuildInPublic #TechFounder #SZLHoldings #Innovation #FounderJourney #StartupLife #TechLeadership #AI #Cybersecurity #SystemDesign #FullStack #ProductDevelopment`,
    xPost: `8 weeks. The full reveal.

One engineer. One ecosystem:

- INCA (AI research)
- Lyte (observability)
- Rosie + Aegis + Firestorm (security)
- Nimbus + Beacon (predictions)
- Zeus (orchestration)
- DreamEra + Dreamscape (creative)
- AlloyScape (integration)
- Carlota Jo (consulting)

All interconnected. All production-grade.

I'm Stephen Lutar. Builder. Founder. System architect.

Just getting started.

#BuildInPublic #TechFounder #SZLHoldings`,
    hackajobUpdate: [
      'Final profile polish: update all sections to reflect complete portfolio',
      'Ensure all 12+ platforms are listed as projects',
      'Update headline to: "Founder & CTO | SZL Holdings | Building interconnected technology ecosystems"',
    ],
    carousel: {
      title: 'One Engineer. One Ecosystem. The Full Picture.',
      slides: [
        { title: 'Slide 1: Title', content: '"One Engineer. One Ecosystem."\nThe Full Picture — SZL Holdings\nStephen Lutar' },
        { title: 'Slide 2: The Brain', content: '"INCA — AI Research Intelligence"\nExperiment tracking. Model benchmarking. Cross-platform insights.\nThe central nervous system.' },
        { title: 'Slide 3: The Eyes', content: '"Lyte — Intelligent Observability"\nNot monitoring. Understanding.\nThe eyes that never blink.' },
        { title: 'Slide 4: The Shield', content: '"Rosie + Aegis + Firestorm"\nDetection. Defense. Response.\nThree layers. One security stack.' },
        { title: 'Slide 5: The Prediction Engine', content: '"Nimbus + Beacon"\nForecast what\'s next. Surface the signal.\n70% early > 99% late.' },
        { title: 'Slide 6: The Advisory Arm', content: '"Carlota Jo Consulting"\nWhere vision meets precision.\nTech without strategy is expensive tooling.' },
        { title: 'Slide 7: The Creative Side', content: '"DreamEra + Dreamscape"\nCreative AI. Immersive experiences.\nCompetitive advantage disguised as art.' },
        { title: 'Slide 8: The Thesis', content: '"One engineer can build a comprehensive ecosystem."\nThink in systems. Build in layers.\nTreat every platform as part of something larger.\nArchitecture > individual features.' },
        { title: 'Slide 9: CTA', content: '"I\'m Stephen Lutar. Builder. Founder. System Architect."\nJust getting started.\nLet\'s connect.\n#BuildInPublic #SZLHoldings' },
      ],
    },
    xThread: [
      '🧵 8 weeks ago I said I built an entire technology ecosystem. Alone.\n\nToday: the full reveal.\n\nEvery platform. Every connection. The complete picture.\n\n(1/8)',
      'THE BRAIN: INCA\nAI research intelligence. Experiment tracking. Model benchmarking.\nThe central nervous system of everything.\n\nTHE EYES: Lyte\nIntelligent observability. System understanding.\nEyes that never blink.\n\n(2/8)',
      'THE SHIELD:\nRosie — Detection & triage\nAegis — Defense & compliance\nFirestorm — Response simulation\n\nThree platforms. One security stack.\nDetect. Defend. Respond.\n\n(3/8)',
      'THE PREDICTION ENGINE:\nNimbus — Forecasting what happens next\nBeacon — Surfacing signals across platforms\n\nSpeed of insight > perfection of analysis.\n\n(4/8)',
      'THE ADVISORY ARM: Carlota Jo\nStrategic consulting where tech meets business.\n\nTHE CREATIVE SIDE:\nDreamEra — Creative AI & storytelling\nDreamscape — Immersive experiences\n\nCompetitive advantage disguised as art.\n\n(5/8)',
      'THE ORCHESTRATION:\nZeus — Platform management\nAlloyScape — Integration layer\n\nEvery platform connects. Intelligence flows.\nThe ecosystem is alive.\n\n(6/8)',
      'Three lessons from this journey:\n\n1. Architecture matters more than any individual feature\n2. The connections CREATE more value than the platforms\n3. Building in public is the best decision I\'ve ever made\n\n(7/8)',
      'I\'m Stephen Lutar.\n\nBuilder. Founder. System architect.\n\nAnd I\'m just getting started.\n\nIf any of this resonated — let\'s connect.\n\n#BuildInPublic #TechFounder #SZLHoldings\n\n(8/8)',
    ],
    proTips: [
      'This is your biggest post — be available ALL DAY to respond to comments. Clear your schedule.',
      'Post the LinkedIn version early (8 AM GMT sharp) and engage intensively for the first 2 hours.',
      'If any previous week went viral, reference it: "Since my Week [X] post reached [N] people..."',
      'Add a personal photo or video if possible — Week 8 is about the human behind the tech.',
      'Pin the X thread and update your bio to reflect the complete portfolio.',
    ],
  },
];


drawPageBackground();

doc.font('Helvetica-Bold').fontSize(36).fillColor(COLORS.cyan);
doc.text('SZL HOLDINGS', MARGIN, 120, { width: CONTENT_WIDTH, align: 'center' });

doc.font('Helvetica').fontSize(14).fillColor(COLORS.gold);
doc.text('ULTIMATE MARKETING PLAYBOOK', MARGIN, 170, { width: CONTENT_WIDTH, align: 'center' });

drawLine(200, COLORS.cyan);

doc.font('Helvetica').fontSize(12).fillColor(COLORS.white);
doc.text('8-Week Social Media Campaign Guide', MARGIN, 220, { width: CONTENT_WIDTH, align: 'center' });
doc.text('LinkedIn  |  X (Twitter)  |  Hackajob', MARGIN, 240, { width: CONTENT_WIDTH, align: 'center' });

doc.font('Helvetica').fontSize(10).fillColor(COLORS.midGray);
doc.text('Prepared for Stephen Lutar', MARGIN, 280, { width: CONTENT_WIDTH, align: 'center' });
doc.text('Founder & CTO, SZL Holdings', MARGIN, 296, { width: CONTENT_WIDTH, align: 'center' });

const heroPath = path.join(SCREENSHOTS_DIR, 'szl-holdings-hero.jpg');
if (fs.existsSync(heroPath)) {
  try {
    doc.image(heroPath, MARGIN + 80, 340, { width: CONTENT_WIDTH - 160, height: 180, fit: [CONTENT_WIDTH - 160, 180] });
  } catch(e) {}
}

doc.font('Helvetica').fontSize(9).fillColor(COLORS.darkGray);
doc.text('CONFIDENTIAL — For Personal Use Only', MARGIN, PAGE_HEIGHT - 60, { width: CONTENT_WIDTH, align: 'center' });


newSection();
writeTitle('TABLE OF CONTENTS');
currentY += 10;

const tocItems = [
  ['Section 1', 'Pre-Launch Setup'],
  ['Section 2', 'The 8-Week Campaign (Week-by-Week)'],
  ['Section 3', 'Carousel Content Strategy'],
  ['Section 4', 'X Thread Strategy'],
  ['Section 5', 'Maximum Engagement Playbook'],
  ['Section 6', 'Quick Reference Cards'],
];

tocItems.forEach(([section, title], i) => {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.cyan);
  doc.text(section, MARGIN, currentY);
  doc.font('Helvetica').fontSize(12).fillColor(COLORS.white);
  doc.text(title, MARGIN + 90, currentY);
  currentY += 28;
});

currentY += 20;
writeSubtitle('How to Use This Playbook');
writeBody('This playbook contains everything you need to execute an 8-week social media campaign across LinkedIn, X (Twitter), and Hackajob. Each section is designed for action — copy-paste ready text, exact filenames for images, posting schedules, and engagement strategies.');
currentY += 5;
writeBullet('Copy-paste boxes contain exact text ready to post — just copy and go');
writeBullet('Checkboxes track your progress — print and check off as you complete each action');
writeBullet('Pro tips give you algorithm-beating strategies specific to each week');
writeBullet('Carousel content describes slide-by-slide layouts for Canva or similar tools');
writeBullet('X thread versions provide alternative long-form content for maximum engagement');


newSection();
writeTitle('SECTION 1');
writeSubtitle('Pre-Launch Setup');
drawLine(currentY, COLORS.cyan);
currentY += 15;

writeBody('Complete these setup tasks BEFORE posting Week 1. This ensures your profiles are optimized and ready to capture attention from day one.');
currentY += 10;

writeSubheading('LinkedIn Profile Optimization');
writeCheckbox('Update your headline to: "Founder & CTO | SZL Holdings | Building interconnected technology ecosystems"');
writeCheckbox('Write a compelling About section highlighting the ecosystem vision and your role as sole builder');
writeCheckbox('Turn on Creator Mode (Settings > Resources > Creator mode)');
writeCheckbox('Add a custom banner image — use the SZL Holdings branding from your website or the Week 1 banner');
writeCheckbox('Add SZL Holdings website to your Featured section');
writeCheckbox('Add Apps Showcase link to Featured section');
writeCheckbox('Set your profile to "Open to" relevant opportunities');
writeCheckbox('Follow relevant hashtags: #BuildInPublic, #TechFounder, #AI, #Cybersecurity, #Innovation');

currentY += 10;
writeSubheading('X (Twitter) Profile Optimization');
writeCheckbox('Update bio to mention SZL Holdings and your ecosystem');
writeCheckbox('Upload a professional header image — use Week 1 LinkedIn banner (resize to 1500x500)');
writeCheckbox('Prepare a pinned tweet draft (will be your Week 1 post)');
writeCheckbox('Follow key accounts in #BuildInPublic, #TechFounder, AI, and Cybersecurity spaces');
writeCheckbox('Set up notifications for relevant hashtags');

currentY += 10;
writeSubheading('Hackajob Profile Setup');
writeBody('Copy-paste each section directly from the templates below:');
currentY += 5;

writeCopyBox('HACKAJOB HEADLINE (copy this exactly)', 'Founder & CTO | SZL Holdings | Building interconnected AI, security, and intelligence platforms | Full-stack system architect');

writeCopyBox('HACKAJOB ABOUT SECTION (copy this exactly)', `I'm the founder of SZL Holdings, a technology holding company with a portfolio of 12+ interconnected platforms spanning AI research, cybersecurity, predictive intelligence, observability, creative technology, and strategic consulting.

Every platform in the SZL ecosystem was designed, engineered, and shipped by me — from system architecture to production deployment. The ecosystem is built on the thesis that interconnected platforms create exponentially more value than isolated tools.

My core belief: the best technology doesn't just solve problems — it creates systems that anticipate, protect, and evolve. SZL Holdings is the proof of concept.

I specialise in building production-grade, full-stack platforms with a focus on:
- AI/ML research infrastructure and intelligence systems
- Cybersecurity operations (detection, defense, incident response)
- Predictive analytics and real-time observability
- System architecture that scales across interconnected platforms
- Strategic consulting at the intersection of technology and business`);

writeCopyBox('HACKAJOB SKILLS (copy this exactly)', 'TypeScript, React, Node.js, Python, PostgreSQL, System Architecture, Full-Stack Development, AI/ML, Machine Learning, Natural Language Processing, Cybersecurity, Threat Detection, Incident Response, Observability, Real-Time Systems, Predictive Analytics, Data Engineering, API Design, Cloud Infrastructure, DevOps, Strategic Consulting, Product Development, Technical Leadership, Startup Founding');

currentY += 10;
writeSubheading('Screenshots & Logos to Upload');
writeBody('Upload these files to your profiles as project images:');
writeBullet('szl-holdings-hero.jpg — Main SZL Holdings project image');
writeBullet('inca-dashboard.jpg — INCA Intelligence Platform');
writeBullet('lyte-command-center.jpg — Lyte Observability');
writeBullet('rosie-hero.jpg — Rosie Cybersecurity');
writeBullet('aegis-hero.jpg — Aegis Security');
writeBullet('firestorm-hero.jpg — Firestorm Security Lab');
writeBullet('nimbus-hero.jpg — Nimbus Predictive AI');
writeBullet('beacon-hero.jpg — Beacon Analytics');
writeBullet('carlota-jo-hero.jpg — Carlota Jo Consulting');
writeBullet('dreamera-hero.jpg — DreamEra Creative');
writeBullet('dreamscape-hero.jpg — Dreamscape Creative Systems');
writeBullet('apps-showcase-hero.jpg — Full Platform Catalog');
writeBullet('career-stephen-lutar.jpg — Personal Profile');
writeBullet('lyte-logo.png — Lyte logo for branding');


newSection();
writeTitle('SECTION 2');
writeSubtitle('The 8-Week Campaign');
drawLine(currentY, COLORS.cyan);
currentY += 15;
writeBody('Each week includes: LinkedIn post (copy-paste ready), X post (copy-paste ready), Hackajob profile updates, posting schedule, and a checklist of action items.');
currentY += 10;

WEEKS.forEach((week) => {
  newSection();

  doc.font('Helvetica-Bold').fontSize(24).fillColor(COLORS.cyan);
  doc.text(`WEEK ${week.num}`, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 2;
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.white);
  doc.text(week.title.toUpperCase(), MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 2;
  doc.font('Helvetica').fontSize(11).fillColor(COLORS.gold);
  doc.text(week.subtitle, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 8;

  drawLine(currentY, COLORS.cyan);
  currentY += 10;

  doc.font('Helvetica').fontSize(10).fillColor(COLORS.midGray);
  doc.text(`Theme: ${week.theme}`, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 10;

  const bannerPath = path.join(BANNERS_DIR, week.bannerLinkedin);
  if (fs.existsSync(bannerPath)) {
    embedImage(bannerPath, CONTENT_WIDTH, 160);
  }

  doc.font('Helvetica').fontSize(9).fillColor(COLORS.midGray);
  doc.text(`LinkedIn banner: ${week.bannerLinkedin}  |  X banner: ${week.bannerSquare}`, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 5;
  if (week.screenshots.length > 0) {
    doc.text(`Screenshots to attach: ${week.screenshots.join(', ')}`, MARGIN, currentY, { width: CONTENT_WIDTH });
    currentY = doc.y + 10;
  }

  writeSubheading('LinkedIn Post');
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.midGray);
  doc.text('Post on Tuesday or Thursday, 8:00-9:00 AM GMT. Attach the LinkedIn banner image.', MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 5;
  writeCopyBox('LINKEDIN POST — Copy & Paste', week.linkedinPost);

  writeSubheading('Follow-Up Comment (post 30 min after)');
  const followUpComments = {
    1: 'I\'ve been working on this quietly for over a year. If you\'re curious about what it takes to build 12+ platforms as a solo founder, follow along. Week 2 goes deep into the AI layer.\n\nWhat\'s the most ambitious technical project you\'ve tackled?',
    2: 'The INCA dashboard processes data from every other platform in the ecosystem. Last week I introduced SZL Holdings — this week we\'re going deeper into the brain that powers it all.\n\nWhat\'s the biggest challenge you\'ve faced with AI tooling?',
    3: 'When you run 15+ platforms solo, manual monitoring is impossible. Lyte was born from necessity. It watches everything so I don\'t have to.\n\nWhat\'s the biggest gap in YOUR monitoring setup?',
    4: 'Detection without defense is just awareness. Defense without response planning is just hope. You need all three.\n\nHave you ever had a security incident where you wished you\'d practiced the response?',
    5: 'The compound effect is real — every new platform in the ecosystem makes the predictions better. More data, better models, smarter alerts.\n\nDo you build for accuracy or speed of insight?',
    6: 'The most surprising thing about adding consulting to a tech portfolio: the client conversations IMPROVE the technology. Every gap they reveal becomes a feature.\n\nDo you get feedback directly from users?',
    7: 'Building creative tools after months of security and analytics platforms was like switching from weights to swimming — completely different muscles, incredibly refreshing.\n\nDo you build anything just for the joy of building?',
    8: 'This 8-week journey has been incredible. Thank you to everyone who engaged, commented, and followed along. This is just the beginning.\n\nWhat resonated most with you over these 8 weeks?',
  };
  writeCopyBox('FOLLOW-UP COMMENT — Post 30 min after the main post', followUpComments[week.num]);

  ensureSpace(100);
  writeSubheading('X / Twitter Post');
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.midGray);
  doc.text('Post on Monday, Wednesday, or Friday, 12:00 PM GMT. Attach the square banner image.', MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 5;
  writeCopyBox('X POST — Copy & Paste', week.xPost);

  ensureSpace(80);
  writeSubheading('Hackajob Updates');
  week.hackajobUpdate.forEach(item => writeCheckbox(item));

  currentY += 10;
  writeSubheading('Pro Tips for This Week');
  week.proTips.forEach(tip => writeProTip(tip));

  currentY += 10;
  writeSubheading('Weekly Checklist');
  writeCheckbox(`Post LinkedIn content (Tue/Thu 8-9 AM GMT)`);
  writeCheckbox(`Post follow-up LinkedIn comment (30 min later)`);
  writeCheckbox(`Post X content (Mon/Wed/Fri 12 PM GMT)`);
  writeCheckbox(`Attach ${week.bannerLinkedin} to LinkedIn post`);
  writeCheckbox(`Attach ${week.bannerSquare} to X post`);
  week.screenshots.forEach(s => writeCheckbox(`Attach screenshot: ${s}`));
  writeCheckbox(`Update Hackajob profile as noted above`);
  writeCheckbox(`Engage with 10+ relevant posts in your feed after posting`);
  writeCheckbox(`Respond to all comments within first hour`);
});


newSection();
writeTitle('SECTION 3');
writeSubtitle('Carousel Content Strategy');
drawLine(currentY, COLORS.cyan);
currentY += 15;

writeBody('LinkedIn carousels get 3-5x more reach than standard text posts. Each week has a pre-designed carousel with slide-by-slide content you can build in Canva or similar tools.');
currentY += 5;
writeBody('Carousel format: Problem > Insight > SZL Solution > CTA');
writeBody('Design tip: Use the SZL dark theme (dark background, white text, cyan accents). Keep each slide to one key idea with minimal text.');
currentY += 10;

WEEKS.forEach((week) => {
  ensureSpace(100);
  writeSubheading(`Week ${week.num}: ${week.carousel.title}`);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.midGray);
  doc.text(`Post alongside or 1-2 days after the main LinkedIn post for Week ${week.num}`, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 8;

  week.carousel.slides.forEach((slide) => {
    writeCopyBox(slide.title, slide.content);
  });

  currentY += 8;
});


newSection();
writeTitle('SECTION 4');
writeSubtitle('X Thread Strategy');
drawLine(currentY, COLORS.cyan);
currentY += 15;

writeBody('X threads get significantly more engagement than single tweets. For each week, here is an alternative thread format (5-8 tweets) that can be posted alongside or instead of the single tweet.');
writeBody('Thread tip: Post the hook tweet first, then reply to yourself with each subsequent tweet. Pin the thread once complete.');
currentY += 10;

WEEKS.forEach((week) => {
  ensureSpace(80);
  writeSubheading(`Week ${week.num}: ${week.title} — X Thread`);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.midGray);
  doc.text(`Alternative to the single X post for Week ${week.num}. Post as a self-reply thread.`, MARGIN, currentY, { width: CONTENT_WIDTH });
  currentY = doc.y + 8;

  week.xThread.forEach((tweet, i) => {
    writeCopyBox(`Tweet ${i + 1} of ${week.xThread.length}`, tweet);
  });

  currentY += 8;
});


newSection();
writeTitle('SECTION 5');
writeSubtitle('Maximum Engagement Playbook');
drawLine(currentY, COLORS.cyan);
currentY += 15;

writeSubheading('Daily Engagement Routine (15 min/day)');
writeBody('Consistency beats volume. Spend 15 focused minutes daily on engagement:');
currentY += 5;
writeNumbered(1, 'Morning (5 min): Scroll your LinkedIn feed and leave 3-5 thoughtful comments on posts from people in your target audience (tech founders, CTOs, security professionals, AI researchers).');
writeNumbered(2, 'Midday (5 min): Check X mentions and replies. Respond to everything. Quote tweet one interesting post from your niche with your take.');
writeNumbered(3, 'Evening (5 min): Review your post analytics. Note what\'s working. Engage with any new comments on your posts.');
currentY += 10;

writeSubheading('LinkedIn Algorithm Strategies');
writeBullet('Post timing: Tuesday and Thursday, 8-9 AM GMT. These are peak B2B engagement windows.');
writeBullet('First hour is critical: LinkedIn\'s algorithm evaluates post performance in the first 60 minutes. Be available to respond to every comment immediately.');
writeBullet('Self-comment strategy: Post a follow-up comment on your own post within 30 minutes. This counts as "engagement" and boosts your reach.');
writeBullet('Comment quality: Write comments longer than 5 words. One-word reactions ("Great!") don\'t help. Share a genuine thought or ask a question.');
writeBullet('Hashtag limits: Use 3-5 hashtags maximum. More than 5 can reduce reach. Always include #BuildInPublic and #SZLHoldings.');
writeBullet('Image posts get 2x engagement. Always attach a banner or screenshot.');
writeBullet('Carousel posts get 3-5x engagement. Post the carousel version 1-2 days after your main text post for double exposure.');
writeBullet('Tag people only when genuinely relevant. Never spam-tag. Tag no more than 2-3 people per post.');
writeBullet('Avoid external links in the main post — LinkedIn deprioritizes posts with links. Put links in the first comment instead.');

currentY += 10;
writeSubheading('X Algorithm Strategies');
writeBullet('Post timing: Monday, Wednesday, Friday around 12 PM GMT for peak tech engagement.');
writeBullet('Threads outperform single tweets significantly. Use the thread versions from Section 4.');
writeBullet('Reply strategy: Reply to relevant threads in your niche with thoughtful takes. This puts your profile in front of new audiences.');
writeBullet('Quote tweets with your own commentary get more engagement than simple retweets.');
writeBullet('Use 1-3 hashtags maximum on X. More looks spammy.');
writeBullet('Pin your best-performing tweet each week.');
writeBullet('Attach images — tweets with images get 150% more engagement.');
writeBullet('Spaces: If you find relevant X Spaces about tech/AI/security, join as a listener or request to speak. This builds visibility.');

currentY += 10;
writeSubheading('Hackajob Strategy');
writeBullet('Update your profile weekly — even small changes signal to recruiters that you\'re active.');
writeBullet('Add projects progressively (one per week) to keep your profile "fresh" in Hackajob\'s algorithm.');
writeBullet('Upload screenshots as project images — visual profiles get more recruiter attention.');
writeBullet('Set "Open to opportunities" if appropriate — even passive visibility helps.');
writeBullet('Connect your GitHub to showcase code contributions.');
writeBullet('Use skills keywords that match job descriptions in your target market.');

currentY += 10;
writeSubheading('Week-Over-Week Growth Tactics');
writeBullet('Cross-reference previous weeks: "Last week I showed you the brain. This week, the eyes." This builds narrative momentum and encourages followers to revisit old posts.');
writeBullet('If a post goes viral: Post a follow-up within 24 hours. Ride the momentum. "Since my post about [topic] reached [N] people, here\'s a deeper dive..."');
writeBullet('Engagement compounds: Every week your audience grows, your next post reaches more people. Week 8 should be your strongest performer.');
writeBullet('Repurpose: Turn your best LinkedIn post into an X thread (and vice versa). Turn threads into short-form articles.');
writeBullet('Save your best engagement week\'s post as a Featured item on LinkedIn.');
writeBullet('DM strategy: If someone leaves a particularly thoughtful comment, send a genuine DM thanking them. Don\'t pitch — just connect.');


newSection();
writeTitle('SECTION 6');
writeSubtitle('Quick Reference Cards');
drawLine(currentY, COLORS.cyan);
currentY += 15;

writeSubheading('8-Week Visual Calendar');
currentY += 5;

const calHeaders = ['Week', 'Theme', 'LinkedIn (Tue/Thu)', 'X (Mon/Wed/Fri)', 'Hackajob'];
const calRows = [
  ['1', 'Genesis', 'SZL Holdings intro', 'Ecosystem tease', 'Update headline'],
  ['2', 'The Brain', 'INCA deep dive', 'INCA summary', 'Add INCA project'],
  ['3', 'The Eyes', 'Lyte observability', 'Lyte summary', 'Add Lyte project'],
  ['4', 'The Shield', 'Security stack', 'Security tease', 'Add security projects'],
  ['5', 'Prediction', 'Nimbus + Beacon', 'Prediction insight', 'Add prediction projects'],
  ['6', 'Advisory', 'Carlota Jo', 'Consulting value', 'Add Carlota Jo'],
  ['7', 'Creative', 'DreamEra + Dreamscape', 'Creative tech', 'Add creative projects'],
  ['8', 'Full Reveal', 'Complete portfolio', 'Full ecosystem', 'Final profile polish'],
];

const colWidths = [35, 70, 140, 130, 140];

doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.cyan);
let xPos = MARGIN;
calHeaders.forEach((h, i) => {
  doc.text(h, xPos, currentY, { width: colWidths[i] });
  xPos += colWidths[i];
});
currentY += 16;
drawLine(currentY, COLORS.cyan);
currentY += 6;

calRows.forEach((row) => {
  ensureSpace(20);
  xPos = MARGIN;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white);
  doc.text(row[0], xPos, currentY, { width: colWidths[0] });
  xPos += colWidths[0];
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.gold);
  doc.text(row[1], xPos, currentY, { width: colWidths[1] });
  xPos += colWidths[1];
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.lightGray);
  for (let i = 2; i < row.length; i++) {
    doc.text(row[i], xPos, currentY, { width: colWidths[i] });
    xPos += colWidths[i];
  }
  currentY += 16;
});

currentY += 15;
writeSubheading('Hashtag Cheat Sheet');
currentY += 5;

writeCopyBox('EVERY POST (always include)', '#BuildInPublic #TechFounder #SZLHoldings #Innovation');
writeCopyBox('WEEK 1 (Genesis)', '#StartupLife #FounderJourney #TechLeadership #SaaS');
writeCopyBox('WEEK 2 (Brain/INCA)', '#AI #MachineLearning #DataScience #EnterpriseAI');
writeCopyBox('WEEK 3 (Eyes/Lyte)', '#Observability #DevOps #SystemDesign #SaaS');
writeCopyBox('WEEK 4 (Shield/Security)', '#Cybersecurity #SecurityOps #B2B #StartupLife');
writeCopyBox('WEEK 5 (Prediction)', '#PredictiveAI #AI #DataScience #MachineLearning');
writeCopyBox('WEEK 6 (Advisory)', '#StrategicConsulting #TechLeadership #DigitalTransformation #B2B');
writeCopyBox('WEEK 7 (Creative)', '#CreativeTech #ProductDevelopment #Design #AI');
writeCopyBox('WEEK 8 (Full Reveal)', '#FounderJourney #StartupLife #TechLeadership #AI #Cybersecurity #SystemDesign #FullStack #ProductDevelopment');

currentY += 10;
writeSubheading('File Reference Sheet');
currentY += 5;

writeBody('BANNER FILES (social-content/banners/):');
for (let i = 1; i <= 8; i++) {
  const w = WEEKS[i - 1];
  writeBullet(`Week ${i}: ${w.bannerLinkedin} (LinkedIn) | ${w.bannerSquare} (X/Square)`);
}

currentY += 8;
writeBody('SCREENSHOT FILES (social-content/screenshots/):');
const screenshotFiles = [
  ['szl-holdings-hero.jpg', 'SZL Holdings main site'],
  ['inca-dashboard.jpg', 'INCA Intelligence command center'],
  ['lyte-command-center.jpg', 'Lyte Observability platform'],
  ['rosie-hero.jpg', 'Rosie security monitoring'],
  ['aegis-hero.jpg', 'Aegis security fortress'],
  ['firestorm-hero.jpg', 'Firestorm incident response'],
  ['nimbus-hero.jpg', 'Nimbus predictive AI'],
  ['beacon-hero.jpg', 'Beacon analytics'],
  ['carlota-jo-hero.jpg', 'Carlota Jo consulting'],
  ['dreamera-hero.jpg', 'DreamEra creative platform'],
  ['dreamscape-hero.jpg', 'Dreamscape creative workspace'],
  ['career-stephen-lutar.jpg', 'Stephen Lutar profile'],
  ['apps-showcase-hero.jpg', 'Full platform catalog'],
  ['zeus-hero.jpg', 'Zeus architecture'],
  ['alloyscape-hero.jpg', 'AlloyScape infrastructure'],
  ['lutar-hero.jpg', 'Lutar command center'],
];
screenshotFiles.forEach(([file, desc]) => writeBullet(`${file} — ${desc}`));

currentY += 8;
writeBody('LOGO FILES (social-content/logos/):');
writeBullet('lyte-logo.png — Lyte logo (960x400px PNG)');
writeBullet('lyte-logo.svg — Lyte logo (scalable SVG)');


doc.end();

stream.on('finish', () => {
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`PDF generated successfully: ${OUTPUT_FILE}`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
});

stream.on('error', (err) => {
  console.error('Error writing PDF:', err);
});
