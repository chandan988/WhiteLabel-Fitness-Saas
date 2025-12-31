const tips = [
  {
    title: "Move Your Body",
    body: "Even 10 minutes of movement can lift your energy and mood."
  },
  {
    title: "Stay Hydrated",
    body: "Water keeps your joints happy and your focus sharp."
  },
  {
    title: "Protein First",
    body: "Aim for a protein source in every main meal."
 
  },
  {
    title: "Walk After Meals",
    body: "A short walk supports digestion and blood sugar control."
  },
  {
    title: "Sleep Wins",
    body: "Protect your sleep window for recovery and performance."
  },
  {
    title: "Mindful Bites",
    body: "Slow down and notice hunger cues before you eat."
  },
  {
    title: "Consistency Counts",
    body: "Small daily actions create big results over time."
  },
  {
    title: "Stretch Break",
    body: "Two minutes of stretching eases tension and improves posture."
  },
  {
    title: "Color Your Plate",
    body: "Include at least two different colors of produce today."
  },
  {
    title: "Plan Your Day",
    body: "Schedule your workout like a meeting with yourself."
  },
  {
    title: "Core Check",
    body: "Engage your core during everyday movements."
  },
  {
    title: "Fuel Smart",
    body: "Choose whole foods that keep you satisfied longer."
  },
  {
    title: "Step Goal",
    body: "Aim for steady steps across the day, not just one burst."
  },
  {
    title: "Deep Breaths",
    body: "Three slow breaths can reset your focus and calm."
  },
  {
    title: "Balanced Plate",
    body: "Half veggies, quarter protein, quarter whole grains."
  },
  {
    title: "Morning Light",
    body: "Natural light in the morning helps your sleep rhythm."
  },
  {
    title: "Strength Matters",
    body: "Muscle supports metabolism and protects joints."
  },
  {
    title: "Snack Smart",
    body: "Pair fiber with protein for steady energy."
  },
  {
    title: "Posture Reset",
    body: "Roll your shoulders back and relax your jaw."
  },
  {
    title: "Warm Up",
    body: "Give your body 5 minutes to prepare before workouts."
  },
  {
    title: "Cool Down",
    body: "Slow breathing after exercise speeds recovery."
  },
  {
    title: "Add Greens",
    body: "Leafy greens add nutrients without heavy calories."
  },
  {
    title: "Track Progress",
    body: "Measure wins beyond the scale, like energy and sleep."
  },
  {
    title: "Stand Up",
    body: "Stand and stretch every hour if you sit a lot."
  },
  {
    title: "Hydration Check",
    body: "Sip water before you feel thirsty."
  },
  {
    title: "Mindful Finish",
    body: "End meals when you are 80 percent full."
  },
  {
    title: "Recovery Day",
    body: "Light movement helps recovery on rest days."
  },
  {
    title: "Fiber Focus",
    body: "Add beans or oats for steady digestion."
  },
  {
    title: "Power Playlist",
    body: "Music can boost workout intensity and enjoyment."
  },
  {
    title: "Small Wins",
    body: "Celebrate the effort, not just the outcome."
  }
];

const quotes = [
  {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt"
  },
  {
    text: "Take care of your body. It is the only place you have to live.",
    author: "Jim Rohn"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "Energy and persistence conquer all things.",
    author: "Benjamin Franklin"
  },
  {
    text: "Wellness is the complete integration of body, mind, and spirit.",
    author: "Greg Anderson"
  },
  {
    text: "The body achieves what the mind believes.",
    author: "Napoleon Hill"
  },
  {
    text: "A healthy outside starts from the inside.",
    author: "Robert Urich"
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Your body can stand almost anything. It is your mind you have to convince.",
    author: "Unknown"
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln"
  },
  {
    text: "Take the time to do what makes your soul happy.",
    author: "Unknown"
  },
  {
    text: "The only bad workout is the one that did not happen.",
    author: "Unknown"
  },
  {
    text: "Every day is a chance to get stronger.",
    author: "Unknown"
  },
  {
    text: "We are what we repeatedly do. Excellence then is a habit.",
    author: "Aristotle"
  },
  {
    text: "A little progress each day adds up to big results.",
    author: "Unknown"
  },
  {
    text: "Believe you can and you are halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown"
  },
  {
    text: "Health is not valued till sickness comes.",
    author: "Thomas Fuller"
  },
  {
    text: "Keep your face always toward the sunshine, and shadows will fall behind you.",
    author: "Walt Whitman"
  }
];

export const toDateKey = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return toDateKey(new Date());
  }
  return date.toISOString().slice(0, 10);
};

export const getDayOfYear = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return getDayOfYear(new Date());
  }
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const buildDefaultDailyContent = () => {
  const days = [];
  for (let day = 1; day <= 365; day += 1) {
    const tip = tips[(day - 1) % tips.length];
    const quote = quotes[(day - 1) % quotes.length];
    days.push({
      dayOfYear: day,
      tipTitle: tip.title,
      tipBody: tip.body,
      quoteText: quote.text,
      quoteAuthor: quote.author,
      isOverride: false
    });
  }
  return days;
};
