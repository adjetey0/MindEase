import random

COPING_STRATEGIES = {
    "anxiety": [
        {
            "type": "breathing",
            "title": "Box Breathing Exercise",
            "body": "Try this: Inhale for 4 seconds → Hold for 4 seconds → Exhale for 4 seconds → Hold for 4 seconds. Repeat 4 times. This calms your nervous system quickly.",
            "duration_seconds": 64
        },
        {
            "type": "grounding",
            "title": "5-4-3-2-1 Grounding",
            "body": "Look around and name: 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This brings you back to the present moment.",
            "duration_seconds": None
        },
        {
            "type": "journaling",
            "title": "Worry Journal Prompt",
            "body": "Write down: What am I worried about? What is the worst that could happen? How likely is that really? What would I tell a friend in this situation?",
            "duration_seconds": None
        }
    ],
    "stress": [
        {
            "type": "breathing",
            "title": "4-7-8 Breathing",
            "body": "Inhale through your nose for 4 seconds → Hold for 7 seconds → Exhale through your mouth for 8 seconds. Do this 3 times to release tension.",
            "duration_seconds": 57
        },
        {
            "type": "reframing",
            "title": "Thought Reframing",
            "body": "Ask yourself: Is this thought a fact or a feeling? What evidence do I have for and against it? What is a more balanced way to see this situation?",
            "duration_seconds": None
        },
        {
            "type": "physical",
            "title": "Quick Body Reset",
            "body": "Stand up, shake your hands out, roll your shoulders back 5 times, take 3 deep breaths. Physical movement breaks the stress cycle in your body.",
            "duration_seconds": 60
        }
    ],
    "depression": [
        {
            "type": "behavioural",
            "title": "One Small Action",
            "body": "When everything feels heavy, pick just ONE tiny thing you can do right now — drink a glass of water, open a window, send one message to someone you care about. Small steps count.",
            "duration_seconds": None
        },
        {
            "type": "journaling",
            "title": "Gratitude Prompt",
            "body": "Write down 3 things — no matter how small — that you are grateful for today. It could be as simple as a meal, a song, or sunlight. This gently shifts your focus.",
            "duration_seconds": None
        },
        {
            "type": "connection",
            "title": "Reach Out",
            "body": "Depression often makes us want to isolate, but connection helps. Send a simple message to one person today — it doesn't have to be about how you feel. Just connecting matters.",
            "duration_seconds": None
        }
    ],
    "neutral": [
        {
            "type": "mindfulness",
            "title": "Mindful Moment",
            "body": "Take 60 seconds to just breathe and notice how you feel right now — without judging it. Awareness is the first step to emotional wellbeing.",
            "duration_seconds": 60
        }
    ],
    "positive": [
        {
            "type": "affirmation",
            "title": "Savour This Moment",
            "body": "You're doing well! Take a moment to acknowledge what's going right for you today. Savouring positive moments helps build emotional resilience over time.",
            "duration_seconds": None
        }
    ]
}

FOLLOW_UP_QUESTIONS = {
    "anxiety":    "Would you like to talk more about what's making you anxious?",
    "stress":     "What's been weighing on you the most today?",
    "depression": "I'm here with you. Would it help to talk about what's been going on?",
    "neutral":    "How has your day been going overall?",
    "positive":   "That's great to hear! What's been going well for you?"
}

ACKNOWLEDGEMENTS = {
    "anxiety":    "It sounds like you're carrying a lot of worry right now, and that's really hard.",
    "stress":     "I can hear that you're under a lot of pressure. That's completely valid.",
    "depression": "Thank you for sharing that with me. What you're feeling is real, and you're not alone.",
    "neutral":    "Thanks for checking in. I'm here whenever you need to talk.",
    "positive":   "It's really good to hear you're feeling okay! That matters."
}


def get_coping_response(emotion: str) -> dict:
    strategies      = COPING_STRATEGIES.get(emotion, COPING_STRATEGIES["neutral"])
    strategy        = random.choice(strategies)
    acknowledgement = ACKNOWLEDGEMENTS.get(emotion, ACKNOWLEDGEMENTS["neutral"])
    follow_up       = FOLLOW_UP_QUESTIONS.get(emotion, FOLLOW_UP_QUESTIONS["neutral"])

    return {
        "acknowledgement": acknowledgement,
        "strategy":        strategy,
        "follow_up":       follow_up
    }


def format_bot_message(emotion: str) -> str:
    response = get_coping_response(emotion)
    return (
        f"{response['acknowledgement']}\n\n"
        f"💡 *{response['strategy']['title']}*\n"
        f"{response['strategy']['body']}\n\n"
        f"{response['follow_up']}"
    )