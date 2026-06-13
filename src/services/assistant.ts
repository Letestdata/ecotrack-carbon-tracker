// ============================================================
// EcoTrack – Smart Assistant Engine (rule-based + NLP-style)
// Processes user messages and returns contextual eco-advice
// ============================================================

import type { ChatMessage, DailyLog, UserProfile, Category } from '../types';
import { GLOBAL_AVERAGE_MONTHLY_KG, PARIS_TARGET_MONTHLY_KG } from '../data/emissionFactors';
import { ECO_TIPS } from '../data/tips';

// ── Helpers ──────────────────────────────────────────────────

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

function buildAssistantMessage(content: string): ChatMessage {
  return { id: generateId(), role: 'assistant', content, timestamp: now() };
}

// ── Intent detection ─────────────────────────────────────────

type Intent =
  | 'greeting'
  | 'how_are_you'
  | 'help'
  | 'carbon_overview'
  | 'transport_tips'
  | 'energy_tips'
  | 'food_tips'
  | 'shopping_tips'
  | 'waste_tips'
  | 'compare_average'
  | 'paris_target'
  | 'monthly_summary'
  | 'achievements'
  | 'daily_tip'
  | 'what_is_co2'
  | 'reduce_footprint'
  | 'category_breakdown'
  | 'unknown';

const INTENT_PATTERNS: Array<{ pattern: RegExp; intent: Intent }> = [
  { pattern: /\b(hi|hello|hey|greetings|howdy)\b/i, intent: 'greeting' },
  { pattern: /how are you|how do you do/i, intent: 'how_are_you' },
  { pattern: /\bhelp\b|what can you do|options|commands/i, intent: 'help' },
  { pattern: /my (carbon|footprint|co2|emission|impact)/i, intent: 'carbon_overview' },
  { pattern: /transport|car|drive|fly|bus|train|commute/i, intent: 'transport_tips' },
  { pattern: /energy|electricity|heating|gas|power|solar/i, intent: 'energy_tips' },
  { pattern: /food|eat|diet|meal|beef|vegan|vegetarian/i, intent: 'food_tips' },
  { pattern: /shop|buy|cloth|fashion|product|purchase/i, intent: 'shopping_tips' },
  { pattern: /waste|recycle|compost|rubbish|trash/i, intent: 'waste_tips' },
  { pattern: /average|global|world|compare|comparison/i, intent: 'compare_average' },
  { pattern: /paris|target|goal|2 ?degrees?|1\.5 ?degrees?/i, intent: 'paris_target' },
  { pattern: /month|monthly|this month|summary/i, intent: 'monthly_summary' },
  { pattern: /achievement|badge|reward|streak/i, intent: 'achievements' },
  { pattern: /tip|advice|suggestion|idea/i, intent: 'daily_tip' },
  { pattern: /what is co2|carbon dioxide|greenhouse|global warming/i, intent: 'what_is_co2' },
  { pattern: /reduce|lower|cut|decrease|improve|offset/i, intent: 'reduce_footprint' },
  { pattern: /breakdown|category|categories|split|proportion/i, intent: 'category_breakdown' },
];

function detectIntent(message: string): Intent {
  for (const { pattern, intent } of INTENT_PATTERNS) {
    if (pattern.test(message)) return intent;
  }
  return 'unknown';
}

// ── Response generators ──────────────────────────────────────

function getTopCategory(logs: DailyLog[]): { cat: Category; kg: number } | null {
  const totals: Partial<Record<Category, number>> = {};
  logs.forEach((l) =>
    l.entries.forEach((e) => {
      totals[e.category] = (totals[e.category] ?? 0) + e.co2e;
    })
  );
  const entries = Object.entries(totals) as [Category, number][];
  if (!entries.length) return null;
  const [cat, kg] = entries.sort((a, b) => b[1] - a[1])[0];
  return { cat, kg };
}

function getMonthTotal(logs: DailyLog[]): number {
  const month = new Date().toISOString().slice(0, 7);
  return logs.filter((l) => l.date.startsWith(month)).reduce((s, l) => s + l.totalCo2e, 0);
}

function randomTip(category?: Category): string {
  const pool = category ? ECO_TIPS.filter((t) => t.category === category) : ECO_TIPS;
  const tip = pool[Math.floor(Math.random() * pool.length)];
  return tip
    ? `${tip.icon} **${tip.title}**: ${tip.description} *(saves ~${tip.potentialSaving} kg CO₂e/month)*`
    : 'Keep tracking your activities for personalised tips! 🌱';
}

// ── Main response function ────────────────────────────────────

export function generateAssistantResponse(
  userMessage: string,
  logs: DailyLog[],
  profile: UserProfile,
  earnedAchievements: string[]
): ChatMessage {
  const intent = detectIntent(userMessage);
  const monthTotal = getMonthTotal(logs);
  const topCat = getTopCategory(logs);
  const firstName = profile.name.split(' ')[0];

  switch (intent) {
    case 'greeting':
      return buildAssistantMessage(
        `Hello, ${firstName}! 👋 I'm **EcoBot**, your personal carbon footprint assistant. ` +
        `You've logged **${monthTotal.toFixed(1)} kg CO₂e** this month. ` +
        `Ask me for tips, comparisons, or a summary of your impact!`
      );

    case 'how_are_you':
      return buildAssistantMessage(
        `I'm doing great — running on green energy! 🌿 ` +
        `You've logged **${monthTotal.toFixed(1)} kg CO₂e** this month. How can I help you reduce your footprint today?`
      );

    case 'help':
      return buildAssistantMessage(
        `Here's what I can help you with:\n\n` +
        `🌍 **"My carbon footprint"** – Overview of your emissions\n` +
        `📊 **"Monthly summary"** – This month's breakdown\n` +
        `🚗 **"Transport tips"** – Reduce travel emissions\n` +
        `⚡ **"Energy tips"** – Cut home energy use\n` +
        `🥗 **"Food tips"** – Lower dietary footprint\n` +
        `🛍️ **"Shopping tips"** – Smarter purchases\n` +
        `♻️ **"Waste tips"** – Better disposal habits\n` +
        `🎯 **"Paris target"** – How you compare to climate goals\n` +
        `🌐 **"Compare average"** – vs global average\n\n` +
        `Just type your question naturally!`
      );

    case 'carbon_overview':
      return buildAssistantMessage(
        `📊 Here's your carbon overview, ${firstName}:\n\n` +
        `• **This month:** ${monthTotal.toFixed(1)} kg CO₂e\n` +
        `• **Global average:** ${GLOBAL_AVERAGE_MONTHLY_KG.toFixed(0)} kg CO₂e/month\n` +
        `• **Your goal:** ${profile.monthlyBudgetGoal} kg CO₂e/month\n` +
        `• **Paris 1.5°C target:** ${PARIS_TARGET_MONTHLY_KG.toFixed(0)} kg CO₂e/month\n\n` +
        (topCat
          ? `Your biggest source is **${topCat.cat}** (${topCat.kg.toFixed(1)} kg CO₂e this month).`
          : `Start logging activities to see your personal breakdown!`)
      );

    case 'transport_tips':
      return buildAssistantMessage(
        `🚗 **Transport accounts for ~30% of most people's footprint.** Here are your top actions:\n\n` +
        `1. 🚌 Replace car trips with public transport (saves ~80 kg CO₂e/month)\n` +
        `2. 🚲 Cycle or walk trips under 5 km (zero emissions!)\n` +
        `3. ⚡ Consider an EV for your next car (72% fewer lifecycle emissions)\n` +
        `4. 🏠 Work from home 2 days/week (~40 kg CO₂e saved/month)\n` +
        `5. ✈️ Take one fewer flight/year (saves 200–2,000 kg CO₂e)\n\n` +
        `💡 Random tip: ${randomTip('transport')}`
      );

    case 'energy_tips':
      return buildAssistantMessage(
        `⚡ **Home energy is typically 20-25% of your footprint.** Key actions:\n\n` +
        `1. ☀️ Switch to a green energy tariff (saves ~120 kg CO₂e/month)\n` +
        `2. 🌡️ Lower thermostat by 1°C (saves 5-10% on heating)\n` +
        `3. 💡 Replace all bulbs with LEDs (75% less electricity)\n` +
        `4. 📱 Install a smart thermostat (saves 10-15% on heating/cooling)\n` +
        `5. 🏡 Improve home insulation (saves 25-45% on heating)\n\n` +
        `💡 Random tip: ${randomTip('energy')}`
      );

    case 'food_tips':
      return buildAssistantMessage(
        `🥗 **Food contributes ~25% of global greenhouse gas emissions.** Try these:\n\n` +
        `1. 🌱 Go meat-free 1 day/week (saves ~346 kg CO₂e/year)\n` +
        `2. 🥩 Replace beef with chicken or legumes (beef emits 27 kg CO₂e/kg!)\n` +
        `3. 🌽 Buy local & seasonal produce (50% fewer transport emissions)\n` +
        `4. ♻️ Reduce food waste (8% of global emissions come from waste)\n` +
        `5. 🌿 Grow your own herbs and vegetables\n\n` +
        `💡 Random tip: ${randomTip('food')}`
      );

    case 'shopping_tips':
      return buildAssistantMessage(
        `🛍️ **Consumer goods account for ~15% of the average carbon footprint.** Smart moves:\n\n` +
        `1. 👕 Buy second-hand clothing (reduces garment footprint by 87%)\n` +
        `2. 🔧 Repair instead of replace (extending life by 2 years cuts footprint 24%)\n` +
        `3. 📱 Choose refurbished electronics (92% less CO₂ than new)\n` +
        `4. 🎁 Choose experiences over physical gifts\n` +
        `5. 📦 Consolidate online orders to reduce deliveries\n\n` +
        `💡 Random tip: ${randomTip('shopping')}`
      );

    case 'waste_tips':
      return buildAssistantMessage(
        `♻️ **Waste management can reduce your footprint significantly.** Here's how:\n\n` +
        `1. 🪱 Compost food scraps (diverts methane-producing organic waste)\n` +
        `2. 🗑️ Improve recycling (reduces emissions by up to 75% vs landfill)\n` +
        `3. 🛍️ Use reusable bags, bottles, and containers\n` +
        `4. 📰 Go paperless for bills and subscriptions\n` +
        `5. 🔄 Join a local repair café or swap shop\n\n` +
        `💡 Random tip: ${randomTip('waste')}`
      );

    case 'compare_average':
      return buildAssistantMessage(
        `🌐 **How you compare to the world:**\n\n` +
        `• **Your monthly emissions:** ${monthTotal.toFixed(1)} kg CO₂e\n` +
        `• **Global average:** ~417 kg CO₂e/month\n` +
        `• **USA average:** ~833 kg CO₂e/month\n` +
        `• **EU average:** ~625 kg CO₂e/month\n` +
        `• **India average:** ~125 kg CO₂e/month\n\n` +
        (monthTotal < GLOBAL_AVERAGE_MONTHLY_KG
          ? `✅ You're **below the global average** — great work! Keep going!`
          : `⚠️ You're **above the global average**. Check the Tips section for quick wins!`)
      );

    case 'paris_target':
      return buildAssistantMessage(
        `🎯 **Paris Agreement Climate Targets:**\n\n` +
        `To limit warming to 1.5°C, each person needs to emit less than:\n` +
        `• **~167 kg CO₂e/month** (2 tonnes/year)\n\n` +
        `**Your current monthly emissions:** ${monthTotal.toFixed(1)} kg CO₂e\n\n` +
        (monthTotal < PARIS_TARGET_MONTHLY_KG
          ? `🌟 Amazing! You're **within the Paris target**. You're a climate champion!`
          : monthTotal < GLOBAL_AVERAGE_MONTHLY_KG
          ? `📈 You're below the global average but **${(monthTotal - PARIS_TARGET_MONTHLY_KG).toFixed(0)} kg above the Paris target**. Keep reducing!`
          : `🚨 You're **${(monthTotal - PARIS_TARGET_MONTHLY_KG).toFixed(0)} kg above the Paris target** this month. The Log and Tips sections can help!`)
      );

    case 'monthly_summary': {
      const month = new Date().toISOString().slice(0, 7);
      const monthLogs = logs.filter((l) => l.date.startsWith(month));
      const categories: Partial<Record<string, number>> = {};
      monthLogs.forEach((l) =>
        l.entries.forEach((e) => {
          categories[e.category] = (categories[e.category] ?? 0) + e.co2e;
        })
      );
      const breakdown = Object.entries(categories)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([cat, kg]) => `  • ${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${Number(kg).toFixed(1)} kg`)
        .join('\n');

      return buildAssistantMessage(
        `📅 **${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Summary:**\n\n` +
        `**Total:** ${monthTotal.toFixed(1)} kg CO₂e\n` +
        `**Days logged:** ${monthLogs.length}\n` +
        `**Your goal:** ${profile.monthlyBudgetGoal} kg CO₂e\n\n` +
        (breakdown ? `**By category:**\n${breakdown}` : `No activities logged yet this month.`) +
        `\n\n` +
        (monthTotal <= profile.monthlyBudgetGoal
          ? `✅ You're on track to meet your personal goal!`
          : `⚡ You've exceeded your goal by ${(monthTotal - profile.monthlyBudgetGoal).toFixed(1)} kg. Focus on ${topCat?.cat ?? 'your top category'}!`)
      );
    }

    case 'achievements':
      return buildAssistantMessage(
        earnedAchievements.length > 0
          ? `🏆 You've earned **${earnedAchievements.length} achievement(s)**!\n\nKeep logging and reducing to unlock more badges. Head to the Profile page to see them all.`
          : `🌱 No achievements unlocked yet — but you can start right now!\n\nLog your first activity to earn the **"First Step"** badge. You've got this!`
      );

    case 'daily_tip':
      return buildAssistantMessage(
        `💡 **Today's Eco Tip:**\n\n${randomTip()}\n\nWant a tip for a specific category? Ask me about transport, energy, food, shopping, or waste!`
      );

    case 'what_is_co2':
      return buildAssistantMessage(
        `🌍 **What is CO₂e (Carbon Dioxide Equivalent)?**\n\n` +
        `CO₂e measures all greenhouse gases (CO₂, methane, nitrous oxide, etc.) in terms of their global warming potential relative to CO₂.\n\n` +
        `**Key facts:**\n` +
        `• The global average is ~4.7 tonnes CO₂e per person per year\n` +
        `• To stay below 1.5°C warming, we need to reach ~2 tonnes/year by 2030\n` +
        `• The biggest personal sources are transport, home energy, and diet\n\n` +
        `EcoTrack uses IPCC and DEFRA 2023 emission factors to calculate your personal impact accurately.`
      );

    case 'reduce_footprint':
      return buildAssistantMessage(
        `🎯 **Your personalised reduction roadmap:**\n\n` +
        (topCat
          ? `Your biggest source is **${topCat.cat}** (${topCat.kg.toFixed(1)} kg CO₂e this month).\n\n`
          : ``) +
        `**Quick wins (easy changes):**\n` +
        `1. Switch to LED bulbs\n` +
        `2. Eat meat-free one day per week\n` +
        `3. Use reusable bags and bottles\n\n` +
        `**Medium impact:**\n` +
        `1. Use public transport or cycle\n` +
        `2. Buy second-hand clothing\n` +
        `3. Lower your thermostat by 1°C\n\n` +
        `**High impact:**\n` +
        `1. Switch to green energy tariff\n` +
        `2. Reduce flying significantly\n` +
        `3. Adopt a plant-based diet\n\n` +
        `Check the **Tips** section for detailed advice! 🌿`
      );

    case 'category_breakdown':
      return buildAssistantMessage(
        monthTotal > 0
          ? `📊 **Your emissions this month by category:**\n\n` +
            (['transport', 'energy', 'food', 'shopping', 'waste'] as const)
              .map((cat) => {
                const catLogs = logs
                  .filter((l) => l.date.startsWith(new Date().toISOString().slice(0, 7)))
                  .flatMap((l) => l.entries)
                  .filter((e) => e.category === cat);
                const total = catLogs.reduce((s, e) => s + e.co2e, 0);
                const pct = monthTotal > 0 ? ((total / monthTotal) * 100).toFixed(0) : '0';
                return `• **${cat.charAt(0).toUpperCase() + cat.slice(1)}:** ${total.toFixed(1)} kg (${pct}%)`;
              })
              .join('\n')
          : `You haven't logged any activities yet this month. Use the **Log** page to get started!`
      );

    default:
      return buildAssistantMessage(
        `🤔 I didn't quite catch that, but I'm here to help!\n\n` +
        `You can ask me about:\n` +
        `• Your carbon footprint overview\n` +
        `• Tips for transport, energy, food, shopping, or waste\n` +
        `• How you compare to global averages\n` +
        `• Your monthly summary\n\n` +
        `Or just say **"help"** to see all options! 🌱`
      );
  }
}
