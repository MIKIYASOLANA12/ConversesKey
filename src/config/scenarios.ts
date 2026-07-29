export type ScenarioId = 'interview' | 'dating' | 'sales' | 'negotiation' | 'networking' | 'leadership' | 'english_practice' | 'public_speaking' | 'customer_service';

export interface Scenario {
  id: ScenarioId;
  name: string;
  prompt: string;
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  interview: {
    id: 'interview',
    name: 'Job Interview',
    prompt: 'Act as a hiring manager conducting a professional job interview. Ask challenging behavioral and technical questions.',
  },
  dating: {
    id: 'dating',
    name: 'Dating Practice',
    prompt: 'Act as a potential romantic interest on a first date. Be conversational, ask engaging questions, and see how the user builds rapport.',
  },
  sales: {
    id: 'sales',
    name: 'Sales Pitch',
    prompt: 'Act as a skeptical prospect. The user is trying to sell you a product. Raise common objections and test their persuasion skills.',
  },
  negotiation: {
    id: 'negotiation',
    name: 'Salary Negotiation',
    prompt: 'Act as a strict HR director negotiating a salary. Push back on the user\'s demands and require them to justify their value.',
  },
  networking: {
    id: 'networking',
    name: 'Networking Event',
    prompt: 'Act as a stranger at a professional networking event. Be polite but brief. See if the user can effectively introduce themselves and network.',
  },
  leadership: {
    id: 'leadership',
    name: 'Leadership & Conflict',
    prompt: 'Act as a frustrated employee coming to their manager (the user) with a conflict. Test the user\'s empathy and leadership skills.',
  },
  english_practice: {
    id: 'english_practice',
    name: 'English Practice',
    prompt: 'Act as a patient language partner. Keep vocabulary accessible. Gently help the user if they struggle, and keep the conversation flowing.',
  },
  public_speaking: {
    id: 'public_speaking',
    name: 'Public Speaking',
    prompt: 'Act as an audience member asking tough Q&A questions after a presentation. Test the user\'s ability to think on their feet.',
  },
  customer_service: {
    id: 'customer_service',
    name: 'Customer Service',
    prompt: 'Act as an angry customer with a valid complaint. Test the user\'s de-escalation skills and customer service approach.',
  },
};
