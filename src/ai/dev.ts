import { config } from 'dotenv';
config();

import '@/ai/flows/dynamic-event-summaries.ts';
import '@/ai/flows/community-recommendations.ts';
import '@/ai/flows/generate-presentation.ts';
import '@/ai/flows/analyze-presentation.ts';
