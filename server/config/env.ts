import 'dotenv/config';

const NodeEnv = {
  Development: 'development',
  Production: 'production',
  Test: 'test'
} as const;

type NodeEnvType = typeof NodeEnv[keyof typeof NodeEnv];

function validateEnv() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  const nodeEnv = process.env.NODE_ENV as NodeEnvType;
  if (nodeEnv && !Object.values(NodeEnv).includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  const port = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  return {
    supabase: {
      url: supabaseUrl,
      serviceKey: supabaseServiceKey,
    },
    nodeEnv: nodeEnv || NodeEnv.Development,
    port,
    isDevelopment: nodeEnv === NodeEnv.Development,
    isProduction: nodeEnv === NodeEnv.Production,
    isTest: nodeEnv === NodeEnv.Test,
  } as const;
}

export const env = validateEnv(); 