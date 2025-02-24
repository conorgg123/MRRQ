import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Clock } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'Matchmaking',
    question: 'How does the matchmaking system work?',
    answer: 'Our matchmaking system uses a combination of factors including rank, MMR, role preference, and main characters to create balanced matches. The system prioritizes finding players of similar skill levels while maintaining reasonable queue times.'
  },
  {
    category: 'Matchmaking',
    question: 'Why are my queue times longer than estimated?',
    answer: 'Queue times can vary based on several factors including your rank, selected roles, time of day, and server population. Higher ranks typically experience longer queue times due to a smaller player pool.'
  },
  {
    category: 'Matchmaking',
    question: 'How does the 2-2-2 role lock work?',
    answer: 'Teams are composed of 2 Vanguards, 2 Duelists, and 2 Strategists. You must select at least one character from your chosen role to queue, and the system will match you with complementary teammates.'
  },
  {
    category: 'Account',
    question: 'How do I mark a character as my main?',
    answer: 'Double-click on a character during role selection to mark them as a main. You can have up to 3 main characters total across all roles. Main characters receive priority in matchmaking and reduced queue times.'
  },
  {
    category: 'Account',
    question: 'What happens if I lose connection during a match?',
    answer: 'If you disconnect, you have a short window to reconnect before receiving a penalty. Repeated disconnections may result in temporary matchmaking restrictions.'
  },
  {
    category: 'Technical',
    question: 'What are the minimum system requirements?',
    answer: 'The matchmaking system is web-based and works on any modern browser. For the game itself, please refer to the official Marvel Rivals system requirements.'
  },
  {
    category: 'Technical',
    question: 'How do I report bugs or technical issues?',
    answer: 'Use the contact form below or email support@marvelrivalsqueue.com with detailed information about the issue, including any error messages and steps to reproduce the problem.'
  }
];

export function SupportPage() {
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleQuestion = (question: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(question)) {
      newOpenQuestions.delete(question);
    } else {
      newOpenQuestions.add(question);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const categories = Array.from(new Set(FAQ_ITEMS.map(item => item.category)));

  const filteredFAQs = activeCategory
    ? FAQ_ITEMS.filter(item => item.category === activeCategory)
    : FAQ_ITEMS;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Support & FAQ</h1>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg transition ${
              activeCategory === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <button
                  onClick={() => toggleQuestion(item.question)}
                  className="w-full text-left flex items-center justify-between py-2"
                >
                  <span className="font-semibold">{item.question}</span>
                  {openQuestions.has(item.question) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openQuestions.has(item.question) && (
                  <p className="text-gray-300 mt-2 pl-4">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Live Chat</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Our live chat support system is coming soon! In the meantime, please use email support for assistance.
              </p>
              <button 
                disabled
                className="px-6 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold w-full cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Coming Soon
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Email Support</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Send us an email for non-urgent inquiries.
                We typically respond within 24 hours.
              </p>
              <a
                href="mailto:support@marvelrivalsqueue.com"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition block text-center"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}