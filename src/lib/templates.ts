export const journalTemplates = [
	{
		id: 'morning-routine',
		name: 'Morning Routine',
		icon: '🌅',
		description: 'Start your day with intention and gratitude',
		prompts: [
			'What am I grateful for today?',
			'What are my top 3 priorities for today?',
			'How do I want to feel today?',
			'What would make today great?'
		],
		template: `# Morning Reflection - {{date}}

## Gratitude 🙏
What am I grateful for today?

## Today's Priorities ✨
1. 
2. 
3. 

## Intention 💫
How do I want to feel today?

## Success Vision 🎯
What would make today great?
`
	},
	{
		id: 'evening-reflection',
		name: 'Evening Reflection',
		icon: '🌙',
		description: 'Reflect on your day and celebrate wins',
		prompts: [
			'What went well today?',
			'What could I have done better?',
			'What did I learn today?',
			'What am I letting go of before bed?'
		],
		template: `# Evening Reflection - {{date}}

## Wins of the Day 🎉
What went well today?

## Growth Opportunities 🌱
What could I have done better?

## Today's Lesson 📚
What did I learn today?

## Release & Rest 😌
What am I letting go of before bed?
`
	},
	{
		id: 'stress-management',
		name: 'Stress Check-In',
		icon: '🧘',
		description: 'Process stress and find your calm',
		prompts: [
			'What is causing me stress right now?',
			'What can I control? What can I not control?',
			'What would help me feel better?',
			'What am I doing well despite the stress?'
		],
		template: `# Stress Check-In - {{date}}

## Current Stressors 😰
What is causing me stress right now?

## Control Analysis 🎯
**What I can control:**
- 

**What I cannot control:**
- 

## Self-Care Actions 💆
What would help me feel better?

## Acknowledge Strengths 💪
What am I doing well despite the stress?
`
	},
	{
		id: 'goal-tracking',
		name: 'Goal Progress',
		icon: '🎯',
		description: 'Track progress toward your goals',
		prompts: [
			'What progress did I make today?',
			'What obstacles did I face?',
			'What is my next action step?',
			'How do I feel about my progress?'
		],
		template: `# Goal Progress - {{date}}

## Today's Progress 📈
What progress did I make today?

## Obstacles & Challenges 🚧
What obstacles did I face?

## Next Actions 👣
What is my next action step?

## Reflection 💭
How do I feel about my progress?
`
	},
	{
		id: 'gratitude-journal',
		name: 'Gratitude Practice',
		icon: '🙏',
		description: 'Focus on abundance and appreciation',
		prompts: [
			'Three things I am grateful for',
			'Someone who made me smile today',
			'A simple pleasure I enjoyed',
			'Something positive about myself'
		],
		template: `# Gratitude Journal - {{date}}

## Three Gratitudes 🌟
1. 
2. 
3. 

## People Appreciation 💝
Someone who made me smile today:

## Simple Pleasures ☕
A simple pleasure I enjoyed:

## Self-Appreciation 💖
Something positive about myself:
`
	},
	{
		id: 'anxiety-release',
		name: 'Anxiety Release',
		icon: '🌊',
		description: 'Process anxious thoughts and find peace',
		prompts: [
			'What am I worried about?',
			'What is the worst that could happen? Best case?',
			'What evidence do I have for/against these worries?',
			'What action can I take right now?'
		],
		template: `# Anxiety Release - {{date}}

## Current Worries 😟
What am I worried about?

## Reality Check 🔍
**Worst case scenario:**

**Best case scenario:**

**Most likely scenario:**

## Evidence Analysis 📊
**Evidence for my worry:**
- 

**Evidence against my worry:**
- 

## Action Plan ⚡
What action can I take right now?
`
	},
	{
		id: 'creative-flow',
		name: 'Creative Flow',
		icon: '🎨',
		description: 'Capture ideas and creative thoughts',
		prompts: [
			'What inspires me today?',
			'What ideas are flowing?',
			'What do I want to create?',
			'What creative blocks am I facing?'
		],
		template: `# Creative Flow - {{date}}

## Inspiration ✨
What inspires me today?

## Ideas Stream 💡
What ideas are flowing?

## Creative Desires 🎨
What do I want to create?

## Blocks & Breakthroughs 🚀
What creative blocks am I facing? How can I overcome them?
`
	},
	{
		id: 'relationship-reflection',
		name: 'Relationship Reflection',
		icon: '💝',
		description: 'Reflect on your connections with others',
		prompts: [
			'How are my relationships making me feel?',
			'Who do I want to connect with more?',
			'What boundaries do I need to set?',
			'How can I show up better for others?'
		],
		template: `# Relationship Reflection - {{date}}

## Current State 💫
How are my relationships making me feel?

## Connection Goals 🤝
Who do I want to connect with more?

## Boundaries 🛡️
What boundaries do I need to set or maintain?

## Growth 🌱
How can I show up better for others and myself?
`
	},
	{
		id: 'free-write',
		name: 'Free Write',
		icon: '✍️',
		description: 'Let your thoughts flow freely',
		prompts: [
			'What is on my mind right now?',
			'What do I need to express?',
			'What am I feeling?',
			'What insights are emerging?'
		],
		template: `# Free Write - {{date}}

`
	}
];

export type JournalTemplate = (typeof journalTemplates)[number];

export function getTemplateById(id: string): JournalTemplate | undefined {
	return journalTemplates.find((t) => t.id === id);
}

export function formatTemplate(template: string, date: Date = new Date()): string {
	const dateStr = date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	return template.replace(/\{\{date\}\}/g, dateStr);
}
