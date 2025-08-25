export const sessions = [
  { id: 1, title: "Brain Health Fundamentals", unlocked: true },
  { id: 2, title: "Understanding MCI & Early Warning Signs", unlocked: true },
  { id: 3, title: "Cognitive Strategies & Treatment", unlocked: true },
  { id: 4, title: "Mood, Mental Health & Brain Protection", unlocked: true },
  { id: 5, title: "Relaxation, Stress & Sleep", unlocked: true },
  { id: 6, title: "Lifestyle Management", unlocked: true },
  { id: 7, title: "Cognitive Training & Moving Forward", unlocked: true }
];

export const getSessionContent = (sessionId) => {
  const content = {
    1: {
      title: "Brain Health Fundamentals",
      modules: [
        {
          type: "content",
          title: "Understanding Your Brain",
          content: "Let's explore the basics of brain health..."
        }
      ]
    },
    2: {
      title: "Understanding MCI & Early Warning Signs",
      modules: [
        {
          type: "content",
          title: "What is MCI?",
          content: "Mild Cognitive Impairment is..."
        }
      ]
    }
  };
  
  return content[sessionId] || null;
};

export const getPersonalizedContent = (sessionId, profile) => {
  const hasMCI = profile.diagnosis?.includes("Mild Cognitive Impairment");
  
  if (sessionId === 1 && hasMCI) {
    return {
      title: "Brain Health Fundamentals",
      modules: [
        {
          type: "content",
          title: "Understanding MCI and Brain Health",
          segments: [
            {
              content: `Let's explore how MCI affects your brain and what you can do about it.

**Understanding MCI in Context:**

First, let's talk about what MCI really means. MCI is a distinct stage between normal aging and dementia. It's not just "getting older" - it's a specific condition that we can identify and manage.

Many people think MCI automatically leads to dementia, but that's not true.

**The Real Trajectory of MCI:**
- About 10-15% of people with MCI progress to dementia each year
- However, 30-50% remain stable for many years (like you have!)
- 10-20% actually improve and return to normal cognition

**Who is More Likely to Progress:**
- Those with memory-specific MCI (amnestic type)
- People with multiple cognitive domains affected
- Those with biomarker evidence (like abnormal brain scans or spinal fluid)
- Individuals with untreated cardiovascular risk factors

**What You Can Do to Prevent Progression:**
- **Physical exercise** - The single most powerful intervention (reduces risk by 30-40%)
- **Cognitive stimulation** - Keep learning and challenging your brain
- **Social engagement** - Maintain meaningful connections
- **Managing health conditions** - Control blood pressure, diabetes, cholesterol
- **Mediterranean/MIND diet** - Protective eating patterns
- **Quality sleep** - 7-8 hours of restorative sleep
- **Stress management** - Chronic stress damages the brain`,
              discussion: "Would you like a short quiz to test your knowledge of the information I just shared with you?",
              discussionOptions: ['Yes, test my knowledge', 'No, continue to other options']
            }
          ]
        }
      ]
    };
  }
  
  return getSessionContent(sessionId);
};