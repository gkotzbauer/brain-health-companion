export const diagnosticProfile = {
  userId: "user1",
  name: "User 1",
  diagnosis: "Mild Cognitive Impairment (F06.7)",
  referral_info: {
    clinic_name: "Brain Health Clinic",
    referral_reason: "further investigation and follow-up related to concerns around your cognition (thinking and memory)",
    referring_provider: "Southwark and Lambeth Memory Service (SLMS)"
  },
  assessment_info: {
    date: "19/Nov/2024",
    clinicians: [
      { name: "Professor Dag Aarsland", role: "Consultant Psychiatrist" },
      { name: "Viyash Muniswaran", role: "Research Assistant" }
    ]
  },
  current_symptoms: {
    sleep_patterns: ["experience nightmares", "snoring", "occasional talking during sleep"],
    physical_challenges: [],
    cognitive_challenges: ["Mild Cognitive Impairment", "Alzheimer's"],
    instrumental_activities_daily_living: {
      transportation: ["trouble finding your way while driving"],
      managing_finances: ["difficulties with managing finances"]
    }
  },
  assessment_results: {
    HADS: { anxiety: "12/21", depression: "9/21" },
    ACE_III: {
      total: "98/100",
      domain_performance: {
        Memory: "25/26",
        Fluency: "13/14",
        Language: "26/26",
        Visuospatial: "16/16",
        "Attention and Orientation": "18/18"
      }
    }
  },
  patient_background: {
    family_history: {
      father: "diagnosed with Alzheimer's in his early 80s",
      mother: "diagnosed with vascular dementia and frontotemporal dementia in her 90s"
    },
    symptom_duration: "more than 10 years",
    employment_status: "retired",
    caregiving_history: "been a carer for your poorly mother",
    previous_occupation: "led the council's work on research and policy"
  },
  completedSessions: [],
  sessionScores: {},
  exerciseResults: [],
  responses: [],
  conversationHistory: [],
  lastUpdated: null
};